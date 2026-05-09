import { JoinRequest } from "../models/join-request.model.js";
import { consumeEmailVerification } from "./email-verification.controller.js";
import { scheduleAdminCheck } from "../config/agenda.js";

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

export default { submitJoinRequest, listAdminJoinRequests };
