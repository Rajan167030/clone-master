import mongoose from "mongoose";

const { Schema } = mongoose;

const SpeakerInvestorProfileSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    category: { type: String, required: true, enum: ["speaker", "investor"], index: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    photoUrl: { type: String, default: "", trim: true },
    photoAlt: { type: String, default: "", trim: true },
    summary: { type: String, default: "", trim: true },
    linkedinUrl: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "speaker_investor_profiles",
  },
);

export const SpeakerInvestorProfile =
  mongoose.models.SpeakerInvestorProfile ||
  mongoose.model("SpeakerInvestorProfile", SpeakerInvestorProfileSchema);

export default SpeakerInvestorProfile;