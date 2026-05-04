import mongoose from "mongoose";

const { Schema } = mongoose;

const EventInterestSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    occupation: { type: String, default: "", trim: true },
    startupName: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    source: { type: String, default: "event_interest_form", trim: true },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "approved", "contacted"],
      default: "submitted",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "event_interests",
  },
);

EventInterestSchema.index({ slug: 1, email: 1 }, { unique: true });

export const EventInterest =
  mongoose.models.EventInterest || mongoose.model("EventInterest", EventInterestSchema);
