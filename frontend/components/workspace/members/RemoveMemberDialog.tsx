import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, Loader2 } from "lucide-react";
import { removeMember } from "@/redux/slices/workspaceSlice";
import { toast } from "sonner";

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

interface RemoveMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export default function RemoveMemberDialog({
  member,
  open,
  onOpenChange,
  workspaceId,
}: RemoveMemberDialogProps) {
  const dispatch = useAppDispatch();
  const [isRemoving, setIsRemoving] = useState(false);

  if (!member) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemoveMember = async () => {
    setIsRemoving(true);
    try {
      await dispatch(removeMember({ 
        workspaceId, 
        memberId: member.id 
      })).unwrap();
      
      toast.success(`${member.user.name} has been removed from the workspace`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error as string || "Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Remove Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.user.profilePicture || undefined} />
              <AvatarFallback className="bg-red-500 text-white font-semibold">
                {getInitials(member.user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {member.user.name}
              </h3>
              <p className="text-sm text-gray-600">
                {member.user.email}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-700">
              Are you sure you want to remove <strong>{member.user.name}</strong> from this workspace?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. The member will lose access to all projects and data in this workspace.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleRemoveMember}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}