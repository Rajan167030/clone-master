import mongoose from "mongoose";

const { Schema } = mongoose;

const KpiSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    color: {
      type: String,
      enum: ["blue", "green", "purple", "amber"],
      default: "blue",
    },
    trend: { type: String, default: "stable", trim: true },
  },
  { _id: false },
);

const PortfolioRowSchema = new Schema(
  {
    startupName: { type: String, required: true, trim: true },
    investment: { type: String, default: "0", trim: true },
    date: { type: String, default: "Waiting", trim: true },
    status: { type: String, default: "active", trim: true },
  },
  { _id: false },
);

const WidgetLayoutSchema = new Schema(
  {
    widgetId: { type: String, required: true, trim: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    w: { type: Number, default: 4 },
    h: { type: Number, default: 2 },
    visible: { type: Boolean, default: true },
  },
  { _id: false },
);

const BaseDashboardSchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "investor", "founder"],
      index: true,
    },
    title: { type: String, default: "Dashboard", trim: true },
    kpis: { type: [KpiSchema], default: [] },
    tables: {
      commitmentPortfolio: { type: [PortfolioRowSchema], default: [] },
      investmentPortfolio: { type: [PortfolioRowSchema], default: [] },
    },
    filters: { type: Schema.Types.Mixed, default: {} },
    widgetsData: { type: Schema.Types.Mixed, default: {} },
    layout: { type: [WidgetLayoutSchema], default: [] },
    roleConfig: { type: Schema.Types.Mixed, default: {} },
    lastComputedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
    collection: "dashboards",
  },
);

BaseDashboardSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    accountId: this.accountId,
    role: this.role,
    title: this.title,
    kpis: this.kpis,
    tables: this.tables,
    filters: this.filters,
    widgetsData: this.widgetsData,
    layout: this.layout,
    roleConfig: this.roleConfig,
    lastComputedAt: this.lastComputedAt,
    updatedAt: this.updatedAt,
  };
};

export const Dashboard =
  mongoose.models.Dashboard || mongoose.model("Dashboard", BaseDashboardSchema);

const UserDashboardSchema = new Schema({
  roleConfig: {
    communitiesJoined: { type: Number, required: true, min: 0 },
    mentorSessions: { type: Number, required: true, min: 0 },
    savedOpportunities: { type: Number, required: true, min: 0 },
    profileCompletion: { type: Number, required: true, min: 0, max: 100 },
  },
});

const InvestorDashboardSchema = new Schema({
  roleConfig: {
    totalInvestment: { type: Number, required: true, min: 0 },
    fiveYearGoal: { type: Number, required: true, min: 0 },
    goalProgress: { type: Number, required: true, min: 0, max: 100 },
    startupsInvested: { type: Number, required: true, min: 0 },
    riskSpread: {
      high: { type: Number, default: 0, min: 0 },
      medium: { type: Number, default: 0, min: 0 },
      low: { type: Number, default: 0, min: 0 },
    },
  },
});

const FounderDashboardSchema = new Schema({
  roleConfig: {
    fundingTarget: { type: Number, required: true, min: 0 },
    raisedAmount: { type: Number, required: true, min: 0 },
    investorLeads: { type: Number, required: true, min: 0 },
    startupStage: {
      type: String,
      required: true,
      enum: ["idea", "mvp", "early-revenue", "growth", "scale"],
    },
  },
});

export const UserDashboard =
  mongoose.models.user ||
  Dashboard.discriminator("user", UserDashboardSchema);

export const InvestorDashboard =
  mongoose.models.investor ||
  Dashboard.discriminator("investor", InvestorDashboardSchema);

export const FounderDashboard =
  mongoose.models.founder ||
  Dashboard.discriminator("founder", FounderDashboardSchema);
