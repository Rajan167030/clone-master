import mongoose from "mongoose";
import { Account } from "../models/index.js";

const toDirectoryEntry = (account, viewerId) => ({
  id: account._id,
  fullName: account.fullName,
  role: account.role,
  city: account.city,
  headline: account.headline || "",
  profilePhoto: account.profilePhoto || "",
  profileId: account.profileId,
  company:
    account.role === "founder"
      ? account.roleDetails?.startupName || ""
      : account.role === "investor"
      ? account.roleDetails?.focusSector?.[0] || ""
      : "",
  followersCount: account.followers?.length || 0,
  isFollowing: viewerId ? (account.followers || []).some((id) => String(id) === String(viewerId)) : false,
});

export const listDirectory = async (req, res, next) => {
  try {
    const role = String(req.query.role || "all").toLowerCase();
    const search = String(req.query.search || "").trim();
    const limit = Math.min(Number(req.query.limit) || 24, 60);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const roleFilter =
      role === "founder" || role === "investor" ? [role] : ["founder", "investor"];

    const filter = {
      role: { $in: roleFilter },
      isActive: true,
      isProfilePublic: true,
    };

    if (req.user?.sub) {
      filter._id = { $ne: req.user.sub };
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ fullName: regex }, { headline: regex }, { city: regex }];
    }

    const [members, total] = await Promise.all([
      Account.find(filter)
        .select("fullName role city headline profilePhoto profileId roleDetails followers")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Account.countDocuments(filter),
    ]);

    return res.status(200).json({
      members: members.map((m) => toDirectoryEntry(m, req.user?.sub)),
      page,
      hasMore: page * limit < total,
      total,
    });
  } catch (error) {
    return next(error);
  }
};

export const toggleFollow = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const meId = req.user.sub;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id." });
    }
    if (String(userId) === String(meId)) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    const target = await Account.findById(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found." });
    }

    const alreadyFollowing = target.followers.some((id) => String(id) === String(meId));

    if (alreadyFollowing) {
      await Promise.all([
        Account.updateOne({ _id: userId }, { $pull: { followers: meId } }),
        Account.updateOne({ _id: meId }, { $pull: { following: userId } }),
      ]);
    } else {
      await Promise.all([
        Account.updateOne({ _id: userId }, { $addToSet: { followers: meId } }),
        Account.updateOne({ _id: meId }, { $addToSet: { following: userId } }),
      ]);
    }

    const updatedTarget = await Account.findById(userId).select("followers").lean();

    return res.status(200).json({
      isFollowing: !alreadyFollowing,
      followersCount: updatedTarget.followers?.length || 0,
    });
  } catch (error) {
    return next(error);
  }
};
