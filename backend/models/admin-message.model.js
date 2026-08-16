import mongoose from "mongoose";

const { Schema } = mongoose;

const AdminMessageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    senderName: { type: String, required: true, trim: true },
    senderRole: { type: String, enum: ["admin", "superadmin"], required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    mentions: { type: [{ type: Schema.Types.ObjectId, ref: "Account" }], default: [] },
  },
  { timestamps: true, collection: "admin_messages" },
);

AdminMessageSchema.index({ createdAt: 1 });

export const AdminMessage =
  mongoose.models.AdminMessage || mongoose.model("AdminMessage", AdminMessageSchema);
