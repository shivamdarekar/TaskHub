"use client";

import { useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProjectBasicInfo, fetchProjectMembers } from "@/redux/slices/projectSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import ProjectHeader from "@/components/workspace/project/ProjectHeader";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;

  const { currentProject, members, currentProjectLoading, error } = useAppSelector(
    (state) => state.project
  );

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/table')) return 'table';
    if (pathname.includes('/kanban')) return 'kanban';
    if (pathname.includes('/calendar')) return 'calendar';
    if (pathname.includes('/activity')) return 'timeline';
    return 'dashboard';
  };

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectBasicInfo(projectId));
      dispatch(fetchProjectMembers(projectId));
    }
  }, [dispatch, projectId]);

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

  if (currentProjectLoading && !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject && !currentProjectLoading) {
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
    <div className="flex-1 overflow-auto bg-gray-50">
      <WorkspaceNavbar 
        title="Projects" 
        subtitle="Manage project tasks and activities" 
      />
      
      {currentProject && (
        <div className="bg-white border-b border-gray-200 px-8 pt-4">
          <ProjectHeader
            project={currentProject}
            members={members}
            workspaceId={workspaceId}
            activeTab={getActiveTab()}
          />
        </div>
      )}

      {children}
    </div>
  );
}