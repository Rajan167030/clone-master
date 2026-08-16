import { AuditLog } from "../models/audit-log.model.js";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "confirmPassword",
  "newPassword",
  "apiSecret",
  "token",
  "emailVerificationToken",
  "inviteToken",
]);

const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return {};

  return Object.entries(body).reduce((acc, [key, value]) => {
    if (SENSITIVE_KEYS.has(key)) {
      acc[key] = "[redacted]";
    } else if (typeof value === "string" && value.length > 500) {
      acc[key] = `${value.slice(0, 500)}...`;
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const auditLogger = (req, res, next) => {
  if (req.method === "GET") {
    return next();
  }

  res.on("finish", () => {
    if (!req.user?.id) return;

    const routePath = req.route?.path || req.path;
    const targetCollection = routePath.split("/").filter(Boolean)[0] || "";
    const targetId = req.params?.id || null;

    AuditLog.create({
      actorId: req.user.id,
      actorName: req.user.email || "",
      actorRole: req.user.role,
      action: `${req.method} /admin${routePath}`,
      method: req.method,
      path: routePath,
      targetCollection,
      targetId: targetId && /^[0-9a-fA-F]{24}$/.test(targetId) ? targetId : null,
      statusCode: res.statusCode,
      changes: sanitizeBody(req.body),
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    }).catch((error) => {
      console.error("Audit log write failed:", error?.message || error);
    });
  });

  return next();
};
