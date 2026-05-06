import { Account, JoinRequest, NewsletterSubscriber, Campaign } from "../models/index.js";
import { isEmailConfigured } from "../utils/email.js";
import { scheduleCampaign } from "../config/agenda.js";

// Optimized batch size for better performance
const BULK_EMAIL_BATCH_SIZE = process.env.BULK_EMAIL_BATCH_SIZE || 50;
const BULK_AUDIENCES = new Set(["subscribers", "members", "everyone"]);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizeName = (name) => String(name || "").trim().slice(0, 80);

const normalizeRecipient = (recipient) => ({
  email: normalizeEmail(recipient?.email),
  name: normalizeName(recipient?.name),
});

const dedupeRecipients = (recipients) => {
  const map = new Map();

  for (const recipient of recipients) {
    const normalized = normalizeRecipient(recipient);
    if (!normalized.email) continue;
    if (!map.has(normalized.email)) {
      map.set(normalized.email, normalized);
    }
  }

  return [...map.values()];
};

const appendUnsubscribeFooter = ({ html, email, req }) => {
  const configured = process.env.PUBLIC_API_BASE_URL || process.env.API_PUBLIC_URL;
  const baseUrl = configured
    ? configured.trim().replace(/\/+$/, "").replace(/\/api$/i, "/api")
    : `${req.protocol}://${req.get("host")}/api`;
  const unsubscribeUrl = `${baseUrl}/content/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  return `
    ${html}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;" />
    <p style="color:#64748b;font-size:12px;line-height:1.6;">
      You are receiving this email because you are part of the Founders Connect ecosystem.
      <a href="${unsubscribeUrl}" style="color:#2563eb;">Unsubscribe</a>
    </p>
  `;
};

export const getRecipients = async (audience) => {
  const selectedAudience = BULK_AUDIENCES.has(audience) ? audience : "subscribers";

  if (selectedAudience === "subscribers") {
    const subscribers = await NewsletterSubscriber.find({ isActive: true }).select("email name").lean();
    return dedupeRecipients(subscribers.map((subscriber) => ({ email: subscriber.email, name: subscriber.name })));
  }

  if (selectedAudience === "members") {
    const members = await Account.find({ isActive: true, role: { $in: ["user", "investor", "founder"] } })
      .select("email fullName")
      .lean();

    return dedupeRecipients(members.map((member) => ({ email: member.email, name: member.fullName })));
  }

  const [subscribers, members, joinRequests] = await Promise.all([
    NewsletterSubscriber.find({ isActive: true }).select("email name").lean(),
    Account.find({ isActive: true, role: { $in: ["user", "investor", "founder"] } })
      .select("email fullName")
      .lean(),
    JoinRequest.find({}).select("email name companyName").lean(),
  ]);

  return dedupeRecipients([
    ...subscribers.map((subscriber) => ({ email: subscriber.email, name: subscriber.name })),
    ...members.map((member) => ({ email: member.email, name: member.fullName })),
    ...joinRequests.map((request) => ({ email: request.email, name: request.name || request.companyName })),
  ]);
};

export const sendBulkEmail = async (req, res) => {
  try {
    const { subject, html, audience } = req.body || {};
    const trimmedSubject = String(subject || "").trim();
    const trimmedHtml = String(html || "").trim();
    const selectedAudience = BULK_AUDIENCES.has(String(audience || "").trim())
      ? String(audience || "").trim()
      : "subscribers";

    if (!trimmedSubject || !trimmedHtml) {
      return res.status(400).json({ message: "Missing subject or html body." });
    }

    if (trimmedSubject.length > 150) {
      return res.status(400).json({ message: "Subject must be 150 characters or less." });
    }

    if (trimmedHtml.length > 100000) {
      return res.status(400).json({ message: "Email body is too large." });
    }

    if (!isEmailConfigured()) {
      return res.status(503).json({ message: "SMTP is not configured." });
    }

    const recipients = await getRecipients(selectedAudience);
    if (recipients.length === 0) {
      return res.status(400).json({ message: "There are no recipients for the selected audience." });
    }

    // create campaign record
    const campaign = await Campaign.create({
      name: trimmedSubject.slice(0, 80),
      subject: trimmedSubject,
      html: trimmedHtml,
      audience: selectedAudience,
      status: trimmedHtml && trimmedSubject ? 'scheduled' : 'draft',
      stats: { total: recipients.length, sent: 0, failed: 0 },
      createdBy: req.user?.id,
    });

    // schedule sending via Agenda jobs
    await scheduleCampaign(campaign._id, recipients);

    return res.json({ 
      message: 'Campaign queued for delivery',
      campaignId: campaign._id, 
      totalRecipients: recipients.length,
      estimatedDuration: `${Math.ceil(recipients.length / 100)} minutes`
    });
  } catch (error) {
    console.error("Bulk email send failed:", error?.message || error);
    return res.status(500).json({ message: "Server error" });
  }
};

export default { sendBulkEmail };