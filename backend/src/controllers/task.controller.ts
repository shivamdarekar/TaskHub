import { Request, Response } from "express";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import prisma from "../config/prisma";
import { ActivityType, logActivity } from "../services/activityLogger";
import { ApiResponse } from "../utils/apiResponse";

interface CreateTaskBody {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string;
    dueDate?: string;
    assigneeId?: string;
}

interface UpdateTaskBody {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    startDate?: string;
    dueDate?: string;
    assigneeId?: string;
}

const formatStatusForDisplay = (status: TaskStatus): string => {
    const statusMap: Record<TaskStatus, string> = {
        [TaskStatus.TODO]: "To Do",
        [TaskStatus.IN_PROGRESS]: "In Progress",
        [TaskStatus.IN_REVIEW]: "In Review",
        [TaskStatus.COMPLETED]: "Completed",
        [TaskStatus.BACKLOG]: "Backlog",
        // Add BLOCKED if you have it in your enum
    };
    return statusMap[status] || status;
};

// helper function to truncate long titles for activity logs
const truncateTitle = (title: string, maxLength: number = 50): string => {
    return title.length > maxLength ? `${title.substring(0, maxLength - 3)}...` : title;
};


export const createTask = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, status, priority, startDate, dueDate, assigneeId }: CreateTaskBody = req.body;
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(400, "Not Authorized");
    if (!projectId) throw new ApiError(401, "Project Id is required");
    if (!title || !title.trim()) throw new ApiError(401, "Task title is required");

    //if assigneeId provided verify they have access to project
    if (assigneeId) {
        const assigneeAccess = await prisma.projectAccess.findFirst({
            where: {
                projectId,
                workspaceMember: { userId: assigneeId },
                hasAccess: true,
            }
        });

        if (!assigneeAccess) throw new ApiError(400, "Assignee doesn't have access to this project");
    }

    //get last position
    const lastTask = await prisma.task.findFirst({
        where: { projectId },
        orderBy: { position: "desc" },
        select: { position: true },
    });

    const task = await prisma.task.create({
        data: {
            title: title.trim(),
            description: description?.trim() || null,
            status: status || TaskStatus.TODO,
            priority: priority || TaskPriority.LOW,
            startDate: startDate ? new Date(startDate) : null,
            dueDate: dueDate ? new Date(dueDate) : null,
            projectId,
            createdBy: userId,
            assigneeId: assigneeId || null,
            position: (lastTask?.position || 0) + 1
        },
        include: {
            creator: {
                select: { id: true, name: true, email: true },
            },
            assignedTo: {
                select: { id: true, name: true, email: true }
            },
            project: {
                select: { id: true, name: true }
            }
        }
    });

    if (!task) throw new ApiError(403, "Failed to create task");

    logActivity({
        type: ActivityType.TASK_CREATED,
        description: `Created Task "${title}"`,
        userId,
        projectId,
        taskId: task.id
    }).catch(console.error);

    return res.status(201).json(
        new ApiResponse(201, { task }, "Task created successfully")
    )
});


export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!taskId) throw new ApiError(400, "Task ID is required");

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            creator: {
                select: { id: true, name: true, email: true },
            },
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            project: {
                select: {
                    id: true,
                    name: true,
                    workspaceId: true,
                    workspace: {
                        select: { id: true, name: true }
                    }
                }
            },
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            attachments: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!task) throw new ApiError(404, "Task not found");

    return res.status(200).json(
        new ApiResponse(200, { task }, "Task fetched successfully")
    )
});


//for task table get all project tasks
export const getProjectTasks = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const {
        status, priority,
        assigneeId, search,
        page = "1",
        limit = "20",
        sortBy = "position",
        sortOrder = "asc",
    } = req.query;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!projectId) throw new ApiError(400, "Project ID is required");

    const filters: any = { projectId };

    if (status) filters.status = status as TaskStatus;
    if (priority) filters.priority = priority as TaskPriority;
    if (assigneeId) filters.assigneeId = assigneeId as string;
    if (search && typeof search === 'string' && search.trim()) {
        filters.OR = [
            { title: { contains: search.trim(), mode: 'insensitive' } },
            { description: { contains: search.trim(), mode: 'insensitive' } }
        ];
    }

    const pageNumber = Math.max(parseInt(page as string, 10), 1);
    const pageSize = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [tasks, total] = await prisma.$transaction([
        prisma.task.findMany({
            where: filters,
            include: {
                creator: {
                    select: { id: true, name: true, email: true },
                },
                assignedTo: {
                    select: { id: true, name: true }
                }
            },
            orderBy: {
                [sortBy as string]: sortOrder === "desc" ? "desc" : "asc",
            },
            skip,
            take: pageSize,
        }),
        prisma.task.count({ where: filters }),
    ]);

    return res.status(200).json(
        new ApiResponse(200,
            {
                tasks,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: pageSize,
                    totalPages: Math.ceil(total / pageSize),
                }
            },
            "Tasks fetch successfully"
        )
    );
});


export const updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id;
    const updates: UpdateTaskBody = req.body;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!taskId) throw new ApiError(400, "TaskId & ProjectId is required");

    const existingTask = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
            title: true,
            description: true,
            status: true,
            priority: true,
            startDate: true,
            dueDate: true,
            assigneeId: true,
            projectId: true
        }
    });

    if (!existingTask) throw new ApiError(404, "Task not found");

    //changing assignee, verify they have access
    if (updates.assigneeId !== undefined && updates.assigneeId !== existingTask.assigneeId) {
        if (updates.assigneeId) {
            const assigneeAccess = await prisma.projectAccess.findFirst({
                where: {
                    projectId: existingTask.projectId,
                    workspaceMember: { userId: updates.assigneeId },
                    hasAccess: true
                }
            });

            if (!assigneeAccess) {
                throw new ApiError(400, "Assignee doesn't have access to the project");
            }
        }
    }

    const updateData: any = {};
    if (updates.title !== undefined) {
        if (!updates.title.trim()) {
            throw new ApiError(400, "Task title cannot be empty");
        }
        updateData.title = updates.title.trim();
    }
    if (updates.description !== undefined) updateData.description = updates.description.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate ? new Date(updates.startDate) : null;
    if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId || null;

    const task = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
            creator: {
                select: { id: true, name: true, email: true }
            },
            assignedTo: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    if (!task) throw new ApiError(403, "Failed to update task");

    // Log significant changes
    if (updates.status && updates.status !== existingTask.status) {
        logActivity({
            type: ActivityType.TASK_STATUS_CHANGED,
            description: `Changed task "${task.title}" status from ${existingTask.status} to ${updates.status}`,
            userId,
            projectId: existingTask.projectId,
            taskId: task.id
        }).catch(console.error);
    }

    if (updates.priority && updates.priority != existingTask.priority) {
        logActivity({
            type: ActivityType.TASK_PRIORITY_CHANGED,
            description: `Changed task "${task.title}" priority from ${existingTask.priority} to ${updates.priority}`,
            userId,
            projectId: existingTask.projectId,
            taskId: task.id
        }).catch(console.error);
    }

    if (updates.assigneeId !== undefined && updates.assigneeId !== existingTask.assigneeId) {
        logActivity({
            type: ActivityType.TASK_ASSIGNED,
            description: updates.assigneeId
                ? `Assigned task "${task.title}" to ${task.assignedTo?.name}`
                : `Unassigned task "${task.title}"`,
            userId,
            projectId: existingTask.projectId,
            taskId: task.id
        }).catch(console.error);
    }

    return res.status(200).json(
        new ApiResponse(200, { task }, "Task updated successfully")
    )
});


export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!taskId) throw new ApiError(400, "TaskId and ProjectId is required");

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { title: true, projectId: true },
    });

    if (!task) throw new ApiError(404, "Task not found");

    await prisma.task.delete({
        where: { id: taskId }
    });

    logActivity({
        type: ActivityType.TASK_DELETED,
        description: `Deleted Task "${task.title}"`,
        userId,
        projectId: task.projectId,
        taskId: taskId
    }).catch(console.error);

    return res.status(200).json(
        new ApiResponse(200, {}, "Task deleted successfully")
    )
});


//update task position & status(for drag and drop)
//filter in ui all assign to me and my tasks and unassign tasks
export const getKanbanTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user?.id;
  const { view } = req.query;

  if (!userId) throw new ApiError(401, "Not Authorized");
  if (!projectId) throw new ApiError(400, "Project ID is required");

  const where: any = { projectId };

  if (view === "assigned") {
    where.assigneeId = userId;
  }

  if (view === "created") {
    where.createdBy = userId;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [
      { status: "asc" },
      { position: "asc" },
    ],
    select: {
      id: true,
      title: true,
      description:true,
      status: true,
      priority: true,
      position: true,
      assigneeId: true,
      assignedTo: {
        select: { id: true, name: true },
      },
      dueDate: true,
    },
  });

  const kanban = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, typeof tasks>);

  return res.json(
    new ApiResponse(200, { kanban }, "Kanban tasks fetched successfully")
  );
});


export const moveTaskKanban = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { toStatus, toPosition } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(400, "Not authorized");
    if (!taskId) throw new ApiError(401, "TaskId is required");

    if (!Object.values(TaskStatus).includes(toStatus)) {
        throw new ApiError(400, "Invalid task status");
    }

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true, title:true, status: true, position: true, projectId: true }
    });

    if (!task) throw new ApiError(404, "Task not found");

    const oldStatus = task.status

    await prisma.$transaction(async (tx) => {
        //close gap in old column
        await tx.task.updateMany({
            where: {
                projectId: task.projectId,
                status: task.status,
                position: { gt: task.position }
            },
            data: { position: { decrement: 1 } }
        });

        //make space in new column
        await tx.task.updateMany({
            where: {
                projectId: task.projectId,
                status: toStatus,
                position: { gte: toPosition }
            },
            data: { position: { increment: 1 } }
        });

        //move task
        await tx.task.update({
            where: { id: taskId },
            data: {
                status: toStatus,
                position: toPosition
            }
        });
    });

    if (oldStatus !== toStatus) {
        logActivity({
            type: ActivityType.TASK_STATUS_CHANGED,
            description: `Moved task "${truncateTitle(task.title)}" from ${formatStatusForDisplay(oldStatus)} to ${formatStatusForDisplay(toStatus)}`,
            userId,
            projectId: task.projectId,
            taskId: task.id
        }).catch(console.error);
    }
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Task move successfully")
    )
});


export const getCalendarTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user?.id;
  const { startDate, endDate, view } = req.query;

  if (!userId) throw new ApiError(401, "Not Authorized");
  if (!projectId) throw new ApiError(400, "Project ID is required");

  const where: any = { projectId };

  if (startDate || endDate) {
    where.OR = [
      {
        dueDate: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      {
        startDate: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
    ];
  }

  if (view === "assigned") where.assigneeId = userId;
  if (view === "created") where.createdBy = userId;

  const tasks = await prisma.task.findMany({
    where,
    select: {
      id: true,
      title: true,
      startDate: true,
      dueDate: true,
      status: true,
      priority: true,
      assignedTo: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ dueDate: "asc" }],
  });

  return res.json(
    new ApiResponse(
      200,
      { tasks },
      "Calendar tasks fetched successfully"
    )
  );
});


export const getTimelineTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user?.id;
  const { startDate, endDate, view } = req.query;

  if (!userId) throw new ApiError(401, "Not Authorized");
  if (!projectId) throw new ApiError(400, "Project ID is required");

  const where: any = {
    projectId,
    startDate: { not: null },
    dueDate: { not: null },
  };

  if (startDate && endDate) {
    where.AND = [
      { startDate: { lte: new Date(endDate as string) } },
      { dueDate: { gte: new Date(startDate as string) } },
    ];
  }

  if (view === "assigned") where.assigneeId = userId;
  if (view === "created") where.createdBy = userId;

  const tasks = await prisma.task.findMany({
    where,
    select: {
      id: true,
      title: true,
      startDate: true,
      dueDate: true,
      status: true,
      priority: true,
      assignedTo: {
        select: { id: true, name: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return res.json(
    new ApiResponse(
      200,
      { tasks },
      "Timeline tasks fetched successfully"
    )
  );
});


// Get user's tasks across all projects in a workspace
export const getUserTasks = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const userId = req.user?.id;
  const {
    status, priority,
    search,
    page = "1",
    limit = "20",
    sortBy = "dueDate",
    sortOrder = "asc",
  } = req.query;

  if (!userId) throw new ApiError(401, "Not Authorized");
  if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

  const filters: any = {
    assigneeId: userId,
    project: {
      workspaceId: workspaceId
    }
  };

  if (status) filters.status = status as TaskStatus;
  if (priority) filters.priority = priority as TaskPriority;
  if (search && typeof search === 'string' && search.trim()) {
    filters.OR = [
      { title: { contains: search.trim(), mode: 'insensitive' } },
      { description: { contains: search.trim(), mode: 'insensitive' } }
    ];
  }

  const pageNumber = Math.max(parseInt(page as string, 10), 1);
  const pageSize = Math.min(parseInt(limit as string, 10), 100);
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where: filters,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder === "desc" ? "desc" : "asc",
      },
      skip,
      take: pageSize,
    }),
    prisma.task.count({ where: filters }),
  ]);

  return res.status(200).json(
    new ApiResponse(200,
      {
        tasks,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      },
      "User tasks fetched successfully"
    )
  );
});



