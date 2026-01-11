import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, UserMinus, Crown, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { removeProjectMember, fetchProjectMembers, fetchAvailableMembers, fetchRecentProjectActivities } from "@/redux/slices/projectSlice";
import { toast } from "sonner";

interface MemberManagementDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberManagementDialog({ projectId, open, onOpenChange }: MemberManagementDialogProps) {
  const dispatch = useAppDispatch();
  const { members, removingMember } = useAppSelector((state) => state.project);
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);

  const isOwner = currentWorkspace?.ownerId === user?.id;

  const handleRemoveMember = async (workspaceMemberId: string, member: any) => {
    // Check if owner is trying to remove themselves
    if (member.userId === currentWorkspace?.ownerId) {
      toast.error("Owner cannot remove themselves from the project");
      return;
    }

    try {
      await dispatch(removeProjectMember({ projectId, userId: member.userId })).unwrap();
      
      // Refetch fresh data after removal
      dispatch(fetchProjectMembers(projectId));
      dispatch(fetchAvailableMembers(projectId));
      dispatch(fetchRecentProjectActivities({ projectId }));
      
      toast.success(`${member.name} removed from project successfully`);
    } catch (error) {
      toast.error(error as string || "Failed to remove member");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-purple-500 to-purple-600", 
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getRoleBadgeColor = (accessLevel: string) => {
    switch (accessLevel.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'editor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Project Members ({members.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {members.map((member) => (
            <div 
              key={member.workspaceMemberId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${getAvatarColor(member.name)} text-white font-semibold`}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    {member.userId === currentWorkspace?.ownerId && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRoleBadgeColor(member.accessLevel)}`}
                    >
                      {member.accessLevel}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Only show three dots to workspace owner */}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={removingMember === member.workspaceMemberId}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleRemoveMember(member.workspaceMemberId, member)}
                      className="text-red-600 focus:text-red-600"
                      disabled={removingMember === member.workspaceMemberId}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove from Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No members in this project yet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}