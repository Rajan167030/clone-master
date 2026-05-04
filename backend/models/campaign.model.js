import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
    html: { type: String },
    audience: { type: String, enum: ['subscribers', 'members', 'everyone'], default: 'subscribers' },
    scheduledAt: { type: Date },
    status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'failed'], default: 'draft' },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  },
  { timestamps: true },
);

export default mongoose.model('Campaign', CampaignSchema);
