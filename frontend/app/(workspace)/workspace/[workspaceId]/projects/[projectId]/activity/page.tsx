"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchRecentProjectActivities } from "@/redux/slices/projectSlice";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Activity, Search, Filter, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const projectId = params.projectId as string;

  const { recentActivities, recentActivitiesLoading } = useAppSelector((state) => state.project);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchRecentProjectActivities({ projectId, limit: 50 }));
    }
  }, [dispatch, projectId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getActivityIcon = (action: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
    ];
    const index = action.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      'TASK_CREATED': { label: 'Created', color: 'bg-green-100 text-green-800' },
      'TASK_UPDATED': { label: 'Updated', color: 'bg-blue-100 text-blue-800' },
      'TASK_DELETED': { label: 'Deleted', color: 'bg-red-100 text-red-800' },
      'TASK_MOVED': { label: 'Moved', color: 'bg-purple-100 text-purple-800' },
      'TASK_STATUS_CHANGED': { label: 'Status Changed', color: 'bg-purple-100 text-purple-800' },
      'COMMENT_ADDED': { label: 'Commented', color: 'bg-yellow-100 text-yellow-800' },
      'PROJECT_CREATED': { label: 'Project Created', color: 'bg-green-100 text-green-800' },
      'PROJECT_UPDATED': { label: 'Project Updated', color: 'bg-blue-100 text-blue-800' },
      'MEMBER_ADDED': { label: 'Member Added', color: 'bg-indigo-100 text-indigo-800' },
      'MEMBER_REMOVED': { label: 'Member Removed', color: 'bg-red-100 text-red-800' },
    };
    return badges[type as keyof typeof badges] || { label: type.replace('_', ' '), color: 'bg-gray-100 text-gray-800' };
  };

  // Get unique activity types from the data
  const availableTypes = [...new Set(recentActivities.map(a => a.type))];

  const filteredActivities = recentActivities
    .filter(activity => {
      if (filterType !== "all" && activity.type !== filterType) return false;
      if (searchTerm && !activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !activity.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  if (recentActivitiesLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Project Activity</h1>
            <Badge variant="secondary" className="ml-2">
              {filteredActivities.length} activities
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableTypes.map(type => {
                  const badge = getActivityBadge(type);
                  return (
                    <SelectItem key={type} value={type}>
                      {badge.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredActivities.length === 0 ? (
          <Card className="p-12 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Project activities will appear here as team members work on tasks"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => {
              const badge = getActivityBadge(activity.type);
              return (
                <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={`${getActivityIcon(activity.type)} text-white`}>
                        {activity.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {activity.user?.name || 'Unknown User'}
                            </span>
                            <Badge variant="secondary" className={`text-xs ${badge.color}`}>
                              {badge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {activity.description || 'No description available'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                          <Calendar className="h-3 w-3" />
                          {formatTimestamp(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}