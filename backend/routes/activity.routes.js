import crypto from "crypto";
import { Router } from "express";
import { ActivityStartup, ActivityInvestor } from "../models/activity.model.js";
import { applyStartupRating } from "../utils/activity-rating.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { sendEmail } from "../utils/email.js";

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

    if (!founderName || !founderEmail || !startupName || !tagline || !pitchDeckUrl || !logoUrl) {
      return res.status(400).json({ message: "Please fill all required startup details." });
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
      pitchDeckUrl,
      logoUrl,
      promoCodeUsed: "startup20",
      accessToken,
      accessTokenIssuedAt: new Date(),
    });

    await startup.save();

    const dashboardLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/sais26/founder/${accessToken}`;
    sendEmail({
      to: founderEmail,
      subject: "Your SAIS'26 Founder Dashboard",
      html: `<p>Hi ${founderName},</p><p>Thanks for registering ${startupName} for SAIS'26. Here is your private dashboard link — save it, it's how you'll get back in:</p><p><a href="${dashboardLink}">${dashboardLink}</a></p>`,
    }).catch(() => {});

    return res.status(201).json({ message: "Startup registered successfully for Bangalore Event!", startup, accessToken });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to register startup." });
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
    });

    await investor.save();
    return res.status(201).json({ message: "Investor profile saved successfully!", investor });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to save investor profile." });
  }
});

// Get all Bangalore Startups
router.get("/startups", async (req, res) => {
  try {
    const startups = await ActivityStartup.find()
      .select("-accessToken -accessTokenIssuedAt")
      .sort({ createdAt: -1 });
    return res.json({ startups });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch startups." });
  }
});

// Get all Bangalore Investors
router.get("/investors", async (req, res) => {
  try {
    const investors = await ActivityInvestor.find().sort({ createdAt: -1 });
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

    const { startupId, scores, comment } = req.body || {};
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

export default router;
