import mongoose from "mongoose";

const { Schema } = mongoose;

const InvestorLeadSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: "", trim: true },
    vcName: { type: String, required: true, trim: true },
    investmentInterest: { type: String, required: true, trim: true },
    inviteToken: { type: String, default: "", trim: true, index: true },
  },
  { timestamps: true, collection: "investor_leads" },
);

export const InvestorLead =
  mongoose.models.InvestorLead || mongoose.model("InvestorLead", InvestorLeadSchema);

export default InvestorLead;
