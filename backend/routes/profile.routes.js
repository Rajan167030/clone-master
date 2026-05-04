import { Router } from "express";
import {
  getPublicProfile,
  updateMyProfile,
  getMyProfile,
  generateProfileUrl,
  getProfileAnalytics,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const profileRouter = Router();

// Public routes (no auth required)
profileRouter.get("/public/:profileId", getPublicProfile);

// Protected routes (auth required)
profileRouter.get("/me", requireAuth, getMyProfile);
profileRouter.put("/me", requireAuth, updateMyProfile);
profileRouter.get("/url/generate", requireAuth, generateProfileUrl);
profileRouter.get("/analytics/scans", requireAuth, getProfileAnalytics);

export default profileRouter;
