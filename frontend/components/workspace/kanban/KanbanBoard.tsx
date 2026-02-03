import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { TaskStatus, Task } from "@/redux/slices/taskSlice";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  tasks: Record<TaskStatus, Task[]>;
  onTaskMove: (taskId: string, toStatus: string, toPosition: number) => void;
  loading?: boolean;
}

const COLUMN_CONFIG = {
  [TaskStatus.TODO]: {
    title: "To Do",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  [TaskStatus.IN_PROGRESS]: {
    title: "In Progress", 
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  [TaskStatus.COMPLETED]: {
    title: "Completed",
    color: "bg-green-500", 
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  [TaskStatus.BACKLOG]: {
    title: "Backlog",
    color: "bg-pink-500",
    bgColor: "bg-pink-50", 
    borderColor: "border-pink-200"
  },
  [TaskStatus.IN_REVIEW]: {
    title: "In Review",
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
};

export default function KanbanBoard({ tasks, onTaskMove, loading }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;
    
    // Find the task being dragged
    const task = Object.values(tasks).flat().find(t => t.id === taskId);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setDraggedOverColumn(null);
      return;
    }

    const overId = over.id as string;
    
    // Check if dragging over a column
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      setDraggedOverColumn(overId as TaskStatus);
    } else {
      // Dragging over a task - find which column it belongs to
      const overTask = Object.values(tasks).flat().find(t => t.id === overId);
      if (overTask) {
        setDraggedOverColumn(overTask.status);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    setDraggedOverColumn(null);

    if (!over || !activeTask) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find current task
    const currentTask = Object.values(tasks).flat().find(t => t.id === taskId);
    if (!currentTask) return;

    let targetStatus: TaskStatus;
    let targetPosition: number;

    // Check if dropped on a column header
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      targetStatus = overId as TaskStatus;
      targetPosition = tasks[targetStatus]?.length || 0;
    } else {
      // Dropped on another task
      const targetTask = Object.values(tasks).flat().find(t => t.id === overId);
      if (!targetTask) return;

      targetStatus = targetTask.status;
      const columnTasks = tasks[targetStatus] || [];
      const targetIndex = columnTasks.findIndex(t => t.id === overId);
      targetPosition = targetIndex >= 0 ? targetIndex : columnTasks.length;
    }

    // Only move if status changed or position changed within same column
    if (currentTask.status !== targetStatus || 
        (currentTask.status === targetStatus && currentTask.position !== targetPosition)) {
      onTaskMove(taskId, targetStatus, targetPosition);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {Object.entries(COLUMN_CONFIG).map(([status, config]) => {
          const columnTasks = tasks[status as TaskStatus] || [];
          const isOver = draggedOverColumn === status;
          
          return (
            <SortableContext
              key={status}
              items={columnTasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={status as TaskStatus}
                title={config.title}
                color={config.color}
                bgColor={config.bgColor}
                borderColor={config.borderColor}
                tasks={columnTasks}
                isOver={isOver}
                loading={loading}
              />
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}