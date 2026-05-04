import { Router } from "express";
import {
  getMyEventRegistrations,
  registerForEvent,
  submitEventInterest,
  updateMyEventRegistration,
} from "../controllers/event.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const eventRouter = Router();

eventRouter.post("/:slug/interest", submitEventInterest);
eventRouter.get("/me", requireAuth, getMyEventRegistrations);
eventRouter.post("/:slug/register", requireAuth, registerForEvent);
eventRouter.patch("/:slug/register", requireAuth, updateMyEventRegistration);

export default eventRouter;
