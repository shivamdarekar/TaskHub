"use client";

import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface ProjectMemberDetails {
  workspaceMemberId: string;
  userId: string;
  name: string;
  email: string;
  lastLogin: string | null;
  accessLevel: string;
  joinedAt: string;
}

interface MemberAvatarsProps {
  members: ProjectMemberDetails[];
  onAddMembers: () => void;
  maxDisplay?: number;
}

export default function MemberAvatars({ 
  members, 
  onAddMembers, 
  maxDisplay = 5 
}: MemberAvatarsProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const displayMembers = members.slice(0, maxDisplay);
  const remainingCount = Math.max(0, members.length - maxDisplay);
  
  // Check if current user is workspace owner
  const isWorkspaceOwner = currentWorkspace?.ownerId === user?.id;

  const handleAddMembersClick = () => {
    if (!isWorkspaceOwner) {
      toast.error("Only workspace owner can add members to projects");
      return;
    }
    onAddMembers();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <Users className="h-4 w-4 text-gray-500 mr-2" />
        <span className="text-sm text-gray-600">{members.length} members</span>
      </div>
      
      <div className="flex -space-x-2">
        {displayMembers.map((member) => (
          <Avatar key={member.userId} className="h-8 w-8 border-2 border-white hover:scale-105 transition-transform cursor-pointer">
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        
        {remainingCount > 0 && (
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="text-xs bg-gradient-to-br from-gray-400 to-gray-500 text-white font-semibold">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <Button 
        onClick={handleAddMembersClick}
        size="sm" 
        className="ml-2 bg-blue-500 hover:bg-blue-700 text-white border-0"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  );
}