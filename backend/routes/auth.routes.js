import { Router } from "express";
import { login, register, forgotPassword, verifyForgotPasswordOtp, resetPassword, adminLogin } from "../controllers/auth.controller.js";
import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from "../controllers/email-verification.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/admin-login", adminLogin);
authRouter.post("/email-verification/send", sendEmailVerificationCode);
authRouter.post("/email-verification/verify", verifyEmailCode);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
