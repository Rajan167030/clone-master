import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    template: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate', index: true },
    html: { type: String },
    audience: { type: String, enum: ['subscribers', 'members', 'everyone', 'custom'], default: 'subscribers' },
    recipientUpload: {
      totalParsed: { type: Number, default: 0 },
      accepted: { type: Number, default: 0 },
      invalid: { type: Number, default: 0 },
      duplicates: { type: Number, default: 0 },
      source: { type: String, default: '' },
      previewInvalid: { type: [String], default: [] },
    },
    scheduledAt: { type: Date, index: true },
    status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'failed'], default: 'draft', index: true },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
  },
  { timestamps: true },
);

// Compound indexes for common queries
CampaignSchema.index({ status: 1, createdAt: -1 });
CampaignSchema.index({ scheduledAt: 1, status: 1 });

export default mongoose.model('Campaign', CampaignSchema);
