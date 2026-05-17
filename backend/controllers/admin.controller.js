import bcrypt from "bcryptjs";
import { Account, Dashboard, FounderAccount, InvestorAccount, UserAccount } from "../models/index.js";
import { createCloudinaryUploadSignature } from "../utils/cloudinary.js";

export const createAdminMember = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, city, role: rawRole, roleDetails } = req.body || {};
    const role = rawRole === "user" || rawRole === "investor" || rawRole === "founder" ? rawRole : "user";
    
    if (!fullName || !email || !password || !phone || !city) {
      return res.status(400).json({ message: "fullName, email, password, phone, and city are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await Account.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      return res.status(409).json({ message: "Account already exists for this email." });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    
    let Model = UserAccount;
    if (role === "investor") Model = InvestorAccount;
    if (role === "founder") Model = FounderAccount;

    const base = String(fullName || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 4) || "user";
    const referralCode = `${base}${Math.floor(100 + Math.random() * 900)}`;
    const profileId = Math.random().toString(36).substring(2, 10);

    const created = await Model.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      phone: String(phone).trim(),
      city: String(city).trim(),
      role,
      profileId,
      headline: "Building the future with Founders Connect",
      referralCode,
      roleDetails: roleDetails || {},
      isActive: true,
      dashboard: {
        stats: [],
        commitmentPortfolio: [],
        investmentPortfolio: [],
      },
    });

    await Dashboard.create({
      accountId: created._id,
      role,
      title: `${created.fullName}'s Dashboard`,
      kpis: [],
      tables: {
        commitmentPortfolio: [],
        investmentPortfolio: [],
      },
      filters: {},
      widgetsData: {},
      layout: [],
      roleConfig: {},
    });

    return res.status(201).json({
      message: "Member added successfully.",
      member: {
        _id: created._id,
        fullName: created.fullName,
        email: created.email,
        role: created.role,
        city: created.city,
        isActive: created.isActive,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const account = await Account.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Member not found." });
    }

    if (account.role === "admin" || account.role === "super-admin") {
      return res.status(403).json({ message: "Cannot delete administrators." });
    }

    await Account.findByIdAndDelete(id);
    await Dashboard.deleteMany({ accountId: id });

    return res.status(200).json({ message: "Member deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

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
