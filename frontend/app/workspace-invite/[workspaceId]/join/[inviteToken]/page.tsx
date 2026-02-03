"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getInviteDetails,
  joinWorkspaceViaInvite,
  clearInviteDetails,
} from "@/redux/slices/inviteMemberSlice";
import { fetchUserWorkspaces } from "@/redux/slices/workspaceSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, FolderKanban, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import AuthNavbar from "@/components/AuthNavbar";
import { toast } from "sonner";

export default function JoinWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const workspaceId = params.workspaceId as string;
  const inviteToken = params.inviteToken as string;

  const { isAuthenticated, authLoading } = useAppSelector((state) => state.auth);
  const { inviteDetails, loading, error } = useAppSelector((state) => state.invite);

  useEffect(() => {
    if (!authLoading && workspaceId && inviteToken) {
      dispatch(getInviteDetails({ workspaceId, inviteToken }));
    }
  }, [workspaceId, inviteToken, authLoading, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearInviteDetails());
    };
  }, [dispatch]);

  const handleJoinWorkspace = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = `/workspace-invite/${workspaceId}/join/${inviteToken}`;
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    try {
      const result = await dispatch(joinWorkspaceViaInvite({ workspaceId, inviteToken })).unwrap();
      
      // Check if user is already a member
      if (result.alreadyMember) {
        toast.info("You're already a member of this workspace!", {
          description: "Redirecting to workspace..."
        });
        
        // Refresh workspaces to ensure latest data
        await dispatch(fetchUserWorkspaces()).unwrap();
        router.push(`/workspace/${workspaceId}`);
        return;
      }
      
      // New member joined successfully
      toast.success("Successfully joined workspace!", {
        description: "Welcome to the team! 🎉"
      });
      
      // Refresh workspaces list and redirect
      await dispatch(fetchUserWorkspaces()).unwrap();
      router.push(`/workspace/${workspaceId}`);
    } catch (err: unknown) {
      // Better error messages
      const errorMessage = typeof err === 'string' ? err.toLowerCase() : String(err).toLowerCase();
      
      if (errorMessage?.includes('already used')) {
        toast.error("Invite Link Already Used", {
          description: "This invitation has already been claimed. Please request a new one."
        });
      } else if (errorMessage?.includes('expired')) {
        toast.error("Invite Link Expired", {
          description: "This invitation has expired. Please request a new one."
        });
      } else if (errorMessage?.includes('email')) {
        toast.error("Email Mismatch", {
          description: "This invitation was sent to a different email address."
        });
      } else {
        toast.error("Failed to Join Workspace", {
          description: typeof err === 'string' ? err : "An unexpected error occurred. Please try again."
        });
      }
    }
  };

  const handleCancel = () => {
    if (isAuthenticated) {
      dispatch(fetchUserWorkspaces())
        .unwrap()
        .then((workspaces) => {
          if (workspaces.length > 0) {
            router.push(`/workspace/${workspaces[0].id}`);
          } else {
            router.push("/workspace/create");
          }
        });
    } else {
      router.push("/");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <AuthNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-center text-xl">
                Invalid Invitation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => router.push("/")}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!inviteDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <AuthNavbar />
      
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <Card className="max-w-lg w-full shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Join Workspace</CardTitle>
            <CardDescription className="text-base mt-2">
              You have been invited to join{" "}
              <span className="font-semibold text-gray-900">
                {inviteDetails.invite.workspace.name}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Workspace Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </span>
                <span className="font-semibold text-gray-900">
                  {inviteDetails.invite.workspace._count.members}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Projects
                </span>
                <span className="font-semibold text-gray-900">
                  {inviteDetails.invite.workspace._count.projects}
                </span>
              </div>
            </div>

            {inviteDetails.invite.workspace.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {inviteDetails.invite.workspace.description}
                </p>
              </div>
            )}

            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p>
                <span className="font-medium text-gray-900">
                  {inviteDetails.invite.inviter.name}
                </span>{" "}
                invited you to collaborate
              </p>
            </div>

            {!isAuthenticated && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800">
                  You need to sign in or create an account to join this workspace.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 h-11"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinWorkspace}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : isAuthenticated ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Join Workspace
                  </>
                ) : (
                  "Sign In to Join"
                )}
              </Button>
            </div>

            {!isAuthenticated && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/register?redirect=${encodeURIComponent(`/workspace-invite/${workspaceId}/join/${inviteToken}`)}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}