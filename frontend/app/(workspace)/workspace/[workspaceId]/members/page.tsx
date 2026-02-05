"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Users, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchWorkspaceMembers } from "@/redux/slices/workspaceSlice";
import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import MembersGrid from "@/components/workspace/members/MembersGrid";
import MemberDetailsDialog from "@/components/workspace/members/MemberDetailsDialog";
import RemoveMemberDialog from "@/components/workspace/members/RemoveMemberDialog";
import UpdateMemberAccessDialog from "@/components/workspace/members/UpdateMemberAccessDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InviteMembersSection from "@/components/workspace/invite/InviteMembersSection";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
  accessLevel: string;
  createdAt: string;
}

export default function MembersPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { members, membersLoading, error, overview, currentWorkspace } = useAppSelector((state) => state.workspace);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const isOwner = overview?.isOwner || false;
  const workspaceOwnerId = currentWorkspace?.ownerId || overview?.workspace.owner.id;

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceMembers(workspaceId));
    }
  }, [workspaceId, dispatch]);

  // Loading state
  if (membersLoading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Members Error</h2>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <p className="text-gray-600 leading-relaxed">{error}</p>
            
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <WorkspaceNavbar 
        title="Members"
        subtitle={`Manage workspace members (${members.length} ${members.length === 1 ? 'member' : 'members'})`}
        actions={
          isOwner && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setInviteDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Members
            </Button>
          )
        }
      />

      <div className="p-8">
        {members.length === 0 ? (
          <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Invite team members to start collaborating on projects
                </p>
                {isOwner && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <MembersGrid
            members={members}
            isOwner={isOwner}
            currentUserId={user?.id || ""}
            workspaceOwnerId={workspaceOwnerId}
            onViewDetails={setSelectedMember}
            onRemoveMember={setMemberToRemove}
            onUpdateAccess={setMemberToUpdate}
          />
        )}
      </div>

      <MemberDetailsDialog
        member={selectedMember}
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        workspaceId={workspaceId}
      />

      <RemoveMemberDialog
        member={memberToRemove}
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        workspaceId={workspaceId}
      />

      <UpdateMemberAccessDialog
        member={memberToUpdate}
        open={!!memberToUpdate}
        onOpenChange={(open) => !open && setMemberToUpdate(null)}
        workspaceId={workspaceId}
      />

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
          </DialogHeader>
          <InviteMembersSection workspaceId={workspaceId} />
        </DialogContent>
      </Dialog>
    </div>
  );
}