import * as AgendaPkg from 'agenda';
const Agenda = AgendaPkg?.default || AgendaPkg;
import { sendEmail } from '../utils/email.js';
import { Campaign, SendLog, NewsletterSubscriber, Account, JoinRequest } from '../models/index.js';

let agenda;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendWithRetry = async (payload, maxAttempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await sendEmail(payload);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        await delay(1000 * 2 ** (attempt - 1));
      }
    }
  }

  throw lastError;
};

// Rate limiter to avoid provider throttling
const emailRateLimiter = (() => {
  let lastEmailTime = 0;
  const MIN_DELAY = 50; // 50ms between emails
  
  return async () => {
    const now = Date.now();
    const timeSinceLastEmail = now - lastEmailTime;
    if (timeSinceLastEmail < MIN_DELAY) {
      await delay(MIN_DELAY - timeSinceLastEmail);
    }
    lastEmailTime = Date.now();
  };
})();

export const initAgenda = async (mongoConnection, opts = {}) => {
  if (agenda) return agenda;

  const mongo = mongoConnection.client ? mongoConnection.client.db() : mongoConnection.db();

  agenda = new Agenda({ mongo, db: { collection: opts.collection || 'agendaJobs' } });

  agenda.define('send-campaign-batch', { concurrency: 5, lockLifetime: 30 * 60 * 1000, maxAttempts: 3 }, async (job) => {
    const { campaignId, recipients, batchIndex = 0 } = job.attrs.data || {};
    if (!recipients || !Array.isArray(recipients)) return;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;

    if (batchIndex === 0) {
      campaign.status = 'running';
      await campaign.save();
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        await emailRateLimiter(); // Rate limit
        const body = recipient.name ? `<p>Hi ${recipient.name},</p>${campaign.html}` : campaign.html;
        await sendWithRetry({
          to: recipient.email,
          subject: campaign.subject,
          html: body,
          from: process.env.NEWSLETTER_FROM_EMAIL,
          requireConfigured: true,
        });

        await SendLog.create({ campaign: campaignId, to: recipient.email, name: recipient.name, status: 'sent' });
        sentCount++;
      } catch (err) {
        await SendLog.create({ campaign: campaignId, to: recipient.email, name: recipient.name, status: 'failed', error: String(err?.message || err) });
        failedCount++;
      }
    }

    // Final summary after all batches
    const totals = await SendLog.aggregate([
      { $match: { campaign: campaign._id } },
      { $group: { _id: '$campaign', sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } } } },
    ]);

    const summary = totals[0] || { sent: 0, failed: 0 };
    campaign.stats = { total: recipients.length, sent: summary.sent, failed: summary.failed };
    campaign.status = 'completed';
    await campaign.save();
  });

  await agenda.start();
  return agenda;
};

export const scheduleCampaign = async (campaignId, recipients, options = {}) => {
  if (!agenda) throw new Error('Agenda is not initialized');

  const batchSize = Number(process.env.BULK_EMAIL_BATCH_SIZE || 25);
  const runAt = options.scheduledAt ? new Date(options.scheduledAt) : new Date();

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    if (runAt.getTime() > Date.now()) {
      await agenda.schedule(runAt, 'send-campaign-batch', { campaignId, recipients: batch });
    } else {
      await agenda.now('send-campaign-batch', { campaignId, recipients: batch });
    }
  }
};

export default { initAgenda, scheduleCampaign };
