import { PartnerInquiry } from "../models/partner-inquiry.model.js";
import { consumeEmailVerification } from "./email-verification.controller.js";
import { scheduleAdminCheck } from "../config/agenda.js";
import { sendEmail } from "../utils/email.js";

const buildPartnerApprovalEmail = ({ contactPerson, companyName, partnershipType }) => `
  <div style="background-color: #0b071e; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
    <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #130f35 0%, #0a0524 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.45); text-align: center;">
      <div style="margin-bottom: 30px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #a855f7; text-transform: uppercase;">Founders Connect</span>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; margin-top: 0; color: #ffffff; letter-spacing: -0.5px;">Your partnership is approved!</h2>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 8px;">Hi ${contactPerson},</p>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 30px;">
        Great news — the partnership inquiry from <strong style="color: #c084fc;">${companyName}</strong> has been approved
        as a <strong style="color: #c084fc;">${partnershipType}</strong>. Our team will reach out shortly with next steps.
      </p>

      <a href="https://foundersconnect.co.in" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; margin-bottom: 10px;">
        Visit Founders Connect
      </a>

      <p style="font-size: 13px; color: #8e85aa; line-height: 1.5; margin-top: 20px; margin-bottom: 0;">
        We're excited to build something great together.
      </p>
    </div>
    <div style="margin-top: 20px; font-size: 12px; color: #5a5275; text-align: center;">
      © ${new Date().getFullYear()} Founders Connect. All rights reserved.<br/>
      <a href="https://foundersconnect.co.in" style="color: #a855f7; text-decoration: none; font-weight: 600;">foundersconnect.co.in</a>
    </div>
  </div>
`;

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

export const updateAdminPartnerInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be pending, approved, or rejected." });
    }

    const inquiry = await PartnerInquiry.findByIdAndUpdate(id, { $set: { status } }, { new: true });

    if (!inquiry) {
      return res.status(404).json({ message: "Partner inquiry not found." });
    }

    if (status === "approved") {
      try {
        await sendEmail({
          to: inquiry.email,
          subject: "Your partnership inquiry has been approved",
          html: buildPartnerApprovalEmail({
            contactPerson: inquiry.contactPerson,
            companyName: inquiry.companyName,
            partnershipType: inquiry.partnershipType,
          }),
          from: process.env.NEWSLETTER_FROM_EMAIL,
        });
      } catch (emailError) {
        console.error("Partner inquiry approval email failed:", emailError?.message || emailError);
      }
    }

    return res.status(200).json({ message: `Partner inquiry marked as ${status}.`, inquiry });
  } catch (err) {
    console.error("Partner inquiry status update failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to update partner inquiry." });
  }
};

export default { submitPartnerInquiry, listAdminPartnerInquiries, updateAdminPartnerInquiryStatus };
