import mongoose from 'mongoose';

const SendLogSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    to: { type: String, required: true, trim: true },
    name: { type: String },
    status: { type: String, enum: ['queued', 'sent', 'failed', 'bounced'], default: 'queued' },
    providerId: { type: String },
    error: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model('SendLog', SendLogSchema);
