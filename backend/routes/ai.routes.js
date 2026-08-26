import express from "express";
import { chat, transcribe } from "../controllers/groq.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/chat", chat);
router.post("/transcribe", requireAuth, transcribe);

export default router;
