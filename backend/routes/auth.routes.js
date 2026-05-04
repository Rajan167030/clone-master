import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from "../controllers/email-verification.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/email-verification/send", sendEmailVerificationCode);
authRouter.post("/email-verification/verify", verifyEmailCode);

export default authRouter;
