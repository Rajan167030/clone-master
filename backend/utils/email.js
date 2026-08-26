import nodemailer from "nodemailer";

let cachedTransporter = null;
// undefined = not yet fetched, null = fetch failed (fall back to remote URL), object = ready to attach
let cachedLogoAttachment;

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

// Most inboxes (Gmail, Outlook) block remotely-hosted <img> sources by default for senders
// they don't yet trust — that was silently hiding the logo. Embedding it as an inline CID
// attachment ships the bytes with the message itself, so it renders without that gate.
const getLogoAttachment = async (logoUrl) => {
  if (cachedLogoAttachment !== undefined) return cachedLogoAttachment;

  try {
    const res = await fetch(logoUrl);
    if (!res.ok) throw new Error(`Logo fetch responded ${res.status}`);
    cachedLogoAttachment = {
      filename: "founders-connect-logo.jpg",
      content: Buffer.from(await res.arrayBuffer()),
      cid: "founders-connect-logo",
    };
  } catch (error) {
    console.error("sendEmail: could not fetch logo for inline embedding, falling back to remote URL.", error?.message || error);
    cachedLogoAttachment = null;
  }

  return cachedLogoAttachment;
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
  const logoAttachment = await getLogoAttachment(logoUrl);
  const logoSrc = logoAttachment ? `cid:${logoAttachment.cid}` : logoUrl;

  const wrappedHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
      <div style="text-align:center; padding:18px 0;">
        <img src="${logoSrc}" alt="Founders Connect" width="140" style="display:block; margin:0 auto; max-width:85%; height:auto;" />
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
    attachments: logoAttachment ? [logoAttachment] : undefined,
  });

  return { ok: true };
};

export default sendEmail;
