import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  taskTitle?: string;
}

interface RecentCommentsProps {
  comments?: Comment[];
  loading?: boolean;
}

export default function RecentComments({ comments, loading }: RecentCommentsProps) {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;

  const handleViewAllComments = () => {
    router.push(`/workspace/${workspaceId}/projects/${projectId}/comments`);
  };
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayComments = comments?.slice(0, 10) || [];

  const getUserColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          {displayComments.length === 0 ? (
            <div className="text-center py-6">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-full">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">No comments yet</p>
                </div>
              </div>
            </div>
          ) : (
            displayComments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="flex items-start gap-3 animate-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={`${getUserColor(comment.user)} text-white text-xs`}>
                    {comment.user.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.user}
                      </span>
                      {comment.taskTitle && (
                        <span className="text-xs text-gray-500">
                          on {comment.taskTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  <p className="text-xs mt-1 text-gray-500 ml-3">
                    {formatTimestamp(comment.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {displayComments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button 
              onClick={handleViewAllComments}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer"
            >
              View all comments
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}