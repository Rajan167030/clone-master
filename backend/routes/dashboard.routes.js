import { Router } from "express";
import {
  getMyDashboard,
  updateMyDashboard,
} from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get("/me", requireAuth, getMyDashboard);
dashboardRouter.patch("/me", requireAuth, updateMyDashboard);

export default dashboardRouter;
