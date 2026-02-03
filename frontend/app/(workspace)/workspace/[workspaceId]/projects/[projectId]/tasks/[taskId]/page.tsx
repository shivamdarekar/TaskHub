"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getTaskById, TaskStatus, TaskPriority } from "@/redux/slices/taskSlice";
import TaskDocumentation from "@/components/workspace/task/TaskDocumentation";
import TaskComments from "@/components/workspace/task/TaskComments";
import EditTaskDialog from "@/components/workspace/task/EditTaskDialog";
import DeleteTaskDialog from "@/components/workspace/task/DeleteTaskDialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Calendar, 
  Flag, 
  Paperclip,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;
  const taskId = params.taskId as string;

  const { currentTask, currentTaskLoading } = useAppSelector((state) => state.task);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (projectId && taskId) {
      dispatch(getTaskById({ projectId, taskId }));
    }
  }, [dispatch, projectId, taskId]);

  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = {
      [TaskStatus.TODO]: { label: "TODO", className: "bg-gray-100 text-gray-800" },
      [TaskStatus.IN_PROGRESS]: { label: "IN PROGRESS", className: "bg-blue-100 text-blue-800" },
      [TaskStatus.IN_REVIEW]: { label: "IN REVIEW", className: "bg-yellow-100 text-yellow-800" },
      [TaskStatus.COMPLETED]: { label: "COMPLETED", className: "bg-green-100 text-green-800" },
      [TaskStatus.BACKLOG]: { label: "BACKLOG", className: "bg-purple-100 text-purple-800" },
    };
    
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const priorityConfig = {
      [TaskPriority.LOW]: { label: "LOW", className: "bg-green-100 text-green-800" },
      [TaskPriority.MEDIUM]: { label: "MEDIUM", className: "bg-yellow-100 text-yellow-800" },
      [TaskPriority.HIGH]: { label: "HIGH", className: "bg-orange-100 text-orange-800" },
      [TaskPriority.CRITICAL]: { label: "CRITICAL", className: "bg-red-100 text-red-800" },
    };
    
    const config = priorityConfig[priority];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (currentTaskLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Task not found</h2>
          <p className="text-gray-600 mt-2">The task you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-2">
        <Button
          variant="ghost"
          onClick={() => router.push(`/workspace/${workspaceId}/projects/${projectId}/table`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded flex items-center justify-center text-white font-medium">
                  {currentTask.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentTask.title}</h1>
                  <p className="text-sm text-gray-500">
                    {currentTask.project?.name} • {currentTask.project?.workspace?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Task
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Assigned to:</span>
                {currentTask.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {currentTask.assignedTo.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{currentTask.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {currentTask.description || "No description provided"}
              </p>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Status</span>
                  </div>
                  {getStatusBadge(currentTask.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Due Date</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {currentTask.dueDate 
                      ? format(new Date(currentTask.dueDate), "MMM dd, yyyy")
                      : "No due date"
                    }
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Priority</span>
                </div>
                {getPriorityBadge(currentTask.priority)}
              </div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <TaskDocumentation projectId={projectId} taskId={taskId} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Comments */}
          <TaskComments projectId={projectId} taskId={taskId} />

          {/* Attachments */}
          <Card> 
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 text-center py-4">
                No attachments found
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Task Dialog */}
      {currentTask && (
        <EditTaskDialog
          task={currentTask}
          open={isEditing}
          onOpenChange={setIsEditing}
        />
      )}
      
      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        task={currentTask ? { id: currentTask.id, title: currentTask.title, projectId: currentTask.projectId } : null}
        open={isDeleting}
        onOpenChange={setIsDeleting}
        onTaskDeleted={() => router.push(`/workspace/${workspaceId}/projects/${projectId}/table`)}
      />
    </div>
  );
}