import { ActivityStartup, ActivityInvestor } from "../models/activity.model.js";

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

    return res.status(200).json({ message: "Investor removed from the Bangalore Event Activity." });
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
