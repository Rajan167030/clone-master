import mongoose from "mongoose";

const { Schema } = mongoose;

const CohortSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    category: {
      type: String,
      enum: ["startup", "d2c", "general", "upcoming"],
      default: "startup",
      index: true,
    },
    tagline: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "", trim: true },
    duration: { type: String, default: "8 Weeks", trim: true },
    mode: { type: String, default: "Hybrid", trim: true },
    startDate: { type: String, default: "", trim: true },
    status: {
      type: String,
      default: "Waitlist Open",
      trim: true,
    },
    applicationUrl: { type: String, default: "/join-us", trim: true },
    highlights: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "cohorts",
  },
);

export const Cohort = mongoose.models.Cohort || mongoose.model("Cohort", CohortSchema);
export default Cohort;
