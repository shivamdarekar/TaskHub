import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import prisma from "../config/prisma";
import razorpayService, { PLAN_LIMITS } from "../services/razorpay.service";
import { SubscriptionStatus, PaymentStatus } from "@prisma/client";
import { sendPaymentFailedEmail, sendSubscriptionCancelledEmail } from "../services/subscriptionEmail";

export const handleRazorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    throw new ApiError(400, "Missing signature");
  }

  // Verify webhook signature
  const webhookBody = JSON.stringify(req.body);
  const isValid = razorpayService.verifyWebhookSignature(webhookBody, signature);

  if (!isValid) {
    console.error("⚠️ WEBHOOK SIGNATURE VERIFICATION FAILED");
    throw new ApiError(400, "Invalid webhook signature");
  }

  const event = req.body;

  // Handle different events
  switch (event.event) {
    case "payment.captured":
      await handlePaymentCaptured(event.payload.payment.entity);
      break;

    case "payment.failed":
      await handlePaymentFailed(event.payload.payment.entity);
      break;

    case "subscription.cancelled":
      await handleSubscriptionCancelled(event.payload.subscription.entity);
      break;

    default:
      console.log(`Unhandled event: ${event.event}`);
  }

  return res.status(200).json({ status: "ok" });
});

async function handlePaymentCaptured(payment: any) {
  // Payment is already handled in verifyPaymentAndUpgrade
  console.log("Payment captured:", payment.id);
}

async function handlePaymentFailed(payment: any) {
  console.log("Payment failed:", payment.id);
  
  // Find transaction and update status
  const transaction = await prisma.transaction.findUnique({
    where: { razorpayPaymentId: payment.id },
    include: {
      subscription: {
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      },
    },
  });

  if (transaction) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED" as PaymentStatus },
    });

    // Send failure email (async, don't block)
    if (transaction.subscription?.user) {
      sendPaymentFailedEmail(
        transaction.subscription.user.email,
        transaction.subscription.user.name,
        transaction.plan,
        payment.error_description || "Payment was declined by your bank"
      ).catch(err => console.error('Failed to send payment failure email:', err));
    }
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log("Subscription cancelled:", subscription.id);
  
  // Find subscription by razorpaySubscriptionId
  const sub = await prisma.subscription.findFirst({
    where: { razorpaySubscriptionId: subscription.id },
    include: {
      user: {
        select: { email: true, name: true },
      },
    },
  });

  if (sub) {
    const previousPlan = sub.plan;
    const expiryDate = sub.currentPeriodEnd || new Date();

    // Downgrade to FREE plan
    const freeLimits = PLAN_LIMITS.FREE;
    
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        plan: "FREE",
        status: "ACTIVE" as SubscriptionStatus,
        frequency: "monthly",
        razorpaySubscriptionId: null,
        razorpayPaymentId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        maxWorkspaces: freeLimits.maxWorkspaces,
        maxMembers: freeLimits.maxMembers,
        maxProjects: freeLimits.maxProjects,
        maxTasks: freeLimits.maxTasks,
        maxStorage: freeLimits.maxStorage,
      },
    });

    // Send cancellation email (async, don't block)
    if (sub.user) {
      sendSubscriptionCancelledEmail(
        sub.user.email,
        sub.user.name,
        previousPlan,
        expiryDate
      ).catch(err => console.error('Failed to send cancellation email:', err));
    }
  }
}
