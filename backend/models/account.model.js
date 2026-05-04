import mongoose from "mongoose";

const { Schema } = mongoose;

const DashboardStatSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    color: {
      type: String,
      enum: ["blue", "green", "purple", "amber"],
      default: "blue",
    },
  },
  { _id: false },
);

const PortfolioItemSchema = new Schema(
  {
    startupName: { type: String, required: true, trim: true },
    investment: { type: String, default: "0", trim: true },
    date: { type: String, default: "Waiting", trim: true },
  },
  { _id: false },
);

const BaseAccountSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["user", "investor", "founder", "admin"],
      index: true,
    },
    referralCode: { type: String, trim: true, index: true },
    roleDetails: { type: Schema.Types.Mixed, default: {} },
    dashboard: {
      stats: { type: [DashboardStatSchema], default: [] },
      commitmentPortfolio: { type: [PortfolioItemSchema], default: [] },
      investmentPortfolio: { type: [PortfolioItemSchema], default: [] },
      widgets: { type: Schema.Types.Mixed, default: {} },
    },
    aiContext: {
      summary: { type: String, default: "" },
      tags: { type: [String], default: [] },
      preferences: { type: Schema.Types.Mixed, default: {} },
      embeddingId: { type: String, default: null },
    },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    // Profile Card Fields
    profileId: { type: String, unique: true, sparse: true, index: true },
    headline: { type: String, default: "", trim: true },
    profilePhoto: { type: String, default: "", trim: true },
    cardColors: {
      primary: { type: String, default: "#667eea", trim: true }, // Gradient start
      secondary: { type: String, default: "#764ba2", trim: true }, // Gradient end
      accent: { type: String, default: "#ffffff", trim: true }, // Text color on card
      backgroundColor: { type: String, default: "#ffffff", trim: true }, // Inner card bg
    },
    nfcId: { type: String, default: null, trim: true }, // NFC tag ID if available
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    collection: "accounts",
  },
);

BaseAccountSchema.pre("validate", function normalizeEmail(next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

BaseAccountSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    city: this.city,
    referralCode: this.referralCode,
    roleDetails: this.roleDetails,
    dashboard: this.dashboard,
    aiContext: this.aiContext,
    isActive: this.isActive,
    profileId: this.profileId,
    headline: this.headline,
    profilePhoto: this.profilePhoto,
    cardColors: this.cardColors,
    nfcId: this.nfcId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Account = mongoose.models.Account || mongoose.model("Account", BaseAccountSchema);

const UserRoleDetailsSchema = new Schema(
  {
    interest: { type: String, required: true, trim: true },
    occupation: { type: String, required: true, trim: true },
    experienceLevel: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced", "expert"],
    },
  },
  { _id: false },
);

const InvestorRoleDetailsSchema = new Schema(
  {
    investmentRange: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "INR", trim: true },
    },
    focusSector: { type: [String], required: true, default: [] },
    portfolioSize: { type: Number, required: true, min: 0 },
    investorId: { type: String, required: true, trim: true, index: true },
  },
  { _id: false },
);

const FounderRoleDetailsSchema = new Schema(
  {
    startupName: { type: String, required: true, trim: true },
    startupStage: {
      type: String,
      required: true,
      enum: ["idea", "mvp", "early-revenue", "growth", "scale"],
    },
    teamSize: { type: Number, required: true, min: 1 },
    startupWebsite: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const UserSchema = new Schema({
  roleDetails: { type: UserRoleDetailsSchema, required: true },
});

const InvestorSchema = new Schema({
  roleDetails: { type: InvestorRoleDetailsSchema, required: true },
});

const FounderSchema = new Schema({
  roleDetails: { type: FounderRoleDetailsSchema, required: true },
});

export const UserAccount =
  mongoose.models.user || Account.discriminator("user", UserSchema);

export const InvestorAccount =
  mongoose.models.investor || Account.discriminator("investor", InvestorSchema);

export const FounderAccount =
  mongoose.models.founder || Account.discriminator("founder", FounderSchema);
