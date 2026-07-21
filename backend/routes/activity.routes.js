import { Router } from "express";
import { ActivityStartup, ActivityInvestor } from "../models/activity.model.js";

const router = Router();

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
    });

    await startup.save();
    return res.status(201).json({ message: "Startup registered successfully for Bangalore Event!", startup });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to register startup." });
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
    const startups = await ActivityStartup.find().sort({ averageScore: -1, createdAt: -1 });
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

    const totalScore = Number(scores.innovation || 0) + Number(scores.market || 0) + Number(scores.traction || 0) + Number(scores.team || 0) + Number(scores.pitch || 0);

    const existingRatingIndex = startup.ratings.findIndex((r) => r.investorId === investorId);
    if (existingRatingIndex >= 0) {
      startup.ratings[existingRatingIndex] = {
        investorId,
        investorName: investorName || "Anonymous Investor",
        investorFirm: investorFirm || "",
        investorPhoto: investorPhoto || "",
        scores,
        totalScore,
        comment: comment || "",
        updatedAt: new Date(),
      };
    } else {
      startup.ratings.push({
        investorId,
        investorName: investorName || "Anonymous Investor",
        investorFirm: investorFirm || "",
        investorPhoto: investorPhoto || "",
        scores,
        totalScore,
        comment: comment || "",
        updatedAt: new Date(),
      });
    }

    // Recalculate average score out of 5 stars (totalScore out of 25 converted to 5 scale)
    const sumAverage = startup.ratings.reduce((acc, curr) => acc + curr.totalScore / 5, 0);
    startup.totalRatingsCount = startup.ratings.length;
    startup.averageScore = startup.totalRatingsCount > 0 ? Number((sumAverage / startup.totalRatingsCount).toFixed(2)) : 0;

    await startup.save();
    return res.json({ message: "Rating submitted successfully!", startup });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to submit rating." });
  }
});

export default router;
