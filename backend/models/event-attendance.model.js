import mongoose from "mongoose";

const { Schema } = mongoose;

const EventAttendanceSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    eventSlug: { type: String, required: true, trim: true, index: true },
    eventTitle: { type: String, required: true, trim: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "event_attendances" },
);

EventAttendanceSchema.index({ accountId: 1, eventSlug: 1 }, { unique: true });

export const EventAttendance =
  mongoose.models.EventAttendance || mongoose.model("EventAttendance", EventAttendanceSchema);
