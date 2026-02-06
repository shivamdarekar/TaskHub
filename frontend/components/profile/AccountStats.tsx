import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FolderKanban, CheckSquare, Calendar } from "lucide-react";

interface UserStats {
  workspacesCount: number;
  projectsCount: number;
  tasksCount: number;
  lastLogin: string | null;
  memberSince: string;
}

interface AccountStatsProps {
  stats: UserStats | null;
  loading: boolean;
}

export default function AccountStats({ stats, loading }: AccountStatsProps) {
  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Account Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{stats.workspacesCount}</p>
                  <p className="text-sm text-blue-600 font-medium">Workspaces</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="p-2 bg-green-600 rounded-lg">
                  <FolderKanban className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.projectsCount}</p>
                  <p className="text-sm text-green-600 font-medium">Projects</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{stats.tasksCount}</p>
                  <p className="text-sm text-purple-600 font-medium">Tasks</p>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last login: <span className="font-medium">{formatLastLogin(stats.lastLogin)}</span>
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">Failed to load statistics</p>
        )}
      </CardContent>
    </Card>
  );
}
