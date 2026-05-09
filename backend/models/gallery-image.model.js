import mongoose from "mongoose";

const GalleryImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    altText: { type: String, default: "", trim: true },
    caption: { type: String, default: "", trim: true },
    linkUrl: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

GalleryImageSchema.index({ isActive: 1, order: 1, createdAt: -1 });

export const GalleryImage = mongoose.model("GalleryImage", GalleryImageSchema);