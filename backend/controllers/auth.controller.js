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
      referredBy,
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
      referredBy: String(referredBy || "").trim(),
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
      <div style="background-color: #0b071e; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
        <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #130f35 0%, #0a0524 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.45); text-align: center;">
          <!-- Logo Header -->
          <div style="margin-bottom: 30px;">
            <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #a855f7; text-transform: uppercase;">Founders Connect</span>
          </div>
          
          <h2 style="font-size: 24px; font-weight: 700; margin-top: 0; color: #ffffff; letter-spacing: -0.5px;">Password Reset Request</h2>
          <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 30px; text-align: left;">Hello ${account.fullName},<br/><br/>We received a request to reset your password for your Founders Connect account. Use the one-time code below to complete the reset process.</p>
          
          <!-- OTP Box -->
          <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 18px; margin-bottom: 30px; display: inline-block; width: 80%;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #c084fc; font-family: monospace; display: block; text-shadow: 0 0 10px rgba(168, 85, 247, 0.45); text-align: center; margin-left: 8px;">${otp}</span>
          </div>
          
          <p style="font-size: 13px; color: #8e85aa; line-height: 1.5; margin-bottom: 0; text-align: left;">This OTP is valid for 15 minutes. If you did not make this request, you can safely ignore this and your password will remain unchanged.</p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #5a5275; text-align: center;">
          © ${new Date().getFullYear()} Founders Connect. All rights reserved.<br/>
          <a href="https://foundersconnect.co.in" style="color: #a855f7; text-decoration: none; font-weight: 600;">foundersconnect.co.in</a>
        </div>
      </div>
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
