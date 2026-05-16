import express from "express";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 20px; border-radius: 16px; border: 1px solid #eaeaea; text-align: center;">
        <div style="margin-bottom: 30px;">
          <h1 style="color: #111827; font-size: 32px; margin: 0 0 10px 0; font-weight: 800; letter-spacing: -1px;">You're on the list! 🎉</h1>
          <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin: 0;">
            Thank you for requesting early access.
          </p>
        </div>
        
        <div style="background: linear-gradient(145deg, #f3f4f6, #ffffff); border: 1px solid #e5e7eb; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <p style="color: #374151; font-size: 16px; margin: 0; font-weight: 500; line-height: 1.6;">
            We are building a powerful new product designed specifically for founders and builders.<br><br>
            <strong>Keep an eye on your inbox.</strong> We will notify you the moment we launch so you can be among the first to experience it.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
          If you have any questions, feel free to reply to this email.<br>
          <span style="font-weight: 600; color: #111827; display: inline-block; margin-top: 8px;">— The Founders Connect Team</span>
        </p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "You're on the Early Access List! 🚀",
      html: htmlContent,
    });

    res.status(200).json({ success: true, message: "Early access email sent successfully." });
  } catch (error) {
    console.error("Early access error:", error);
    res.status(500).json({ success: false, message: "Failed to process early access request." });
  }
});

export default router;
