"use client";

import { useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProjectBasicInfo, fetchProjectMembers } from "@/redux/slices/projectSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

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

  const { currentProject, members, currentProjectLoading, deleting, error } = useAppSelector(
    (state) => state.project
  );

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/tasks/')) return 'table';
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

  if (deleting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Deleting project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAccessDenied = error?.toLowerCase().includes('access denied');
    const isPermissionError = error?.toLowerCase().includes('permission') || 
                             error?.toLowerCase().includes('owner') ||
                             error?.toLowerCase().includes('workspace owner');
    
    // Only show error UI for actual project access issues, not component action errors
    if (isAccessDenied && !isPermissionError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Access Denied</h2>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <p className="text-gray-600 leading-relaxed">
                You don't have access to this project. Please contact the workspace owner to grant you access.
              </p>
              
              <Button
                onClick={() => router.push(`/workspace/${workspaceId}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold"
              >
                Back to Workspace
              </Button>
            </div>
          </div>
        </div>
      );
    }
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

  if (!currentProject && !currentProjectLoading && !deleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Project Not Found</h2>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <p className="text-gray-600 leading-relaxed">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            
            <Button
              onClick={() => router.push(`/workspace/${workspaceId}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold"
            >
              Back to Workspace
            </Button>
          </div>
        </div>
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