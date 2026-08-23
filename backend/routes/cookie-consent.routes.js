import { Router } from "express";
import { optionalAuth } from "../middlewares/auth.middleware.js";
import { logConsent } from "../controllers/cookie-consent.controller.js";

const cookieConsentRouter = Router();

// Public: works for anonymous visitors too; optionalAuth attributes it to an
// account when the visitor happens to be logged in.
cookieConsentRouter.post("/log", optionalAuth, logConsent);

export default cookieConsentRouter;
