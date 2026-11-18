import mongoose from "mongoose";

const { Schema } = mongoose;

export const AI_ARTIFACT_KINDS = ["pitch_deck", "pitch_review", "validation", "investor_readiness"];

// One saved result of a founder AI tool (a generated deck, a review report, …).
const AiArtifactSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    kind: { type: String, enum: AI_ARTIFACT_KINDS, required: true, index: true },
    title: { type: String, default: "", trim: true },
    input: { type: Schema.Types.Mixed, default: {} },
    output: { type: Schema.Types.Mixed, default: {} },
    provider: { type: String, default: "" },
    model: { type: String, default: "" },
  },
  { timestamps: true, collection: "ai_artifacts", minimize: false },
);
AiArtifactSchema.index({ accountId: 1, kind: 1, updatedAt: -1 });

const ChatMessageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

// Learning assistant conversation; optionally anchored to a course lesson for context.
const AiChatThreadSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    title: { type: String, default: "New conversation", trim: true },
    courseSlug: { type: String, default: "", trim: true },
    lessonId: { type: String, default: "", trim: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true, collection: "ai_chat_threads" },
);

// Per-account daily request counter (cost control).
const AiUsageSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    day: { type: String, required: true }, // YYYY-MM-DD (UTC)
    count: { type: Number, default: 0 },
    byTool: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "ai_usage" },
);
AiUsageSchema.index({ accountId: 1, day: 1 }, { unique: true });

export const AiArtifact = mongoose.models.AiArtifact || mongoose.model("AiArtifact", AiArtifactSchema);
export const AiChatThread = mongoose.models.AiChatThread || mongoose.model("AiChatThread", AiChatThreadSchema);
export const AiUsage = mongoose.models.AiUsage || mongoose.model("AiUsage", AiUsageSchema);
