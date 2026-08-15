import crypto from "crypto";
import { InvestorInvite } from "../models/index.js";

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
