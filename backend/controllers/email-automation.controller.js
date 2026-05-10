import { Account, JoinRequest, NewsletterSubscriber, Campaign } from "../models/index.js";
import { isEmailConfigured } from "../utils/email.js";
import { scheduleCampaign } from "../config/agenda.js";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const BULK_AUDIENCES = new Set(["subscribers", "members", "everyone", "custom"]);
const MAX_CUSTOM_RECIPIENTS = Number(process.env.BULK_EMAIL_MAX_RECIPIENTS || 20000);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizeName = (name) => String(name || "").trim().slice(0, 80);

const normalizeRecipient = (recipient) => ({
  email: normalizeEmail(recipient?.email),
  name: normalizeName(recipient?.name),
});

const isValidEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

const parseCustomRecipientsFromText = (recipientsText) =>
  String(recipientsText || "")
    .split(/[\n,;\t ]+/)
    .map((value) => normalizeEmail(value))
    .filter(Boolean)
    .map((email) => ({ email, name: "" }));

const parseCustomRecipientsFromArray = (recipients = []) => {
  if (!Array.isArray(recipients)) {
    return [];
  }

  return recipients
    .map((entry) => {
      if (typeof entry === "string") {
        return { email: normalizeEmail(entry), name: "" };
      }

      return {
        email: normalizeEmail(entry?.email),
        name: normalizeName(entry?.name),
      };
    })
    .filter((entry) => Boolean(entry.email));
};

const parseCustomRecipients = ({ recipientsText, recipients } = {}) => {
  const parsed = [...parseCustomRecipientsFromText(recipientsText), ...parseCustomRecipientsFromArray(recipients)];
  const acceptedMap = new Map();
  const invalidEntries = [];
  let duplicateCount = 0;

  for (const recipient of parsed) {
    if (!isValidEmail(recipient.email)) {
      if (invalidEntries.length < 100) {
        invalidEntries.push(recipient.email);
      }
      continue;
    }

    if (acceptedMap.has(recipient.email)) {
      duplicateCount += 1;
      continue;
    }

    acceptedMap.set(recipient.email, recipient);
  }

  const accepted = [...acceptedMap.values()];

  return {
    recipients: accepted,
    recipientUpload: {
      totalParsed: parsed.length,
      accepted: accepted.length,
      invalid: parsed.length - accepted.length - duplicateCount,
      duplicates: duplicateCount,
      source: "manual-paste",
      previewInvalid: invalidEntries,
    },
  };
};

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

export const getRecipients = async (audience, options = {}) => {
  const selectedAudience = BULK_AUDIENCES.has(audience) ? audience : "subscribers";

  if (selectedAudience === "custom") {
    const { recipients: customRecipients, recipientUpload } = parseCustomRecipients(options);
    if (customRecipients.length > MAX_CUSTOM_RECIPIENTS) {
      throw new Error(`Custom recipients exceed limit of ${MAX_CUSTOM_RECIPIENTS}.`);
    }

    return {
      selectedAudience,
      recipients: customRecipients,
      recipientUpload,
    };
  }

  if (selectedAudience === "subscribers") {
    const subscribers = await NewsletterSubscriber.find({ isActive: true }).select("email name").lean();
    return {
      selectedAudience,
      recipients: dedupeRecipients(subscribers.map((subscriber) => ({ email: subscriber.email, name: subscriber.name }))),
      recipientUpload: null,
    };
  }

  if (selectedAudience === "members") {
    const members = await Account.find({ isActive: true, role: { $in: ["user", "investor", "founder"] } })
      .select("email fullName")
      .lean();

    return {
      selectedAudience,
      recipients: dedupeRecipients(members.map((member) => ({ email: member.email, name: member.fullName }))),
      recipientUpload: null,
    };
  }

  const [subscribers, members, joinRequests] = await Promise.all([
    NewsletterSubscriber.find({ isActive: true }).select("email name").lean(),
    Account.find({ isActive: true, role: { $in: ["user", "investor", "founder"] } })
      .select("email fullName")
      .lean(),
    JoinRequest.find({}).select("email name companyName").lean(),
  ]);

  return {
    selectedAudience,
    recipients: dedupeRecipients([
      ...subscribers.map((subscriber) => ({ email: subscriber.email, name: subscriber.name })),
      ...members.map((member) => ({ email: member.email, name: member.fullName })),
      ...joinRequests.map((request) => ({ email: request.email, name: request.name || request.companyName })),
    ]),
    recipientUpload: null,
  };
};

export const sendBulkEmail = async (req, res) => {
  try {
    const { subject, html, audience, recipientsText, recipients } = req.body || {};
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

    const recipientContext = await getRecipients(selectedAudience, { recipientsText, recipients });
    if (recipientContext.recipients.length === 0) {
      return res.status(400).json({ message: "There are no recipients for the selected audience." });
    }

    // create campaign record
    const campaign = await Campaign.create({
      name: trimmedSubject.slice(0, 80),
      subject: trimmedSubject,
      html: trimmedHtml,
      audience: recipientContext.selectedAudience,
      status: trimmedHtml && trimmedSubject ? 'scheduled' : 'draft',
      stats: { total: recipientContext.recipients.length, sent: 0, failed: 0 },
      recipientUpload: recipientContext.recipientUpload || undefined,
      createdBy: req.user?.id,
    });

    // schedule sending via Agenda jobs
    await scheduleCampaign(campaign._id, recipientContext.recipients);

    return res.json({ 
      message: 'Campaign queued for delivery',
      campaignId: campaign._id, 
      totalRecipients: recipientContext.recipients.length,
      estimatedDuration: `${Math.ceil(recipientContext.recipients.length / 100)} minutes`,
      recipientUpload: recipientContext.recipientUpload || undefined,
    });
  } catch (error) {
    console.error("Bulk email send failed:", error?.message || error);
    if (error instanceof Error && /recipients|limit/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export default { sendBulkEmail };