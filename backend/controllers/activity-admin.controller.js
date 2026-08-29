import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ActivityStartup, ActivityInvestor } from "../models/activity.model.js";
import { Account, InvestorAccount, Dashboard } from "../models/index.js";
import { getDashboardTemplate } from "../utils/dashboard-template.js";
import { buildDashboardPayload } from "../utils/dashboard-payload.js";
import { validateAndNormalizeRoleDetails } from "../utils/role-details.js";
import { generateProfileId } from "../utils/profile-utils.js";

const DEFAULT_ACTIVITY_INVESTOR_PASSWORD = "sais2026";

const generateInvestorId = () => `SAIS26-INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const generateReferralCode = (fullName) => {
  const base =
    String(fullName || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 4) || "invr";
  return `${base}${Math.floor(100 + Math.random() * 900)}`;
};

const buildPlaceholderPhoto = (fullName) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "Investor")}&background=8b5cf6&color=fff&size=256`;

// Admin adds an investor for the Bangalore activity (SAIS'26) straight from the panel — creates
// a real login account (default password "sais2026" unless one is given) plus the activity
// profile investors/founders see inside the SAIS'26 Room.
export const createAdminActivityInvestor = async (req, res, next) => {
  try {
    const { fullName, email, firmName, designation, phone, city, sector, password } = req.body || {};

    const normalizedFullName = String(fullName || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedFirmName = String(firmName || "").trim();
    const normalizedDesignation = String(designation || "").trim() || "Investor";
    const normalizedPhone = String(phone || "").trim() || "0000000000";
    const normalizedCity = String(city || "").trim() || "Bangalore";
    const normalizedSector = String(sector || "").trim();
    const finalPassword = String(password || "").trim() || DEFAULT_ACTIVITY_INVESTOR_PASSWORD;

    if (!normalizedFullName || !normalizedEmail || !normalizedFirmName) {
      return res.status(400).json({ message: "Full name, email, and VC/firm name are required." });
    }
    if (finalPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingActivityEntry = await ActivityInvestor.findOne({ email: normalizedEmail }).lean();
    if (existingActivityEntry) {
      return res.status(409).json({ message: "An investor with this email is already in the Bangalore activity." });
    }

    let account = await Account.findOne({ email: normalizedEmail });
    if (account && account.role !== "investor") {
      return res.status(409).json({ message: "This email is already registered with a different role." });
    }

    if (!account) {
      const passwordHash = await bcrypt.hash(finalPassword, 12);
      const roleDetails = validateAndNormalizeRoleDetails("investor", {
        investmentRange: { min: 0, max: 0, currency: "INR" },
        focusSector: [normalizedSector || "General"],
        portfolioSize: 0,
        investorId: generateInvestorId(),
      });
      const dashboardTemplate = getDashboardTemplate("investor");

      account = await InvestorAccount.create({
        fullName: normalizedFullName,
        email: normalizedEmail,
        passwordHash,
        phone: normalizedPhone,
        city: normalizedCity,
        role: "investor",
        profileId: generateProfileId(),
        headline: `${normalizedFirmName} · SAIS'26`,
        referralCode: generateReferralCode(normalizedFullName),
        roleDetails,
        dashboard: {
          stats: dashboardTemplate.stats,
          commitmentPortfolio: dashboardTemplate.commitmentPortfolio,
          investmentPortfolio: dashboardTemplate.investmentPortfolio,
        },
      });

      const dashboardPayload = buildDashboardPayload({
        role: "investor",
        fullName: account.fullName,
        template: dashboardTemplate,
        roleDetails,
      });

      await Dashboard.create({
        accountId: account._id,
        role: "investor",
        ...dashboardPayload,
      });
    }

    const investor = await ActivityInvestor.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      firmName: normalizedFirmName,
      designation: normalizedDesignation,
      sectors: normalizedSector ? [normalizedSector] : [],
      photoUrl: buildPlaceholderPhoto(normalizedFullName),
      promoCodeUsed: "admin-added",
      accountId: account._id,
      plainPassword: finalPassword,
    });

    return res.status(201).json({
      message: "Investor added to the Bangalore activity.",
      investor,
      password: finalPassword,
    });
  } catch (error) {
    return next(error);
  }
};

// Admin-only listing of Bangalore activity investors that also surfaces each one's password —
// the public /activity/investors route deliberately omits it (plainPassword is select:false).
export const listAdminActivityInvestors = async (req, res, next) => {
  try {
    const investors = await ActivityInvestor.find()
      .select("+plainPassword -accessToken -accessTokenIssuedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ investors });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminActivityStartup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const startup = await ActivityStartup.findByIdAndDelete(id);

    if (!startup) {
      return res.status(404).json({ message: "Startup not found." });
    }

    return res.status(200).json({ message: "Startup removed from the Bangalore Event Activity." });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminActivityInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const investor = await ActivityInvestor.findByIdAndDelete(id);

    if (!investor) {
      return res.status(404).json({ message: "Investor not found." });
    }

    // This event-registration record only references the real platform account via
    // accountId — deleting it alone left that Account untouched, so the investor kept
    // showing up on the public Community Directory after being "deleted" here.
    if (investor.accountId) {
      await Account.updateOne(
        { _id: investor.accountId },
        { $set: { isActive: false, isProfilePublic: false } },
      );
    }

    return res.status(200).json({ message: "Investor removed from the Bangalore Event Activity and hidden from the Community Directory." });
  } catch (error) {
    return next(error);
  }
};

// Admin announces Gold / Silver / Bronze based on the investor-feedback score.
// The score itself always comes from investor ratings — the admin only confirms which
// startup ids hold each position (pre-filled with the top 3 by averageScore on the client).
export const announceAdminActivityResults = async (req, res, next) => {
  try {
    const { goldId, silverId, bronzeId } = req.body || {};
    const picks = { gold: goldId || null, silver: silverId || null, bronze: bronzeId || null };

    const chosenIds = Object.values(picks).filter(Boolean);
    if (chosenIds.length === 0) {
      return res.status(400).json({ message: "Select at least one startup for Gold, Silver, or Bronze." });
    }
    if (new Set(chosenIds).size !== chosenIds.length) {
      return res.status(400).json({ message: "Gold, Silver, and Bronze must be different startups." });
    }

    // Clear any previous announcement first.
    await ActivityStartup.updateMany({ resultRank: { $ne: null } }, { $set: { resultRank: null, resultAnnouncedAt: null } });

    const now = new Date();
    for (const [rank, id] of Object.entries(picks)) {
      if (!id) continue;
      const updated = await ActivityStartup.findByIdAndUpdate(id, { $set: { resultRank: rank, resultAnnouncedAt: now } });
      if (!updated) {
        return res.status(404).json({ message: `Startup selected for ${rank} was not found.` });
      }
    }

    return res.status(200).json({ message: "Results announced." });
  } catch (error) {
    return next(error);
  }
};

export const resetAdminActivityResults = async (req, res, next) => {
  try {
    await ActivityStartup.updateMany({ resultRank: { $ne: null } }, { $set: { resultRank: null, resultAnnouncedAt: null } });
    return res.status(200).json({ message: "Results reset." });
  } catch (error) {
    return next(error);
  }
};
