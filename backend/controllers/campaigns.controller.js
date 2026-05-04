import EmailTemplate from '../models/template.model.js';
import Campaign from '../models/campaign.model.js';
import SendLog from '../models/send-log.model.js';
import { renderTemplate } from '../utils/template.js';
import { scheduleCampaign } from '../config/agenda.js';
import { getRecipients } from './email-automation.controller.js';

export const listTemplates = async (req, res) => {
  const templates = await EmailTemplate.find({}).sort({ createdAt: -1 }).lean();
  return res.json({ templates });
};

export const createTemplate = async (req, res) => {
  const { name, subject, html } = req.body || {};
  if (!name || !subject || !html) return res.status(400).json({ message: 'Missing template fields.' });

  const tpl = await EmailTemplate.create({ name: String(name).trim(), subject: String(subject).trim(), html });
  return res.json({ message: 'Template created', template: tpl });
};

export const updateTemplate = async (req, res) => {
  const id = req.params.id;
  const { name, subject, html } = req.body || {};
  const tpl = await EmailTemplate.findById(id);
  if (!tpl) return res.status(404).json({ message: 'Template not found' });
  tpl.name = name ?? tpl.name;
  tpl.subject = subject ?? tpl.subject;
  tpl.html = html ?? tpl.html;
  await tpl.save();
  return res.json({ message: 'Template updated', template: tpl });
};

export const deleteTemplate = async (req, res) => {
  const id = req.params.id;
  await EmailTemplate.findByIdAndDelete(id);
  return res.json({ message: 'Template deleted' });
};

export const previewTemplate = async (req, res) => {
  const { html, variables } = req.body || {};
  try {
    const rendered = renderTemplate(html || '', variables || {});
    return res.json({ html: rendered });
  } catch (err) {
    return res.status(400).json({ message: err?.message || 'Template render failed' });
  }
};

// Campaigns
export const createCampaign = async (req, res) => {
  try {
    const { name, subject, html, templateId, audience, scheduledAt } = req.body || {};
    if (!subject || !(html || templateId)) return res.status(400).json({ message: 'Missing subject or HTML/template.' });

    let finalHtml = html;
    if (templateId) {
      const tpl = await EmailTemplate.findById(templateId).lean();
      if (!tpl) return res.status(404).json({ message: 'Template not found' });
      finalHtml = tpl.html;
    }

    const recipients = await getRecipients(audience);

    const campaign = await Campaign.create({
      name: name || subject.slice(0, 80),
      subject,
      template: templateId,
      html: finalHtml,
      audience: audience || 'subscribers',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      status: scheduledAt ? 'scheduled' : 'scheduled',
      stats: { total: recipients.length },
      createdBy: req.user?.id,
    });

    // schedule using Agenda
    await scheduleCampaign(campaign._id, recipients, { scheduledAt: campaign.scheduledAt });

    return res.json({ message: 'Campaign created and scheduled', campaignId: campaign._id, total: recipients.length });
  } catch (err) {
    console.error('createCampaign error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();
  return res.json({ campaigns });
};

export const getCampaign = async (req, res) => {
  const id = req.params.id;
  const campaign = await Campaign.findById(id).lean();
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
  return res.json({ campaign });
};

export const getCampaignLogs = async (req, res) => {
  const id = req.params.id;
  const logs = await SendLog.find({ campaign: id }).sort({ createdAt: -1 }).lean();
  return res.json({ logs });
};

export default {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  createCampaign,
  listCampaigns,
  getCampaign,
  getCampaignLogs,
};
