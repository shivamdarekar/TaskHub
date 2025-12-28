import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Settings, Edit, FileText } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { fetchProjectBasicInfo, fetchRecentProjectActivities } from "@/redux/slices/projectSlice";
import CreateTaskDialog from "@/components/workspace/task/CreateTaskDialog";
import EditProjectDialog from "@/components/workspace/project/EditProjectDialog";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description?: string;
  };
  members: Array<{
    workspaceMemberId: string;
    userId: string;
    name: string;
    email: string;
    lastLogin: string | null;
    accessLevel: string;
    joinedAt: string;
  }>;
  workspaceId: string;
  activeTab?: string;
}

export default function ProjectHeader({ 
  project, 
  members,
  workspaceId,
  activeTab = "dashboard"
}: ProjectHeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "" },
    { id: "table", label: "Table", path: "/table" },
    { id: "kanban", label: "Kanban", path: "/kanban" },
    { id: "calendar", label: "Calendar", path: "/calendar" },
    { id: "timeline", label: "Activity", path: "/activity" },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    const basePath = `/workspace/${workspaceId}/projects/${project.id}`;
    router.push(`${basePath}${tab.path}`);
  };

  const handleDocumentationClick = () => {
    router.push(`/workspace/${workspaceId}/projects/${project.id}/documentation`);
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

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-700 delay-400">
      {/* PROJECT INFO */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-lg ${getProjectColor(project.name)} flex items-center justify-center shrink-0`}>
            <span className="text-white font-bold text-lg">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Team Members</span>
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map((member) => (
                    <Avatar key={member.userId} className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {members.length > 5 && (
                    <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{members.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setCreateTaskOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                Actions
              </div>
              <DropdownMenuItem onClick={() => setEditProjectOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDocumentationClick}>
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`text-sm font-medium pb-3 transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projectId={project.id}
      />
      
      <EditProjectDialog
        project={project}
        workspaceId={workspaceId}
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        onProjectUpdated={() => {
          dispatch(fetchProjectBasicInfo(project.id));
          dispatch(fetchRecentProjectActivities({ projectId: project.id }));
        }}
      />
    </div>
  );
}