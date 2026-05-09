import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    status: { type: String, enum: ["open", "in_progress", "done"], default: "open", index: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueAt: { type: Date, default: null, index: true },
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
        text: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

TaskSchema.index({ assignedTo: 1, status: 1, dueAt: 1 });

export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
