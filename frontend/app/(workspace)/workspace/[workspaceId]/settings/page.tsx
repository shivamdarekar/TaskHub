"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  fetchUserWorkspaces,
  fetchWorkspaceMembers,
  transferOwnership,
} from "@/redux/slices/workspaceSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Trash2, UserCog, AlertTriangle } from "lucide-react";
import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import InviteMembersSection from "@/components/workspace/invite/InviteMembersSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { currentWorkspace, currentWorkspaceLoading, error, members } = useAppSelector(
    (state) => state.workspace
  );
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const isOwner = currentWorkspace?.ownerId === user?.id;

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceById(workspaceId));
      dispatch(fetchWorkspaceMembers(workspaceId));
    }
  }, [workspaceId, dispatch]);

  useEffect(() => {
    if (currentWorkspace) {
      setFormData({
        name: currentWorkspace.name,
        description: currentWorkspace.description || "",
      });
    }
  }, [currentWorkspace]);

  const handleUpdateWorkspace = async () => {
    try {
      await dispatch(
        updateWorkspace({
          workspaceId,
          data: formData,
        })
      ).unwrap();
      toast.success("Workspace updated successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(errorMessage || "Failed to update workspace");
    }
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteWorkspace(workspaceId)).unwrap();
      toast.success("Workspace deleted successfully");
      
      // Fetch remaining workspaces and redirect
      const workspaces = await dispatch(fetchUserWorkspaces()).unwrap();
      if (workspaces.length > 0) {
        router.push(`/workspace/${workspaces[0].id}`);
      } else {
        router.push("/workspace/create");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage || "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) {
      toast.error("Please select a new owner");
      return;
    }

    setIsTransferring(true);
    try {
      await dispatch(transferOwnership({ workspaceId, newOwnerId: selectedNewOwner })).unwrap();
      toast.success("Ownership transferred successfully");
      setShowTransferDialog(false);
      setSelectedNewOwner("");
      router.push(`/workspace/${workspaceId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(errorMessage || "Failed to transfer ownership");
    } finally {
      setIsTransferring(false);
    }
  };

  const eligibleMembers = members.filter(
    (m) => m.userId !== user?.id && m.accessLevel !== "OWNER"
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Workspace Error</h2>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <p className="text-gray-600 leading-relaxed">{error}</p>
            
            <Button
              onClick={() => router.back()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <WorkspaceNavbar title="Settings" subtitle="Manage workspace preferences" />

      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Workspace Settings */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Workspace Settings</CardTitle>
            <CardDescription>
              Manage your workspace settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentWorkspaceLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Workspace Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isOwner}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    disabled={!isOwner}
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                {isOwner && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleUpdateWorkspace}
                      disabled={currentWorkspaceLoading}
                      className="bg-blue-600 hover:bg-blue-700 h-11 px-6"
                    >
                      {currentWorkspaceLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Invite Members - Only for owner */}
        {isOwner && <InviteMembersSection workspaceId={workspaceId} />}

        {/* Transfer Ownership - Only for owner */}
        {isOwner && eligibleMembers.length > 0 && (
          <Card className="shadow-sm border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
                <UserCog className="h-5 w-5" />
                Transfer Ownership
              </CardTitle>
              <CardDescription className="text-orange-600">
                Transfer workspace ownership to another member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200">
                <div>
                  <p className="font-semibold text-gray-900">Transfer Ownership</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Hand over full control to another member
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowTransferDialog(true)}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 h-11 px-6"
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone - Only for owner */}
        {isOwner && (
          <Card className="shadow-sm border-red-200 bg-red-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600">
                Irreversible actions that affect your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div>
                  <p className="font-semibold text-gray-900">Delete Workspace</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete this workspace and all its data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 h-11 px-6"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Workspace
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              workspace and remove all associated data including projects, tasks,
              and members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Dialog */}
      <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Workspace Ownership</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are about to transfer ownership of this workspace. The new owner will have full control.
              </p>
              <div className="space-y-2">
                <Label>Select New Owner</Label>
                <Select value={selectedNewOwner} onValueChange={setSelectedNewOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleMembers.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        {member.user.name} ({member.user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedNewOwner("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferOwnership}
              disabled={!selectedNewOwner || isTransferring}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isTransferring ? "Transferring..." : "Transfer Ownership"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}