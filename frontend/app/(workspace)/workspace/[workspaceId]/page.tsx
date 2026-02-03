"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWorkspaceOverview } from "@/redux/slices/workspaceSlice";
import { createWorkspaceInvite, resetInviteLink } from "@/redux/slices/inviteMemberSlice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, UserPlus } from "lucide-react";
import { InviteEmailForm, InviteLinkManager } from "@/components/workspace/invite";
import { toast } from "sonner";

import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import StatsCards from "@/components/workspace/dashboard/StatsCards";
import TaskStatusChart from "@/components/workspace/dashboard/TaskStatusChart";
import TaskTrendChart from "@/components/workspace/dashboard/TaskTrendChart";
import RecentMembers from "@/components/workspace/dashboard/RecentMembers";
import RecentProjects from "@/components/workspace/dashboard/RecentProjects";
import CreateProjectDialog from "@/components/workspace/CreateProjectDialog";

export default function WorkspaceDashboardPage() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { overview, overviewLoading, error } = useAppSelector((state) => state.workspace);
  const { loading: inviteLoading, inviteLink } = useAppSelector((state) => state.invite);
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  
  const isOwner = currentWorkspace?.ownerId === user?.id;

  const handleSendInvite = async (email: string) => {
    try {
      await dispatch(createWorkspaceInvite({ workspaceId, email })).unwrap();
      toast.success(`Invitation sent to ${email}`);
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleGenerateLink = async () => {
    try {
      await dispatch(createWorkspaceInvite({ workspaceId })).unwrap();
      toast.success("Invite link generated");
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleResetLink = async () => {
    try {
      await dispatch(resetInviteLink(workspaceId)).unwrap();
      toast.success("Invite link reset");
    } catch (error) {
      toast.error(error as string);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceOverview(workspaceId));
    }
  }, [dispatch, workspaceId]);

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

  if (overviewLoading && !overview) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
    </div>
  );
}

  return (
    <div className="flex-1 overflow-auto bg-gray-50 animate-in fade-in-0 duration-500">
      <WorkspaceNavbar 
        title="Home" 
        subtitle="Monitor your workspace activities and projects"
        actions={
          isOwner && (
            <Button 
              onClick={() => setInviteMemberOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )
        }
      />

      {/* MAIN CONTENT */}
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        {/* STATS CARDS */}
        <div className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <StatsCards stats={overview?.stats} loading={overviewLoading} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-500">
          <TaskStatusChart 
            data={overview?.stats?.taskByStatus} 
            loading={overviewLoading} 
          />
          <TaskTrendChart 
            data={overview?.stats?.taskCreationTrend} 
            loading={overviewLoading} 
          />
        </div>

        {/* RECENT MEMBERS & PROJECTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-700">
          <RecentMembers 
            members={overview?.recentMembers} 
            loading={overviewLoading} 
          />
          <RecentProjects
            projects={overview?.recentProjects}
            loading={overviewLoading}
            workspaceId={workspaceId}
            onCreateProject={() => setCreateProjectOpen(true)}
            onProjectClick={(projectId) => router.push(`/workspace/${workspaceId}/projects/${projectId}`)}
            isOwner={overview?.isOwner}
          />
        </div>
      </div>
      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        workspaceId={workspaceId}
      />
      
      {isOwner && (
        <Dialog open={inviteMemberOpen} onOpenChange={setInviteMemberOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader className="space-y-3">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-5 w-5" />
                Invite Member to Workspace
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-2">
              <InviteEmailForm
                onSendInvite={handleSendInvite}
                loading={inviteLoading}
              />
              <Separator className="my-6" />
              <InviteLinkManager
                inviteLink={inviteLink}
                loading={inviteLoading}
                onGenerate={handleGenerateLink}
                onReset={handleResetLink}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
