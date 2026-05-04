import mongoose from 'mongoose';

const SuppressionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    reason: { type: String },
    source: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  },
  { timestamps: true },
);

export default mongoose.model('Suppression', SuppressionSchema);
