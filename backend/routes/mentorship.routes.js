import { Router } from "express";
import {
  validateMentorInvite,
  submitMentorApplication,
  submitMentorConnectRequest,
  listAdminMentorInvites,
  createAdminMentorInvite,
  setAdminMentorInviteActive,
  deleteAdminMentorInvite,
  listAdminMentorApplications,
  reviewAdminMentorApplication,
  listAdminMentorConnectRequests,
  updateAdminMentorConnectRequest,
  deleteAdminMentorConnectRequest,
  getAdminMentorshipStats,
} from "../controllers/mentorship.controller.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { auditLogger } from "../middlewares/audit.middleware.js";

const router = Router();

// Small in-memory fixed-window limiter for the unauthenticated endpoints.
const rateLimit = ({ windowMs, max, message }) => {
  const hits = new Map();
  return (req, res, next) => {
    const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const key = forwarded || req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > 10000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      return next();
    }
    entry.count += 1;
    if (entry.count > max) return res.status(429).json({ message });
    return next();
  };
};

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many submissions from this network. Please try again in an hour.",
});
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many requests. Please wait a few minutes and try again.",
});

// Public
router.get("/invites/:token", lookupLimiter, validateMentorInvite);
router.post("/invites/:token/apply", submitLimiter, submitMentorApplication);
router.post("/mentors/:slug/connect", submitLimiter, optionalAuth, submitMentorConnectRequest);

// Admin
const admin = Router();
admin.use(requireAuth, requireAdmin, auditLogger);
admin.get("/stats", getAdminMentorshipStats);
admin.get("/invites", listAdminMentorInvites);
admin.post("/invites", createAdminMentorInvite);
admin.patch("/invites/:id", setAdminMentorInviteActive);
admin.delete("/invites/:id", deleteAdminMentorInvite);
admin.get("/applications", listAdminMentorApplications);
admin.patch("/applications/:id/review", reviewAdminMentorApplication);
admin.get("/requests", listAdminMentorConnectRequests);
admin.patch("/requests/:id", updateAdminMentorConnectRequest);
admin.delete("/requests/:id", deleteAdminMentorConnectRequest);

router.use("/admin", admin);

export default router;
