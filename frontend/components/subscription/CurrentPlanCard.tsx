"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Calendar, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import SubscriptionBadge from "./SubscriptionBadge";
import { format } from "date-fns";

interface CurrentPlanCardProps {
  subscription: {
    plan: "FREE" | "PRO" | "ENTERPRISE";
    status: string;
    frequency: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  onCancel: () => void;
  onReactivate: () => void;
  loading?: boolean;
}

export default function CurrentPlanCard({ subscription, onCancel, onReactivate, loading }: CurrentPlanCardProps) {
  const router = useRouter();

  // Check if subscription is expired
  const isExpired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();

  const planDetails = {
    FREE: { name: "Free Plan", description: "Basic features with limited usage" },
    PRO: { name: "Pro Plan", description: "Advanced features for professionals" },
    ENTERPRISE: { name: "Enterprise Plan", description: "Full access with premium support" },
  };

  const details = planDetails[subscription.plan];

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-amber-500" />
          Current Subscription
        </CardTitle>
        <CardDescription>Your active plan and billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{details.name}</p>
                <SubscriptionBadge plan={subscription.plan} />
              </div>
              <p className="text-sm text-gray-600">{details.description}</p>
              {subscription.plan !== "FREE" && subscription.frequency && (
                <p className="text-xs text-gray-500 mt-1">
                  Billed {subscription.frequency}
                </p>
              )}
            </div>
          </div>
        </div>

        {subscription.currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {isExpired ? (
                <span className="text-red-600 font-medium">Expired on {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}</span>
              ) : (
                <>
                  {subscription.cancelAtPeriodEnd ? "Expires on" : "Renews on"}{" "}
                  {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                </>
              )}
            </span>
          </div>
        )}

        {isExpired && subscription.plan !== "FREE" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your subscription has expired. Upgrade now to regain access to premium features.
            </AlertDescription>
          </Alert>
        )}

        {!isExpired && subscription.cancelAtPeriodEnd && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your subscription will be cancelled on{" "}
              {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}.
              You&apos;ll lose access to premium features.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          {subscription.plan === "FREE" ? (
            <Button
              onClick={() => router.push("/account/upgrade")}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          ) : (
            <>
              <Button
                onClick={() => router.push("/account/upgrade")}
                variant="outline"
              >
                Change Plan
              </Button>
              {subscription.cancelAtPeriodEnd ? (
                <Button onClick={onReactivate} disabled={loading}>
                  Reactivate Subscription
                </Button>
              ) : (
                <Button onClick={onCancel} variant="destructive" disabled={loading}>
                  Cancel Subscription
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
