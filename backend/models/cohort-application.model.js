import mongoose from "mongoose";

const { Schema } = mongoose;

export const COHORT_APPLICATION_STATUSES = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "accepted",
  "waitlisted",
  "rejected",
];

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    changedBy: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const CohortApplicationSchema = new Schema(
  {
    cohort: { type: Schema.Types.ObjectId, ref: "Cohort", index: true },
    cohortSlug: { type: String, required: true, trim: true, index: true },
    cohortTitle: { type: String, default: "", trim: true },

    founderName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    linkedinUrl: { type: String, default: "", trim: true },

    startupName: { type: String, required: true, trim: true },
    website: { type: String, default: "", trim: true },
    industry: { type: String, default: "", trim: true },
    stage: { type: String, default: "", trim: true },
    teamSize: { type: String, default: "", trim: true },
    monthlyRevenue: { type: String, default: "", trim: true },
    fundingRaised: { type: String, default: "", trim: true },
    pitch: { type: String, default: "", trim: true },
    whyJoin: { type: String, default: "", trim: true },
    deckUrl: { type: String, default: "", trim: true },
    referralSource: { type: String, default: "", trim: true },

    status: { type: String, enum: COHORT_APPLICATION_STATUSES, default: "new", index: true },
    score: { type: Number, min: 0, max: 10, default: null },
    adminNotes: { type: String, default: "", trim: true },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "cohort_applications" },
);

CohortApplicationSchema.index({ cohortSlug: 1, email: 1 }, { unique: true });

export const CohortApplication =
  mongoose.models.CohortApplication || mongoose.model("CohortApplication", CohortApplicationSchema);
export default CohortApplication;
