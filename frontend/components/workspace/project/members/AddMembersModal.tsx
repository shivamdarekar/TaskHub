"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAvailableMembers, addProjectMembers, fetchProjectMembers, fetchRecentProjectActivities } from "@/redux/slices/projectSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AddMembersModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddMembersModal({
  projectId,
  open,
  onOpenChange,
}: AddMembersModalProps) {
  const dispatch = useAppDispatch();
  const { availableMembers, availableMembersLoading, addingMembers } = useAppSelector(
    (state) => state.project
  );
  
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (open && projectId) {
      dispatch(fetchAvailableMembers(projectId));
      setSelectedMembers([]);
    }
  }, [open, projectId, dispatch]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      await dispatch(addProjectMembers({
        projectId,
        memberIds: selectedMembers
      })).unwrap();
      
      // Refetch data to show updated lists
      dispatch(fetchProjectMembers(projectId));
      dispatch(fetchAvailableMembers(projectId));
      dispatch(fetchRecentProjectActivities({ projectId }));
      
      toast.success(`Successfully added ${selectedMembers.length} member(s)`);
      onOpenChange(false);
      setSelectedMembers([]);
    } catch (error) {
      toast.error(error as string);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Members to Project
          </DialogTitle>
          <DialogDescription>
            Select workspace members to add to this project
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto">
          {availableMembersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : availableMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available members to add
            </div>
          ) : (
            <div className="space-y-2">
              {availableMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => handleMemberToggle(member.id)}
                    className="border-gray-400"
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMembers}
            disabled={selectedMembers.length === 0 || addingMembers}
          >
            {addingMembers && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add {selectedMembers.length > 0 && `(${selectedMembers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}