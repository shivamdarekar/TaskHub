"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getKanbanTasks, moveTaskKanban, TaskStatus } from "@/redux/slices/taskSlice";
import KanbanBoard from "@/components/workspace/kanban/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function KanbanPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const projectId = params.projectId as string;
  
  const [view, setView] = useState<"all" | "assigned" | "created">("all");
  
  const { kanbanTasks, kanbanLoading, error } = useAppSelector((state) => state.task);

  useEffect(() => {
    if (projectId) {
      dispatch(getKanbanTasks({ projectId, view }));
    }
  }, [projectId, view, dispatch]);

  const handleTaskMove = async (taskId: string, toStatus: string, toPosition: number) => {
    try {
      await dispatch(moveTaskKanban({
        projectId,
        taskId,
        toStatus: toStatus as TaskStatus,
        toPosition
      })).unwrap();
      
      // Refetch kanban tasks to get updated positions
      dispatch(getKanbanTasks({ projectId, view }));
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

  if (kanbanLoading && !kanbanTasks) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading kanban board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => dispatch(getKanbanTasks({ projectId, view }))}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600">Drag and drop tasks to update their status</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={view} onValueChange={(value: "all" | "assigned" | "created") => setView(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="assigned">Assigned to Me</SelectItem>
              <SelectItem value="created">Created by Me</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          tasks={kanbanTasks || { TODO: [], IN_PROGRESS: [], IN_REVIEW: [], COMPLETED: [], BACKLOG: [] }}
          onTaskMove={handleTaskMove}
          loading={kanbanLoading}
        />
      </div>
    </div>
  );
}