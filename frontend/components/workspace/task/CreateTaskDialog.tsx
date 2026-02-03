"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProjectOverview,
  fetchRecentProjectActivities,
} from "@/redux/slices/projectSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, addDays, isBefore } from "date-fns";
import {
  createTask,
  TaskPriority,
  TaskStatus,
  clearTaskError,
} from "@/redux/slices/taskSlice";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

interface TaskFormData {
  title: string;
  description: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: Date;
  dueDate?: Date;
}

export default function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
}: CreateTaskDialogProps) {
  const dispatch = useAppDispatch();
  const { members } = useAppSelector((state) => state.project);
  const { tasksLoading, error } = useAppSelector((state) => state.task);

  const getDefaultDates = () => {
    const today = new Date();
    return {
      startDate: today,
      dueDate: addDays(today, 1),
    };
  };

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    assigneeId: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    ...getDefaultDates(),
  });

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      assigneeId: "",
      priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
      ...getDefaultDates(),
    });
    dispatch(clearTaskError());
  }, [dispatch]);

  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    name: keyof TaskFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (
    name: "startDate" | "dueDate",
    date?: Date
  ) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    if (
      formData.startDate &&
      formData.dueDate &&
      isBefore(formData.dueDate, formData.startDate)
    ) {
      return;
    }

    const payload = {
      projectId,
      title: formData.title.trim(),
      description: formData.description || undefined,
      assigneeId: formData.assigneeId || undefined,
      priority: formData.priority,
      status: formData.status,
      startDate: formData.startDate?.toISOString(),
      dueDate: formData.dueDate?.toISOString(),
    };

    try {
      await dispatch(createTask(payload)).unwrap();
      await dispatch(fetchProjectOverview(projectId));
      await dispatch(fetchRecentProjectActivities({ projectId }));
      onOpenChange(false);
    } catch {
      /* handled in redux */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            Create New Task
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label>Task Name</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="TEST TASK"
              disabled={tasksLoading}
              required
            />
          </div>

          {/* Assignee + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(v) =>
                  handleSelectChange("assigneeId", v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {members?.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) =>
                  handleSelectChange("priority", v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {(["startDate", "dueDate"] as const).map((key) => (
              <div key={key} className="space-y-2">
                <Label>{key === "startDate" ? "Start Date" : "Due Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData[key] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData[key]
                        ? format(formData[key]!, "MMMM do, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={formData[key]}
                      onSelect={(d) => handleDateChange(key, d)}
                      disabled={(date) =>
                        key === "dueDate" &&
                        formData.startDate
                          ? date < formData.startDate
                          : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                handleSelectChange("status", v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "TODO",
                  "IN_PROGRESS",
                  "IN_REVIEW",
                  "COMPLETED",
                  "BACKLOG",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add your description..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={tasksLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={tasksLoading}
            >
              {tasksLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
