import bcrypt from "bcryptjs";
import {
  Account,
  Dashboard,
  FounderAccount,
  InvestorAccount,
  UserAccount,
} from "../models/index.js";
import { getDashboardTemplate } from "../utils/dashboard-template.js";
import { buildDashboardPayload } from "../utils/dashboard-payload.js";
import { validateAndNormalizeRoleDetails } from "../utils/role-details.js";
import { signAuthToken } from "../utils/jwt.js";
import { generateProfileId } from "../utils/profile-utils.js";
import { consumeEmailVerification } from "./email-verification.controller.js";

const toRole = (value) => {
  const role = String(value || "").trim().toLowerCase();
  if (role === "user" || role === "investor" || role === "founder") {
    return role;
  }
  return null;
};

const pickAccountModel = (role) => {
  if (role === "investor") return InvestorAccount;
  if (role === "founder") return FounderAccount;
  return UserAccount;
};

const generateReferralCode = (fullName) => {
  const base = String(fullName || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, 4) || "user";

  return `${base}${Math.floor(100 + Math.random() * 900)}`;
};

const toSafeAccount = (account) => {
  const base =
    typeof account?.toSafeJSON === "function"
      ? account.toSafeJSON()
      : account?.toObject?.() || account;

  return {
    ...base,
    role:
      base?.role ||
      account?.role ||
      account?.get?.("role") ||
      account?.toObject?.()?.role ||
      null,
  };
};

export const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      city,
      role: rawRole,
      roleDetails,
      emailVerificationToken,
    } = req.body || {};

    const role = toRole(rawRole);
    if (!role) {
      return res.status(400).json({ message: "role must be user, investor, or founder." });
    }

    if (!fullName || !email || !password || !phone || !city) {
      return res.status(400).json({
        message: "fullName, email, password, phone, and city are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await Account.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      return res.status(409).json({ message: "Account already exists for this email." });
    }

    const verified = await consumeEmailVerification({
      email: normalizedEmail,
      purpose: `register:${role}`,
      verificationToken: emailVerificationToken,
    });

    if (!verified) {
      return res.status(400).json({ message: "Please verify your email before registering." });
    }

    const normalizedRoleDetails = validateAndNormalizeRoleDetails(role, roleDetails);
    const passwordHash = await bcrypt.hash(String(password), 12);
    const dashboardTemplate = getDashboardTemplate(role);
    const profileId = generateProfileId();

    const Model = pickAccountModel(role);
    const created = await Model.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      phone: String(phone).trim(),
      city: String(city).trim(),
      role,
      profileId,
      headline: "Building the future with Founders Connect",
      referralCode: generateReferralCode(fullName),
      roleDetails: normalizedRoleDetails,
      dashboard: {
        stats: dashboardTemplate.stats,
        commitmentPortfolio: dashboardTemplate.commitmentPortfolio,
        investmentPortfolio: dashboardTemplate.investmentPortfolio,
      },
    });

    const dashboardPayload = buildDashboardPayload({
      role,
      fullName: created.fullName,
      template: dashboardTemplate,
      roleDetails: normalizedRoleDetails,
    });

    const dashboard = await Dashboard.create({
      accountId: created._id,
      role,
      ...dashboardPayload,
    });

    const token = signAuthToken(created);

    return res.status(201).json({
      message: "Account registered successfully.",
      token,
      account: toSafeAccount(created),
      dashboard: dashboard.toSafeJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const account = await Account.findOne({ email: normalizedEmail });

    if (!account) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatched = await bcrypt.compare(String(password), account.passwordHash);
    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    await Account.updateOne(
      { _id: account._id },
      { $set: { lastLoginAt: new Date() } },
    );

    const token = signAuthToken(account);

    return res.status(200).json({
      message: "Login successful.",
      token,
      account: toSafeAccount(account),
    });
  } catch (error) {
    return next(error);
  }
};
