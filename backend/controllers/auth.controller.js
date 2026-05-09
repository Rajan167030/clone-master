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
import { sendEmail } from "../utils/email.js";

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

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "email is required." });

    const normalizedEmail = String(email).toLowerCase().trim();
    const account = await Account.findOne({ email: normalizedEmail });

    if (!account) {
      // Don't leak whether an account exists
      return res.status(200).json({ message: "If an account with that email exists, an OTP has been sent." });
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await Account.updateOne(
      { _id: account._id },
      { $set: { resetPasswordOtp: otp, resetPasswordOtpExpiry: expiry } }
    );

    const emailHtml = `
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${account.fullName},</p>
      <p>We received a request to reset your password for your Founders Connect account.</p>
      <p>Your one-time password (OTP) is: <strong style="font-size: 24px; color: #4f46e5;">${otp}</strong></p>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;

    await sendEmail({
      to: normalizedEmail,
      subject: "Founders Connect - Password Reset",
      html: emailHtml,
    });

    return res.status(200).json({ message: "If an account with that email exists, an OTP has been sent." });
  } catch (error) {
    return next(error);
  }
};

export const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) return res.status(400).json({ message: "email and otp are required." });

    const normalizedEmail = String(email).toLowerCase().trim();
    const account = await Account.findOne({ email: normalizedEmail });

    if (!account || account.resetPasswordOtp !== otp || !account.resetPasswordOtpExpiry || new Date() > account.resetPasswordOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    return res.status(200).json({ message: "OTP is valid." });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "email, otp, and newPassword are required." });

    const normalizedEmail = String(email).toLowerCase().trim();
    const account = await Account.findOne({ email: normalizedEmail });

    if (!account || account.resetPasswordOtp !== otp || !account.resetPasswordOtpExpiry || new Date() > account.resetPasswordOtpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 12);

    await Account.updateOne(
      { _id: account._id },
      { 
        $set: { passwordHash },
        $unset: { resetPasswordOtp: "", resetPasswordOtpExpiry: "" }
      }
    );

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    return next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const account = await Account.findOne({ email: normalizedEmail });

    if (!account) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    if (account.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    const passwordMatched = await bcrypt.compare(String(password), account.passwordHash);
    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    await Account.updateOne(
      { _id: account._id },
      { $set: { lastLoginAt: new Date() } },
    );

    const token = signAuthToken(account);

    return res.status(200).json({
      message: "Admin login successful.",
      token,
      account: toSafeAccount(account),
    });
  } catch (error) {
    return next(error);
  }
};
