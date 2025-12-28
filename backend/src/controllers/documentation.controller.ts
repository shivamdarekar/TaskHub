import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import prisma from "../config/prisma";
import { ApiResponse } from "../utils/apiResponse";

// Save or update documentation for a task
export const saveTaskDocumentation = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { documentation } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!taskId) throw new ApiError(400, "TaskId is required");
    if (typeof documentation !== "string") throw new ApiError(400, "Documentation is required");

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new ApiError(404, "Task not found");

    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { documentation },
    });

    return res.status(200).json(new ApiResponse(200, { documentation: updatedTask.documentation }, "Documentation saved successfully"));
});

// Get documentation for a task
export const getTaskDocumentation = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!taskId) throw new ApiError(400, "TaskId is required");

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { documentation: true },
    });
    if (!task) throw new ApiError(404, "Task not found");

    return res.status(200).json(new ApiResponse(200, { documentation: task.documentation }, "Documentation fetched successfully"));
});

// Save or update documentation for a project
export const saveProjectDocumentation = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!projectId) throw new ApiError(400, "ProjectId is required");
    if (typeof content !== "string") throw new ApiError(400, "Content is required");

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new ApiError(404, "Project not found");

    const documentation = await prisma.documentation.upsert({
        where: { projectId },
        update: { content, updatedBy: userId },
        create: { projectId, content, updatedBy: userId },
    });

    return res.status(200).json(new ApiResponse(200, { content: documentation.content }, "Project documentation saved successfully"));
});

// Get documentation for a project
export const getProjectDocumentation = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!projectId) throw new ApiError(400, "ProjectId is required");

    const documentation = await prisma.documentation.findUnique({
        where: { projectId },
        select: { content: true },
    });

    return res.status(200).json(new ApiResponse(200, { content: documentation?.content || "" }, "Project documentation fetched successfully"));
});
