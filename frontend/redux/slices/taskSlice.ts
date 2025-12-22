import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

export enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    COMPLETED = "COMPLETED",
    BACKLOG = "BACKLOG"
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}

interface User {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

interface Project {
    id: string;
    name: string;
    workspaceId: string;
    workspace?: {
        id: string;
        name: string;
    };
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: User;
}

interface Attachment {
    id: string;
    filename: string;
    url: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    startDate?: string | null;
    dueDate?: string | null;
    position: number;
    projectId: string;
    createdBy: string;
    assigneeId?: string | null;
    createdAt: string;
    updatedAt: string;
    creator?: User;
    assignedTo?: User | null;
    project?: Project;
    comments?: Comment[];
    attachments?: Attachment[];
}

interface TaskState {
    tasks: Task[];
    tasksLoading: boolean;
    currentTask: Task | null;
    currentTaskLoading: boolean;
    kanbanTasks: Record<TaskStatus, Task[]> | null;
    kanbanLoading: boolean;
    calendarTasks: Task[];
    calendarLoading: boolean;
    timelineTasks: Task[];
    timelineLoading: boolean;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | null;
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    tasksLoading: false,
    currentTask: null,
    currentTaskLoading: false,
    kanbanTasks: null,
    kanbanLoading: false,
    calendarTasks: [],
    calendarLoading: false,
    timelineTasks: [],
    timelineLoading: false,
    pagination: null,
    error: null,
};

interface CreateTaskData {
    projectId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string;
    dueDate?: string;
    assigneeId?: string;
}

interface UpdateTaskData {
    projectId: string;
    taskId: string;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string;
    dueDate?: string;
    assigneeId?: string;
}

interface GetProjectTasksParams {
    projectId: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

interface GetKanbanTasksParams {
    projectId: string;
    view?: "assigned" | "created" | "all";
}

interface MoveTaskKanbanData {
    projectId: string;
    taskId: string;
    toStatus: TaskStatus;
    toPosition: number;
}

interface GetCalendarTasksParams {
    projectId: string;
    startDate?: string;
    endDate?: string;
    view?: "assigned" | "created" | "all";
}

interface GetTimelineTasksParams {
    projectId: string;
    startDate?: string;
    endDate?: string;
    view?: "assigned" | "created" | "all";
}

// Create Task
export const createTask = createAsyncThunk(
    "task/createTask",
    async (data: CreateTaskData, { rejectWithValue }) => {
        try {
            const { projectId, ...taskData } = data;
            const response = await axiosInstance.post(
                `/api/v1/tasks/project/${projectId}/create`,
                taskData
            );
            return response.data.data.task;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to create task"));
        }
    }
);

// Get Task by ID
export const getTaskById = createAsyncThunk(
    "task/getTaskById",
    async ({ projectId, taskId }: { projectId: string; taskId: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/tasks/project/${projectId}/get/${taskId}`);
            return response.data.data.task;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch task"));
        }
    }
);

// Get Project Tasks (with filters and pagination)
export const getProjectTasks = createAsyncThunk(
    "task/getProjectTasks",
    async (params: GetProjectTasksParams, { rejectWithValue }) => {
        try {
            const { projectId, ...queryParams } = params;
            const response = await axiosInstance.get(
                `/api/v1/tasks/project/${projectId}/tasks`,
                { params: queryParams }
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch tasks"));
        }
    }
);

// Update Task
export const updateTask = createAsyncThunk(
    "task/updateTask",
    async (data: UpdateTaskData, { rejectWithValue }) => {
        try {
            const { projectId, taskId, ...updates } = data;
            const response = await axiosInstance.patch(
                `/api/v1/tasks/project/${projectId}/update/${taskId}`,
                updates
            );
            return response.data.data.task;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to update task"));
        }
    }
);

// Delete Task
export const deleteTask = createAsyncThunk(
    "task/deleteTask",
    async ({ projectId, taskId }: { projectId: string; taskId: string }, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/v1/tasks/project/${projectId}/delete/${taskId}`);
            return taskId;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to delete task"));
        }
    }
);

// Get Kanban Tasks
export const getKanbanTasks = createAsyncThunk(
    "task/getKanbanTasks",
    async (params: GetKanbanTasksParams, { rejectWithValue }) => {
        try {
            const { projectId, view } = params;
            const response = await axiosInstance.get(
                `/api/v1/tasks/project/${projectId}/kanban`,
                { params: { view } }
            );
            return response.data.data.kanban;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch kanban tasks"));
        }
    }
);

// Move Task in Kanban
export const moveTaskKanban = createAsyncThunk(
    "task/moveTaskKanban",
    async (data: MoveTaskKanbanData, { rejectWithValue }) => {
        try {
            const { projectId, taskId, ...moveData } = data;
            await axiosInstance.patch(
                `/api/v1/tasks/project/${projectId}/kanban/${taskId}`,
                moveData
            );
            return data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to move task"));
        }
    }
);

// Get Calendar Tasks
export const getCalendarTasks = createAsyncThunk(
    "task/getCalendarTasks",
    async (params: GetCalendarTasksParams, { rejectWithValue }) => {
        try {
            const { projectId, ...queryParams } = params;
            const response = await axiosInstance.get(
                `/api/v1/tasks/project/${projectId}/calender`,
                { params: queryParams }
            );
            return response.data.data.tasks;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch calendar tasks"));
        }
    }
);

// Get Timeline Tasks
export const getTimelineTasks = createAsyncThunk(
    "task/getTimelineTasks",
    async (params: GetTimelineTasksParams, { rejectWithValue }) => {
        try {
            const { projectId, ...queryParams } = params;
            const response = await axiosInstance.get(
                `/api/v1/tasks/project/${projectId}/timeline`,
                { params: queryParams }
            );
            return response.data.data.tasks;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch timeline tasks"));
        }
    }
);

const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {
        clearTaskError: (state) => {
            state.error = null;
        },
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        clearTasks: (state) => {
            state.tasks = [];
            state.pagination = null;
        },
        clearKanbanTasks: (state) => {
            state.kanbanTasks = null;
        },
        // Optimistic update for task status change
        updateTaskStatusOptimistic: (state, action: PayloadAction<{ taskId: string; status: TaskStatus }>) => {
            const task = state.tasks.find(t => t.id === action.payload.taskId);
            if (task) {
                task.status = action.payload.status;
            }
            if (state.currentTask?.id === action.payload.taskId) {
                state.currentTask.status = action.payload.status;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Task
            .addCase(createTask.pending, (state) => {
                state.tasksLoading = true;
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.tasksLoading = false;
                state.tasks.unshift(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.tasksLoading = false;
                state.error = action.payload as string;
            })

            // Get Task by ID
            .addCase(getTaskById.pending, (state) => {
                state.currentTaskLoading = true;
                state.error = null;
            })
            .addCase(getTaskById.fulfilled, (state, action) => {
                state.currentTaskLoading = false;
                state.currentTask = action.payload;
            })
            .addCase(getTaskById.rejected, (state, action) => {
                state.currentTaskLoading = false;
                state.error = action.payload as string;
            })

            // Get Project Tasks
            .addCase(getProjectTasks.pending, (state) => {
                state.tasksLoading = true;
                state.error = null;
            })
            .addCase(getProjectTasks.fulfilled, (state, action) => {
                state.tasksLoading = false;
                state.tasks = action.payload.tasks;
                state.pagination = action.payload.pagination;
            })
            .addCase(getProjectTasks.rejected, (state, action) => {
                state.tasksLoading = false;
                state.error = action.payload as string;
            })

            // Update Task
            .addCase(updateTask.pending, (state) => {
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
                if (state.currentTask?.id === action.payload.id) {
                    state.currentTask = action.payload;
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Delete Task
            .addCase(deleteTask.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter(t => t.id !== action.payload);
                if (state.currentTask?.id === action.payload) {
                    state.currentTask = null;
                }
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Get Kanban Tasks
            .addCase(getKanbanTasks.pending, (state) => {
                state.kanbanLoading = true;
                state.error = null;
            })
            .addCase(getKanbanTasks.fulfilled, (state, action) => {
                state.kanbanLoading = false;
                state.kanbanTasks = action.payload;
            })
            .addCase(getKanbanTasks.rejected, (state, action) => {
                state.kanbanLoading = false;
                state.error = action.payload as string;
            })

            // Move Task Kanban
            .addCase(moveTaskKanban.pending, (state) => {
                state.error = null;
            })
            .addCase(moveTaskKanban.fulfilled, (state) => {
                // Task position will be updated when kanban is refetched
            })
            .addCase(moveTaskKanban.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Get Calendar Tasks
            .addCase(getCalendarTasks.pending, (state) => {
                state.calendarLoading = true;
                state.error = null;
            })
            .addCase(getCalendarTasks.fulfilled, (state, action) => {
                state.calendarLoading = false;
                state.calendarTasks = action.payload;
            })
            .addCase(getCalendarTasks.rejected, (state, action) => {
                state.calendarLoading = false;
                state.error = action.payload as string;
            })

            // Get Timeline Tasks
            .addCase(getTimelineTasks.pending, (state) => {
                state.timelineLoading = true;
                state.error = null;
            })
            .addCase(getTimelineTasks.fulfilled, (state, action) => {
                state.timelineLoading = false;
                state.timelineTasks = action.payload;
            })
            .addCase(getTimelineTasks.rejected, (state, action) => {
                state.timelineLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearTaskError,
    clearCurrentTask,
    clearTasks,
    clearKanbanTasks,
    updateTaskStatusOptimistic,
} = taskSlice.actions;

export default taskSlice.reducer;
