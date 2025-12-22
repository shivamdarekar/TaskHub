"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWorkspaceOverview } from "@/redux/slices/workspaceSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import StatsCards from "@/components/workspace/dashboard/StatsCards";
import TaskStatusChart from "@/components/workspace/dashboard/TaskStatusChart";
import TaskTrendChart from "@/components/workspace/dashboard/TaskTrendChart";
import RecentMembers from "@/components/workspace/dashboard/RecentMembers";
import RecentProjects from "@/components/workspace/dashboard/RecentProjects";
import CreateProjectDialog from "@/components/workspace/CreateProjectDialog";
import { useState } from "react";

export default function WorkspaceDashboardPage() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { overview, overviewLoading, error } = useAppSelector((state) => state.workspace);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceOverview(workspaceId));
    }
  }, [dispatch, workspaceId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
          />
        </div>
      </div>
      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
}
