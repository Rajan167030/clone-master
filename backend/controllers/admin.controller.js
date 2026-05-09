import { Account } from "../models/index.js";
import { createCloudinaryUploadSignature } from "../utils/cloudinary.js";

const buildEventInterest = (account) => {
  const roleDetails = account.roleDetails || {};
  const interest = String(roleDetails.interest || "").trim();
  const occupation = String(roleDetails.occupation || "").trim();

  return {
    _id: account._id,
    slug: account.profileId || account.referralCode || String(account._id),
    title: interest || "Event Interest",
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    city: account.city,
    occupation: occupation || undefined,
    note: occupation || roleDetails.experienceLevel || "",
    status: account.isActive ? "active" : "inactive",
    createdAt: account.createdAt,
  };
};

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
    const interests = await Account.find({ role: "user" })
      .sort({ createdAt: -1 })
      .select("fullName email phone city roleDetails profileId referralCode isActive createdAt")
      .lean();

    return res.status(200).json({
      interests: interests.map((account) => buildEventInterest(account)),
    });
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
