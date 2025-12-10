"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchWorkspaceOverview } from "@/redux/slices/workspaceSlice";
import { Bell, Moon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import StatsCards from "@/components/workspace/dashboard/StatsCards";
import TaskStatusChart from "@/components/workspace/dashboard/TaskStatusChart";
import TaskTrendChart from "@/components/workspace/dashboard/TaskTrendChart";
import RecentMembers from "@/components/workspace/dashboard/RecentMembers";
import RecentProjects from "@/components/workspace/dashboard/RecentProjects";

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { overview, overviewLoading, error } = useAppSelector((state) => state.workspace);
  const { user } = useAppSelector((state) => state.auth);

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

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor your workspace activities and projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Moon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-8 space-y-6">
        {/* STATS CARDS */}
        <StatsCards stats={overview?.stats} loading={overviewLoading} />

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskStatusChart 
            data={overview?.stats?.taskByStatus} 
            loading={overviewLoading} 
          />
          <TaskTrendChart loading={overviewLoading} />
        </div>

        {/* RECENT MEMBERS & PROJECTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentMembers 
            members={overview?.recentMembers} 
            loading={overviewLoading} 
          />
          <RecentProjects
            projects={overview?.recentProjects}
            loading={overviewLoading}
            workspaceId={workspaceId}
            onCreateProject={() => router.push(`/workspace/${workspaceId}/projects/new`)}
            onProjectClick={(projectId) => router.push(`/workspace/${workspaceId}/projects/${projectId}`)}
          />
        </div>
      </div>
    </div>
  );
}
