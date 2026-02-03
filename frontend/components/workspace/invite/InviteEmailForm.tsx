"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface InviteEmailFormProps {
  onSendInvite: (email: string) => Promise<void>;
  loading: boolean;
}

export default function InviteEmailForm({
  onSendInvite,
  loading,
}: InviteEmailFormProps) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await onSendInvite(email);
      setEmail("");
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Label>Send Invitation by Email</Label>
      <div className="flex gap-3">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          type="email"
          className="flex-1"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : emailSent ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Invite
            </>
          )}
        </Button>
      </div>
    </form>
  );
}