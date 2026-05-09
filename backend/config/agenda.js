import { Campaign, SendLog } from "../models/index.js";
import { sendEmail } from "../utils/email.js";

const BULK_EMAIL_BATCH_SIZE = Number(process.env.BULK_EMAIL_BATCH_SIZE || 50);

const chunkRecipients = (recipients, size) => {
  const chunks = [];
  for (let index = 0; index < recipients.length; index += size) {
    chunks.push(recipients.slice(index, index + size));
  }
  return chunks;
};

export const initAgenda = async () => {
  console.log("Agenda initialization skipped (direct send mode).");
  return null;
};

export const scheduleCampaign = async (campaignId, recipients = []) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign || !Array.isArray(recipients) || recipients.length === 0) {
    return { total: 0, sent: 0, failed: 0 };
  }

  const html = String(campaign.html || "").trim();
  const subject = String(campaign.subject || "").trim();
  const total = recipients.length;
  let sent = 0;
  let failed = 0;

  await Campaign.findByIdAndUpdate(campaignId, {
    status: "running",
    stats: { total, sent: 0, failed: 0 },
  });

  for (const batch of chunkRecipients(recipients, BULK_EMAIL_BATCH_SIZE)) {
    for (const recipient of batch) {
      const to = String(recipient?.email || "").trim();
      if (!to) continue;

      try {
        await sendEmail({
          to,
          subject,
          html,
          requireConfigured: true,
        });

        await SendLog.create({
          campaign: campaignId,
          to,
          name: String(recipient?.name || "").trim(),
          status: "sent",
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        await SendLog.create({
          campaign: campaignId,
          to,
          name: String(recipient?.name || "").trim(),
          status: "failed",
          error: error instanceof Error ? error.message : String(error || "Unable to send email."),
        });
      }
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      stats: { total, sent, failed },
    });
  }

  await Campaign.findByIdAndUpdate(campaignId, {
    status: "completed",
    stats: { total, sent, failed },
  });

  return { total, sent, failed };
};

export const scheduleForgotPasswordEmail = async () => {
  // Now handled directly in auth controller
};

export const scheduleDripEmail = async () => {
  // Disabled
};

export const scheduleEventReminder = async () => {
  // Disabled
};

export const scheduleAdminCheck = async () => {
  // Disabled
};

export default { 
  initAgenda, 
  scheduleCampaign, 
  scheduleForgotPasswordEmail,
  scheduleDripEmail,
  scheduleEventReminder,
  scheduleAdminCheck
};
