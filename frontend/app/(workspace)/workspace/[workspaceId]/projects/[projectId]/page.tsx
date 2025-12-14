"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import ProjectHeader from "@/components/workspace/project/ProjectHeader";
import ProjectStatsCards from "@/components/workspace/project/ProjectStatsCards";
import TaskDistributionChart from "@/components/workspace/project/TaskDistributionChart";
import RecentActivity from "@/components/workspace/project/RecentActivity";
import RecentComments from "@/components/workspace/project/RecentComments";
import {
  fetchProjectById,
  fetchProjectOverview,
  fetchProjectActivities,
  fetchProjectMembers,
} from "@/redux/slices/projectSlice";

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;

  const {
    currentProject,
    overview,
    overviewLoading,
    activities,
    members,
    error,
  } = useAppSelector((state) => state.project);



  useEffect(() => {
    if (!projectId || !workspaceId) {
      router.push("/");
      return;
    }

    Promise.all([
      dispatch(fetchProjectById(projectId)).unwrap(),
      dispatch(fetchProjectOverview(projectId)).unwrap(),
      dispatch(fetchProjectActivities({ projectId, limit: 10 })).unwrap(),
      dispatch(fetchProjectMembers(projectId)).unwrap(),
    ]).catch((err) => {
      console.error("Failed to fetch project data:", err);
    });
  }, [projectId, workspaceId, dispatch, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-8 bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/workspace/${workspaceId}`)}
          >
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  if (overviewLoading && !overview) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!currentProject && !overviewLoading) {
    return (
      <div className="flex items-center justify-center h-screen p-8 bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Project not found</AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/workspace/${workspaceId}`)}
          >
            Go Back to Workspace
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 animate-in fade-in-0 duration-500">
      <WorkspaceNavbar 
        title="Projects" 
        subtitle="Manage project tasks and activities" 
      />
      
      {/* PROJECT HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        {currentProject && (
          <ProjectHeader
            project={currentProject}
            members={members}
            workspaceId={workspaceId}
          />
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="p-8 space-y-6">
        {/* STATS CARDS */}
        <div className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <ProjectStatsCards
            stats={
              overview
                ? {
                    tasksCompleted: overview.stats?.completedTasks || 0,
                    inProgress: overview.tasksByStatus?.IN_PROGRESS || 0,
                    overdue: overview.stats?.overdueTasks || 0,
                    teamMembers: overview.stats?.totalMembers || 0,
                  }
                : undefined
            }
            loading={overviewLoading}
          />
        </div>



        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-500">
          {/* TASK DISTRIBUTION */}
          <div className="lg:col-span-1">
            <TaskDistributionChart
              tasksByStatus={overview?.tasksByStatus}
              loading={overviewLoading}
            />
          </div>

          {/* RECENT ACTIVITY */}
          <div className="lg:col-span-1">
            <RecentActivity
              activities={activities
                .filter(
                  (a) => a?.id && a?.user?.name && a?.type && a?.createdAt
                )
                .map((a) => ({
                  id: a.id,
                  user: a.user.name,
                  action: a.type,
                  target: a.description || "No description",
                  timestamp: a.createdAt,
                }))}
              loading={false}
            />
          </div>

          {/* RECENT COMMENTS */}
          <div className="lg:col-span-1">
            <RecentComments
              comments={
                overview?.recentActivities
                  ?.filter((a) => a?.id && a?.user?.name && a?.createdAt)
                  .map((a) => ({
                    id: a.id,
                    user: a.user.name,
                    content: a.description || "No content",
                    timestamp: a.createdAt,
                  })) || []
              }
              loading={overviewLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}