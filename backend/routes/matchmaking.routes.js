import { Router } from "express";
import { requireAuth, requirePremium } from "../middlewares/auth.middleware.js";
import { getDeck, swipe, listMatches } from "../controllers/matchmaking.controller.js";

const matchmakingRouter = Router();

matchmakingRouter.use(requireAuth, requirePremium);

matchmakingRouter.get("/deck", getDeck);
matchmakingRouter.post("/swipe", swipe);
matchmakingRouter.get("/matches", listMatches);

export default matchmakingRouter;
