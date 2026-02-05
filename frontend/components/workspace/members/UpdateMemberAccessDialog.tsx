import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateMemberAccess } from "@/redux/slices/workspaceSlice";
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

interface UpdateMemberAccessDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export default function UpdateMemberAccessDialog({
  member,
  open,
  onOpenChange,
  workspaceId,
}: UpdateMemberAccessDialogProps) {
  const dispatch = useAppDispatch();
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!member) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "OWNER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "MEMBER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleUpdateAccess = async () => {
    if (!selectedAccessLevel) {
      toast.error("Please select an access level");
      return;
    }

    setIsUpdating(true);
    try {
      await dispatch(updateMemberAccess({ 
        workspaceId, 
        memberId: member.id,
        data: { accessLevel: selectedAccessLevel as "OWNER" | "MEMBER" | "VIEWER" }
      })).unwrap();
      
      toast.success(`${member.user.name}'s access level updated to ${selectedAccessLevel}`);
      onOpenChange(false);
      setSelectedAccessLevel("");
    } catch (error) {
      toast.error(error as string || "Failed to update member access");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Update Member Access
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.user.profilePicture || undefined} />
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {getInitials(member.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {member.user.name}
              </h3>
              <p className="text-sm text-gray-600">
                {member.user.email}
              </p>
              <div className="mt-1">
                <Badge 
                  variant="outline" 
                  className={getAccessLevelColor(member.accessLevel)}
                >
                  Current: {member.accessLevel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              New Access Level
            </label>
            <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Viewer - Read-only access</SelectItem>
                <SelectItem value="MEMBER">Member - Full access to assigned projects</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This will change the member&apos;s access level across the entire workspace.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateAccess}
            disabled={isUpdating || !selectedAccessLevel}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Access"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}