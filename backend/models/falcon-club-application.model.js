import mongoose from "mongoose";

export const FALCON_CLUB_TIERS = ["Achiever", "Millionaire", "Elite", "Signature", "Legacy"];
export const FALCON_CLUB_STATUSES = [
  "New Application",
  "Under Review",
  "Verification Required",
  "Approved",
  "Rejected",
  "Waitlisted",
];

export const PERSONAL_NET_WORTH_RANGES = [
  "Below ₹1 Cr",
  "₹1–5 Cr",
  "₹5–10 Cr",
  "₹10–25 Cr",
  "₹25–50 Cr",
  "₹50 Cr+",
  "Prefer Not to Disclose",
];

export const ANNUAL_COMPANY_REVENUE_RANGES = [
  "Pre-revenue",
  "Below ₹1 Cr",
  "₹1–5 Cr",
  "₹5–10 Cr",
  "₹10–25 Cr",
  "₹25–100 Cr",
  "₹100 Cr+",
  "Prefer Not to Disclose",
];

export const COMPANY_VALUATION_RANGES = [
  "Not Formally Valued",
  "Below ₹1 Cr",
  "₹1–5 Cr",
  "₹5–10 Cr",
  "₹10–25 Cr",
  "₹25–100 Cr",
  "₹100 Cr+",
  "Prefer Not to Disclose",
];

export const VALUATION_BASIS_OPTIONS = [
  "Funding Round",
  "Valuation Report",
  "Internal Estimate",
  "Other / Not Formally Valued",
];

export const DESIGNATION_OPTIONS = [
  "Founder",
  "Co-founder",
  "Business Owner",
  "Exited Founder",
  "Investor",
  "Other",
];

/**
 * Calculates the suggested membership level based on financial criteria.
 * Any single qualifying metric qualifies the applicant for that tier.
 * System evaluates Net Worth, Revenue, and Valuation, picking the highest tier.
 */
export const calculateSuggestedTier = ({ personalNetWorth, annualCompanyRevenue, companyValuation }) => {
  // Score mapping:
  // 5: Legacy (Net worth 50Cr+, Revenue 100Cr+, Valuation 100Cr+)
  // 4: Signature (Net worth 25Cr+, Revenue 25Cr+, Valuation 25Cr+)
  // 3: Elite (Net worth 10Cr+, Revenue 10Cr+, Valuation 10Cr+)
  // 2: Millionaire (Net worth 5Cr+, Revenue 5Cr+, Valuation 5Cr+)
  // 1: Achiever (Net worth 1Cr+, Revenue 1Cr+, Valuation 1Cr+)
  // 0: None / Below threshold

  let nwScore = 0;
  let nwTier = "";
  if (personalNetWorth === "₹50 Cr+") {
    nwScore = 5;
    nwTier = "Legacy";
  } else if (personalNetWorth === "₹25–50 Cr") {
    nwScore = 4;
    nwTier = "Signature";
  } else if (personalNetWorth === "₹10–25 Cr") {
    nwScore = 3;
    nwTier = "Elite";
  } else if (personalNetWorth === "₹5–10 Cr") {
    nwScore = 2;
    nwTier = "Millionaire";
  } else if (personalNetWorth === "₹1–5 Cr") {
    nwScore = 1;
    nwTier = "Achiever";
  }

  let revScore = 0;
  let revTier = "";
  if (annualCompanyRevenue === "₹100 Cr+") {
    revScore = 5;
    revTier = "Legacy";
  } else if (annualCompanyRevenue === "₹25–100 Cr") {
    revScore = 4;
    revTier = "Signature";
  } else if (annualCompanyRevenue === "₹10–25 Cr") {
    revScore = 3;
    revTier = "Elite";
  } else if (annualCompanyRevenue === "₹5–10 Cr") {
    revScore = 2;
    revTier = "Millionaire";
  } else if (annualCompanyRevenue === "₹1–5 Cr") {
    revScore = 1;
    revTier = "Achiever";
  }

  let valScore = 0;
  let valTier = "";
  if (companyValuation === "₹100 Cr+") {
    valScore = 5;
    valTier = "Legacy";
  } else if (companyValuation === "₹25–100 Cr") {
    valScore = 4;
    valTier = "Signature";
  } else if (companyValuation === "₹10–25 Cr") {
    valScore = 3;
    valTier = "Elite";
  } else if (companyValuation === "₹5–10 Cr") {
    valScore = 2;
    valTier = "Millionaire";
  } else if (companyValuation === "₹1–5 Cr") {
    valScore = 1;
    valTier = "Achiever";
  }

  const maxScore = Math.max(nwScore, revScore, valScore);

  let suggestedTier = "Under Review / Discretionary";
  let reasons = [];

  if (maxScore === 5) {
    suggestedTier = "Legacy";
  } else if (maxScore === 4) {
    suggestedTier = "Signature";
  } else if (maxScore === 3) {
    suggestedTier = "Elite";
  } else if (maxScore === 2) {
    suggestedTier = "Millionaire";
  } else if (maxScore === 1) {
    suggestedTier = "Achiever";
  }

  if (nwTier && nwScore === maxScore && maxScore > 0) {
    reasons.push(`Net Worth (${personalNetWorth})`);
  }
  if (revTier && revScore === maxScore && maxScore > 0) {
    reasons.push(`Revenue (${annualCompanyRevenue})`);
  }
  if (valTier && valScore === maxScore && maxScore > 0) {
    reasons.push(`Valuation (${companyValuation})`);
  }

  const reasonString = reasons.length > 0
    ? `Qualifies for ${suggestedTier} via ${reasons.join(" & ")}`
    : "Discretionary evaluation required based on profile and references";

  return {
    suggestedTier,
    suggestedTierReason: reasonString,
    qualifyingScore: maxScore,
  };
};

const falconClubApplicationSchema = new mongoose.Schema(
  {
    // A. Personal Details
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    currentCity: {
      type: String,
      required: true,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // B. Company Details
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: "",
    },
    designation: {
      type: String,
      required: true,
      enum: DESIGNATION_OPTIONS,
      default: "Founder",
    },
    customDesignation: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    alternativeInfo: {
      type: String,
      trim: true,
      default: "",
    },

    // C. Financial Details
    personalNetWorth: {
      type: String,
      required: true,
      enum: PERSONAL_NET_WORTH_RANGES,
    },
    annualCompanyRevenue: {
      type: String,
      required: true,
      enum: ANNUAL_COMPANY_REVENUE_RANGES,
    },
    companyValuation: {
      type: String,
      required: true,
      enum: COMPANY_VALUATION_RANGES,
    },
    valuationBasis: {
      type: String,
      required: true,
      enum: VALUATION_BASIS_OPTIONS,
      default: "Other / Not Formally Valued",
    },

    // D. Final Details
    whyJoin: {
      type: String,
      trim: true,
      default: "",
    },
    referredBy: {
      type: String,
      trim: true,
      default: "",
    },
    confirmedAccurate: {
      type: Boolean,
      required: true,
      default: true,
    },
    agreedTerms: {
      type: Boolean,
      required: true,
      default: true,
    },

    // Automatic Tier Classification
    suggestedTier: {
      type: String,
      default: "Under Review / Discretionary",
    },
    suggestedTierReason: {
      type: String,
      default: "",
    },

    // Verification & Admin Status
    status: {
      type: String,
      enum: FALCON_CLUB_STATUSES,
      default: "New Application",
      index: true,
    },
    approvedTier: {
      type: String,
      enum: ["", ...FALCON_CLUB_TIERS],
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    verificationRequestSent: {
      type: Boolean,
      default: false,
    },
    verificationRequestDate: {
      type: Date,
    },
    verificationRequestNote: {
      type: String,
      default: "",
    },
    // Applicant's own permission, captured on the form. The directory only shows a
    // member when both their consent and the admin toggle below are on.
    consentDirectory: {
      type: Boolean,
      default: false,
    },
    consentLinkedin: {
      type: Boolean,
      default: false,
    },
    showInDirectory: {
      type: Boolean,
      default: true,
    },
    allowPublicLinkedin: {
      type: Boolean,
      default: true,
    },

    // Secure document upload link sent with a verification request. Only the
    // SHA-256 hash of the token is stored.
    verificationTokenHash: {
      type: String,
      select: false,
      index: true,
    },
    verificationTokenExpires: {
      type: Date,
    },
    documents: {
      type: [
        new mongoose.Schema(
          {
            label: { type: String, trim: true, default: "" },
            originalName: { type: String, trim: true, default: "" },
            publicId: { type: String, required: true },
            resourceType: { type: String, enum: ["image", "raw", "video"], default: "image" },
            format: { type: String, default: "" },
            bytes: { type: Number, default: 0 },
            uploadedAt: { type: Date, default: Date.now },
          },
          { _id: true }
        ),
      ],
      default: [],
    },
    documentsSubmittedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

falconClubApplicationSchema.index({ status: 1, createdAt: -1 });
falconClubApplicationSchema.index({ email: 1, companyName: 1 });

export const FalconClubApplication =
  mongoose.models.FalconClubApplication ||
  mongoose.model("FalconClubApplication", falconClubApplicationSchema);

export default FalconClubApplication;
