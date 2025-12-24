import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Settings2 } from "lucide-react";
import { TaskStatus, TaskPriority } from "@/redux/slices/taskSlice";
import { useState } from "react";

interface TaskTableFiltersProps {
  filters: {
    search: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
  };
  onFilterChange: (filters: any) => void;
  members: Array<{
    workspaceMemberId: string;
    userId: string;
    name: string;
    email: string;
    lastLogin: string | null;
    accessLevel: string;
    joinedAt: string;
  }>;
  onColumnsChange?: (columns: string[]) => void;
}

const statusOptions = [
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.IN_REVIEW, label: "In Review" },
  { value: TaskStatus.COMPLETED, label: "Completed" },
  { value: TaskStatus.BACKLOG, label: "Backlog" },
];

const priorityOptions = [
  { value: TaskPriority.LOW, label: "Low" },
  { value: TaskPriority.MEDIUM, label: "Medium" },
  { value: TaskPriority.HIGH, label: "High" },
  { value: TaskPriority.CRITICAL, label: "Critical" },
];

const defaultColumns = [
  { id: "title", label: "Task Title", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "priority", label: "Priority", visible: true },
  { id: "createdAt", label: "Created At", visible: true },
  { id: "dueDate", label: "Due Date", visible: true },
  { id: "assignedTo", label: "Assigned To", visible: true },
  { id: "attachments", label: "Attachments", visible: true },
  { id: "actions", label: "Actions", visible: true },
];

export default function TaskTableFilters({ filters, onFilterChange, members, onColumnsChange }: TaskTableFiltersProps) {
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);

  const handleColumnToggle = (columnId: string) => {
    const updated = visibleColumns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    setVisibleColumns(updated);
    onColumnsChange?.(updated.filter(c => c.visible).map(c => c.id));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Filter tasks..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-10 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            {/* Status Filter */}
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => onFilterChange({ ...filters, status: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-full sm:w-32 md:w-40 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={filters.priority || "all"}
              onValueChange={(value) => onFilterChange({ ...filters, priority: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-full sm:w-32 md:w-40 text-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assignee Filter */}
            <Select
              value={filters.assigneeId || "all"}
              onValueChange={(value) => onFilterChange({ assigneeId: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="w-full sm:w-36 md:w-48 text-sm">
                <SelectValue placeholder="Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Columns Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 text-sm w-full sm:w-auto">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Columns</span>
              <span className="sm:hidden">View</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {visibleColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => handleColumnToggle(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}