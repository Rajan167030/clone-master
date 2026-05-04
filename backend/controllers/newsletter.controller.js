import { NewsletterSubscriber } from "../models/index.js";
import { isEmailConfigured, sendEmail } from "../utils/email.js";

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SUBSCRIBE_WINDOW_MS = 15 * 60 * 1000;
const SUBSCRIBE_MAX_ATTEMPTS = 5;
const subscribeAttempts = new Map();

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const normalizeName = (name) => String(name || "").trim().slice(0, 80);

const isValidEmail = (email) => EMAIL_REGEX.test(email);

const pruneSubscribeAttempts = (now) => {
  for (const [key, value] of subscribeAttempts.entries()) {
    if (now - value.firstAttemptAt > SUBSCRIBE_WINDOW_MS) {
      subscribeAttempts.delete(key);
    }
  }
};

const isRateLimited = (req, email) => {
  const now = Date.now();
  pruneSubscribeAttempts(now);

  const key = `${req.ip || "unknown"}:${email}`;
  const current = subscribeAttempts.get(key);

  if (!current) {
    subscribeAttempts.set(key, { count: 1, firstAttemptAt: now });
    return false;
  }

  current.count += 1;

  return current.count > SUBSCRIBE_MAX_ATTEMPTS;
};

const getPublicApiBaseUrl = (req) => {
  const configured = process.env.PUBLIC_API_BASE_URL || process.env.API_PUBLIC_URL;

  if (configured) {
    return configured.trim().replace(/\/+$/, "").replace(/\/api$/i, "/api");
  }

  return `${req.protocol}://${req.get("host")}/api`;
};

const appendNewsletterFooter = ({ html, email, req }) => {
  const unsubscribeUrl = `${getPublicApiBaseUrl(req)}/content/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;

  return `
    ${html}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;" />
    <p style="color:#64748b;font-size:12px;line-height:1.6;">
      You are receiving this email because you subscribed to Founders Connect updates.
      <a href="${unsubscribeUrl}" style="color:#2563eb;">Unsubscribe</a>
    </p>
  `;
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email, name } = req.body || {};
    const normalized = normalizeEmail(email);
    const normalizedName = normalizeName(name);

    if (!isValidEmail(normalized)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (isRateLimited(req, normalized)) {
      return res.status(429).json({ message: "Too many subscription attempts. Please try again later." });
    }

    const existing = await NewsletterSubscriber.findOne({ email: normalized });

    if (existing) {
      const wasInactive = !existing.isActive;
      if (!existing.isActive) {
        existing.isActive = true;
        existing.name = normalizedName || existing.name;
        await existing.save();
      }
      return res.json({ message: wasInactive ? "Subscription reactivated." : "Already subscribed." });
    }

    const subscriber = new NewsletterSubscriber({ email: normalized, name: normalizedName });
    await subscriber.save();

    if (isEmailConfigured()) {
      try {
        const from = process.env.NEWSLETTER_FROM_EMAIL;
        const html = appendNewsletterFooter({
          html: `<p>Thanks for subscribing to the Founders Connect newsletter.</p>`,
          email: normalized,
          req,
        });
        await sendEmail({ to: normalized, subject: "Welcome to Founders Connect", html, from });
      } catch (err) {
        console.warn("Newsletter welcome email failed:", err?.message || err);
      }
    }

    return res.status(201).json({ message: "Subscribed successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.query || {};
    if (!email || typeof email !== "string") return res.status(400).json({ message: "Missing email." });

    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) return res.status(400).json({ message: "Invalid email address." });

    const existing = await NewsletterSubscriber.findOne({ email: normalized });
    if (!existing) return res.json({ message: "Not subscribed." });

    existing.isActive = false;
    await existing.save();

    return res.json({ message: "Unsubscribed successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const listSubscribersAdmin = async (req, res) => {
  try {
    const subs = await NewsletterSubscriber.find().sort({ subscribedAt: -1 }).lean();
    return res.json({ subscribers: subs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default { subscribeNewsletter, unsubscribeNewsletter, listSubscribersAdmin };
