import mongoose from "mongoose";
import { Account, CommunityMessage } from "../models/index.js";

export const listConversations = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.sub);

    const grouped = await CommunityMessage.aggregate([
      { $match: { participants: userId } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          otherParticipant: {
            $arrayElemAt: [
              { $filter: { input: "$participants", cond: { $ne: ["$$this", userId] } } },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$otherParticipant",
          lastMessage: { $first: "$text" },
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$recipientId", userId] }, { $eq: ["$readAt", null] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const otherIds = grouped.map((g) => g._id);
    const accounts = await Account.find({ _id: { $in: otherIds } })
      .select("fullName role profilePhoto headline")
      .lean();
    const accountMap = new Map(accounts.map((a) => [String(a._id), a]));

    const conversations = grouped
      .filter((g) => accountMap.has(String(g._id)))
      .map((g) => {
        const account = accountMap.get(String(g._id));
        return {
          userId: g._id,
          fullName: account.fullName,
          role: account.role,
          profilePhoto: account.profilePhoto || "",
          headline: account.headline || "",
          lastMessage: g.lastMessage,
          lastMessageAt: g.lastMessageAt,
          unreadCount: g.unreadCount,
        };
      });

    return res.status(200).json({ conversations });
  } catch (error) {
    return next(error);
  }
};

export const getThread = async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;
    const meId = req.user.sub;

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const otherAccount = await Account.findById(otherUserId).select("fullName role profilePhoto headline").lean();
    if (!otherAccount) {
      return res.status(404).json({ message: "User not found." });
    }

    const messages = await CommunityMessage.find({
      participants: { $all: [meId, otherUserId] },
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    await CommunityMessage.updateMany(
      { participants: { $all: [meId, otherUserId] }, recipientId: meId, readAt: null },
      { $set: { readAt: new Date() } },
    );

    return res.status(200).json({
      participant: {
        userId: otherAccount._id,
        fullName: otherAccount.fullName,
        role: otherAccount.role,
        profilePhoto: otherAccount.profilePhoto || "",
        headline: otherAccount.headline || "",
      },
      messages,
    });
  } catch (error) {
    return next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { userId: otherUserId } = req.params;
    const meId = req.user.sub;
    const text = String(req.body?.text || "").trim();

    if (!mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: "Invalid user id." });
    }
    if (String(otherUserId) === String(meId)) {
      return res.status(400).json({ message: "You can't message yourself." });
    }
    if (!text) {
      return res.status(400).json({ message: "Message text is required." });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: "Message is too long (max 2000 characters)." });
    }

    const recipient = await Account.findById(otherUserId).lean();
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    const created = await CommunityMessage.create({
      participants: [meId, otherUserId],
      senderId: meId,
      recipientId: otherUserId,
      text,
    });

    return res.status(201).json({ message: created });
  } catch (error) {
    return next(error);
  }
};
