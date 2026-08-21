// Shared visual language for Bangalore Activity confirmation emails —
// a white card with a solid brand-violet accent bar, not a dark/gradient
// card, so it reads as a deliberate product email rather than a template.

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));

const buildCredentialsBlock = ({ email, password }) => {
  if (!password) return "";

  return `
    <div style="background: #f6f4fb; border: 1px solid #e8e1f5; border-radius: 12px; padding: 18px; margin-bottom: 26px; text-align: left;">
      <p style="margin: 0 0 10px; font-size: 13px; color: #55506b; line-height: 1.5;">
        Your login — select and copy, then paste both into the <strong style="color: #191024;">login page</strong>:
      </p>
      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8b84a0;">Email</p>
      <p style="margin: 0 0 12px; font-size: 14px; color: #191024; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 600; user-select: all;">${escapeHtml(email)}</p>
      <p style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8b84a0;">Password</p>
      <p style="margin: 0; font-size: 16px; color: #6113d8; font-family: 'SFMono-Regular', Consolas, monospace; font-weight: 700; letter-spacing: 0.5px; user-select: all;">${escapeHtml(password)}</p>
    </div>
  `;
};

const renderShell = ({ eyebrow, heading, bodyHtml, primaryLabel, primaryHref, secondaryButton, secondaryLinks }) => `
  <div style="background-color: #f6f4fb; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #191024;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e1f5; border-top: 4px solid #6113d8; border-radius: 16px; padding: 40px 34px; box-shadow: 0 1px 2px rgba(25,16,36,0.04), 0 16px 32px rgba(25,16,36,0.06); text-align: center;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #6113d8; text-transform: uppercase;">${escapeHtml(eyebrow)}</span>
      </div>

      <h2 style="font-size: 23px; font-weight: 700; margin: 0 0 18px; color: #191024; letter-spacing: -0.5px;">${escapeHtml(heading)}</h2>

      ${bodyHtml}

      <a href="${primaryHref}" style="display: inline-block; background: #6113d8; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 15px 34px; border-radius: 10px; margin: 8px 0; box-shadow: 0 8px 20px rgba(97,19,216,0.25);">
        ${escapeHtml(primaryLabel)}
      </a>

      ${
        secondaryButton
          ? `
      <div>
        <a href="${secondaryButton.href}" style="display: inline-block; background: #ffffff; color: #6113d8; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 30px; border-radius: 10px; margin: 4px 0 22px; border: 2px solid #6113d8;">
          ${escapeHtml(secondaryButton.label)}
        </a>
      </div>`
          : ""
      }

      <div style="border-top: 1px solid #ece7f6; padding-top: 20px; margin-top: ${secondaryButton ? "4px" : "22px"};">
        ${secondaryLinks
          .map(
            (link) => `
          <a href="${link.href}" style="display: inline-block; color: #6113d8; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 14px;">
            ${escapeHtml(link.label)} &rarr;
          </a>`
          )
          .join("")}
      </div>
    </div>
    <div style="margin-top: 20px; font-size: 12px; color: #8b84a0; text-align: center;">
      © ${new Date().getFullYear()} Founders Connect. All rights reserved.<br/>
      <a href="https://foundersconnect.co.in" style="color: #6113d8; text-decoration: none; font-weight: 600;">foundersconnect.co.in</a>
    </div>
  </div>
`;

export const buildStartupActivityEmail = ({ founderName, startupName, email, password, dashboardLink, saisLink, communityLink }) => {
  const bodyHtml = `
    <p style="font-size: 15px; color: #55506b; line-height: 1.6; margin-bottom: 6px;">Hi ${escapeHtml(founderName)},</p>
    <p style="font-size: 15px; color: #55506b; line-height: 1.6; margin-bottom: 26px;">
      ${escapeHtml(startupName)} is officially registered for the Bangalore Founders Connect activity. Investors on the ground will be
      viewing your pitch and rating it live — head into <strong style="color: #6113d8;">SAIS'26</strong> to see where you stand.
    </p>
    ${buildCredentialsBlock({ email, password })}
  `;

  return renderShell({
    eyebrow: "Founders Connect",
    heading: "You're registered for SAIS'26",
    bodyHtml,
    primaryLabel: "Enter SAIS'26 →",
    primaryHref: saisLink,
    secondaryButton: { label: password ? "Log In to Your Dashboard" : "Your Dashboard", href: dashboardLink },
    secondaryLinks: [{ label: "Join the Community", href: communityLink }],
  });
};

export const buildInvestorActivityEmail = ({ fullName, firmName, email, password, dashboardLink, saisLink, communityLink }) => {
  const bodyHtml = `
    <p style="font-size: 15px; color: #55506b; line-height: 1.6; margin-bottom: 6px;">Hi ${escapeHtml(fullName)},</p>
    <p style="font-size: 15px; color: #55506b; line-height: 1.6; margin-bottom: 26px;">
      Your investor profile for ${escapeHtml(firmName)} is confirmed for the Bangalore Founders Connect activity. Step into
      <strong style="color: #6113d8;">SAIS'26</strong> to browse founder pitches and start rating startups.
    </p>
    ${buildCredentialsBlock({ email, password })}
  `;

  return renderShell({
    eyebrow: "Founders Connect",
    heading: "You're in — SAIS'26 awaits",
    bodyHtml,
    primaryLabel: "Enter SAIS'26 →",
    primaryHref: saisLink,
    secondaryButton: { label: password ? "Log In to Your Dashboard" : "Your Dashboard", href: dashboardLink },
    secondaryLinks: [{ label: "Join the Community", href: communityLink }],
  });
};

export default { buildStartupActivityEmail, buildInvestorActivityEmail };
