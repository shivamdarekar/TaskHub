"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  createWorkspaceInvite,
  resetInviteLink,
} from "@/redux/slices/inviteMemberSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import InviteEmailForm from "./InviteEmailForm";
import InviteLinkManager from "./InviteLinkManager";
import { toast } from "sonner";

interface InviteMembersSectionProps {
  workspaceId: string;
}

export default function InviteMembersSection({
  workspaceId,
}: InviteMembersSectionProps) {
  const dispatch = useAppDispatch();
  const { inviteLink, loading } = useAppSelector((state) => state.invite);
  const [localInviteLink, setLocalInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (inviteLink) {
      setLocalInviteLink(inviteLink);
    }
  }, [inviteLink]);

  const handleSendInvite = async (email: string) => {
    try {
      await dispatch(
        createWorkspaceInvite({ workspaceId, email })
      ).unwrap();
      toast.success(`Invitation sent to ${email}`);
    } catch (err: unknown) {
      const errorMessage = typeof err === 'string' ? err : String(err);
      toast.error(errorMessage || "Failed to send invitation");
      throw err;
    }
  };

  const handleGenerateLink = async () => {
    try {
      await dispatch(createWorkspaceInvite({ workspaceId })).unwrap();
      toast.success("Invite link generated");
    } catch (err: unknown) {
      const errorMessage = typeof err === 'string' ? err : String(err);
      toast.error(errorMessage || "Failed to generate invite link");
    }
  };

  const handleResetLink = async () => {
    try {
      await dispatch(resetInviteLink(workspaceId)).unwrap();
      toast.success("Invite link reset successfully");
    } catch (err: unknown) {
      const errorMessage = typeof err === 'string' ? err : String(err);
      toast.error(errorMessage || "Failed to reset invite link");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Members</CardTitle>
        <CardDescription>
          Invite team members to collaborate on your workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Invite */}
        <InviteEmailForm onSendInvite={handleSendInvite} loading={loading} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or share invite link
            </span>
          </div>
        </div>

        {/* Invite Link */}
        <InviteLinkManager
          inviteLink={localInviteLink}
          loading={loading}
          onGenerate={handleGenerateLink}
          onReset={handleResetLink}
        />
      </CardContent>
    </Card>
  );
}