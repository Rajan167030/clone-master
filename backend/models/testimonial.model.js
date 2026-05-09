import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    initials: { type: String, default: "", trim: true },
    quote: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

TestimonialSchema.index({ isActive: 1, order: 1, createdAt: -1 });

export const Testimonial = mongoose.model("Testimonial", TestimonialSchema);