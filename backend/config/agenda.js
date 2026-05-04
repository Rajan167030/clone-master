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
        await delay(500 * 2 ** (attempt - 1));
      }
    }
  }

  throw lastError;
};

export const initAgenda = async (mongoConnection, opts = {}) => {
  if (agenda) return agenda;

  const mongo = mongoConnection.client ? mongoConnection.client.db() : mongoConnection.db();

  agenda = new Agenda({ mongo, db: { collection: opts.collection || 'agendaJobs' } });

  agenda.define('send-campaign-batch', { concurrency: 2, lockLifetime: 10 * 60 * 1000 }, async (job) => {
    const { campaignId, recipients } = job.attrs.data || {};
    if (!recipients || !Array.isArray(recipients)) return;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return;

    campaign.status = 'running';
    await campaign.save();

    for (const recipient of recipients) {
      try {
        const body = recipient.name ? `<p>Hi ${recipient.name},</p>${campaign.html}` : campaign.html;
        await sendWithRetry({
          to: recipient.email,
          subject: campaign.subject,
          html: body,
          from: process.env.NEWSLETTER_FROM_EMAIL,
          requireConfigured: true,
        });

        await SendLog.create({ campaign: campaignId, to: recipient.email, name: recipient.name, status: 'sent' });
      } catch (err) {
        await SendLog.create({ campaign: campaignId, to: recipient.email, name: recipient.name, status: 'failed', error: String(err?.message || err) });
      }
    }

    const totals = await SendLog.aggregate([
      { $match: { campaign: campaign._id } },
      { $group: { _id: '$campaign', sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } } } },
    ]);

    const summary = totals[0] || { sent: 0, failed: 0 };
    campaign.stats = { total: recipients.length, sent: summary.sent, failed: summary.failed };
    campaign.status = summary.failed > 0 ? 'completed' : 'completed';
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
