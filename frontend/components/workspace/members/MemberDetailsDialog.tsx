import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FolderKanban, Calendar, Mail, User, Crown } from "lucide-react";
import { getMemberProjects } from "@/redux/slices/workspaceSlice";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string | null;
  };
  accessLevel: string;
  createdAt: string;
}

interface MemberDetailsDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export default function MemberDetailsDialog({
  member,
  open,
  onOpenChange,
  workspaceId,
}: MemberDetailsDialogProps) {
  const dispatch = useAppDispatch();
  const { memberProjects, memberProjectsLoading } = useAppSelector((state) => state.workspace);

  useEffect(() => {
    if (open && member) {
      dispatch(getMemberProjects({ workspaceId, memberId: member.id }));
    }
  }, [open, member, workspaceId, dispatch]);

  if (!member) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "OWNER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "MEMBER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={member.user.profilePicture || undefined} />
                  <AvatarFallback className="bg-blue-500 text-white font-semibold text-lg">
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      {member.user.name}
                      {member.accessLevel === "OWNER" && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{member.user.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <Badge 
                        variant="outline" 
                        className={getAccessLevelColor(member.accessLevel)}
                      >
                        {member.accessLevel}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(member.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projects ({memberProjectsLoading ? "..." : memberProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {memberProjectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : memberProjects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderKanban className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No projects assigned</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memberProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`h-8 w-8 rounded-md ${getProjectColor(project.name)} flex items-center justify-center shrink-0`}>
                        <span className="text-white font-bold text-sm">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {project.name}
                          </h4>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 ml-2">
                            {project.accessType}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}