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

  // Ensure emails include a small branded header with the Founders Connect logo.
  // Uses HOST_URL (preferred) or HOST_DOMAIN to form an absolute URL to the public asset.
  const hostUrl = (process.env.HOST_URL || (process.env.HOST_DOMAIN ? `https://${process.env.HOST_DOMAIN}` : "")).replace(/\/$/, "");
  const logoUrl = hostUrl ? `${hostUrl}/founders_connect_global_logo.jpg` : `/founders_connect_global_logo.jpg`;

  const wrappedHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
      <div style="text-align:center; padding:18px 0;">
        <img src="${logoUrl}" alt="Founders Connect" width="140" style="display:block; margin:0 auto; max-width:85%; height:auto;" />
      </div>
      <div style="max-width:680px; margin:0 auto; padding:0 16px;">
        ${html || ""}
      </div>
      <div style="max-width:680px; margin:18px auto 30px; padding:0 16px; color:#6b7280; font-size:12px; text-align:center;">
        <p style="margin:8px 0 0;">Founders Connect · <a href="${hostUrl || '#'}" style="color:#6b7280;">Visit site</a></p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html: wrappedHtml,
  });

  return { ok: true };
};

export default sendEmail;
