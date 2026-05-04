import mongoose from "mongoose";

const { Schema } = mongoose;

const NewsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    name: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: { createdAt: "subscribedAt", updatedAt: "updatedAt" }, collection: "newsletter_subscribers" },
);

export const NewsletterSubscriber =
  mongoose.models.NewsletterSubscriber || mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);
