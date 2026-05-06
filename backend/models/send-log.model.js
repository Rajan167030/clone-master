import mongoose from 'mongoose';

const SendLogSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', index: true },
    to: { type: String, required: true, trim: true, index: true },
    name: { type: String },
    status: { type: String, enum: ['queued', 'sent', 'failed', 'bounced'], default: 'queued', index: true },
    providerId: { type: String },
    error: { type: String },
  },
  { timestamps: true },
);

// Compound index for common queries
SendLogSchema.index({ campaign: 1, status: 1 });
SendLogSchema.index({ createdAt: -1 });

export default mongoose.model('SendLog', SendLogSchema);
