// Shared SAIS'26 investor evaluation rubric — used by the rating dialogs (Sais26Room,
// BangaloreActivity) and the results breakdown (StartupProfileModal) so the criteria list,
// labels, and 1-10 scale stay in sync everywhere a startup gets scored or reviewed.

export type RatingCriterionKey =
  | "market"
  | "traction"
  | "pitch"
  | "problemClarity"
  | "solutionViability"
  | "qna"
  | "mvpFit";

export type RatingCriterionDef = {
  key: RatingCriterionKey;
  label: string;
};

export const RATING_CRITERIA: RatingCriterionDef[] = [
  { key: "problemClarity", label: "Problem Clarity" },
  { key: "solutionViability", label: "Solution Viability" },
  { key: "mvpFit", label: "MVP Fit to Problem" },
  { key: "market", label: "Market Opportunity & Scalability" },
  { key: "traction", label: "Business Model & Traction" },
  { key: "pitch", label: "Pitch & Presentation Quality" },
  { key: "qna", label: "Investor Q&A Round" },
];

export const RATING_SCALE_MAX = 10;
export const RATING_CRITERIA_COUNT = RATING_CRITERIA.length;
export const RATING_MAX_TOTAL = RATING_SCALE_MAX * RATING_CRITERIA_COUNT;

export const DEFAULT_RATING_SCORES: Record<RatingCriterionKey, number> = RATING_CRITERIA.reduce(
  (acc, c) => {
    acc[c.key] = 0;
    return acc;
  },
  {} as Record<RatingCriterionKey, number>,
);

export const sumRatingScores = (scores: Record<RatingCriterionKey, number>): number =>
  RATING_CRITERIA.reduce((sum, c) => sum + Number(scores?.[c.key] || 0), 0);

export const ratingScoreLabel = (value: number): string => {
  if (value <= 0) return "Not rated";
  if (value <= 2) return "Poor";
  if (value <= 4) return "Below Average";
  if (value <= 6) return "Average";
  if (value <= 8) return "Good";
  return "Excellent";
};
