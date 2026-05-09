import mongoose from "mongoose";

const { Schema } = mongoose;

const PartnerLogoSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "general", enum: ["general", "college", "ecell"], trim: true },
    logoUrl: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    logoWidth: { type: String, default: "auto", trim: true },
    logoHeight: { type: String, default: "auto", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "partner_logos",
  },
);

export const PartnerLogo =
  mongoose.models.PartnerLogo || mongoose.model("PartnerLogo", PartnerLogoSchema);

export default PartnerLogo;
