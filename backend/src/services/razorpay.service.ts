import Razorpay from "razorpay";
import crypto from "crypto";
import { ApiError } from "../utils/apiError";

// Plan pricing in INR (paise - 1 INR = 100 paise)
export const PLAN_PRICING = {
  FREE: {
    monthly: 0,
    yearly: 0,
  },
  PRO: {
    monthly: 49900, // ₹499
    yearly: 480000, // ₹4800 (₹400/month)
  },
  ENTERPRISE: {
    monthly: 169900, // ₹1699
    yearly: 1699000, // ₹16990 (₹1415.83/month)
  },
};

// Plan limits based on your structure
export const PLAN_LIMITS = {
  FREE: {
    maxWorkspaces: 1,
    maxMembers: 2,
    maxProjects: 5,
    maxTasks: 20,
    maxStorage: 0, // No file storage
  },
  PRO: {
    maxWorkspaces: 10,
    maxMembers: 20,
    maxProjects: -1, // Unlimited
    maxTasks: -1, // Unlimited
    maxStorage: 10240, // 10GB in MB (10 files per task)
  },
  ENTERPRISE: {
    maxWorkspaces: -1, // Unlimited
    maxMembers: -1, // Unlimited
    maxProjects: -1, // Unlimited
    maxTasks: -1, // Unlimited
    maxStorage: -1, // Unlimited (fair use)
  },
};

class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are not configured");
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  // Create a Razorpay order for one-time payment
  async createOrder(
    amount: number,
    currency: string = "INR",
    receipt: string,
    notes?: Record<string, string>,
  ) {
    try {
      const orderOptions: any = {
        amount, // amount in smallest currency unit (paise for INR)
        currency,
        receipt,
      };

      if (notes) {
        orderOptions.notes = notes;
      }

      const order = await this.razorpay.orders.create(orderOptions);

      return order;
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      throw new ApiError(
        500,
        error.message || "Failed to create Razorpay order",
      );
    }
  }

  //Verify payment signature
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    try {
      const text = `${orderId}|${paymentId}`;
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest("hex");

      return generated_signature === signature;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  //Verify webhook signature
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        throw new Error("Webhook secret not configured");
      }

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  //Fetch payment details
  async getPayment(paymentId: string) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error: any) {
      console.error("Error fetching payment:", error);
      throw new ApiError(
        500,
        error.message || "Failed to fetch payment details",
      );
    }
  }

  //Create refund
  async createRefund(paymentId: string, amount?: number) {
    try {
      const refund = await this.razorpay.payments.refund(
        paymentId,
        amount !== undefined ? { amount } : {},
      );
      return refund;
    } catch (error: any) {
      console.error("Error creating refund:", error);
      throw new ApiError(500, error.message || "Failed to create refund");
    }
  }

  //Get plan amount based on plan type and frequency
  getPlanAmount(
    plan: "PRO" | "ENTERPRISE",
    frequency: "monthly" | "yearly",
  ): number {
    return PLAN_PRICING[plan][frequency];
  }

  //Get plan limits
  getPlanLimits(plan: "FREE" | "PRO" | "ENTERPRISE") {
    return PLAN_LIMITS[plan];
  }
}

// Export a singleton instance
const razorpayService = new RazorpayService();
export default razorpayService;
