import { Router } from "express";
import { validate } from "../config/validate";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  toggle2FASchema,
} from "../config/schema";
import {
  registerUser,
  verifyEmail,
  loginUser,
  resendVerification,
  sendPassResetOtp,
  verifyOtp,
  resetPassword,
  logoutUser,
  toggle2FA,
  verify2FA,
  fetchCurrentUser,
  refreshAccessToken
} from "../controllers/user.controller";
import { verifyJWT } from "../middleware/auth.middleware";

const router = Router();

//public route
router.post("/register", validate(registerSchema), registerUser);

router.get("/verify-email", verifyEmail);

router.post("/resend-verifylink", resendVerification);

router.post("/login", validate(loginSchema), loginUser);

router.post("/verify-2fa", verify2FA);

router.post("/forgot-password", sendPassResetOtp);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.post("/refresh-token", refreshAccessToken);

//protected route
router.post("/toggle-2fa", verifyJWT, validate(toggle2FASchema), toggle2FA);

router.post("/logout", verifyJWT, logoutUser);

router.get("/me", verifyJWT, fetchCurrentUser);

export default router;
