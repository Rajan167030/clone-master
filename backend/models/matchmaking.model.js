import mongoose from "mongoose";

const { Schema } = mongoose;

const matchSwipeSchema = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    action: { type: String, enum: ["like", "pass"], required: true },
  },
  { timestamps: true, collection: "matchmaking_swipes" },
);

matchSwipeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

export const MatchSwipe =
  mongoose.models.MatchSwipe || mongoose.model("MatchSwipe", matchSwipeSchema);

const matchSchema = new Schema(
  {
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: "Account" }],
      required: true,
      validate: { validator: (v) => Array.isArray(v) && v.length === 2, message: "A match needs exactly 2 users." },
    },
    matchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "matchmaking_matches" },
);

matchSchema.index({ users: 1 });

export const Match = mongoose.models.Match || mongoose.model("Match", matchSchema);
