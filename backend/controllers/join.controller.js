import bcrypt from "bcryptjs";
import crypto from "crypto";
import { JoinRequest } from "../models/join-request.model.js";
import { consumeEmailVerification } from "./email-verification.controller.js";
import { scheduleAdminCheck } from "../config/agenda.js";
import { sendEmail } from "../utils/email.js";
import { Account, UserAccount, Dashboard } from "../models/index.js";

const generateSecurePassword = () => {
  const raw = crypto.randomBytes(12).toString("base64").replace(/[+/=]/g, "");
  return `${raw.slice(0, 12)}${crypto.randomInt(10, 99)}!`;
};

const buildApprovalEmail = ({ name, occupation, collegeName, email, password }) => {
  const roleLine = occupation === "Student" && collegeName
    ? `${occupation} at ${collegeName}`
    : occupation;

  const credentialsBlock = password
    ? `
      <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 18px; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8e85aa;">Email</p>
        <p style="margin: 0 0 16px; font-size: 15px; color: #ffffff; font-weight: 600;">${email}</p>
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8e85aa;">Temporary Password</p>
        <p style="margin: 0; font-size: 18px; color: #c084fc; font-family: monospace; font-weight: 700; letter-spacing: 1px;">${password}</p>
      </div>
    `
    : "";

  return `
  <div style="background-color: #0b071e; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
    <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #130f35 0%, #0a0524 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.45); text-align: center;">
      <div style="margin-bottom: 30px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #a855f7; text-transform: uppercase;">Founders Connect</span>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin-top: 0; color: #ffffff; letter-spacing: -0.5px;">You're approved!</h2>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 8px;">Hi ${name},</p>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 30px;">
        Great news — your Join Us application has been approved. You are now an official member of the
        Founders Connect community as a <strong style="color: #c084fc;">${roleLine}</strong>.
      </p>

      ${credentialsBlock}

      <a href="https://foundersconnect.co.in${password ? "/login" : ""}" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; margin-bottom: 10px;">
        ${password ? "Log In to Your Account" : "Visit Founders Connect"}
      </a>

      <p style="font-size: 13px; color: #8e85aa; line-height: 1.5; margin-top: 20px; margin-bottom: 0;">
        ${password ? "For security, please sign in and change this password as soon as possible. " : ""}We're excited to have you with us. Keep an eye on your inbox for events and updates.
      </p>
    </div>
    <div style="margin-top: 20px; font-size: 12px; color: #5a5275; text-align: center;">
      © ${new Date().getFullYear()} Founders Connect. All rights reserved.<br/>
      <a href="https://foundersconnect.co.in" style="color: #a855f7; text-decoration: none; font-weight: 600;">foundersconnect.co.in</a>
    </div>
  </div>
`;
};

export const submitJoinRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      occupation,
      collegeName,
      companyName,
      linkedinProfile,
      website,
      city,
      whyJoin,
      referralSource,
      emailVerificationToken,
    } = req.body || {};

    const requiredFields = [
      name,
      email,
      phone,
      occupation,
      companyName,
      linkedinProfile,
      website,
      city,
      whyJoin,
      referralSource,
    ];

    if (requiredFields.some((value) => !String(value || "").trim())) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const verified = await consumeEmailVerification({
      email,
      purpose: "join-us",
      verificationToken: emailVerificationToken,
    });

    if (!verified) {
      return res.status(400).json({ ok: false, message: "Please verify your email before submitting." });
    }

    const jr = new JoinRequest({
      name,
      email,
      phone,
      occupation,
      collegeName: collegeName || undefined,
      companyName,
      linkedinProfile,
      website,
      city,
      whyJoin,
      referralSource,
    });
    await jr.save();

    await scheduleAdminCheck({ id: jr._id, type: 'join-request' }, 'in 2 days');

    return res.json({ ok: true, id: jr._id });
  } catch (err) {
    console.error("Join request save failed:", err?.message || err);
    return res.status(500).json({ ok: false, message: "database not connected" });
  }
};

export const listAdminJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find().sort({ createdAt: -1 }).lean();
    return res.json({ requests });
  } catch (err) {
    console.error("Join requests list failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to load join requests." });
  }
};

export const updateAdminJoinRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!["pending", "approved", "denied"].includes(status)) {
      return res.status(400).json({ message: "status must be pending, approved, or denied." });
    }

    const request = await JoinRequest.findByIdAndUpdate(
      id,
      { $set: { status, reviewedAt: new Date() } },
      { new: true },
    );

    if (!request) {
      return res.status(404).json({ message: "Join request not found." });
    }

    let generatedPassword = null;

    if (status === "approved") {
      const normalizedEmail = String(request.email).toLowerCase().trim();
      const existingAccount = await Account.findOne({ email: normalizedEmail });

      if (!existingAccount) {
        generatedPassword = generateSecurePassword();
        const passwordHash = await bcrypt.hash(generatedPassword, 12);
        const base = String(request.name || "").toLowerCase().replace(/[^a-z]/g, "").slice(0, 4) || "user";
        const referralCode = `${base}${Math.floor(100 + Math.random() * 900)}`;
        const profileId = Math.random().toString(36).substring(2, 10);

        const newAccount = await UserAccount.create({
          fullName: request.name,
          email: normalizedEmail,
          passwordHash,
          phone: request.phone,
          city: request.city,
          role: "user",
          profileId,
          headline: "Building the future with Founders Connect",
          referralCode,
          roleDetails: {
            interest: (request.whyJoin || "").slice(0, 120) || "Startups & Networking",
            occupation: request.occupation,
            experienceLevel: "beginner",
          },
          isActive: true,
          dashboard: { stats: [], commitmentPortfolio: [], investmentPortfolio: [] },
        });

        await Dashboard.create({
          accountId: newAccount._id,
          role: "user",
          title: `${newAccount.fullName}'s Dashboard`,
          kpis: [],
          tables: { commitmentPortfolio: [], investmentPortfolio: [] },
          filters: {},
          widgetsData: {},
          layout: [],
          roleConfig: {},
        });
      }

      try {
        await sendEmail({
          to: request.email,
          subject: "You're approved! Welcome to Founders Connect",
          html: buildApprovalEmail({
            name: request.name,
            occupation: request.occupation,
            collegeName: request.collegeName,
            email: normalizedEmail,
            password: generatedPassword,
          }),
          from: process.env.NEWSLETTER_FROM_EMAIL,
        });
      } catch (emailError) {
        console.error("Join request approval email failed:", emailError?.message || emailError);
      }
    }

    return res.status(200).json({ message: `Join request marked as ${status}.`, request });
  } catch (err) {
    console.error("Join request status update failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to update join request." });
  }
};

export default { submitJoinRequest, listAdminJoinRequests, updateAdminJoinRequestStatus };
