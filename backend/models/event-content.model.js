import mongoose from "mongoose";

const { Schema } = mongoose;

const EventFaqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const EventContentSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    shortDescription: { type: String, default: "", trim: true },
    bannerImage: { type: String, required: true, trim: true },
    bannerAlt: { type: String, default: "", trim: true },
    hostName: { type: String, default: "", trim: true },
    hostLogoText: { type: String, default: "FC", trim: true },
    dateLabel: { type: String, default: "", trim: true },
    locationLabel: { type: String, default: "", trim: true },
    mapUrl: { type: String, default: "", trim: true },
    calendarUrl: { type: String, default: "", trim: true },
    registrationUrl: { type: String, default: "", trim: true },
    ticketLabel: { type: String, default: "", trim: true },
    refundPolicy: { type: String, default: "", trim: true },
    about: { type: [String], default: [] },
    expectations: { type: [String], default: [] },
    differentiators: { type: [String], default: [] },
    audience: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    photos: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    faqs: { type: [EventFaqSchema], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
    featuredOnSlider: { type: Boolean, default: false, index: true },
    sliderOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "event_contents" },
);

export const EventContent =
  mongoose.models.EventContent || mongoose.model("EventContent", EventContentSchema);
