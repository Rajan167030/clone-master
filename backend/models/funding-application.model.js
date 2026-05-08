import mongoose from "mongoose";

const { Schema } = mongoose;

const FundingApplicationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    startupName: { type: String, required: true, trim: true },
    startupLink: { type: String, default: "", trim: true },
    sector: { type: String, default: "", trim: true },
    sectorOther: { type: String, default: "", trim: true },
    mrr: { type: String, default: "", trim: true },
    mrrOther: { type: String, default: "", trim: true },
    brief: { type: String, required: true, trim: true },
    pitchDeckUrl: { type: String, default: "", trim: true },
    pitchDeckName: { type: String, default: "", trim: true },
    problem: { type: String, required: true, trim: true },
    solution: { type: String, required: true, trim: true },
    targetCustomers: { type: String, required: true, trim: true },
    revenue6Months: { type: String, default: "", trim: true },
    growthRate: { type: String, default: "", trim: true },
    payingCustomers: { type: String, default: "", trim: true },
    raisedBefore: { type: String, default: "", trim: true },
    raisedDetails: { type: String, default: "", trim: true },
    raiseAmountRange: { type: String, default: "", trim: true },
    stage: { type: String, default: "", trim: true },
    agreeAccurate: { type: Boolean, default: false },
    agreePromo: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "reviewed", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true, collection: "funding_applications" },
);

export const FundingApplication =
  mongoose.models.FundingApplication || mongoose.model("FundingApplication", FundingApplicationSchema);

export default FundingApplication;