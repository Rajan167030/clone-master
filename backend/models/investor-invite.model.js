import mongoose from "mongoose";

const { Schema } = mongoose;

const InvestorInviteSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    code: { type: String, unique: true, sparse: true, index: true },
    label: { type: String, default: "", trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: null },
    usedAt: { type: Date, default: null },
    usedByAccountId: { type: Schema.Types.ObjectId, ref: "Account", default: null },
  },
  { timestamps: true, collection: "investor_invites" },
);

export const InvestorInvite =
  mongoose.models.InvestorInvite || mongoose.model("InvestorInvite", InvestorInviteSchema);

export default InvestorInvite;
