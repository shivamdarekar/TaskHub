import prisma from "../config/prisma";
import { logActivity, ActivityType } from "../services/activityLogger";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asynchandler";
import { Request, Response } from "express";

interface CreateCommentBody {
    content: string
}

interface UpdateCommentBody {
    content: string
}

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const { content }: CreateCommentBody = req.body;
    const { taskId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(400, "Not Authorized");
    if (!taskId) throw new ApiError(401, "TaskId is required");
    if (!content || !content.trim()) throw new ApiError(402, "Content is required");

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true }
    });

    if (!task) throw new ApiError(404, "Task not found");

    const comment = await prisma.comment.create({
        data: {
            content: content.trim(),
            userId,
            taskId,
            projectId: task.projectId
        },
        include: {
            user: {
                select: { id: true, name: true }
            }
        }
    });

    if (!comment) throw new ApiError(403, "Failed to create comment");

    //log activity
    logActivity({
        type: ActivityType.COMMENT_ADDED,
        description: `Added a comment`,
        userId,
        projectId: task.projectId
    });

    return res.status(200).json(
        new ApiResponse(201, { comment }, "Comment created successfully")
    );
});


// get all comments
export const getProjectComments = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!projectId) throw new ApiError(400, "Project ID is required");

    const {
        page = "1",
        limit = "15",
    } = req.query;

    const pageNumber = Math.max(parseInt(page as string, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit as string, 10), 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const where = { projectId };

    const [comments, total] = await prisma.$transaction([
        prisma.comment.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                task: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.comment.count({ where }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: pageSize,
                    totalPages: Math.ceil(total / pageSize),
                    hasNext: pageNumber * pageSize < total,
                    hasPrev: pageNumber > 1,
                },
            },
            "Project comments fetched successfully"
        )
    );
});


export const getRecentProjectComments = asyncHandler(
    async (req: Request, res: Response) => {
        const { projectId } = req.params;
        const userId = req.user?.id;

        if (!userId) throw new ApiError(401, "Not Authorized");
        if (!projectId) throw new ApiError(400, "Project ID is required");

        const limit = Math.min(
            parseInt(req.query.limit as string) || 10,
            50
        );

        const comments = await prisma.comment.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, name: true },
                },
                task: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                { comments },
                "Recent project comments fetched successfully"
            )
        );
    }
);


// GET ALL COMMENTS FOR A SPECIFIC TASK (for task detail page)
export const getTaskComments = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!taskId) throw new ApiError(400, "TaskId is required");

    const comments = await prisma.comment.findMany({
        where: { taskId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePicture: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(
        new ApiResponse(200, { comments, count: comments.length }, "Task comments retrieved successfully")
    );
});


export const updateComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!commentId) throw new ApiError(400, "CommentId is required");
    if (!content?.trim()) throw new ApiError(400, "Content is required");

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true, projectId: true },
    });

    if (!existingComment) throw new ApiError(404, "Comment not found");

    // Only comment author can update
    if (existingComment.userId !== userId) {
        throw new ApiError(403, "You can only edit your own comments");
    }

    const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { content: content.trim() },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePicture: true,
                },
            },
        },
    });

    // Log activity
    logActivity({
        type: ActivityType.COMMENT_UPDATED,
        description: `Updated a comment`,
        userId,
        projectId: existingComment.projectId,
    }).catch(console.error);

    return res.status(200).json(
        new ApiResponse(200, { comment }, "Comment updated successfully")
    );
});


export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!commentId) throw new ApiError(400, "CommentId is required");

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true, projectId: true },
    });

    if (!comment) throw new ApiError(404, "Comment not found");

    // only comment author can delete
    if (comment.userId !== userId) {
        throw new ApiError(403, "You can only delete your own comments");
    }

    await prisma.comment.delete({
        where: { id: commentId },
    });

    // log activity
    logActivity({
        type: ActivityType.COMMENT_DELETED,
        description: `Deleted a comment`,
        userId,
        projectId: comment.projectId,
    }).catch(console.error);

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

