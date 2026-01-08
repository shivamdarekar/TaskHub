"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InviteLinkManagerProps {
  inviteLink: string | null;
  loading: boolean;
  onGenerate: () => void;
  onReset: () => void;
}

export default function InviteLinkManager({
  inviteLink,
  loading,
  onGenerate,
  onReset,
}: InviteLinkManagerProps) {
  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Invite Link</Label>
        {inviteLink && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={loading}
              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </div>
      {inviteLink ? (
        <div className="p-3 bg-gray-50 border rounded-lg text-sm font-mono text-gray-700 break-all">
          {inviteLink}
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={onGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Generate Invite Link"
          )}
        </Button>
      )}
    </div>
  );
}