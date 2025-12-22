import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskStatus, Task } from "@/redux/slices/taskSlice";
import TaskCard from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tasks: Task[];
  isOver?: boolean;
  loading?: boolean;
}

export default function KanbanColumn({
  id,
  title,
  color,
  bgColor,
  borderColor,
  tasks,
  isOver,
  loading
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col min-w-80 max-w-80">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-t-lg border-2",
        bgColor,
        borderColor,
        isOver && "ring-2 ring-blue-400 ring-opacity-50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <Badge variant="secondary" className="bg-white">
          {tasks.length}
        </Badge>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-4 border-2 border-t-0 rounded-b-lg min-h-96 transition-colors",
          bgColor,
          borderColor,
          isOver && "bg-opacity-70 ring-2 ring-blue-400 ring-opacity-50"
        )}
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {loading && tasks.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
            
            {!loading && tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No tasks in {title.toLowerCase()}</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}