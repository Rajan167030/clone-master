/**
 * JSON Schemas for each founder AI tool, plus normalizers.
 * Claude enforces the schema server-side (output_config.format); Groq doesn't, so every
 * response goes through normalize*() which coerces types, clamps scores and fills defaults
 * so the frontend can render without null checks.
 */

const S = { type: "string" };
const I = { type: "integer" };
const B = { type: "boolean" };
const arr = (items) => ({ type: "array", items });
const en = (values) => ({ type: "string", enum: values });
const obj = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

/* ---------- coercion helpers ---------- */
const s = (v, max = 2000) => String(v ?? "").trim().slice(0, max);
const n = (v, min, max) => {
  const x = Math.round(Number(v));
  return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min;
};
const list = (v, map, max = 20) => (Array.isArray(v) ? v : []).slice(0, max).map(map);
const strList = (v, max = 12) => list(v, (x) => s(typeof x === "string" ? x : x?.text ?? x), max).filter(Boolean);
const oneOf = (v, values, fallback) => (values.includes(v) ? v : fallback);

/* ------------------------------------------------------------------ */
/* Pitch deck                                                          */
/* ------------------------------------------------------------------ */

export const SLIDE_TYPES = [
  "title", "problem", "solution", "product", "market", "business_model",
  "traction", "competition", "go_to_market", "team", "financials", "ask", "closing",
];

export const pitchDeckSchema = obj({
  deckTitle: S,
  tagline: S,
  slides: arr(
    obj({
      type: en(SLIDE_TYPES),
      title: S,
      headline: S,
      bullets: arr(S),
      speakerNotes: S,
      visualSuggestion: S,
    }),
  ),
  tips: arr(S),
});

export const normalizeDeck = (d = {}) => ({
  deckTitle: s(d.deckTitle, 150) || "Pitch Deck",
  tagline: s(d.tagline, 250),
  slides: list(
    d.slides,
    (x) => ({
      type: oneOf(x?.type, SLIDE_TYPES, "product"),
      title: s(x?.title, 120) || "Slide",
      headline: s(x?.headline, 300),
      bullets: strList(x?.bullets, 8).map((b) => b.slice(0, 300)),
      speakerNotes: s(x?.speakerNotes, 2000),
      visualSuggestion: s(x?.visualSuggestion, 400),
    }),
    20,
  ),
  tips: strList(d.tips, 8),
});

/* ------------------------------------------------------------------ */
/* Pitch review                                                        */
/* ------------------------------------------------------------------ */

export const REVIEW_CRITERIA = [
  "Problem clarity",
  "Solution & product",
  "Market size & insight",
  "Business model",
  "Traction & validation",
  "Competition & moat",
  "Team",
  "The ask & use of funds",
  "Storytelling & clarity",
];

export const pitchReviewSchema = obj({
  overallScore: I,
  verdict: en(["not_ready", "needs_work", "promising", "investor_ready"]),
  summary: S,
  criteria: arr(obj({ name: S, score: I, feedback: S })),
  strengths: arr(S),
  weaknesses: arr(S),
  redFlags: arr(S),
  likelyInvestorQuestions: arr(S),
  rewrites: arr(obj({ original: S, improved: S, why: S })),
  nextSteps: arr(S),
});

export const normalizeReview = (d = {}) => ({
  overallScore: n(d.overallScore, 0, 100),
  verdict: oneOf(d.verdict, ["not_ready", "needs_work", "promising", "investor_ready"], "needs_work"),
  summary: s(d.summary, 2000),
  criteria: list(d.criteria, (c) => ({ name: s(c?.name, 80), score: n(c?.score, 1, 10), feedback: s(c?.feedback, 1000) }), 12).filter((c) => c.name),
  strengths: strList(d.strengths),
  weaknesses: strList(d.weaknesses),
  redFlags: strList(d.redFlags),
  likelyInvestorQuestions: strList(d.likelyInvestorQuestions, 12),
  rewrites: list(d.rewrites, (r) => ({ original: s(r?.original, 600), improved: s(r?.improved, 800), why: s(r?.why, 400) }), 8).filter((r) => r.improved),
  nextSteps: strList(d.nextSteps, 10),
});

/* ------------------------------------------------------------------ */
/* Startup validation & business model                                 */
/* ------------------------------------------------------------------ */

const RISK = ["high", "medium", "low"];
const EFFORT = ["low", "medium", "high"];

export const validationSchema = obj({
  viabilityScore: I,
  summary: S,
  leanCanvas: obj({
    problem: arr(S),
    customerSegments: arr(S),
    uniqueValueProposition: S,
    solution: arr(S),
    channels: arr(S),
    revenueStreams: arr(S),
    costStructure: arr(S),
    keyMetrics: arr(S),
    unfairAdvantage: S,
  }),
  assumptions: arr(obj({ assumption: S, risk: en(RISK), howToTest: S })),
  experiments: arr(obj({ name: S, description: S, successMetric: S, effort: en(EFFORT), timeframe: S })),
  revenueModels: arr(obj({ model: S, fit: en(RISK), pricingIdea: S, notes: S })),
  risks: arr(S),
  marketQuestions: arr(S),
});

export const normalizeValidation = (d = {}) => {
  const lc = d.leanCanvas || {};
  return {
    viabilityScore: n(d.viabilityScore, 0, 100),
    summary: s(d.summary, 2000),
    leanCanvas: {
      problem: strList(lc.problem, 5),
      customerSegments: strList(lc.customerSegments, 5),
      uniqueValueProposition: s(lc.uniqueValueProposition, 500),
      solution: strList(lc.solution, 5),
      channels: strList(lc.channels, 6),
      revenueStreams: strList(lc.revenueStreams, 5),
      costStructure: strList(lc.costStructure, 6),
      keyMetrics: strList(lc.keyMetrics, 6),
      unfairAdvantage: s(lc.unfairAdvantage, 500),
    },
    assumptions: list(d.assumptions, (a) => ({ assumption: s(a?.assumption, 400), risk: oneOf(a?.risk, RISK, "medium"), howToTest: s(a?.howToTest, 500) }), 10).filter((a) => a.assumption),
    experiments: list(d.experiments, (e) => ({ name: s(e?.name, 120), description: s(e?.description, 600), successMetric: s(e?.successMetric, 300), effort: oneOf(e?.effort, EFFORT, "medium"), timeframe: s(e?.timeframe, 60) }), 8).filter((e) => e.name),
    revenueModels: list(d.revenueModels, (r) => ({ model: s(r?.model, 120), fit: oneOf(r?.fit, RISK, "medium"), pricingIdea: s(r?.pricingIdea, 300), notes: s(r?.notes, 500) }), 6).filter((r) => r.model),
    risks: strList(d.risks, 10),
    marketQuestions: strList(d.marketQuestions, 10),
  };
};

/* ------------------------------------------------------------------ */
/* Investor readiness                                                  */
/* ------------------------------------------------------------------ */

export const READINESS_DIMENSIONS = ["Team", "Product", "Traction", "Market", "Financials", "Legal & cap table", "Pitch & materials"];
const STATUS = ["strong", "okay", "gap"];
const PRIORITY = ["high", "medium", "low"];

export const readinessSchema = obj({
  readinessScore: I,
  level: en(["early", "building", "almost_ready", "ready"]),
  summary: S,
  dimensions: arr(obj({ name: S, score: I, status: en(STATUS), advice: S })),
  gaps: arr(obj({ item: S, priority: en(PRIORITY), action: S })),
  suggestedRaise: obj({ amountRange: S, instrument: S, rationale: S }),
  investorTypes: arr(obj({ type: S, why: S })),
  ninetyDayPlan: arr(obj({ period: S, focus: S, actions: arr(S) })),
});

export const normalizeReadiness = (d = {}) => ({
  readinessScore: n(d.readinessScore, 0, 100),
  level: oneOf(d.level, ["early", "building", "almost_ready", "ready"], "building"),
  summary: s(d.summary, 2000),
  dimensions: list(d.dimensions, (x) => ({ name: s(x?.name, 60), score: n(x?.score, 1, 10), status: oneOf(x?.status, STATUS, "okay"), advice: s(x?.advice, 800) }), 10).filter((x) => x.name),
  gaps: list(d.gaps, (g) => ({ item: s(g?.item, 200), priority: oneOf(g?.priority, PRIORITY, "medium"), action: s(g?.action, 600) }), 12).filter((g) => g.item),
  suggestedRaise: {
    amountRange: s(d.suggestedRaise?.amountRange, 120),
    instrument: s(d.suggestedRaise?.instrument, 120),
    rationale: s(d.suggestedRaise?.rationale, 800),
  },
  investorTypes: list(d.investorTypes, (t) => ({ type: s(t?.type, 120), why: s(t?.why, 400) }), 6).filter((t) => t.type),
  ninetyDayPlan: list(d.ninetyDayPlan, (p) => ({ period: s(p?.period, 60), focus: s(p?.focus, 200), actions: strList(p?.actions, 6) }), 6).filter((p) => p.focus),
});
