import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../config/prisma";
import razorpayService, { PLAN_LIMITS } from "../services/razorpay.service";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { sendSubscriptionConfirmationEmail } from "../services/subscriptionEmail";

// Get current user subscription
export const getCurrentSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new ApiError(401, "Not Authorized");

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { subscription }, "Subscription fetched successfully")
  );
});

// Create payment order for subscription upgrade
export const createSubscriptionOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { plan, frequency }: { plan: "PRO" | "ENTERPRISE"; frequency: "monthly" | "yearly" } = req.body;

  if (!userId) throw new ApiError(401, "Not Authorized");

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) throw new ApiError(404, "User not found");

  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) throw new ApiError(404, "Subscription not found");

  // Check if already on this plan
  if (subscription.plan === plan && subscription.frequency === frequency) {
    throw new ApiError(400, "You are already on this plan");
  }

  // Get amount in paise using service
  const amount = razorpayService.getPlanAmount(plan, frequency);

  // Create Razorpay order using service
  const order = await razorpayService.createOrder(
    amount,
    "INR",
    `order_${userId}_${Date.now()}`,
    {
      userId,
      plan,
      frequency,
      email: user.email,
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      "Order created successfully"
    )
  );
});

// Verify payment and upgrade subscription
export const verifyPaymentAndUpgrade = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    frequency,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan: "PRO" | "ENTERPRISE";
    frequency: "monthly" | "yearly";
  } = req.body;

  if (!userId) throw new ApiError(401, "Not Authorized");

  // IDEMPOTENCY: Check if payment already processed
  const existingTransaction = await prisma.transaction.findUnique({
    where: { razorpayPaymentId: razorpay_payment_id },
  });

  if (existingTransaction) {
    // Payment already processed, return existing subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        { subscription, transaction: existingTransaction },
        "Payment already processed"
      )
    );
  }

  // Verify signature using service
  const isValid = razorpayService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    throw new ApiError(400, "Invalid payment signature");
  }

  // Fetch payment details using service
  const payment = await razorpayService.getPayment(razorpay_payment_id);

  if (payment.status !== "captured") {
    throw new ApiError(400, "Payment not captured");
  }

  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) throw new ApiError(404, "Subscription not found");

  // Get user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) throw new ApiError(404, "User not found");

  // Calculate period dates
  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();

  if (frequency === "monthly") {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  } else {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  }

  // Get plan limits using service
  const limits = razorpayService.getPlanLimits(plan);

  // Update subscription and create transaction in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update subscription
    const updatedSubscription = await tx.subscription.update({
      where: { userId },
      data: {
        plan: plan as SubscriptionPlan,
        status: "ACTIVE" as SubscriptionStatus,
        frequency,
        razorpayPaymentId: razorpay_payment_id,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        maxWorkspaces: limits.maxWorkspaces,
        maxMembers: limits.maxMembers,
        maxProjects: limits.maxProjects,
        maxTasks: limits.maxTasks,
        maxStorage: limits.maxStorage,
      },
    });

    // Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        subscriptionId: subscription.id,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        amount: Number(payment.amount) / 100, // Convert paise to rupees
        currency: payment.currency,
        status: "CAPTURED",
        plan: plan as SubscriptionPlan,
        frequency,
        paymentMethod: payment.method,
        email: payment.email,
        contact: payment.contact ? String(payment.contact) : null,
      },
    });

    return { subscription: updatedSubscription, transaction };
  });

  // Send confirmation email (async, doesn't block response)
  sendSubscriptionConfirmationEmail(
    user.email,
    user.name,
    plan,
    frequency,
    Number(payment.amount) / 100,
    currentPeriodEnd
  ).catch(err => console.error('Email send failed:', err));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscription: result.subscription,
        transaction: result.transaction,
      },
      "Subscription upgraded successfully"
    )
  );
});

// Cancel subscription (at period end)
export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new ApiError(401, "Not Authorized");

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) throw new ApiError(404, "Subscription not found");

  if (subscription.plan === "FREE") {
    throw new ApiError(400, "Cannot cancel free plan");
  }

  if (subscription.cancelAtPeriodEnd) {
    throw new ApiError(400, "Subscription is already scheduled for cancellation");
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { subscription: updatedSubscription },
      "Subscription will be cancelled at the end of current period"
    )
  );
});

// Reactivate cancelled subscription
export const reactivateSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new ApiError(401, "Not Authorized");

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) throw new ApiError(404, "Subscription not found");

  if (!subscription.cancelAtPeriodEnd) {
    throw new ApiError(400, "Subscription is not scheduled for cancellation");
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: false },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { subscription: updatedSubscription },
      "Subscription reactivated successfully"
    )
  );
});

// Get subscription history (transactions)
export const getSubscriptionHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page = "1", limit = "10" } = req.query;

  if (!userId) throw new ApiError(401, "Not Authorized");

  const pageNumber = Math.max(parseInt(page as string), 1);
  const pageSize = Math.min(parseInt(limit as string), 50);
  const skip = (pageNumber - 1) * pageSize;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) throw new ApiError(404, "Subscription not found");

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.transaction.count({
      where: { subscriptionId: subscription.id },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transactions,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      "Transaction history fetched successfully"
    )
  );
});

// Check if user can perform action based on subscription limits
export const checkSubscriptionLimits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new ApiError(401, "Not Authorized");

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) throw new ApiError(404, "Subscription not found");

  // Get current usage
  const [workspacesCount, tasksCount, projectsCount] = await Promise.all([
    prisma.workspaceMembers.count({
      where: { userId },
    }),
    prisma.task.count({
      where: { createdBy: userId },
    }),
    prisma.project.count({
      where: { createdBy: userId },
    }),
  ]);

  const limits = {
    workspaces: {
      current: workspacesCount,
      max: subscription.maxWorkspaces,
      canAdd: subscription.maxWorkspaces === -1 || workspacesCount < subscription.maxWorkspaces,
    },
    tasks: {
      current: tasksCount,
      max: subscription.maxTasks,
      canAdd: subscription.maxTasks === -1 || tasksCount < subscription.maxTasks,
    },
    projects: {
      current: projectsCount,
      max: subscription.maxProjects,
      canAdd: subscription.maxProjects === -1 || projectsCount < subscription.maxProjects,
    },
  };

  return res.status(200).json(
    new ApiResponse(200, { subscription, limits }, "Subscription limits fetched successfully")
  );
});