// 7-criteria SAIS'26 rubric, each scored 1-10 — must mirror src/lib/rating-criteria.ts.
const CRITERIA_KEYS = [
  "market",
  "traction",
  "pitch",
  "problemClarity",
  "solutionViability",
  "qna",
  "mvpFit",
];

export const applyStartupRating = (
  startup,
  { investorId, investorName, investorFirm, investorPhoto, scores, comment, feedbackImageUrl, voiceNoteUrl },
) => {
  const totalScore = CRITERIA_KEYS.reduce((sum, key) => sum + Number(scores?.[key] || 0), 0);

  const ratingEntry = {
    investorId,
    investorName: investorName || "Anonymous Investor",
    investorFirm: investorFirm || "",
    investorPhoto: investorPhoto || "",
    scores,
    totalScore,
    comment: comment || "",
    feedbackImageUrl: feedbackImageUrl || "",
    voiceNoteUrl: voiceNoteUrl || "",
    updatedAt: new Date(),
  };

  const existingRatingIndex = startup.ratings.findIndex((r) => r.investorId === investorId);
  if (existingRatingIndex >= 0) {
    startup.ratings[existingRatingIndex] = ratingEntry;
  } else {
    startup.ratings.push(ratingEntry);
  }

  // Recompute every rating's per-criterion average live from its raw `scores`, ignoring
  // `curr.totalScore` — that field was frozen at whatever CRITERIA_KEYS existed when that
  // rating was submitted, so trusting it drifts out of sync each time the rubric changes.
  const sumAverage = startup.ratings.reduce((acc, curr) => {
    const liveTotal = CRITERIA_KEYS.reduce((sum, key) => sum + Number(curr.scores?.[key] || 0), 0);
    return acc + liveTotal / CRITERIA_KEYS.length;
  }, 0);
  startup.totalRatingsCount = startup.ratings.length;
  startup.averageScore = startup.totalRatingsCount > 0 ? Number((sumAverage / startup.totalRatingsCount).toFixed(2)) : 0;

  return startup;
};
