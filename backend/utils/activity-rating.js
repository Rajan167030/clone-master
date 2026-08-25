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

export const applyStartupRating = (startup, { investorId, investorName, investorFirm, investorPhoto, scores, comment }) => {
  const totalScore = CRITERIA_KEYS.reduce((sum, key) => sum + Number(scores?.[key] || 0), 0);

  const ratingEntry = {
    investorId,
    investorName: investorName || "Anonymous Investor",
    investorFirm: investorFirm || "",
    investorPhoto: investorPhoto || "",
    scores,
    totalScore,
    comment: comment || "",
    updatedAt: new Date(),
  };

  const existingRatingIndex = startup.ratings.findIndex((r) => r.investorId === investorId);
  if (existingRatingIndex >= 0) {
    startup.ratings[existingRatingIndex] = ratingEntry;
  } else {
    startup.ratings.push(ratingEntry);
  }

  const sumAverage = startup.ratings.reduce((acc, curr) => acc + curr.totalScore / CRITERIA_KEYS.length, 0);
  startup.totalRatingsCount = startup.ratings.length;
  startup.averageScore = startup.totalRatingsCount > 0 ? Number((sumAverage / startup.totalRatingsCount).toFixed(2)) : 0;

  return startup;
};
