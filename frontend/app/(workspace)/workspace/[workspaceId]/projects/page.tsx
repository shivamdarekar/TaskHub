"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FolderKanban, Calendar, AlertCircle } from "lucide-react";
import { fetchWorkspaceProjects } from "@/redux/slices/projectSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import CreateProjectDialog from "@/components/workspace/CreateProjectDialog";

export default function ProjectsListPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const workspaceId = params.workspaceId as string;

  const { projects, projectsLoading, error } = useAppSelector((state) => state.project);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch projects when workspaceId changes
  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceProjects(workspaceId)).unwrap();
    }
  }, [workspaceId, dispatch]);

  const getProjectColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500", 
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
    });
  };

  // Loading state
  if (projectsLoading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        </div>
        <div className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <WorkspaceNavbar 
        title="Projects"
        subtitle="Manage and organize your workspace projects"
        actions={
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        }
      />

      {/* MAIN CONTENT */}
      <div className="p-8">
        {projects.length === 0 ? (
          <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <FolderKanban className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Create your first project to start organizing tasks and collaborating with your team
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-300">
            {projects.map((project, index) => (
              <Card 
                key={project.id}
                className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => router.push(`/workspace/${workspaceId}/projects/${project.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`h-12 w-12 rounded-lg ${getProjectColor(project.name)} flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-lg">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {project._count?.tasks || project.taskCount || 0} {((project._count?.tasks || project.taskCount || 0) === 1) ? 'task' : 'tasks'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
}