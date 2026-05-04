import mongoose from "mongoose";

const { Schema } = mongoose;

const AuditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    actorRole: {
      type: String,
      required: true,
      enum: ["admin", "founder", "investor", "user"],
      index: true,
    },
    action: { type: String, required: true, trim: true, index: true },
    targetCollection: { type: String, required: true, trim: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    changes: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "audit_logs" },
);

AuditLogSchema.index({ createdAt: -1, action: 1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
