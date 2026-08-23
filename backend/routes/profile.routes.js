import { Router } from "express";
import {
  getPublicProfile,
  updateMyProfile,
  getMyProfile,
  generateProfileUrl,
  getProfileAnalytics,
  changePassword,
  updatePrivacy,
  updateNotificationPrefs,
  deactivateAccount,
} from "../controllers/profile.controller.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";

const profileRouter = Router();

// Public routes (no auth required, but attach req.user when a token is present)
profileRouter.get("/public/:profileId", optionalAuth, getPublicProfile);

// Protected routes (auth required)
profileRouter.get("/me", requireAuth, getMyProfile);
profileRouter.put("/me", requireAuth, updateMyProfile);
profileRouter.get("/url/generate", requireAuth, generateProfileUrl);
profileRouter.get("/analytics/scans", requireAuth, getProfileAnalytics);
profileRouter.post("/change-password", requireAuth, changePassword);
profileRouter.patch("/privacy", requireAuth, updatePrivacy);
profileRouter.patch("/notifications", requireAuth, updateNotificationPrefs);
profileRouter.post("/deactivate", requireAuth, deactivateAccount);

export default profileRouter;
