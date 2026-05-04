import nodemailer from "nodemailer";

let cachedTransporter = null;

export const isEmailConfigured = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  return Boolean(host && user && pass);
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
};

export const sendEmail = async ({ to, subject, html, from, requireConfigured = false }) => {
  const transporter = createTransporter();
  const fromAddress =
    from ||
    process.env.NEWSLETTER_FROM_EMAIL ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    `no-reply@${process.env.HOST_DOMAIN || "foundersconnect.app"}`;

  if (!transporter) {
    if (requireConfigured) {
      throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS before sending newsletters.");
    }

    console.log("sendEmail: SMTP not configured. Skipping send.", { to, subject });
    return { ok: false, skipped: true, info: "smtp-not-configured" };
  }

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });

  return { ok: true };
};

export default sendEmail;
