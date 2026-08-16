import crypto from "crypto";
import { InvestorInvite, InvestorLead } from "../models/index.js";

const toSafeInvite = (invite) => ({
  _id: invite._id,
  token: invite.token,
  label: invite.label,
  isActive: invite.isActive,
  expiresAt: invite.expiresAt,
  usageCount: invite.usageCount,
  lastUsedAt: invite.lastUsedAt,
  createdAt: invite.createdAt,
  updatedAt: invite.updatedAt,
});

export const listAdminInvestorInvites = async (req, res, next) => {
  try {
    const invites = await InvestorInvite.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ invites: invites.map(toSafeInvite) });
  } catch (error) {
    return next(error);
  }
};

export const createAdminInvestorInvite = async (req, res, next) => {
  try {
    const { label, expiresInDays } = req.body || {};

    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt =
      Number.isFinite(Number(expiresInDays)) && Number(expiresInDays) > 0
        ? new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000)
        : null;

    const invite = await InvestorInvite.create({
      token,
      label: String(label || "").trim(),
      createdBy: req.user?.id || null,
      expiresAt,
    });

    return res.status(201).json({ message: "Investor invite link created.", invite: toSafeInvite(invite) });
  } catch (error) {
    return next(error);
  }
};

export const revokeAdminInvestorInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await InvestorInvite.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });

    if (!invite) {
      return res.status(404).json({ message: "Invite link not found." });
    }

    return res.status(200).json({ message: "Invite link revoked.", invite: toSafeInvite(invite) });
  } catch (error) {
    return next(error);
  }
};

export const reactivateAdminInvestorInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await InvestorInvite.findByIdAndUpdate(id, { $set: { isActive: true } }, { new: true });

    if (!invite) {
      return res.status(404).json({ message: "Invite link not found." });
    }

    return res.status(200).json({ message: "Invite link reactivated.", invite: toSafeInvite(invite) });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminInvestorInvite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invite = await InvestorInvite.findByIdAndDelete(id);

    if (!invite) {
      return res.status(404).json({ message: "Invite link not found." });
    }

    return res.status(200).json({ message: "Invite link deleted." });
  } catch (error) {
    return next(error);
  }
};

export const validateInvestorInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invite = await InvestorInvite.findOne({ token: String(token || "").trim() }).lean();

    if (!invite || !invite.isActive) {
      return res.status(404).json({ valid: false, message: "This invite link is invalid or has been revoked." });
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(410).json({ valid: false, message: "This invite link has expired." });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    return next(error);
  }
};

export const submitInvestorLead = async (req, res, next) => {
  try {
    const { fullName, email, phone, vcName, investmentInterest, inviteToken } = req.body || {};

    const normalizedToken = String(inviteToken || "").trim();
    if (!normalizedToken) {
      return res.status(403).json({ message: "A valid invite link is required to submit this form." });
    }

    const invite = await InvestorInvite.findOne({ token: normalizedToken });
    if (!invite || !invite.isActive) {
      return res.status(403).json({ message: "This invite link is invalid or has been revoked." });
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(403).json({ message: "This invite link has expired." });
    }

    const normalizedFullName = String(fullName || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedVcName = String(vcName || "").trim();
    const normalizedInvestmentInterest = String(investmentInterest || "").trim();

    if (!normalizedFullName || !normalizedEmail || !normalizedVcName || !normalizedInvestmentInterest) {
      return res.status(400).json({ message: "Name, email, VC/firm name, and investment interest are required." });
    }

    const lead = await InvestorLead.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: String(phone || "").trim(),
      vcName: normalizedVcName,
      investmentInterest: normalizedInvestmentInterest,
      inviteToken: normalizedToken,
    });

    await InvestorInvite.updateOne(
      { _id: invite._id },
      { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
    );

    return res.status(201).json({
      message: "Thank you! Your details have been submitted.",
      lead: {
        _id: lead._id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        vcName: lead.vcName,
        investmentInterest: lead.investmentInterest,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const listAdminInvestorLeads = async (req, res, next) => {
  try {
    const leads = await InvestorLead.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ investors: leads });
  } catch (error) {
    return next(error);
  }
};
