import mongoose from "mongoose";

const { Schema } = mongoose;

const SliderPromotionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    altText: { type: String, default: "", trim: true },
    linkUrl: { type: String, default: "", trim: true },
    buttonLabel: { type: String, default: "View More", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: String, default: "", trim: true }, // Admin user ID who created it
  },
  { timestamps: true, collection: "slider_promotions" },
);

export const SliderPromotion =
  mongoose.models.SliderPromotion || mongoose.model("SliderPromotion", SliderPromotionSchema);
