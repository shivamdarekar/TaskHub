import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
  getCurrentSubscription,
  createSubscriptionOrder,
  verifyPaymentAndUpgrade,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionHistory,
  checkSubscriptionLimits,
} from "../controllers/subscription.controller";
import { validate } from "../config/validate";
import { createSubscriptionOrderSchema, verifyPaymentSchema } from "../config/schema";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get current subscription
router.get("/current", getCurrentSubscription);

// Check subscription limits
router.get("/limits", checkSubscriptionLimits);

// Get transaction history
router.get("/history", getSubscriptionHistory);

// Create payment order
router.post("/create-order", validate(createSubscriptionOrderSchema), createSubscriptionOrder);

// Verify payment and upgrade
router.post("/verify-payment", validate(verifyPaymentSchema), verifyPaymentAndUpgrade);

// Cancel subscription
router.post("/cancel", cancelSubscription);

// Reactivate subscription
router.post("/reactivate", reactivateSubscription);

export default router;
