import { AdminMessage } from "../models/admin-message.model.js";
import { Account } from "../models/index.js";
import { sendEmail } from "../utils/email.js";

export const listChatParticipants = async (req, res, next) => {
  try {
    const participants = await Account.find({ role: { $in: ["admin", "superadmin"] } })
      .select("fullName email role")
      .lean();

    return res.status(200).json({ participants });
  } catch (error) {
    return next(error);
  }
};

// An admin's tab pings this every ~25s while the panel is open — cheap presence signal,
// no websockets needed since the backend runs as Vercel serverless functions.
const ONLINE_THRESHOLD_MS = 60 * 1000;

export const sendAdminHeartbeat = async (req, res, next) => {
  try {
    await Account.updateOne({ _id: req.user.id }, { $set: { lastActiveAt: new Date() } });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return next(error);
  }
};

export const listOnlineAdmins = async (req, res, next) => {
  try {
    const admins = await Account.find({ role: { $in: ["admin", "superadmin"] } })
      .select("fullName email role lastActiveAt")
      .lean();

    const now = Date.now();
    const online = admins
      .filter((a) => a.lastActiveAt && now - new Date(a.lastActiveAt).getTime() <= ONLINE_THRESHOLD_MS)
      .map((a) => ({ _id: a._id, fullName: a.fullName, email: a.email, role: a.role, lastActiveAt: a.lastActiveAt }));

    return res.status(200).json({ online });
  } catch (error) {
    return next(error);
  }
};

const buildMentionEmail = ({ taggedName, senderName, message }) => `
  <div style="background-color: #0b071e; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #ffffff;">
    <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #130f35 0%, #0a0524 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.45); text-align: center;">
      <div style="margin-bottom: 30px;">
        <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #a855f7; text-transform: uppercase;">Founders Connect</span>
      </div>
      <h2 style="font-size: 24px; font-weight: 700; margin-top: 0; color: #ffffff; letter-spacing: -0.5px;">You were tagged in Admin Chat</h2>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 8px;">Hi ${taggedName},</p>
      <p style="font-size: 15px; color: #b4acc9; line-height: 1.6; margin-bottom: 24px;">
        <strong style="color: #c084fc;">${senderName}</strong> mentioned you in the admin chat:
      </p>
      <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 16px; padding: 18px; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0; font-size: 14px; color: #ffffff;">${message}</p>
      </div>
      <a href="https://foundersconnect.co.in/admin" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px;">
        Open Admin Dashboard
      </a>
    </div>
    <div style="margin-top: 20px; font-size: 12px; color: #5a5275; text-align: center;">
      © ${new Date().getFullYear()} Founders Connect. All rights reserved.<br/>
      <a href="https://foundersconnect.co.in" style="color: #a855f7; text-decoration: none; font-weight: 600;">foundersconnect.co.in</a>
    </div>
  </div>
`;

export const sendAdminMessage = async (req, res, next) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ message: "Message text is required." });
    }

    const senderName = String(req.body?.senderName || "").trim().slice(0, 100) || req.user.email || "Admin";

    const rawMentionedIds = Array.isArray(req.body?.mentionedIds) ? req.body.mentionedIds : [];
    const mentionedIds = rawMentionedIds
      .filter((id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id))
      .filter((id) => id !== req.user.id);

    const created = await AdminMessage.create({
      senderId: req.user.id,
      senderName,
      senderRole: req.user.role,
      message: message.slice(0, 2000),
      mentions: mentionedIds,
    });

    if (mentionedIds.length) {
      Account.find({ _id: { $in: mentionedIds } })
        .select("fullName email")
        .lean()
        .then((tagged) => {
          tagged.forEach((account) => {
            sendEmail({
              to: account.email,
              subject: `${senderName} tagged you in Admin Chat`,
              html: buildMentionEmail({ taggedName: account.fullName, senderName, message: created.message }),
            }).catch((err) => console.error("Mention email failed:", err?.message || err));
          });
        })
        .catch((err) => console.error("Mention lookup failed:", err?.message || err));
    }

    return res.status(201).json({ chatMessage: created });
  } catch (error) {
    return next(error);
  }
};

export const listAdminMessages = async (req, res, next) => {
  try {
    const after = req.query.after ? new Date(String(req.query.after)) : null;
    const filter = after && !Number.isNaN(after.getTime()) ? { createdAt: { $gt: after } } : {};

    const limit = after ? 200 : 50;
    const messages = await AdminMessage.find(filter)
      .sort({ createdAt: after ? 1 : -1 })
      .limit(limit)
      .lean();

    const ordered = after ? messages : messages.reverse();

    return res.status(200).json({ messages: ordered });
  } catch (error) {
    return next(error);
  }
};
