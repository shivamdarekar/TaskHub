"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getProjectTasks } from "@/redux/slices/taskSlice";

import TaskTable from "@/components/workspace/task/TaskTable";
import TaskTableFilters from "@/components/workspace/task/TaskTableFilters";
import { TaskStatus, TaskPriority } from "@/redux/slices/taskSlice";

export default function ProjectTablePage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const projectId = params.projectId as string;

  const { tasks, tasksLoading, pagination } = useAppSelector((state) => state.task);
  const { members } = useAppSelector((state) => state.project);

  const [filters, setFilters] = useState({
    search: "",
    status: undefined as TaskStatus | undefined,
    priority: undefined as TaskPriority | undefined,
    assigneeId: undefined as string | undefined,
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [visibleColumns, setVisibleColumns] = useState([
    "title", "status", "priority", "createdAt", "dueDate", "assignedTo", "attachments", "actions"
  ]);

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectTasks({ projectId, ...filters }));
    }
  }, [dispatch, projectId, filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="p-3 md:p-6">
      <TaskTableFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        members={members}
        onColumnsChange={setVisibleColumns}
      />
      
      <TaskTable
        tasks={tasks}
        loading={tasksLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSort={(sortBy: string, sortOrder: "asc" | "desc") => setFilters(prev => ({ ...prev, sortBy, sortOrder }))}
        visibleColumns={visibleColumns}
      />
    </div>
  );
}
