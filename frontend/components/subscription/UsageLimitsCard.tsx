"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart3, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UsageLimitsCardProps {
  limits: {
    workspaces: { current: number; max: number; canAdd: boolean };
    projects: { current: number; max: number; canAdd: boolean };
    tasks: { current: number; max: number; canAdd: boolean };
  };
  plan: "FREE" | "PRO" | "ENTERPRISE";
}

export default function UsageLimitsCard({ limits, plan }: UsageLimitsCardProps) {
  const router = useRouter();

  const getPercentage = (current: number, max: number) => {
    if (max === -1) return 0;
    return (current / max) * 100;
  };

  const getColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatLimit = (max: number) => (max === -1 ? "Unlimited" : max);

  const items = [
    { label: "Workspaces", ...limits.workspaces },
    { label: "Projects", ...limits.projects },
    { label: "Tasks", ...limits.tasks },
  ];

  const hasWarning = items.some((item) => {
    const percentage = getPercentage(item.current, item.max);
    return percentage >= 70 && item.max !== -1;
  });

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Usage & Limits
        </CardTitle>
        <CardDescription>Track your resource usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const percentage = getPercentage(item.current, item.max);
          const color = getColor(percentage);

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-gray-600">
                  {item.current} / {formatLimit(item.max)}
                </span>
              </div>
              {item.max !== -1 && (
                <Progress value={percentage} className="h-2" indicatorClassName={color} />
              )}
            </div>
          );
        })}

        {hasWarning && plan === "FREE" && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  You&apos;re running out of resources
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Upgrade to Pro for unlimited projects and tasks
                </p>
                <Button
                  size="sm"
                  onClick={() => router.push("/account/upgrade")}
                  className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
