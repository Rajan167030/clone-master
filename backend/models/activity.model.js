import mongoose from "mongoose";

const activityStartupSchema = new mongoose.Schema(
  {
    founderName: { type: String, required: true },
    founderEmail: { type: String, required: true },
    founderPhone: { type: String, default: "" },
    startupName: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    stage: { type: String, required: true },
    location: { type: String, default: "Bangalore" },
    promoCodeUsed: { type: String, default: "startup20" },
    pitchDeckUrl: { type: String, required: true },
    logoUrl: { type: String, required: true },
    ratings: [
      {
        investorId: { type: String },
        investorName: { type: String },
        investorFirm: { type: String },
        investorPhoto: { type: String },
        scores: {
          innovation: { type: Number, min: 1, max: 5, required: true },
          market: { type: Number, min: 1, max: 5, required: true },
          traction: { type: Number, min: 1, max: 5, required: true },
          team: { type: Number, min: 1, max: 5, required: true },
          pitch: { type: Number, min: 1, max: 5, required: true },
        },
        totalScore: { type: Number, required: true },
        comment: { type: String, default: "" },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    averageScore: { type: Number, default: 0 },
    totalRatingsCount: { type: Number, default: 0 },
    resultRank: { type: String, enum: ["gold", "silver", "bronze", null], default: null, index: true },
    resultAnnouncedAt: { type: Date, default: null },
    accessToken: { type: String, default: null, unique: true, sparse: true, index: true },
    accessTokenIssuedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const activityInvestorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    firmName: { type: String, required: true },
    designation: { type: String, required: true },
    sectors: { type: [String], default: [] },
    ticketSize: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    bio: { type: String, default: "" },
    photoUrl: { type: String, required: true },
    promoCodeUsed: { type: String, default: "investor20" },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null, index: true },
    inviteId: { type: mongoose.Schema.Types.ObjectId, ref: "InvestorInvite", default: null },
  },
  { timestamps: true }
);

export const ActivityStartup = mongoose.models.ActivityStartup || mongoose.model("ActivityStartup", activityStartupSchema);
export const ActivityInvestor = mongoose.models.ActivityInvestor || mongoose.model("ActivityInvestor", activityInvestorSchema);
