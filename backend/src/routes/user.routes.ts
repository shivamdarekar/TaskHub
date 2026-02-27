import { Router } from "express";
import { validate } from "../config/validate";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  toggle2FASchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema
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
  refreshAccessToken,
  updateProfile,
  changePassword,
  getUserStats,
  deleteAccount
} from "../controllers/user.controller";
import { verifyJWT } from "../middleware/auth.middleware";
import { authLimiter, passwordResetLimiter } from "../middleware/security";

const router = Router();

//public route with rate limiting
router.post("/register", authLimiter, validate(registerSchema), registerUser);

router.get("/verify-email", verifyEmail);

router.post("/resend-verifylink", resendVerification);

router.post("/login", authLimiter, validate(loginSchema), loginUser);

router.post("/verify-2fa", authLimiter, verify2FA);

router.post("/forgot-password", passwordResetLimiter, sendPassResetOtp);

router.post("/verify-otp", passwordResetLimiter, verifyOtp);

router.post("/reset-password", passwordResetLimiter, validate(resetPasswordSchema), resetPassword);

router.post("/refresh-token", refreshAccessToken);

//protected route
router.post("/toggle-2fa", verifyJWT, validate(toggle2FASchema), toggle2FA);

router.put("/profile", verifyJWT, validate(updateProfileSchema), updateProfile);

router.put("/change-password", verifyJWT, validate(changePasswordSchema), changePassword);

router.get("/stats", verifyJWT, getUserStats);

router.post("/logout", verifyJWT, logoutUser);

router.get("/me", verifyJWT, fetchCurrentUser);

router.delete("/account", verifyJWT, validate(deleteAccountSchema), deleteAccount);

export default router;
