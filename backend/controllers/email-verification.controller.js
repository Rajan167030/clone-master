import bcrypt from "bcryptjs";
import crypto from "crypto";
import { EmailVerification } from "../models/email-verification.model.js";
import { isEmailConfigured, sendEmail } from "../utils/email.js";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const CODE_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const PURPOSES = new Set(["register:user", "register:investor", "register:founder", "join-us", "partner-inquiry"]);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizePurpose = (purpose) => String(purpose || "").trim().toLowerCase();

const generateCode = () => String(crypto.randomInt(100000, 1000000));

const buildCodeEmail = (code) => `
  <p>Your Founders Connect email verification code is:</p>
  <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:20px 0;">${code}</p>
  <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
`;

export const sendEmailVerificationCode = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const purpose = normalizePurpose(req.body?.purpose);

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (!PURPOSES.has(purpose)) {
      return res.status(400).json({ message: "Invalid verification purpose." });
    }

    if (!isEmailConfigured()) {
      return res.status(503).json({ message: "Email service is not configured." });
    }

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await EmailVerification.deleteMany({ email, purpose });
    await EmailVerification.create({
      email,
      purpose,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    });

    await sendEmail({
      to: email,
      subject: "Verify your Founders Connect email",
      html: buildCodeEmail(code),
      from: process.env.NEWSLETTER_FROM_EMAIL,
      requireConfigured: true,
    });

    return res.json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Email verification send failed:", error?.message || error);
    return res.status(500).json({ message: "Unable to send verification code." });
  }
};

export const verifyEmailCode = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const purpose = normalizePurpose(req.body?.purpose);
    const code = String(req.body?.code || "").trim();

    if (!EMAIL_REGEX.test(email) || !PURPOSES.has(purpose) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Invalid verification details." });
    }

    const record = await EmailVerification.findOne({ email, purpose }).sort({ createdAt: -1 });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Verification code expired. Please request a new code." });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });
    }

    const matched = await bcrypt.compare(code, record.codeHash);

    if (!matched) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect verification code." });
    }

    record.verificationToken = crypto.randomUUID();
    record.verifiedAt = new Date();
    record.expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await record.save();

    return res.json({
      message: "Email verified successfully.",
      verificationToken: record.verificationToken,
    });
  } catch (error) {
    console.error("Email verification failed:", error?.message || error);
    return res.status(500).json({ message: "Unable to verify email." });
  }
};

export const consumeEmailVerification = async ({ email, purpose, verificationToken }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPurpose = normalizePurpose(purpose);
  const token = String(verificationToken || "").trim();

  if (!EMAIL_REGEX.test(normalizedEmail) || !PURPOSES.has(normalizedPurpose) || !token) {
    return false;
  }

  const record = await EmailVerification.findOne({
    email: normalizedEmail,
    purpose: normalizedPurpose,
    verificationToken: token,
    verifiedAt: { $ne: null },
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return false;
  }

  await EmailVerification.deleteOne({ _id: record._id });
  return true;
};

export default { sendEmailVerificationCode, verifyEmailCode };
