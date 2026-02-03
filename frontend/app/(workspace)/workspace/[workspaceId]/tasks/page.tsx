"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getUserTasks, TaskStatus, TaskPriority, Task } from "@/redux/slices/taskSlice";

import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Calendar, User, FolderKanban, AlertCircle, MoreHorizontal, Edit, Copy, Trash2 } from "lucide-react";
import EditTaskDialog from "@/components/workspace/task/EditTaskDialog";
import DeleteTaskDialog from "@/components/workspace/task/DeleteTaskDialog";

export default function MyTasksPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const { tasks, tasksLoading, pagination, error } = useAppSelector((state) => state.task);

  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<{ id: string; title: string; projectId: string } | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    page: 1,
    limit: 20,
    sortBy: "dueDate",
    sortOrder: "asc" as "asc" | "desc"
  });

  useEffect(() => {
    if (workspaceId) {
      dispatch(getUserTasks({
        workspaceId,
        ...filters,
        status: filters.status === "all" ? undefined : filters.status as TaskStatus,
        priority: filters.priority === "all" ? undefined : filters.priority as TaskPriority
      }));
    }
  }, [dispatch, workspaceId, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleTaskUpdated = () => {
    dispatch(getUserTasks({
      workspaceId,
      ...filters,
      status: filters.status === "all" ? undefined : filters.status as TaskStatus,
      priority: filters.priority === "all" ? undefined : filters.priority as TaskPriority
    }));
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      [TaskStatus.TODO]: "bg-gray-100 text-gray-800",
      [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
      [TaskStatus.IN_REVIEW]: "bg-yellow-100 text-yellow-800",
      [TaskStatus.COMPLETED]: "bg-green-100 text-green-800",
      [TaskStatus.BACKLOG]: "bg-purple-100 text-purple-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      [TaskPriority.LOW]: "bg-green-100 text-green-800",
      [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
      [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
      [TaskPriority.CRITICAL]: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getDueDateColor = (dateString: string | null) => {
    if (!dateString) return "text-gray-500";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-600";
    if (diffDays === 0) return "text-orange-600";
    if (diffDays <= 3) return "text-yellow-600";
    return "text-gray-500";
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Tasks Error</h2>
          </div>
          
          <div className="p-6 text-center space-y-4">
            <p className="text-gray-600 leading-relaxed">{error}</p>
            
            <Button
              onClick={() => router.back()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkspaceNavbar 
        title="My Tasks" 
        subtitle="Tasks assigned to you across all projects"
      />
      <div className="p-6 space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                <SelectItem value={TaskPriority.CRITICAL}>Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasksLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <User className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">You don&apos;t have any tasks assigned to you yet.</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => router.push(`/workspace/${workspaceId}/projects/${task.project?.id}/tasks/${task.id}`)}
                      >
                        {task.title}
                      </h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FolderKanban className="h-4 w-4" />
                        <span>{task.project?.name}</span>
                      </div>
                      
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      
                      {task.creator && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Created by {task.creator.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log('Duplicate task:', task.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeleteTask({ id: task.id, title: task.title, projectId: task.project?.id || '' })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} tasks
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            
            <span className="flex items-center px-3 text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Edit Task Dialog */}
      {editTask && (
        <EditTaskDialog
          task={editTask}
          open={!!editTask}
          onOpenChange={(open) => !open && setEditTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
      
      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        task={deleteTask}
        open={!!deleteTask}
        onOpenChange={(open) => !open && setDeleteTask(null)}
        onTaskDeleted={handleTaskUpdated}
      />
      </div>
    </div>
  );
}