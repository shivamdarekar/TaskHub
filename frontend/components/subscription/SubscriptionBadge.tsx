import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionBadgeProps {
  plan: "FREE" | "PRO" | "ENTERPRISE";
  className?: string;
}

export default function SubscriptionBadge({ plan, className }: SubscriptionBadgeProps) {
  const variants = {
    FREE: {
      color: "bg-gray-100 text-gray-700 border-gray-300",
      label: "Free",
    },
    PRO: {
      color: "bg-amber-100 text-amber-800 border-amber-300",
      label: "Pro",
    },
    ENTERPRISE: {
      color: "bg-purple-100 text-purple-800 border-purple-300",
      label: "Enterprise",
    },
  };

  const variant = variants[plan];

  return (
    <Badge className={cn("flex items-center gap-1", variant.color, className)}>
      {plan !== "FREE" && <Crown className="h-3 w-3" />}
      {variant.label}
    </Badge>
  );
}
