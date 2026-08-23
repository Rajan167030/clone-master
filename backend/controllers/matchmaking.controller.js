import mongoose from "mongoose";
import { Account, Match, MatchSwipe } from "../models/index.js";

const STAGE_RANGE_INR = {
  idea: [0, 500000],
  mvp: [500000, 2500000],
  "early-revenue": [2500000, 10000000],
  growth: [10000000, 50000000],
  scale: [50000000, Infinity],
};

// Rule-based fit score (0-100) from available profile fields: sector overlap,
// investment-range-vs-stage fit, and city proximity. No ML — just explainable heuristics.
const computeMatchScore = (investor, founder) => {
  let score = 0;

  const founderIndustries = (founder.roleDetails?.industry || []).map((s) => String(s).toLowerCase());
  const investorSectors = (investor.roleDetails?.focusSector || []).map((s) => String(s).toLowerCase());
  if (founderIndustries.length === 0 || investorSectors.length === 0) {
    score += 25;
  } else if (founderIndustries.some((s) => investorSectors.includes(s))) {
    score += 50;
  } else {
    score += 5;
  }

  const stageRange = STAGE_RANGE_INR[founder.roleDetails?.startupStage] || null;
  const investorRange = investor.roleDetails?.investmentRange;
  if (stageRange && investorRange && typeof investorRange.min === "number" && typeof investorRange.max === "number") {
    const overlaps = investorRange.min <= stageRange[1] && investorRange.max >= stageRange[0];
    score += overlaps ? 30 : 10;
  } else {
    score += 15;
  }

  if (investor.city && founder.city && String(investor.city).toLowerCase() === String(founder.city).toLowerCase()) {
    score += 20;
  } else {
    score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

const toCandidateCard = (account, matchScore) => ({
  id: account._id,
  fullName: account.fullName,
  role: account.role,
  city: account.city,
  headline: account.headline || "",
  profilePhoto: account.profilePhoto || "",
  profileId: account.profileId,
  roleDetails: account.roleDetails || {},
  matchScore,
});

export const getDeck = async (req, res, next) => {
  try {
    const meId = req.user.sub;
    const limit = Math.min(Number(req.query.limit) || 10, 30);

    const me = await Account.findById(meId).lean();
    if (!me) {
      return res.status(404).json({ message: "Account not found." });
    }

    const targetRole = me.role === "founder" ? "investor" : "founder";

    const swipedIds = await MatchSwipe.find({ fromUserId: meId }).distinct("toUserId");

    const candidates = await Account.find({
      role: targetRole,
      isActive: true,
      isProfilePublic: true,
      _id: { $nin: [...swipedIds, meId] },
    })
      .select("fullName role city headline profilePhoto profileId roleDetails")
      .limit(200)
      .lean();

    const scored = candidates
      .map((c) => {
        const investor = me.role === "investor" ? me : c;
        const founder = me.role === "founder" ? me : c;
        return toCandidateCard(c, computeMatchScore(investor, founder));
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return res.status(200).json({ deck: scored });
  } catch (error) {
    return next(error);
  }
};

export const swipe = async (req, res, next) => {
  try {
    const meId = req.user.sub;
    const { targetUserId, action } = req.body || {};

    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ message: "Invalid target user id." });
    }
    if (!["like", "pass"].includes(action)) {
      return res.status(400).json({ message: "action must be 'like' or 'pass'." });
    }
    if (String(targetUserId) === String(meId)) {
      return res.status(400).json({ message: "You can't swipe on yourself." });
    }

    const target = await Account.findById(targetUserId).select("fullName role city headline profilePhoto profileId roleDetails").lean();
    if (!target) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!["founder", "investor"].includes(target.role) || target.role === req.user.role) {
      return res.status(400).json({ message: "You can only swipe on the opposite role (founders <-> investors)." });
    }

    await MatchSwipe.findOneAndUpdate(
      { fromUserId: meId, toUserId: targetUserId },
      { $set: { action } },
      { upsert: true, new: true },
    );

    if (action === "pass") {
      return res.status(200).json({ matched: false });
    }

    const reciprocated = await MatchSwipe.findOne({ fromUserId: targetUserId, toUserId: meId, action: "like" }).lean();
    if (!reciprocated) {
      return res.status(200).json({ matched: false });
    }

    let match = await Match.findOne({ users: { $all: [meId, targetUserId] } }).lean();
    if (!match) {
      match = await Match.create({ users: [meId, targetUserId] });
    }

    return res.status(200).json({
      matched: true,
      match: {
        id: match._id,
        matchedAt: match.matchedAt || match.createdAt,
        user: target,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const listMatches = async (req, res, next) => {
  try {
    const meId = new mongoose.Types.ObjectId(req.user.sub);

    const matches = await Match.find({ users: meId }).sort({ matchedAt: -1 }).lean();
    const otherIds = matches.map((m) => m.users.find((id) => String(id) !== String(meId)));

    const accounts = await Account.find({ _id: { $in: otherIds } })
      .select("fullName role city headline profilePhoto profileId roleDetails")
      .lean();
    const accountMap = new Map(accounts.map((a) => [String(a._id), a]));

    const result = matches
      .map((m) => {
        const otherId = m.users.find((id) => String(id) !== String(meId));
        const account = accountMap.get(String(otherId));
        if (!account) return null;
        return {
          id: m._id,
          matchedAt: m.matchedAt || m.createdAt,
          user: account,
        };
      })
      .filter(Boolean);

    return res.status(200).json({ matches: result });
  } catch (error) {
    return next(error);
  }
};
