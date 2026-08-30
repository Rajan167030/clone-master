import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { ActivityStartup, ActivityInvestor } from "../models/activity.model.js";
import { Account, Dashboard, FounderAccount, InvestorAccount } from "../models/index.js";
import { applyStartupRating } from "../utils/activity-rating.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import { sendEmail } from "../utils/email.js";
import { buildStartupActivityEmail, buildInvestorActivityEmail } from "../utils/activity-email-templates.js";
import { getDashboardTemplate } from "../utils/dashboard-template.js";
import { buildDashboardPayload } from "../utils/dashboard-payload.js";
import { validateAndNormalizeRoleDetails } from "../utils/role-details.js";
import { signAuthToken } from "../utils/jwt.js";
import { generateProfileId } from "../utils/profile-utils.js";
import { generateSimplePassword } from "../utils/password.js";

// The Bangalore Activity form's "Funding Stage" options don't match the Account model's
// FounderRoleDetailsSchema enum (idea/mvp/early-revenue/growth/scale), so map between them
// rather than passing the raw label through.
const mapFounderStage = (formStage) => {
  const map = {
    "pre-seed": "idea",
    "seed": "mvp",
    "series a": "growth",
    "bootstrapped": "early-revenue",
  };
  return map[String(formStage || "").trim().toLowerCase()] || "idea";
};

const generateInvestorId = () => `SAIS26-INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const router = Router();

const stripAccessToken = (startup) => {
  const safe = startup.toObject();
  delete safe.accessToken;
  delete safe.accessTokenIssuedAt;
  return safe;
};

// Validate Promo Code
router.post("/verify-promo", (req, res) => {
  const { code, role } = req.body;
  const cleanCode = (code || "").trim().toLowerCase();

  if (role === "startup") {
    if (cleanCode === "startup20") {
      return res.json({ success: true, message: "Valid Startup promo code." });
    }
    return res.status(400).json({ success: false, message: "Invalid promo code for Startup! Please enter 'startup20'." });
  }

  if (role === "investor") {
    if (cleanCode === "investor20") {
      return res.json({ success: true, message: "Valid Investor promo code." });
    }
    return res.status(400).json({ success: false, message: "Invalid promo code for Investor! Please enter 'investor20'." });
  }

  return res.status(400).json({ success: false, message: "Invalid role specified." });
});

// Register Startup
router.post("/startup", async (req, res) => {
  try {
    const { founderName, founderEmail, founderPhone, startupName, tagline, description, category, stage, pitchDeckUrl, logoUrl, promoCode } = req.body;

    if ((promoCode || "").trim().toLowerCase() !== "startup20") {
      return res.status(400).json({ message: "Invalid promo code! Access requires promo code 'startup20'." });
    }

    if (!founderName || !founderEmail || !startupName || !tagline || !logoUrl) {
      return res.status(400).json({ message: "Please fill all required startup details." });
    }

    // One founder, one Bangalore Activity registration — a second submission under the same
    // email would just create a duplicate directory entry, so route them to edit the existing
    // one (via the returned accessToken) instead of creating a new ActivityStartup document.
    const normalizedFounderEmail = String(founderEmail).trim().toLowerCase();
    const existingStartup = await ActivityStartup.findOne({
      founderEmail: { $regex: new RegExp(`^${escapeRegExp(normalizedFounderEmail)}$`, "i") },
    });
    if (existingStartup) {
      return res.status(409).json({
        message: "You've already registered a startup for the Bangalore Event. Edit your existing profile instead of registering again.",
        code: "ALREADY_REGISTERED",
        accessToken: existingStartup.accessToken,
      });
    }

    const accessToken = crypto.randomBytes(24).toString("hex");

    const startup = new ActivityStartup({
      founderName,
      founderEmail,
      founderPhone: founderPhone || "",
      startupName,
      tagline,
      description,
      category,
      stage,
      pitchDeckUrl: pitchDeckUrl || "",
      logoUrl,
      promoCodeUsed: "startup20",
      accessToken,
      accessTokenIssuedAt: new Date(),
    });

    await startup.save();

    // Give the founder full site-wide founder access too — not just the activity-specific
    // link — so the Navbar shows their name and a Dashboard button immediately, same as a
    // real login. If an account with this email already exists, log them into it instead
    // of creating a duplicate (and leave it alone entirely if that account isn't a founder).
    let founderToken = null;
    let founderAccountSafe = null;
    let founderPlainPassword = null;
    try {
      const normalizedFounderEmail = String(founderEmail).trim().toLowerCase();
      let account = await Account.findOne({ email: normalizedFounderEmail });

      if (!account) {
        founderPlainPassword = generateSimplePassword();
        const passwordHash = await bcrypt.hash(founderPlainPassword, 12);
        const roleDetails = validateAndNormalizeRoleDetails("founder", {
          startupName,
          startupStage: mapFounderStage(stage),
          teamSize: 1,
          startupWebsite: pitchDeckUrl || "Not provided",
        });
        const dashboardTemplate = getDashboardTemplate("founder");

        account = await FounderAccount.create({
          fullName: founderName,
          email: normalizedFounderEmail,
          passwordHash,
          phone: founderPhone || "",
          city: "Bangalore",
          role: "founder",
          profileId: generateProfileId(),
          headline: `Founder, ${startupName}`,
          roleDetails,
          dashboard: {
            stats: dashboardTemplate.stats,
            commitmentPortfolio: dashboardTemplate.commitmentPortfolio,
            investmentPortfolio: dashboardTemplate.investmentPortfolio,
          },
        });

        const dashboardPayload = buildDashboardPayload({
          role: "founder",
          fullName: account.fullName,
          template: dashboardTemplate,
          roleDetails,
        });

        await Dashboard.create({ accountId: account._id, role: "founder", ...dashboardPayload });
      }

      if (account.role === "founder") {
        founderToken = signAuthToken(account);
        founderAccountSafe = typeof account.toSafeJSON === "function" ? account.toSafeJSON() : account;
      }
    } catch (sessionError) {
      console.error("Founder session provisioning failed (registration still succeeded):", sessionError?.message || sessionError);
    }

    const frontendUrl = process.env.FRONTEND_URL || process.env.HOST_URL || "https://foundersconnect.co.in";
    const dashboardLink = founderPlainPassword ? `${frontendUrl}/login` : `${frontendUrl}/dashboard`;
    sendEmail({
      to: founderEmail,
      subject: "You're registered for SAIS'26 — Founders Connect",
      html: buildStartupActivityEmail({
        founderName,
        startupName,
        email: founderEmail,
        password: founderPlainPassword,
        dashboardLink,
        saisLink: `${frontendUrl}/sais26/founder/${accessToken}`,
        communityLink: `${frontendUrl}/community`,
      }),
    }).catch(() => {});

    return res.status(201).json({
      message: "Startup registered successfully for Bangalore Event!",
      startup,
      accessToken,
      token: founderToken,
      account: founderAccountSafe,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to register startup." });
  }
});

// Resolve a logged-in founder's own accessToken from their session — lets the general
// /dashboard link into their SAIS'26 room without them having to dig up the emailed link.
router.get("/startup/my-access", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "founder") {
      return res.status(403).json({ message: "Only founders have a SAIS'26 room." });
    }

    const startup = await ActivityStartup.findOne({ founderEmail: req.user.email })
      .sort({ createdAt: -1 })
      .select("accessToken startupName");

    if (!startup) {
      return res.status(404).json({ message: "No Bangalore Activity registration found for this account." });
    }

    return res.status(200).json({ accessToken: startup.accessToken, startupName: startup.startupName });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load your SAIS'26 access." });
  }
});

// Founder's private dashboard access (no login — possession of accessToken)
router.get("/startup/access/:accessToken", async (req, res) => {
  try {
    const { accessToken } = req.params;
    const startup = await ActivityStartup.findOne({ accessToken: String(accessToken || "").trim() });

    if (!startup) {
      return res.status(404).json({ message: "Dashboard link is invalid." });
    }

    const rank =
      (await ActivityStartup.countDocuments({
        totalRatingsCount: { $gt: 0 },
        averageScore: { $gt: startup.averageScore },
      })) + 1;

    return res.status(200).json({ startup, rank: startup.totalRatingsCount > 0 ? rank : null });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load dashboard." });
  }
});

// Edit an already-registered founder's Bangalore Activity profile (no login — possession of
// accessToken, same as the read path above). founderEmail is intentionally not editable here:
// it's the identity the duplicate-registration check above keys off, and it's tied to the
// linked founder Account.
router.put("/startup/access/:accessToken", async (req, res) => {
  try {
    const { accessToken } = req.params;
    const startup = await ActivityStartup.findOne({ accessToken: String(accessToken || "").trim() });

    if (!startup) {
      return res.status(404).json({ message: "Dashboard link is invalid." });
    }

    const { founderName, founderPhone, startupName, tagline, description, category, stage, pitchDeckUrl, logoUrl } = req.body || {};

    if (!founderName || !startupName || !tagline || !description || !logoUrl) {
      return res.status(400).json({ message: "Please fill all required startup details." });
    }

    startup.founderName = founderName;
    startup.founderPhone = founderPhone || "";
    startup.startupName = startupName;
    startup.tagline = tagline;
    startup.description = description;
    startup.category = category;
    startup.stage = stage;
    startup.pitchDeckUrl = pitchDeckUrl || "";
    startup.logoUrl = logoUrl;

    await startup.save();

    return res.status(200).json({ message: "Your Bangalore Event profile has been updated.", startup: stripAccessToken(startup) });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update your profile." });
  }
});

// Register Investor Profile
router.post("/investor", async (req, res) => {
  try {
    const { fullName, email, phone, firmName, designation, sectors, ticketSize, linkedin, bio, photoUrl, promoCode } = req.body;

    if ((promoCode || "").trim().toLowerCase() !== "investor20") {
      return res.status(400).json({ message: "Invalid promo code! Access requires promo code 'investor20'." });
    }

    if (!fullName || !email || !firmName || !photoUrl) {
      return res.status(400).json({ message: "Full Name, Email, Firm Name, and Photo are required." });
    }

    const accessToken = crypto.randomBytes(24).toString("hex");

    const investor = new ActivityInvestor({
      fullName,
      email,
      phone: phone || "",
      firmName,
      designation: designation || "Investor",
      sectors: sectors || [],
      ticketSize: ticketSize || "",
      linkedin: linkedin || "",
      bio: bio || "",
      photoUrl,
      promoCodeUsed: "investor20",
      accessToken,
      accessTokenIssuedAt: new Date(),
    });

    await investor.save();

    // Same as founders: give the investor full site-wide access too, not just the
    // activity-specific link — Navbar shows their name + Dashboard button immediately.
    let investorToken = null;
    let investorAccountSafe = null;
    let investorPlainPassword = null;
    try {
      const normalizedEmail = String(email).trim().toLowerCase();
      let account = await Account.findOne({ email: normalizedEmail });

      if (!account) {
        investorPlainPassword = generateSimplePassword();
        const passwordHash = await bcrypt.hash(investorPlainPassword, 12);
        const focusSector = Array.isArray(sectors) && sectors.length ? sectors : ["General"];
        const roleDetails = validateAndNormalizeRoleDetails("investor", {
          investmentRange: { min: 0, max: 0, currency: "INR" },
          focusSector,
          portfolioSize: 0,
          investorId: generateInvestorId(),
        });
        const dashboardTemplate = getDashboardTemplate("investor");

        account = await InvestorAccount.create({
          fullName,
          email: normalizedEmail,
          passwordHash,
          phone: phone || "",
          city: "Bangalore",
          role: "investor",
          profileId: generateProfileId(),
          headline: `${firmName} · SAIS'26`,
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

        await Dashboard.create({ accountId: account._id, role: "investor", ...dashboardPayload });
      }

      if (account.role === "investor") {
        investorToken = signAuthToken(account);
        investorAccountSafe = typeof account.toSafeJSON === "function" ? account.toSafeJSON() : account;
      }
    } catch (sessionError) {
      console.error("Investor session provisioning failed (registration still succeeded):", sessionError?.message || sessionError);
    }

    const frontendUrl = process.env.FRONTEND_URL || process.env.HOST_URL || "https://foundersconnect.co.in";
    sendEmail({
      to: email,
      subject: "You're in — SAIS'26 awaits — Founders Connect",
      html: buildInvestorActivityEmail({
        fullName,
        firmName,
        email,
        password: investorPlainPassword,
        dashboardLink: investorPlainPassword ? `${frontendUrl}/login` : `${frontendUrl}/dashboard`,
        saisLink: `${frontendUrl}/sais26/investor/${accessToken}`,
        communityLink: `${frontendUrl}/community`,
      }),
    }).catch(() => {});

    return res.status(201).json({
      message: "Investor profile saved successfully!",
      investor,
      token: investorToken,
      account: investorAccountSafe,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to save investor profile." });
  }
});

// Investor's private dashboard access (no login — possession of accessToken), mirrors the founder path above.
router.get("/investor/access/:accessToken", async (req, res) => {
  try {
    const { accessToken } = req.params;
    const investor = await ActivityInvestor.findOne({ accessToken: String(accessToken || "").trim() });

    if (!investor) {
      return res.status(404).json({ message: "Dashboard link is invalid." });
    }

    const safe = investor.toObject();
    delete safe.accessToken;
    delete safe.accessTokenIssuedAt;

    return res.status(200).json({ investor: safe });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load dashboard." });
  }
});

// Get all Bangalore Startups — founderPhone is only for logged-in members (investors, other
// founders, admins) browsing the directory; anonymous visitors get everything else, minus that.
router.get("/startups", optionalAuth, async (req, res) => {
  try {
    const startups = await ActivityStartup.find()
      .select(req.user ? "-accessToken -accessTokenIssuedAt" : "-accessToken -accessTokenIssuedAt -founderPhone")
      .sort({ createdAt: -1 });
    return res.json({ startups });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch startups." });
  }
});

// Get all Bangalore Investors
router.get("/investors", async (req, res) => {
  try {
    const investors = await ActivityInvestor.find()
      .select("-accessToken -accessTokenIssuedAt")
      .sort({ createdAt: -1 });
    return res.json({ investors });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch investors." });
  }
});

// Rate a Startup
router.post("/rate", async (req, res) => {
  try {
    const { startupId, investorId, investorName, investorFirm, investorPhoto, scores, comment } = req.body;

    if (!startupId || !scores || !investorId) {
      return res.status(400).json({ message: "Startup ID, Investor ID, and scores are required." });
    }

    const startup = await ActivityStartup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found." });
    }

    applyStartupRating(startup, { investorId, investorName, investorFirm, investorPhoto, scores, comment });

    await startup.save();
    return res.json({ message: "Rating submitted successfully!", startup: stripAccessToken(startup) });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to submit rating." });
  }
});

// Rate a Startup — authenticated SAIS'26 Room path (identity derived server-side, not client-supplied)
router.post("/room/rate", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "investor") {
      return res.status(403).json({ message: "Only investors can rate startups." });
    }

    const { startupId, scores, comment, feedbackImageUrl, voiceNoteUrl } = req.body || {};
    if (!startupId || !scores) {
      return res.status(400).json({ message: "Startup ID and scores are required." });
    }

    const startup = await ActivityStartup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found." });
    }

    let investorProfile = await ActivityInvestor.findOne({ accountId: req.user.sub });
    if (!investorProfile) {
      investorProfile = await ActivityInvestor.create({
        fullName: req.user.email,
        email: req.user.email,
        firmName: "SAIS'26 Investor",
        designation: "Investor",
        photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.email)}&background=8b5cf6&color=fff`,
        promoCodeUsed: "sais26-invite",
        accountId: req.user.sub,
      });
    }

    applyStartupRating(startup, {
      investorId: String(investorProfile._id),
      investorName: investorProfile.fullName,
      investorFirm: investorProfile.firmName,
      investorPhoto: investorProfile.photoUrl,
      scores,
      comment,
      feedbackImageUrl,
      voiceNoteUrl,
    });

    await startup.save();
    return res.json({ message: "Rating submitted successfully!", startup: stripAccessToken(startup) });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to submit rating." });
  }
});

// Public top-5 leaderboard — sanitized, no founder contact info or raw investor comments
router.get("/leaderboard/top", async (req, res) => {
  try {
    const startups = await ActivityStartup.find({ totalRatingsCount: { $gt: 0 } })
      .sort({ averageScore: -1, totalRatingsCount: -1 })
      .limit(5)
      .select("startupName tagline category stage logoUrl averageScore totalRatingsCount")
      .lean();

    const ranked = startups.map((s, index) => ({
      rank: index + 1,
      startupName: s.startupName,
      tagline: s.tagline,
      category: s.category,
      stage: s.stage,
      logoUrl: s.logoUrl,
      averageScore: s.averageScore,
      totalRatingsCount: s.totalRatingsCount,
    }));

    return res.json({ startups: ranked });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load leaderboard." });
  }
});

// Public "Results" section — startups the admin has published a Rank 1-5 for, each with a
// sample of investor feedback. Distinct from /leaderboard/top (a live score ranking that's
// always visible): this only returns startups the admin has explicitly announced, and is what
// the homepage Results section and the Bangalore Activity page's Results block both read from.
router.get("/results/published", async (req, res) => {
  try {
    const startups = await ActivityStartup.find({ resultRank: { $ne: null } })
      .select("startupName tagline description category stage logoUrl founderName averageScore totalRatingsCount resultRank resultAnnouncedAt ratings")
      .lean();

    const results = startups
      .map((s) => ({
        rank: Number(s.resultRank),
        startupName: s.startupName,
        tagline: s.tagline,
        description: s.description,
        category: s.category,
        stage: s.stage,
        logoUrl: s.logoUrl,
        founderName: s.founderName,
        averageScore: s.averageScore,
        totalRatingsCount: s.totalRatingsCount,
        resultAnnouncedAt: s.resultAnnouncedAt,
        feedback: (s.ratings || [])
          .filter((r) => (r.comment || "").trim())
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, 3)
          .map((r) => ({
            investorName: r.investorName,
            investorFirm: r.investorFirm,
            investorPhoto: r.investorPhoto,
            comment: r.comment,
            totalScore: r.totalScore,
          })),
      }))
      .sort((a, b) => a.rank - b.rank);

    return res.json({ results });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load results." });
  }
});

export default router;
