import mongoose from "mongoose";

const { Schema } = mongoose;

const PartnerLogoSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "partner_logos",
  },
);

export const PartnerLogo =
  mongoose.models.PartnerLogo || mongoose.model("PartnerLogo", PartnerLogoSchema);

export default PartnerLogo;
