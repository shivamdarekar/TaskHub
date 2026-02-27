"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown } from "lucide-react";
import SubscriptionBadge from "./SubscriptionBadge";

interface PlanComparisonCardProps {
  plan: {
    name: "FREE" | "PRO" | "ENTERPRISE";
    price: string;
    yearlyPrice?: string;
    period: string;
    features: readonly string[];
    popular?: boolean;
    current?: boolean;
  };
  frequency: "monthly" | "yearly";
  onUpgrade: (plan: "PRO" | "ENTERPRISE", frequency: "monthly" | "yearly") => void;
  loading?: boolean;
}

export default function PlanComparisonCard({ plan, frequency, onUpgrade, loading }: PlanComparisonCardProps) {
  const displayPrice = frequency === "yearly" && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
  const displayPeriod = frequency === "yearly" ? "year" : plan.period;

  return (
    <Card className={`shadow-sm ${plan.popular ? 'border-2 border-amber-500 relative' : 'border-gray-200'}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-amber-500 text-white">Most Popular</Badge>
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
          {plan.current ? (
            <Badge variant="secondary">Current</Badge>
          ) : (
            <SubscriptionBadge plan={plan.name} />
          )}
        </CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-gray-900">{displayPrice}</span>
          <span className="text-sm text-gray-500"> / {displayPeriod}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full ${
            plan.popular
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
              : ''
          }`}
          variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
          disabled={plan.current || loading || plan.name === "FREE"}
          onClick={() => plan.name !== "FREE" && onUpgrade(plan.name, frequency)}
        >
          {plan.current ? "Current Plan" : plan.name === "FREE" ? "Free Forever" : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to {plan.name}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
