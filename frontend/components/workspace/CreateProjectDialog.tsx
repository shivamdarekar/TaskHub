"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createProject } from "@/redux/slices/projectSlice";
import { fetchWorkspaceMembers, fetchWorkspaceOverview } from "@/redux/slices/workspaceSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, FolderKanban } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export default function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { members, membersLoading } = useAppSelector((state) => state.workspace);
  const { projectsLoading, error } = useAppSelector((state) => state.project);
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Fetch workspace members when dialog opens (with deduplication)
  useEffect(() => {
    if (open && workspaceId) {
      if (!membersLoading && members.length === 0) {
        dispatch(fetchWorkspaceMembers(workspaceId));
      }
    }
  }, [open, workspaceId, dispatch, membersLoading, members.length]);

  // Pre-select current user when members load
  useEffect(() => {
    if (members.length > 0 && user) {
      const currentUserMember = members.find((m) => m.userId === user.id);
      if (currentUserMember && !selectedMembers.includes(currentUserMember.id)) {
        setSelectedMembers([currentUserMember.id]);
        setMemberError(null);
      }
    }
  }, [members, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (memberId: string) => {
    setMemberError(null);
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    if (selectedMembers.length === 0) {
      setMemberError("Select at least one member");
      return;
    }

    try {
      const result = await dispatch(
        createProject({
          workspaceId,
          data: {
            name: formData.name,
            description: formData.description || undefined,
            memberIds: selectedMembers,
          },
        })
      ).unwrap();

      // Refresh workspace overview so dashboard shows updated stats
      dispatch(fetchWorkspaceOverview(workspaceId));

      // Reset form
      setFormData({ name: "", description: "" });
      setSelectedMembers([]);
      setMemberError(null);
      
      // Close dialog
      onOpenChange(false);

      // Navigate to new project
      router.push(`/workspace/${workspaceId}/projects/${result.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "" });
    setSelectedMembers([]);
    setMemberError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="text-center space-y-3 pb-4 animate-in slide-in-from-top-4 duration-500">
          <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
          <DialogDescription className="text-gray-600">
            Set up a project for your team to collaborate
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2 duration-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          {/* Project Name */}
          <div>
            <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              disabled={projectsLoading}
              className="h-11"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-700 font-medium mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              disabled={projectsLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Project Access */}
          <div>
            <Label className="text-gray-700 font-medium mb-2 block">
              Project Access
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Select which workspace members should have access to this project
            </p>

            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {members.map((member, index) => {
                  const isOwner = member.accessLevel === "OWNER";
                  return (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Checkbox
                        id={member.id}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleMemberToggle(member.id)}
                        disabled={projectsLoading}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {member.user.name}
                          </span>
                          {isOwner && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {memberError && (
              <p className="text-sm text-red-600 mt-2 animate-in slide-in-from-top-1 duration-200">{memberError}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={projectsLoading}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={projectsLoading || !formData.name.trim()}
              className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {projectsLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
