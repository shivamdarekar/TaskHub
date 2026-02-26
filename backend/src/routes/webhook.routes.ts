import { Router } from "express";
import { handleRazorpayWebhook } from "../controllers/webhook.controller";

const router = Router();

// Razorpay webhook (no auth needed, verified by signature)
router.post("/razorpay", handleRazorpayWebhook);

export default router;
