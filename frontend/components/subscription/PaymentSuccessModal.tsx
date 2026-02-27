"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { PLAN_FEATURES } from "@/lib/constants";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  plan: "PRO" | "ENTERPRISE";
}

export default function PaymentSuccessModal({ open, onClose, plan }: PaymentSuccessModalProps) {
  const router = useRouter();
  const { workspaces } = useAppSelector((state) => state.workspace);

  const handleStartUsing = () => {
    onClose();
    // Redirect to first workspace or workspace list
    if (workspaces && workspaces.length > 0) {
      router.push(`/workspace/${workspaces[0].id}`);
    } else {
      router.push("/workspace/create");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <CheckCircle className="h-16 w-16 text-green-500 opacity-75" />
              </div>
              <CheckCircle className="h-16 w-16 text-green-500 relative" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to {plan} Plan! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Your subscription has been activated successfully
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Features Unlocked:</h3>
            </div>
            <ul className="space-y-1">
              {PLAN_FEATURES[plan].map((feature) => (
                <li key={feature} className="text-sm text-gray-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            View Billing
          </Button>
          <Button
            onClick={handleStartUsing}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Start Using Features
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
