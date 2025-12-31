import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Paperclip, ChevronLeft, ChevronRight, Loader2, Edit, Copy, Trash2 } from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "@/redux/slices/taskSlice";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import EditTaskDialog from "./EditTaskDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  onPageChange: (page: number) => void;
  onSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onTaskUpdated?: () => void;
  visibleColumns?: string[];
}

const getStatusBadge = (status: TaskStatus) => {
  const statusConfig = {
    [TaskStatus.TODO]: { label: "TODO", className: "bg-gray-100 text-gray-800 text-xs px-2 py-1" },
    [TaskStatus.IN_PROGRESS]: { label: "IN PROGRESS", className: "bg-blue-100 text-blue-800 text-xs px-2 py-1" },
    [TaskStatus.IN_REVIEW]: { label: "IN REVIEW", className: "bg-yellow-100 text-yellow-800 text-xs px-2 py-1" },
    [TaskStatus.COMPLETED]: { label: "COMPLETED", className: "bg-green-100 text-green-800 text-xs px-2 py-1" },
    [TaskStatus.BACKLOG]: { label: "BACKLOG", className: "bg-purple-100 text-purple-800 text-xs px-2 py-1" },
  };
  
  const config = statusConfig[status];
  return (
    <Badge className={config.className}>
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.split(' ')[0]}</span>
    </Badge>
  );
};

const getPriorityText = (priority: TaskPriority) => {
  const priorityConfig = {
    [TaskPriority.LOW]: { label: "LOW", short: "L", className: "text-green-600" },
    [TaskPriority.MEDIUM]: { label: "MEDIUM", short: "M", className: "text-yellow-600" },
    [TaskPriority.HIGH]: { label: "HIGH", short: "H", className: "text-orange-600" },
    [TaskPriority.CRITICAL]: { label: "CRITICAL", short: "C", className: "text-red-600" },
  };
  
  const config = priorityConfig[priority];
  return (
    <span className={`font-medium text-xs md:text-sm ${config.className}`}>
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.short}</span>
    </span>
  );
};

export default function TaskTable({ 
  tasks, 
  loading, 
  pagination, 
  onPageChange, 
  onSort,
  onTaskUpdated,
  visibleColumns = ["title", "status", "priority", "createdAt", "dueDate", "assignedTo", "attachments", "actions"]
}: TaskTableProps) {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;
  const [isPageChanging, setIsPageChanging] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<{ id: string; title: string; projectId: string } | null>(null);
  
  useEffect(() => {
    if (!loading) {
      setIsPageChanging(false);
    }
  }, [loading]);
  
  const handlePageChange = (page: number) => {
    if (page === pagination?.page) return;
    setIsPageChanging(true);
    onPageChange(page);
  };
  
  const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId);
  
  const handleTaskClick = (taskId: string) => {
    router.push(`/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 md:p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2 md:space-x-4 py-3 md:py-4">
              <Skeleton className="h-4 w-32 md:w-40" />
              <Skeleton className="h-6 w-20 md:w-24" />
              <Skeleton className="h-4 w-16 md:w-20" />
              <Skeleton className="h-4 w-24 md:w-28" />
              <Skeleton className="h-4 w-24 md:w-28" />
              <Skeleton className="h-8 w-24 md:w-32 rounded-full" />
              <Skeleton className="h-4 w-8 md:w-12" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="relative">
        {isPageChanging && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
      <div className="overflow-x-auto min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              {isColumnVisible("title") && (
                <TableHead className="min-w-[150px] w-[25%]">
                  <Button variant="ghost" onClick={() => onSort("title", "asc")} className="h-auto p-0 font-medium text-xs md:text-sm">
                    Task Title
                    <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TableHead>
              )}
              {isColumnVisible("status") && <TableHead className="w-[15%] min-w-[100px] align-middle text-xs md:text-sm">Status</TableHead>}
              {isColumnVisible("priority") && <TableHead className="w-[12%] min-w-[80px] align-middle text-xs md:text-sm">Priority</TableHead>}
              {isColumnVisible("createdAt") && (
                <TableHead className="w-[15%] min-w-[100px]">
                  <Button variant="ghost" onClick={() => onSort("createdAt", "desc")} className="h-auto p-0 font-medium text-xs md:text-sm">
                    Created
                    <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TableHead>
              )}
              {isColumnVisible("dueDate") && (
                <TableHead className="w-[15%] min-w-[100px]">
                  <Button variant="ghost" onClick={() => onSort("dueDate", "asc")} className="h-auto p-0 font-medium text-xs md:text-sm">
                    Due Date
                    <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TableHead>
              )}
              {isColumnVisible("assignedTo") && <TableHead className="w-[13%] min-w-[120px] text-xs md:text-sm">Assigned</TableHead>}
              {isColumnVisible("attachments") && <TableHead className="w-[8%] min-w-[80px] text-xs md:text-sm">Files</TableHead>}
              {isColumnVisible("actions") && <TableHead className="w-[7%] min-w-[70px] text-xs md:text-sm">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-8 text-gray-500">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  {isColumnVisible("title") && (
                    <TableCell className="font-medium">
                      <div 
                        className="flex items-center gap-2 md:gap-3 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <div className="h-6 w-6 md:h-8 md:w-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs md:text-sm font-medium shrink-0">
                          {task.title.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs md:text-sm truncate max-w-[150px] md:max-w-none">{task.title}</span>
                      </div>
                    </TableCell>
                  )}
                  {isColumnVisible("status") && <TableCell className="align-middle">{getStatusBadge(task.status)}</TableCell>}
                  {isColumnVisible("priority") && <TableCell className="align-middle">{getPriorityText(task.priority)}</TableCell>}
                  {isColumnVisible("createdAt") && (
                    <TableCell className="text-gray-600 text-xs md:text-sm">
                      <span className="hidden md:inline">{format(new Date(task.createdAt), "MMM dd, yyyy")}</span>
                      <span className="md:hidden">{format(new Date(task.createdAt), "MMM dd")}</span>
                    </TableCell>
                  )}
                  {isColumnVisible("dueDate") && (
                    <TableCell className="text-gray-600 text-xs md:text-sm">
                      {task.dueDate ? (
                        <>
                          <span className="hidden md:inline">{format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
                          <span className="md:hidden">{format(new Date(task.dueDate), "MMM dd")}</span>
                        </>
                      ) : "-"}
                    </TableCell>
                  )}
                  {isColumnVisible("assignedTo") && (
                    <TableCell>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-1 md:gap-2">
                          <Avatar className="h-5 w-5 md:h-6 md:w-6">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs md:text-sm">Unassigned</span>
                      )}
                    </TableCell>
                  )}
                  {isColumnVisible("attachments") && (
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Paperclip className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="text-xs md:text-sm">{task.attachments?.length || 0}</span>
                      </div>
                    </TableCell>
                  )}
                  {isColumnVisible("actions") && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-6 md:h-8 md:w-8 p-0">
                            <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4" />
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
                            onClick={() => setDeleteTask({ id: task.id, title: task.title, projectId: task.projectId })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6 py-4 border-t border-gray-200">
          <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={isPageChanging || pagination.page <= 1}
              className="text-xs md:text-sm"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <span className="text-xs md:text-sm text-gray-600 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={isPageChanging || pagination.page >= pagination.totalPages}
              className="text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
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
          onTaskUpdated={onTaskUpdated}
        />
      )}
      
      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        task={deleteTask}
        open={!!deleteTask}
        onOpenChange={(open) => !open && setDeleteTask(null)}
        onTaskDeleted={onTaskUpdated}
      />
    </div>
  );
}