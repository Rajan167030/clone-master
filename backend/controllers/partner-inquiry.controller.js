import { PartnerInquiry } from "../models/partner-inquiry.model.js";
import { consumeEmailVerification } from "./email-verification.controller.js";
import { scheduleAdminCheck } from "../config/agenda.js";

export const submitPartnerInquiry = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      companyType,
      city,
      partnershipType,
      partnershipGoal,
      audienceSize,
      budgetRange,
      timeline,
      website,
      linkedin,
      twitter,
      message,
      emailVerificationToken,
    } = req.body || {};
    
    if (!companyName || !contactPerson || !email || !phone || !companyType || !city || !partnershipType || !partnershipGoal) {
      return res.status(400).json({ 
        ok: false, 
        message: "Missing required fields" 
      });
    }

    const verified = await consumeEmailVerification({
      email,
      purpose: "partner-inquiry",
      verificationToken: emailVerificationToken,
    });

    if (!verified) {
      return res.status(400).json({ ok: false, message: "Please verify your email before submitting." });
    }

    const inquiry = new PartnerInquiry({ 
      companyName, 
      contactPerson, 
      email, 
      phone: phone || null, 
      companyType,
      city,
      partnershipType,
      partnershipGoal,
      audienceSize,
      budgetRange,
      timeline,
      website,
      linkedin,
      twitter,
      message,
      status: "pending"
    });
    await inquiry.save();

    await scheduleAdminCheck({ id: inquiry._id, type: 'partner-inquiry' }, 'in 2 days');

    return res.json({ ok: true, id: inquiry._id });
  } catch (err) {
    console.error("Partner inquiry save failed:", err?.message || err);
    return res.status(500).json({ ok: false, message: "database not connected" });
  }
};

export const listAdminPartnerInquiries = async (req, res) => {
  try {
    const inquiries = await PartnerInquiry.find().sort({ createdAt: -1 }).lean();
    return res.json({ inquiries });
  } catch (err) {
    console.error("Partner inquiry list failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to load partner inquiries." });
  }
};

export default { submitPartnerInquiry, listAdminPartnerInquiries };
