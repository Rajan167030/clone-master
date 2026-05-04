import mongoose from "mongoose";

const { Schema } = mongoose;

const partnerInquirySchema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      default: null,
    },
    companyType: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    partnershipType: {
      type: String,
      enum: ["Media & Press", "Event Sponsor", "Co-hosting Partner", "Technology Partner", "Community Partner", "Other"],
      required: [true, "Partnership type is required"],
    },
    partnershipGoal: {
      type: String,
      default: "",
      trim: true,
    },
    audienceSize: {
      type: String,
      default: "",
      trim: true,
    },
    budgetRange: {
      type: String,
      default: "",
      trim: true,
    },
    timeline: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    twitter: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "partner_inquiries",
  }
);

export const PartnerInquiry =
  mongoose.models.PartnerInquiry || mongoose.model("PartnerInquiry", partnerInquirySchema);

export default PartnerInquiry;
