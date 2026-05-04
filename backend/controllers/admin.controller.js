import { Account, EventInterest } from "../models/index.js";
import { createCloudinaryUploadSignature } from "../utils/cloudinary.js";

export const listAdminMembers = async (req, res, next) => {
  try {
    const members = await Account.find({})
      .sort({ createdAt: -1 })
      .select("fullName email role city referralCode isActive createdAt lastLoginAt metadata")
      .lean();

    return res.status(200).json({ members });
  } catch (error) {
    return next(error);
  }
};

export const listAdminEventInterests = async (req, res, next) => {
  try {
    const interests = await EventInterest.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ interests });
  } catch (error) {
    return next(error);
  }
};

export const getCloudinaryUploadSignature = async (req, res, next) => {
  try {
    const { folder, publicId } = req.body || {};
    const signedUpload = createCloudinaryUploadSignature({
      folder: String(folder || "founders-connect").trim(),
      publicId: String(publicId || "").trim(),
    });

    return res.status(200).json(signedUpload);
  } catch (error) {
    return next(error);
  }
};
