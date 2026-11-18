import { Router } from "express";
import {
  generatePitchDeck,
  reviewPitch,
  validateStartup,
  assessInvestorReadiness,
  listArtifacts,
  getArtifact,
  updateArtifact,
  deleteArtifact,
  getUsage,
  listThreads,
  getThread,
  deleteThread,
  sendAssistantMessage,
  adminAiStats,
} from "../controllers/ai-tools.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();
router.use(requireAuth);

// Short burst limiter on top of the per-account daily allowance (stops double-click floods).
const burst = new Map();
const burstLimit = (req, res, next) => {
  const key = req.user?.id || req.user?.sub || req.ip;
  const now = Date.now();
  const hits = (burst.get(key) || []).filter((t) => now - t < 60_000);
  if (hits.length >= 6) return res.status(429).json({ message: "Slow down a little. Try again in a minute." });
  hits.push(now);
  burst.set(key, hits);
  if (burst.size > 5000) for (const [k, v] of burst) if (!v.some((t) => now - t < 60_000)) burst.delete(k);
  return next();
};

router.get("/usage", getUsage);
router.post("/pitch-deck", burstLimit, generatePitchDeck);
router.post("/pitch-review", burstLimit, reviewPitch);
router.post("/validation", burstLimit, validateStartup);
router.post("/investor-readiness", burstLimit, assessInvestorReadiness);

router.get("/artifacts", listArtifacts);
router.get("/artifacts/:id", getArtifact);
router.patch("/artifacts/:id", updateArtifact);
router.delete("/artifacts/:id", deleteArtifact);

router.get("/assistant/threads", listThreads);
router.get("/assistant/threads/:id", getThread);
router.delete("/assistant/threads/:id", deleteThread);
router.post("/assistant/messages", burstLimit, sendAssistantMessage);

router.get("/admin/stats", requireAdmin, adminAiStats);

export default router;
