"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import ProjectStatsCards from "@/components/workspace/project/ProjectStatsCards";
import TaskDistributionChart from "@/components/workspace/project/TaskDistributionChart";
import RecentActivity from "@/components/workspace/project/RecentActivity";
import RecentComments from "@/components/workspace/project/RecentComments";
import {
  fetchProjectOverview,
  fetchRecentProjectActivities,
  fetchProjectMembers,
} from "@/redux/slices/projectSlice";
import { getRecentProjectComments } from "@/redux/slices/commentSlice";

export default function ProjectDashboardPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const projectId = params.projectId as string;
  const workspaceId = params.workspaceId as string;

  const {
    overview,
    overviewLoading,
    recentActivities,
    recentActivitiesLoading,
  } = useAppSelector((state) => state.project);
  
  const { recentComments, recentCommentsLoading } = useAppSelector((state) => state.comment);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectOverview(projectId));
      dispatch(fetchRecentProjectActivities({ projectId, limit: 15 }));
      dispatch(getRecentProjectComments({ projectId, limit: 15 }));
      dispatch(fetchProjectMembers(projectId));
    }
  }, [projectId, dispatch]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
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
          <div className="lg:col-span-1 h-[650px]">
            <TaskDistributionChart
              tasksByStatus={overview?.tasksByStatus}
              loading={overviewLoading}
            />
          </div>

          {/* RECENT ACTIVITY */}
          <div className="lg:col-span-1">
            <RecentActivity
              activities={recentActivities
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
              loading={recentActivitiesLoading}
              projectId={projectId}
              workspaceId={workspaceId}
            />
          </div>

          {/* RECENT COMMENTS */}
          <div className="lg:col-span-1">
            <RecentComments
              comments={
                recentComments?.map((c) => ({
                  id: c.id,
                  user: c.user.name,
                  content: c.content,
                  timestamp: c.createdAt,
                  taskTitle: c.task?.title,
                })) || []
              }
              loading={recentCommentsLoading}
            />
          </div>
        </div>
    </div>
  );
}