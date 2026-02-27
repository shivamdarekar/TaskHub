"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Crown } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { PLAN_PRICES, PLAN_FEATURES } from "@/lib/constants";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: "PRO" | "ENTERPRISE";
  frequency: "monthly" | "yearly";
  onSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan: string;
    frequency: string;
  }) => void;
  onCreateOrder: () => Promise<{ orderId: string; amount: number; currency: string; keyId: string }>;
}

export default function PaymentModal({
  open,
  onClose,
  plan,
  frequency,
  onSuccess,
  onCreateOrder,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const planDetails = {
    PRO: {
      name: "Pro Plan",
      monthly: `₹${PLAN_PRICES.PRO.monthly}`,
      yearly: `₹${PLAN_PRICES.PRO.yearly.toLocaleString()}`,
      features: PLAN_FEATURES.PRO,
    },
    ENTERPRISE: {
      name: "Enterprise Plan",
      monthly: `₹${PLAN_PRICES.ENTERPRISE.monthly.toLocaleString()}`,
      yearly: `₹${PLAN_PRICES.ENTERPRISE.yearly.toLocaleString()}`,
      features: PLAN_FEATURES.ENTERPRISE,
    },
  };

  const details = planDetails[plan];
  const price = frequency === "yearly" ? details.yearly : details.monthly;

  const handlePayment = async () => {
    if (!agreedToTerms) return;

    // Check if Razorpay script is loaded
    if (!window.Razorpay) {
      alert("Payment gateway not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    try {
      const orderData = await onCreateOrder();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "TaskHub",
        description: `${details.name} - ${frequency}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: function (response) {
          onSuccess({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan,
            frequency,
          });
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // User closed the payment modal without completing
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      // Close the confirmation modal after opening Razorpay
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate payment";
      alert(`Payment Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Confirm Your Upgrade
          </DialogTitle>
          <DialogDescription>Review your plan details before proceeding</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900">{details.name}</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">{price}</p>
            <p className="text-sm text-gray-600">Billed {frequency}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Includes:</p>
            <ul className="space-y-1">
              {details.features.map((feature) => (
                <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              I agree to the terms and conditions and authorize the payment
            </Label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!agreedToTerms || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
