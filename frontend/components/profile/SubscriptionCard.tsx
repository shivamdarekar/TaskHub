"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getCurrentSubscription } from "@/redux/slices/subscriptionSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SubscriptionBadge from "../subscription/SubscriptionBadge";

export default function SubscriptionCard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { subscription, loading } = useAppSelector((state) => state.subscription);

  useEffect(() => {
    if (!subscription) {
      dispatch(getCurrentSubscription());
    }
  }, [dispatch, subscription]);

  const planDetails = {
    FREE: { name: "Free Plan", description: "Basic features with limited usage" },
    PRO: { name: "Pro Plan", description: "Advanced features for professionals" },
    ENTERPRISE: { name: "Enterprise Plan", description: "Full access with premium support" },
  };

  if (loading || !subscription) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-amber-500" />
            Subscription & Billing
          </CardTitle>
          <CardDescription>Manage your subscription and billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const details = planDetails[subscription.plan];

  // Check if subscription is expired
  const now = new Date();
  const isExpired = subscription.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd) < now
    : false;
  const isPendingCancellation = subscription.cancelAtPeriodEnd && !isExpired;

  // Calculate days remaining
  const daysRemaining = subscription.currentPeriodEnd
    ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-amber-500" />
          Subscription & Billing
        </CardTitle>
        <CardDescription>Manage your subscription and billing information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{details.name}</p>
                <SubscriptionBadge plan={subscription.plan} />
              </div>
              <p className="text-sm text-gray-600">{details.description}</p>
              
              {/* Expiry warnings */}
              {isExpired && subscription.plan === "FREE" && subscription.status === "EXPIRED" && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ⚠️ Your subscription expired. You can still view your workspaces/projects but can&apos;t create new ones beyond FREE limits.
                </div>
              )}
              
              {isPendingCancellation && subscription.currentPeriodEnd && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                  ⚠️ Subscription cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()} ({daysRemaining} days remaining)
                </div>
              )}
              
              {!isExpired && !isPendingCancellation && subscription.plan !== "FREE" && subscription.currentPeriodEnd && (
                <p className="text-xs text-gray-500 mt-1">
                  Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()} ({daysRemaining} days)
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={() => router.push("/account/upgrade")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-11 px-6"
          >
            <Crown className="h-4 w-4 mr-2" />
            {subscription.plan === "FREE" ? "Upgrade to Pro" : "Change Plan"}
          </Button>
          <Button
            onClick={() => router.push("/account/billing")}
            variant="outline"
            className="h-11 px-6 border-gray-300"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            View Billing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
