import mongoose from "mongoose";

const { Schema } = mongoose;

const cookieConsentLogSchema = new Schema(
  {
    visitorId: { type: String, required: true, trim: true, index: true },
    choice: { type: String, enum: ["accepted", "denied"], required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    path: { type: String, default: "", trim: true },
    userAgent: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "cookie_consent_logs" },
);

cookieConsentLogSchema.index({ createdAt: -1 });

export const CookieConsentLog =
  mongoose.models.CookieConsentLog || mongoose.model("CookieConsentLog", cookieConsentLogSchema);
