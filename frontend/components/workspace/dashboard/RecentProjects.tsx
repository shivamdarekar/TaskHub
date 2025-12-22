import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  taskCount: number;
}

interface RecentProjectsProps {
  projects?: Project[];
  loading?: boolean;
  workspaceId: string;
  onCreateProject: () => void;
  onProjectClick: (projectId: string) => void;
}

export default function RecentProjects({
  projects,
  loading,
  workspaceId,
  onCreateProject,
  onProjectClick,
}: RecentProjectsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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

  const displayProjects = projects?.slice(0, 5) || [];

  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold">Recent Projects</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.href = `/workspace/${workspaceId}/projects`}
          className="text-xs"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-3">
          {displayProjects.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500 mb-4">No recent projects</p>
              <Button onClick={onCreateProject} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            displayProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onProjectClick(project.id)}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <div
                  className={`h-10 w-10 rounded-lg ${getProjectColor(
                    project.name
                  )} flex items-center justify-center shrink-0`}
                >
                  <span className="text-white font-semibold text-sm">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}
                  </p>
                </div>
                 <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span className="whitespace-nowrap">{formatDate(project.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
