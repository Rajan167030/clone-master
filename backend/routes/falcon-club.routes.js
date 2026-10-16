import { Router } from "express";
import {
  submitApplication,
  getPublicMembersDirectory,
  getAdminApplications,
  updateApplicationAdmin,
  requestVerificationAdmin,
  deleteApplicationAdmin,
  getAdminStats,
  getDocumentUrlAdmin,
  getVerificationRequest,
  signVerificationUpload,
  addVerificationDocument,
  submitVerificationDocuments,
} from "../controllers/falcon-club.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

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
    if (entry.count > max) {
      return res.status(429).json({ message });
    }
    return next();
  };
};

const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many applications from this network. Please try again in an hour.",
});
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many requests. Please wait a few minutes and try again.",
});

// Public
router.post("/apply", applyLimiter, submitApplication);

// Private member directory (any logged-in account)
router.get("/members", requireAuth, getPublicMembersDirectory);

// Applicant secure document upload (token from verification email)
router.get("/verify/:token", verifyLimiter, getVerificationRequest);
router.post("/verify/:token/sign-upload", verifyLimiter, signVerificationUpload);
router.post("/verify/:token/documents", verifyLimiter, addVerificationDocument);
router.post("/verify/:token/submit", verifyLimiter, submitVerificationDocuments);

// Admin
router.get("/admin/applications", requireAuth, requireAdmin, getAdminApplications);
router.get("/admin/stats", requireAuth, requireAdmin, getAdminStats);
router.patch("/admin/applications/:id", requireAuth, requireAdmin, updateApplicationAdmin);
router.post("/admin/applications/:id/request-verification", requireAuth, requireAdmin, requestVerificationAdmin);
router.get("/admin/applications/:id/documents/:docId", requireAuth, requireAdmin, getDocumentUrlAdmin);
router.delete("/admin/applications/:id", requireAuth, requireAdmin, deleteApplicationAdmin);

export default router;
