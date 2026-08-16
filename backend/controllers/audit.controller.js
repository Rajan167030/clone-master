import { AuditLog } from "../models/audit-log.model.js";

export const listAuditLogs = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);

    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ logs });
  } catch (error) {
    return next(error);
  }
};
