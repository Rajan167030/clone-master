export const applyStartupRating = (startup, { investorId, investorName, investorFirm, investorPhoto, scores, comment }) => {
  const totalScore =
    Number(scores?.innovation || 0) +
    Number(scores?.market || 0) +
    Number(scores?.traction || 0) +
    Number(scores?.team || 0) +
    Number(scores?.pitch || 0);

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

  const sumAverage = startup.ratings.reduce((acc, curr) => acc + curr.totalScore / 5, 0);
  startup.totalRatingsCount = startup.ratings.length;
  startup.averageScore = startup.totalRatingsCount > 0 ? Number((sumAverage / startup.totalRatingsCount).toFixed(2)) : 0;

  return startup;
};
