"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  getCurrentSubscription,
  createSubscriptionOrder,
  verifyPaymentAndUpgrade,
} from "@/redux/slices/subscriptionSlice";
import { fetchUserWorkspaces } from "@/redux/slices/workspaceSlice";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PLAN_FEATURES, PLAN_PRICES } from "@/lib/constants";
import {
  PlanComparisonCard,
  PaymentModal,
  PaymentSuccessModal,
} from "@/components/subscription";

export default function UpgradePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { subscription, upgradeLoading, error, successMessage } = useAppSelector((state) => state.subscription);
  const { workspaces } = useAppSelector((state) => state.workspace);
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "ENTERPRISE" | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!subscription) {
      dispatch(getCurrentSubscription());
    }
    if (!workspaces || workspaces.length === 0) {
      dispatch(fetchUserWorkspaces());
    }
  }, [dispatch, subscription, workspaces]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  const plans = [
    {
      name: "FREE" as const,
      price: "₹0",
      period: "forever",
      features: PLAN_FEATURES.FREE,
      current: subscription?.plan === "FREE",
    },
    {
      name: "PRO" as const,
      price: `₹${PLAN_PRICES.PRO.monthly}`,
      yearlyPrice: `₹${PLAN_PRICES.PRO.yearly.toLocaleString()}`,
      period: "month",
      features: PLAN_FEATURES.PRO,
      popular: true,
      current: subscription?.plan === "PRO",
    },
    {
      name: "ENTERPRISE" as const,
      price: `₹${PLAN_PRICES.ENTERPRISE.monthly.toLocaleString()}`,
      yearlyPrice: `₹${PLAN_PRICES.ENTERPRISE.yearly.toLocaleString()}`,
      period: "month",
      features: PLAN_FEATURES.ENTERPRISE,
      current: subscription?.plan === "ENTERPRISE",
    },
  ];

  const handleUpgrade = (plan: "PRO" | "ENTERPRISE", freq: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    setFrequency(freq);
    setShowPaymentModal(true);
  };

  const handleCreateOrder = async () => {
    if (!selectedPlan) throw new Error("No plan selected");

    const result = await dispatch(
      createSubscriptionOrder({ plan: selectedPlan, frequency })
    ).unwrap();

    return result;
  };

  const handlePaymentSuccess = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan: string;
    frequency: string;
  }) => {
    try {
      await dispatch(verifyPaymentAndUpgrade({
        ...paymentData,
        plan: paymentData.plan as "PRO" | "ENTERPRISE",
        frequency: paymentData.frequency as "monthly" | "yearly",
      })).unwrap();
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch {
      // Error already handled by Redux slice
    }
  };

  if (!subscription) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
            <p className="text-sm text-gray-600 mt-1">Select the perfect plan for your needs</p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="frequency" className="text-sm text-gray-600">
              Monthly
            </Label>
            <Switch
              id="frequency"
              checked={frequency === "yearly"}
              onCheckedChange={(checked) => setFrequency(checked ? "yearly" : "monthly")}
            />
            <Label htmlFor="frequency" className="text-sm text-gray-600">
              Yearly <span className="text-green-600 font-medium">(Save 20%)</span>
            </Label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanComparisonCard
              key={plan.name}
              plan={plan}
              frequency={frequency}
              onUpgrade={handleUpgrade}
              loading={upgradeLoading}
            />
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          frequency={frequency}
          onSuccess={handlePaymentSuccess}
          onCreateOrder={handleCreateOrder}
        />
      )}

      {selectedPlan && (
        <PaymentSuccessModal
          open={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.push("/account/billing");
          }}
          plan={selectedPlan}
        />
      )}
    </>
  );
}
