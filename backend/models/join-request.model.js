import mongoose from "mongoose";

const { Schema } = mongoose;

const JoinRequestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    occupation: { type: String, required: true, trim: true },
    collegeName: { type: String, trim: true },
    companyName: { type: String, required: true, trim: true },
    linkedinProfile: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    whyJoin: { type: String, required: true, trim: true },
    referralSource: { type: String, required: true, trim: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true, collection: "join_requests" },
);

export const JoinRequest = mongoose.models.JoinRequest || mongoose.model("JoinRequest", JoinRequestSchema);

export default JoinRequest;
