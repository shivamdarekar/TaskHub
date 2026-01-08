"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  fetchUserWorkspaces,
} from "@/redux/slices/workspaceSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { currentWorkspace, currentWorkspaceLoading, error } = useAppSelector(
    (state) => state.workspace
  );
  const { user } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = currentWorkspace?.ownerId === user?.id;

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceById(workspaceId));
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
    } catch (err: any) {
      toast.error(err || "Failed to update workspace");
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
    } catch (error: any) {
      toast.error(error || "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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

      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Workspace Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
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
                <div>
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isOwner}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
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
                  />
                </div>
                {isOwner && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleUpdateWorkspace}
                      disabled={currentWorkspaceLoading}
                      className="bg-blue-600 hover:bg-blue-700"
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

        {/* Danger Zone - Only for owner */}
        {isOwner && (
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
    </div>
  );
}