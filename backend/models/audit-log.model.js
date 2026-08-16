import mongoose from "mongoose";

const { Schema } = mongoose;

const AuditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    actorName: { type: String, default: "", trim: true },
    actorRole: {
      type: String,
      required: true,
      enum: ["admin", "superadmin", "founder", "investor", "user"],
      index: true,
    },
    action: { type: String, required: true, trim: true, index: true },
    method: { type: String, default: "", trim: true },
    path: { type: String, default: "", trim: true },
    targetCollection: { type: String, default: "", trim: true },
    targetId: { type: Schema.Types.ObjectId, default: null, index: true },
    statusCode: { type: Number, default: null },
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
