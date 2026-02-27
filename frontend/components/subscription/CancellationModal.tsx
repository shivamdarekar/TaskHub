"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CancellationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  periodEnd?: string;
}

export default function CancellationModal({
  open,
  onClose,
  onConfirm,
  loading,
  periodEnd,
}: CancellationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your subscription?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">
              Your subscription will remain active until{" "}
              <span className="font-semibold">{periodEnd}</span>. After that, you&apos;ll lose access to:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-red-800">
              <li>• Unlimited projects and tasks</li>
              <li>• Additional workspaces</li>
              <li>• Extra storage</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            You can reactivate your subscription anytime before it expires.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Keep Subscription
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
