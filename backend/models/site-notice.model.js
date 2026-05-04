import mongoose from "mongoose";

const { Schema } = mongoose;

const SiteNoticeSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, default: "Announcement", trim: true },
    message: { type: String, default: "", trim: true },
    buttonLabel: { type: String, default: "", trim: true },
    buttonUrl: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "site_notices" },
);

export const SiteNotice = mongoose.models.SiteNotice || mongoose.model("SiteNotice", SiteNoticeSchema);