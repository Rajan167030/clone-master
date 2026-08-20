import crypto from "crypto";
import bcrypt from "bcryptjs";
import { InvestorInvite, InvestorLead, Account, Dashboard, InvestorAccount } from "../models/index.js";
import { ActivityInvestor } from "../models/activity.model.js";
import { getDashboardTemplate } from "../utils/dashboard-template.js";
import { buildDashboardPayload } from "../utils/dashboard-payload.js";
import { validateAndNormalizeRoleDetails } from "../utils/role-details.js";
import { signAuthToken } from "../utils/jwt.js";
import { generateProfileId } from "../utils/profile-utils.js";

const toSafeInvite = (invite) => ({
  _id: invite._id,
  token: invite.token,
  code: invite.code,
  label: invite.label,
  isActive: invite.isActive,
  expiresAt: invite.expiresAt,
  usageCount: invite.usageCount,
  lastUsedAt: invite.lastUsedAt,
  usedAt: invite.usedAt,
  usedByAccountId: invite.usedByAccountId,
  createdAt: invite.createdAt,
  updatedAt: invite.updatedAt,
});

const generateInviteCode = () => crypto.randomBytes(9).toString("base64url");

const generateInvestorId = () => `SAIS26-INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const generateInviteReferralCode = (fullName) => {
  const base =
    String(fullName || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 4) || "invr";

  return `${base}${Math.floor(100 + Math.random() * 900)}`;
};

const buildPlaceholderPhoto = (fullName) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "Investor")}&background=8b5cf6&color=fff&size=256`;

export const listAdminInvestorInvites = async (req, res, next) => {
  try {
    const invites = await InvestorInvite.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ invites: invites.map(toSafeInvite) });
  } catch (error) {
    return next(error);
  }
};

export const createAdminInvestorInvite = async (req, res, next) => {
  try {
    const { label, expiresInDays } = req.body || {};

    const token = crypto.randomBytes(20).toString("hex");
    const code = generateInviteCode();
    const expiresAt =
      Number.isFinite(Number(expiresInDays)) && Number(expiresInDays) > 0
        ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000)
        : null;

    const invite = await InvestorInvite.create({
      token,
      code,
      label: String(label || "").trim(),
      createdBy: req.user?.id || null,
      expiresAt,
    });

    return res.status(201).json({ message: "Investor invite link created.", invite: toSafeInvite(invite) });
  } catch (error) {
    return next(error);
  }
};

export const revokeAdminInvestorInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await InvestorInvite.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });

    if (!invite) {
      return res.status(404).json({ message: "Invite link not found." });
    }

    return res.status(200).json({ message: "Invite link revoked.", invite: toSafeInvite(invite) });
  } catch (error) {
    return next(error);
  }
};

export const reactivateAdminInvestorInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await InvestorInvite.findByIdAndUpdate(id, { $set: { isActive: true } }, { new: true });

    if (!invite) {
      return res.status(404).json({ message: "Invite link not found." });
    }

    return res.status(200).json({ message: "Invite link reactivated.", invite: toSafeInvite(invite) });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminInvestorInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await InvestorInvite.findByIdAndDelete(id);

    if (!invite) {
      return res.status(404).json({ message: "Invite link not found." });
    }

    return res.status(200).json({ message: "Invite link deleted." });
  } catch (error) {
    return next(error);
  }
};

export const validateInvestorInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invite = await InvestorInvite.findOne({ token: String(token || "").trim() }).lean();

    if (!invite || !invite.isActive) {
      return res.status(404).json({ valid: false, message: "This invite link is invalid or has been revoked." });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(410).json({ valid: false, message: "This invite link has expired." });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    return next(error);
  }
};

export const submitInvestorLead = async (req, res, next) => {
  try {
    const { fullName, email, phone, vcName, investmentInterest, inviteToken } = req.body || {};

    const normalizedToken = String(inviteToken || "").trim();
    if (!normalizedToken) {
      return res.status(403).json({ message: "A valid invite link is required to submit this form." });
    }

    const invite = await InvestorInvite.findOne({ token: normalizedToken });
    if (!invite || !invite.isActive) {
      return res.status(403).json({ message: "This invite link is invalid or has been revoked." });
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(403).json({ message: "This invite link has expired." });
    }

    const normalizedFullName = String(fullName || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedVcName = String(vcName || "").trim();
    const normalizedInvestmentInterest = String(investmentInterest || "").trim();

    if (!normalizedFullName || !normalizedEmail || !normalizedVcName || !normalizedInvestmentInterest) {
      return res.status(400).json({ message: "Name, email, VC/firm name, and investment interest are required." });
    }

    const lead = await InvestorLead.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: String(phone || "").trim(),
      vcName: normalizedVcName,
      investmentInterest: normalizedInvestmentInterest,
      inviteToken: normalizedToken,
    });

    await InvestorInvite.updateOne(
      { _id: invite._id },
      { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
    );

    return res.status(201).json({
      message: "Thank you! Your details have been submitted.",
      lead: {
        _id: lead._id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        vcName: lead.vcName,
        investmentInterest: lead.investmentInterest,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const validateInviteByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const invite = await InvestorInvite.findOne({ code: String(code || "").trim() }).lean();

    if (!invite || !invite.isActive) {
      return res.status(404).json({ valid: false, message: "This invite link is invalid or has been revoked." });
    }
    if (invite.usedAt) {
      return res.status(410).json({ valid: false, message: "This invite link has already been used." });
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(410).json({ valid: false, message: "This invite link has expired." });
    }

    return res.status(200).json({ valid: true, label: invite.label });
  } catch (error) {
    return next(error);
  }
};

export const registerInvestorViaInvite = async (req, res, next) => {
  let reservedInviteId = null;
  try {
    const { code } = req.params;
    const normalizedCode = String(code || "").trim();
    if (!normalizedCode) {
      return res.status(400).json({ message: "Invite code is required." });
    }

    const invite = await InvestorInvite.findOneAndUpdate(
      {
        code: normalizedCode,
        isActive: true,
        usedAt: null,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      },
      { $set: { usedAt: new Date() } },
      { new: true },
    );

    if (!invite) {
      return res.status(409).json({ message: "This invite link has already been used or is no longer valid." });
    }
    reservedInviteId = invite._id;

    const { fullName, email, password, phone, city, firmName, sector } = req.body || {};

    const normalizedFullName = String(fullName || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedFirmName = String(firmName || "").trim();
    const normalizedSector = String(sector || "").trim();
    const normalizedPhone = String(phone || "").trim();
    const normalizedCity = String(city || "").trim();

    if (!normalizedFullName || !normalizedEmail || !password || !normalizedFirmName || !normalizedSector) {
      throw Object.assign(new Error("Full name, email, password, firm, and sector are required."), { status: 400 });
    }
    if (String(password).length < 8) {
      throw Object.assign(new Error("Password must be at least 8 characters."), { status: 400 });
    }

    const exists = await Account.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      throw Object.assign(new Error("An account already exists for this email."), { status: 409 });
    }

    const roleDetails = validateAndNormalizeRoleDetails("investor", {
      investmentRange: { min: 0, max: 0, currency: "INR" },
      focusSector: [normalizedSector],
      portfolioSize: 0,
      investorId: generateInvestorId(),
    });

    const passwordHash = await bcrypt.hash(String(password), 12);
    const dashboardTemplate = getDashboardTemplate("investor");
    const profileId = generateProfileId();

    const account = await InvestorAccount.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      passwordHash,
      phone: normalizedPhone,
      city: normalizedCity || "Bangalore",
      role: "investor",
      profileId,
      headline: `${normalizedFirmName} · SAIS'26`,
      referralCode: generateInviteReferralCode(normalizedFullName),
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

    const dashboard = await Dashboard.create({
      accountId: account._id,
      role: "investor",
      ...dashboardPayload,
    });

    await ActivityInvestor.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      firmName: normalizedFirmName,
      designation: "Investor",
      sectors: [normalizedSector],
      photoUrl: buildPlaceholderPhoto(normalizedFullName),
      promoCodeUsed: "sais26-invite",
      accountId: account._id,
      inviteId: invite._id,
    });

    await InvestorInvite.updateOne(
      { _id: invite._id },
      { $set: { usedByAccountId: account._id, lastUsedAt: new Date() }, $inc: { usageCount: 1 } },
    );

    const token = signAuthToken(account);

    return res.status(201).json({
      message: "Investor account created successfully.",
      token,
      account: typeof account.toSafeJSON === "function" ? account.toSafeJSON() : account.toObject(),
      dashboard: dashboard.toSafeJSON(),
    });
  } catch (error) {
    if (reservedInviteId) {
      await InvestorInvite.updateOne({ _id: reservedInviteId }, { $set: { usedAt: null } }).catch(() => {});
    }
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return next(error);
  }
};

export const listAdminInvestorLeads = async (req, res, next) => {
  try {
    const leads = await InvestorLead.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ investors: leads });
  } catch (error) {
    return next(error);
  }
};
