import mongoose from "mongoose";

const { Schema } = mongoose;

const EmailVerificationSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    purpose: {
      type: String,
      required: true,
      enum: ["register:user", "register:investor", "register:founder", "join-us", "partner-inquiry"],
      index: true,
    },
    codeHash: { type: String, required: true },
    verificationToken: { type: String, default: null, index: true },
    attempts: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true, collection: "email_verifications" },
);

EmailVerificationSchema.index({ email: 1, purpose: 1, createdAt: -1 });

export const EmailVerification =
  mongoose.models.EmailVerification || mongoose.model("EmailVerification", EmailVerificationSchema);

export default EmailVerification;
