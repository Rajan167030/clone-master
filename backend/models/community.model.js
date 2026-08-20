import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    authorName: { type: String, required: true, trim: true },
    authorRole: { type: String, default: "user" },
    authorPhoto: { type: String, default: "" },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

const postSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    authorRole: { type: String, enum: ["user", "investor", "founder", "admin", "superadmin"], required: true },
    authorPhoto: { type: String, default: "" },
    authorHeadline: { type: String, default: "" },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
    imageUrl: { type: String, default: "" },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: "Account" }], default: [] },
    comments: { type: [commentSchema], default: [] },
    isRemoved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "community_posts" },
);

postSchema.index({ createdAt: -1 });

export const CommunityPost =
  mongoose.models.CommunityPost || mongoose.model("CommunityPost", postSchema);

const messageSchema = new Schema(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "Account" }],
      required: true,
      validate: { validator: (v) => Array.isArray(v) && v.length === 2, message: "participants must have exactly 2 members." },
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "community_messages" },
);

messageSchema.index({ participants: 1, createdAt: 1 });

export const CommunityMessage =
  mongoose.models.CommunityMessage || mongoose.model("CommunityMessage", messageSchema);
