import { JoinRequest } from "../models/join-request.model.js";
import { consumeEmailVerification } from "./email-verification.controller.js";
import { scheduleAdminCheck } from "../config/agenda.js";
import { sendEmail } from "../utils/email.js";

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

export const updateJoinRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ ok: false, message: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    const request = await JoinRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ ok: false, message: "Join request not found." });
    }

    // Send email notification for approval
    if (status === "approved") {
      try {
        const frontendUrl = process.env.FRONTEND_URL || "https://foundersconnect.app";
        const welcomeUrl = `${frontendUrl}/welcome?email=${encodeURIComponent(request.email)}`;
        const emailSent = await sendEmail({
          to: request.email,
          subject: "🎉 Welcome to Founders Connect - Your Application is Approved!",
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2 style="color: #2563eb; margin-bottom: 16px;">Congratulations ${request.name}!</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Your join request to Founders Connect has been <strong>approved</strong>. Welcome to India's premier founder and investor network!</p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 20px;">You can now access your exclusive welcome page to learn more about the community:</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${welcomeUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Access Welcome Page</a>
              </p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #666; background: #f3f4f6; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb;">
                <strong>Next Steps:</strong><br>
                1. Visit your welcome page to see exclusive member benefits<br>
                2. Join our WhatsApp community for real-time updates<br>
                3. Connect with fellow founders and investors
              </p>
              
              <p style="font-size: 14px; color: #999; margin-top: 20px;">If you have any questions, feel free to reply to this email.</p>
              <p style="font-size: 14px; color: #999;">Best regards,<br><strong>The Founders Connect Team</strong></p>
            </div>
          `,
        });
        
        console.log(`✓ Approval email sent to ${request.email} for join request ${request._id}`, emailSent);
      } catch (emailError) {
        console.error(`✗ Failed to send approval email to ${request.email}:`, emailError?.message || emailError);
        // Don't fail the request if email fails - status is still updated in DB
      }
    }

    return res.json({ ok: true, request });
  } catch (err) {
    console.error("Join request update failed:", err?.message || err);
    return res.status(500).json({ ok: false, message: "Unable to update join request." });
  }
};

export const checkJoinRequestStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ ok: false, message: "Email parameter is required." });
    }

    const request = await JoinRequest.findOne({ 
      email: email.toLowerCase().trim() 
    }).lean();

    if (!request) {
      return res.json({ 
        ok: false, 
        approved: false, 
        status: null,
        message: "No join request found with this email." 
      });
    }

    return res.json({ 
      ok: true, 
      approved: request.status === "approved",
      status: request.status || "pending",
      data: {
        name: request.name,
        email: request.email,
        company: request.companyName,
        city: request.city,
        createdAt: request.createdAt,
        status: request.status || "pending"
      }
    });
  } catch (err) {
    console.error("Check join request status failed:", err?.message || err);
    return res.status(500).json({ ok: false, message: "Unable to check status." });
  }
};

export default { submitJoinRequest, listAdminJoinRequests, updateJoinRequestStatus, checkJoinRequestStatus };
