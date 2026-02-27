import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority } from "@/redux/slices/taskSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_PRIORITY_COLORS } from "@/lib/constants";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const PRIORITY_CONFIG = {
  [TaskPriority.LOW]: {
    color: TASK_PRIORITY_COLORS.LOW,
    label: "Low"
  },
  [TaskPriority.MEDIUM]: {
    color: TASK_PRIORITY_COLORS.MEDIUM,
    label: "Medium"
  },
  [TaskPriority.HIGH]: {
    color: TASK_PRIORITY_COLORS.HIGH, 
    label: "High"
  },
  [TaskPriority.CRITICAL]: {
    color: TASK_PRIORITY_COLORS.CRITICAL,
    label: "Critical"
  }
};

export default function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isBeingDragged = isDragging || isSortableDragging;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md",
        isBeingDragged && "opacity-50 shadow-lg scale-105"
      )}
    >
      <CardContent className="p-4">
        {/* Priority Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge className={cn("text-xs", priorityConfig.color)}>
            {priorityConfig.label}
          </Badge>
          {task.assignedTo && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs">
                {task.assignedTo.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Task Title */}
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Task Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
          
          {task.assignedTo && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">
                {task.assignedTo.name}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}