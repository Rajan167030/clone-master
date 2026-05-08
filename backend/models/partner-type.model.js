import mongoose from "mongoose";

const { Schema } = mongoose;

const partnerTypeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const PartnerType = mongoose.models.PartnerType || mongoose.model("PartnerType", partnerTypeSchema);

export default PartnerType;
