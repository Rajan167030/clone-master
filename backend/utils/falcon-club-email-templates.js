// FALCON Club emails share the platform's white-card / solid-violet look.
// Every applicant-supplied value is escaped before it reaches the HTML.

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));

const renderShell = ({ eyebrow, heading, bodyHtml, ctaLabel, ctaHref }) => `
  <div style="background-color: #f6f4fb; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #191024;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e1f5; border-top: 4px solid #6113d8; border-radius: 16px; padding: 36px 32px; box-shadow: 0 1px 2px rgba(25,16,36,0.04), 0 16px 32px rgba(25,16,36,0.06);">
      <p style="margin: 0 0 10px; font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #6113d8; text-transform: uppercase;">${escapeHtml(eyebrow)}</p>
      <h2 style="font-size: 23px; font-weight: 700; margin: 0 0 18px; color: #191024; letter-spacing: -0.5px;">${escapeHtml(heading)}</h2>
      ${bodyHtml}
      ${ctaHref ? `
        <div style="margin: 26px 0 8px;">
          <a href="${escapeHtml(ctaHref)}" style="display: inline-block; background: #6113d8; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 26px; border-radius: 10px;">${escapeHtml(ctaLabel)}</a>
        </div>` : ""}
      <p style="font-size: 14px; margin: 28px 0 0; color: #55506b; line-height: 1.6;">
        Warm regards,<br />
        <strong style="color: #191024;">Admissions Desk</strong><br />
        FALCON Club · Founders Connect
      </p>
    </div>
  </div>
`;

const paragraph = (html) =>
  `<p style="font-size: 15px; color: #55506b; line-height: 1.6; margin: 0 0 14px;">${html}</p>`;

const detailRows = (rows) => `
  <div style="background: #f6f4fb; border: 1px solid #e8e1f5; border-radius: 12px; padding: 16px 18px; margin: 18px 0;">
    ${rows.map(([label, value]) => `
      <p style="margin: 4px 0; font-size: 14px; color: #191024;"><span style="color: #8b84a0;">${escapeHtml(label)}:</span> <strong>${escapeHtml(value)}</strong></p>
    `).join("")}
  </div>
`;

const notice = (html) => `
  <div style="border-left: 3px solid #6113d8; background: #faf8fe; padding: 12px 16px; margin: 18px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 13.5px; color: #55506b; line-height: 1.6;">${html}</p>
  </div>
`;

export const buildApplicationReceivedEmail = (application) => renderShell({
  eyebrow: "FALCON Club · Founders Connect",
  heading: "Membership request received",
  bodyHtml: [
    paragraph(`Dear <strong style="color: #191024;">${escapeHtml(application.fullName)}</strong>,`),
    paragraph("Thank you for requesting membership to FALCON Club — a private circle for India’s most ambitious founders."),
    detailRows([
      ["Applicant", application.fullName],
      ["Company", `${application.companyName} (${application.customDesignation || application.designation})`],
      ["Suggested level", application.suggestedTier],
    ]),
    notice("Requesting membership does not grant it automatically. Every application is manually verified and approved by our admissions team. If we need supporting details, we will contact you with a secure upload link."),
    paragraph("Your financial details are kept confidential and are never shown publicly."),
  ].join(""),
});

export const buildVerificationRequestEmail = (application, uploadUrl) => renderShell({
  eyebrow: "FALCON Club · Verification",
  heading: "Verification information requested",
  bodyHtml: [
    paragraph(`Dear <strong style="color: #191024;">${escapeHtml(application.fullName)}</strong>,`),
    paragraph(`To continue reviewing your FALCON Club application for <strong style="color: #191024;">${escapeHtml(application.companyName)}</strong>, our admissions team needs some supporting information.`),
    notice(`<strong style="color: #191024;">Note from the admissions team:</strong><br />${escapeHtml(application.verificationRequestNote).replace(/\n/g, "<br />")}`),
    paragraph("Please upload your documents through the secure link below. Files are stored privately and are visible only to the admissions team. The link expires in 14 days."),
  ].join(""),
  ctaLabel: "Upload documents securely",
  ctaHref: uploadUrl,
});

export const buildApprovalEmail = (application, confirmedTier) => renderShell({
  eyebrow: "FALCON Club · Founders Connect",
  heading: "Welcome to FALCON Club",
  bodyHtml: [
    paragraph(`Dear <strong style="color: #191024;">${escapeHtml(application.fullName)}</strong>,`),
    paragraph(`Following verification, your application has been approved at the <strong style="color: #6113d8;">${escapeHtml(confirmedTier)}</strong> level.`),
    detailRows([
      ["Member", application.fullName],
      ["Company", application.companyName],
      ["Confirmed tier", confirmedTier],
    ]),
    paragraph("Our team will be in touch with onboarding details. Any membership fee, benefits, renewal and refund terms will be shared in writing before any payment is taken."),
  ].join(""),
});

export const buildStatusUpdateEmail = (application, status) => renderShell({
  eyebrow: "FALCON Club · Application update",
  heading: status === "Waitlisted" ? "Your application has been waitlisted" : "An update on your application",
  bodyHtml: [
    paragraph(`Dear <strong style="color: #191024;">${escapeHtml(application.fullName)}</strong>,`),
    status === "Waitlisted"
      ? paragraph("Thank you for your interest in FALCON Club. Your application has been placed on our waitlist. We will reach out if a place opens up for your profile.")
      : paragraph("Thank you for your interest in FALCON Club. After careful review, we are unable to offer membership at this time. You are welcome to apply again in the future as your journey grows."),
  ].join(""),
});
