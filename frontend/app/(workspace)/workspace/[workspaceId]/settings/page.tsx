"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateWorkspace, deleteWorkspace } from "@/redux/slices/workspaceSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Trash2, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import DeleteWorkspaceDialog from "@/components/workspace/DeleteWorkspaceDialog";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { currentWorkspace, currentWorkspaceLoading, error, workspaces } = useAppSelector(
    (state) => state.workspace
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Mock invite link - replace with actual implementation later
  const inviteLink = `https://daily-tm.vercel.app/workspace-invite/e1e1f23a-fcc0-4704-a655-7a783de70c57/join/xxinUn`;

  useEffect(() => {
    if (currentWorkspace) {
      setFormData({
        name: currentWorkspace.name,
        description: currentWorkspace.description || "",
      });
    }
  }, [currentWorkspace]);

  const handleUpdateWorkspace = async () => {
    if (!formData.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      await dispatch(updateWorkspace({
        workspaceId,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        },
      })).unwrap();
      toast.success("Workspace updated successfully");
    } catch (error: any) {
      toast.error(error || "Failed to update workspace");
    }
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteWorkspace(workspaceId)).unwrap();
      toast.success("Workspace deleted successfully");
      
      // Navigate to another workspace if available, otherwise create page
      const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
      
      if (remainingWorkspaces.length > 0) {
        router.push(`/workspace/${remainingWorkspaces[0].id}`);
      } else {
        router.push("/workspace/create");
      }
    } catch (error: any) {
      toast.error(error || "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleInvite = () => {
    // TODO: Implement invite functionality
    toast.info("Invite functionality will be implemented soon");
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  const resetInviteLink = () => {
    // TODO: Implement reset invite link functionality
    toast.info("Reset invite link functionality will be implemented soon");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your workspace settings and preferences</p>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Workspace Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Update your workspace name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter workspace name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter workspace description"
                rows={3}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleUpdateWorkspace}
                disabled={currentWorkspaceLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentWorkspaceLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invite Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Team Members</span>
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                1 member
              </span>
            </CardTitle>
            <CardDescription>
              Invite team members to collaborate on your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                type="email"
                className="flex-1"
              />
              <Button 
                onClick={handleInvite}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                <Users className="mr-2 h-4 w-4" />
                Invite
              </Button>
            </div>
            
            {/* Invite Link */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Invite Link</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyInviteLink}
                    className="h-8"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetInviteLink}
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border rounded-lg text-sm font-mono text-gray-700 break-all">
                {inviteLink}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
            <CardDescription className="text-red-600">
              Permanently delete this workspace and all its data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Workspace
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteWorkspaceDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteWorkspace}
        workspaceName={currentWorkspace?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}