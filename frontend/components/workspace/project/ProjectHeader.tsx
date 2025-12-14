import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Settings } from "lucide-react";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description?: string;
  };
  members: Array<{
    userId: string;
    workspaceMemberId: string;
    name: string;
    email: string;
  }>;
  workspaceId: string;
}

export default function ProjectHeader({ 
  project, 
  members,
  workspaceId
}: ProjectHeaderProps) {


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
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button className="text-sm font-medium pb-3 text-blue-600 border-b-2 border-blue-600">
          Dashboard
        </button>
        <button className="text-sm font-medium pb-3 text-gray-500 hover:text-gray-900">
          Table
        </button>
        <button className="text-sm font-medium pb-3 text-gray-500 hover:text-gray-900">
          Kanban
        </button>
        <button className="text-sm font-medium pb-3 text-gray-500 hover:text-gray-900">
          Calendar
        </button>
        <button className="text-sm font-medium pb-3 text-gray-500 hover:text-gray-900">
          Timeline
        </button>
      </div>
    </div>
  );
}