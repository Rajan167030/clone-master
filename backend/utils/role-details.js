const normalizeExperience = (value) => {
  const map = {
    beginner: "beginner",
    fresher: "beginner",
    "entry-level": "beginner",
    entrylevel: "beginner",
    intermediate: "intermediate",
    mid: "intermediate",
    "mid-level": "intermediate",
    midlevel: "intermediate",
    advanced: "advanced",
    senior: "advanced",
    expert: "expert",
    lead: "expert",
    principal: "expert",
  };

  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
  return map[normalized] || null;
};

const normalizeFounderStage = (value) => {
  const map = {
    idea: "idea",
    mvp: "mvp",
    "early-revenue": "early-revenue",
    earlyrevenue: "early-revenue",
    seed: "seed",
    "series-a": "series-a",
    seriesa: "series-a",
    "series-b": "series-b",
    seriesb: "series-b",
    "series-c": "series-c",
    seriesc: "series-c",
    growth: "growth",
    scale: "scale",
    exit: "exit",
  };

  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  return map[normalized] || null;
};

export const validateAndNormalizeRoleDetails = (role, roleDetails = {}) => {
  if (role === "user") {
    const interest = String(roleDetails.interest || "").trim();
    const occupation = String(roleDetails.occupation || "").trim();
    const experienceLevel = normalizeExperience(roleDetails.experienceLevel);

    if (!interest || !occupation || !experienceLevel) {
      throw new Error("User requires interest, occupation, and valid experienceLevel.");
    }

    return { interest, occupation, experienceLevel };
  }

  if (role === "investor") {
    const min = Number(roleDetails?.investmentRange?.min);
    const max = Number(roleDetails?.investmentRange?.max);
    const currency = String(roleDetails?.investmentRange?.currency || "INR").trim().toUpperCase();
    const focusSectorRaw = Array.isArray(roleDetails.focusSector) ? roleDetails.focusSector : [];
    const focusSector = focusSectorRaw.map((item) => String(item).trim()).filter(Boolean);
    const portfolioSize = Number(roleDetails.portfolioSize);
    const investorId = String(roleDetails.investorId || "").trim();

    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) {
      throw new Error("Investor requires a valid investmentRange (min/max).");
    }

    if (!focusSector.length || !Number.isFinite(portfolioSize) || portfolioSize < 0 || !investorId) {
      throw new Error("Investor requires focusSector, portfolioSize, and investorId.");
    }

    return {
      investmentRange: { min, max, currency },
      focusSector,
      portfolioSize,
      investorId,
    };
  }

  if (role === "founder") {
    const startupName = String(roleDetails.startupName || "").trim();
    const startupStage = normalizeFounderStage(roleDetails.startupStage);
    const teamSize = Number(roleDetails.teamSize);
    const startupWebsite = String(roleDetails.startupWebsite || "").trim();

    if (!startupName || !startupStage || !Number.isFinite(teamSize) || teamSize < 1 || !startupWebsite) {
      throw new Error("Founder requires startupName, startupStage, teamSize, and startupWebsite.");
    }

    return { startupName, startupStage, teamSize, startupWebsite };
  }

  throw new Error("Unsupported role.");
};
