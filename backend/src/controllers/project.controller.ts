import prisma from "../config/prisma";
import { getRecentActivities, logActivity, ActivityType } from "../services/activityLogger";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asynchandler";
import { Request, Response } from "express";

interface ProjectBody{
    name: string;
    description?: string;
    memberIds?: string[]; //array of user IDs to grant access
}

interface UpdateProjectBody{
    name?: string;
    description?: string;
}

export const createProject = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, memberIds }: ProjectBody = req.body;
    const { workspaceId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(401, "WorkspaceId is required");
    if (!name?.trim()) throw new ApiError(400, "Project name is required");

    //find the workspace member id of the creator
    const creatorMembership = await prisma.workspaceMembers.findUnique({
        where: {
            userId_workspaceId: { userId, workspaceId },
        }
    });

    if (!creatorMembership) {
        throw new ApiError(403, "You are not a member of this workspace");
    }

    const project = await prisma.$transaction(async (tx) => {
        const newProject = await tx.project.create({
            data: {
                name: name.trim(),
                description: description?.trim() ?? null,
                createdBy: userId,
                workspaceId,
            }
        });

        //give access to creator
        await tx.projectAccess.create({
            data: {
                projectId: newProject.id,
                workspaceMemberId: creatorMembership.id,
                hasAccess: true
            }
        });

        //grant access to other members(other than owner)
        if (memberIds && memberIds.length > 0) {
            const validMembers = await tx.workspaceMembers.findMany({
                where: {
                    workspaceId,
                    userId: { in: memberIds }
                }
            });

            const accessRecords = validMembers.map((m) => ({
                projectId: newProject.id,
                workspaceMemberId: m.id,
                hasAccess: true,
            }))

            await tx.projectAccess.createMany({ data: accessRecords })
        }

        return newProject;
    });

    if(!project) throw new ApiError(500,"Error while creating project")

    //log activity
        await logActivity({
            type: ActivityType.PROJECT_CREATED,
            description: `Created Project ${name}`,
            userId,
            projectId: project.id,
        });

    return res.status(201).json(
        new ApiResponse(201, { project }, "Project created successfully")
    );
});


export const getProjectById = asyncHandler(
    async (req: Request, res: Response) => {
        const { projectId } = req.params;
        if (!projectId) throw new ApiError(401, "ProjectId is required");

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        ownerId: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                projectAccess: {
                    where: { hasAccess: true },
                    include: {
                        workspaceMember: {
                            include: {
                                User: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            },
                        }
                    }
                },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                        assigneeId: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        comments: true,
                        files: true
                    }
                }
            }
        });

        if (!project) throw new ApiError(404, "Project not found");

        const members = project.projectAccess.map((p) => ({
            id: p.workspaceMember.User.id,
            name: p.workspaceMember.User.name,
            email: p.workspaceMember.User.email,
            accessLevel: p.workspaceMember.accessLevel,
            joinAt: p.createdAt
        }));

        const projectData = {
            id: project.id,
            name: project.name,
            description: project.description,
            workspace: project.workspace,
            members,
            totalComments: project._count.comments,
            totalFiles: project._count.files,
            totalTasks: project._count.tasks,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };

        return res.status(200).json(
            new ApiResponse(200, projectData, "Project fetched successfully")
        )
});


export const getWorkspaceProjects = asyncHandler(
    async (req: Request, res: Response) => {
        const { workspaceId } = req.params;
        const userId = req.user?.id;

        if (!workspaceId) throw new ApiError(401, "workspaceId is required");
        if (!userId) throw new ApiError(400, "Not Authorized");

        // Check if user is workspace owner
        const workspace = await prisma.workSpace.findUnique({
            where: { id: workspaceId },
            select: { ownerId: true }
        });

        if (!workspace) throw new ApiError(404, "Workspace not found");

        const isOwner = workspace.ownerId === userId;

        // If not owner, check membership
        if (!isOwner) {
            const membership = await prisma.workspaceMembers.findUnique({
                where: {
                    userId_workspaceId: { userId, workspaceId },
                }
            });

            if (!membership) throw new ApiError(403, "No access to workspace");

            // Members see only projects they have access to
            const projects = await prisma.project.findMany({
                where: {
                    workspaceId,
                    projectAccess: {
                        some: {
                            workspaceMemberId: membership.id,
                            hasAccess: true,
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            tasks: true,
                            comments: true,
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
            });

            return res.status(200).json(
                new ApiResponse(200, { projects }, "Workspace projects fetched")
            );
        }

        // Owner sees ALL projects in the workspace
        const projects = await prisma.project.findMany({
            where: {
                workspaceId,
            },
            include: {
                _count: {
                    select: {
                        tasks: true,
                        comments: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(
            new ApiResponse(200, { projects }, "Workspace projects fetched successfully")
        )
    }
);


export const getProjectOverview = asyncHandler(
    async (req: Request, res: Response) => {
        const { projectId } = req.params;

        if (!projectId) throw new ApiError(401, "ProjectId is required");

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                        createdAt: true,
                        assigneeId: true,
                    },
                },
                projectAccess: {
                    where: { hasAccess: true },
                    select: { id: true },
                },
                _count: {
                    select: {
                        comments: true,
                        files: true,
                        activities: true,
                    },
                },
            },
        });

        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        // Calculate statistics
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter((t) => t.status === "COMPLETED").length;
        const overdueTasks = project.tasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED"
        ).length;
        const unassignedTasks = project.tasks.filter((t) => !t.assigneeId).length;

        const tasksByStatus = {
            TODO: project.tasks.filter((t) => t.status === "TODO").length,
            IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS").length,
            IN_REVIEW: project.tasks.filter((t) => t.status === "IN_REVIEW").length,
            COMPLETED: completedTasks,
            BACKLOG: project.tasks.filter((t) => t.status === "BACKLOG").length,
        };

        const tasksByPriority = {
            LOW: project.tasks.filter((t) => t.priority === "LOW").length,
            MEDIUM: project.tasks.filter((t) => t.priority === "MEDIUM").length,
            HIGH: project.tasks.filter((t) => t.priority === "HIGH").length,
            CRITICAL: project.tasks.filter((t) => t.priority === "CRITICAL").length,
        };

        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Get recent activities (last 10)
        const recentActivities = await getRecentActivities(projectId, 10);

        const overview = {
            projectId: project.id,
            projectName: project.name,
            projectDescription: project.description,
            workspace: project.workspace,
            stats: {
                totalTasks,
                completedTasks,
                overdueTasks,
                unassignedTasks,
                completionRate: Math.round(completionRate * 10) / 10,
                totalMembers: project.projectAccess.length,
                totalComments: project._count.comments,
                totalFiles: project._count.files,
                totalActivities: project._count.activities,
            },
            tasksByStatus,
            tasksByPriority,
            recentActivities,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };

        return res
            .status(200)
            .json(
                new ApiResponse(200, overview, "Project overview fetched successfully")
            );
    }
);


export const updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { name, description }: UpdateProjectBody = req.body;
    const userId = req.user?.id;

    if (!projectId) throw new ApiError(401, "ProjectId is required")
    if (!userId) throw new ApiError(400, "Not Authorized");

    if (!name && description === undefined) {
        throw new ApiError(400, "Atleast one field is required");
    }

    const cuurentProject = await prisma.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            name: true
        },
    });

    const updatedProject = await prisma.project.update({
        where: {
            id: projectId
        },
        data: {
            ...(name && { name }),
            ...(description != undefined && { description: description?.trim() ?? null }),
        },
        include: {
            workspace: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });

    if (!updatedProject) throw new ApiError(401, "Failed to update project");

    //log acticity
    const changes: string[] = [];
    if (name && name !== cuurentProject?.name) changes.push(`name to "${name}"`);
    if (description !== undefined) changes.push("description");

    if (changes.length > 0) {
        await logActivity({
            type: ActivityType.PROJECT_UPDATED,
            description: `Updated project ${changes.join(" and ")}`,
            userId,
            projectId,
        });
    }

    return res.status(200)
        .json(
            new ApiResponse(200, updatedProject, "Project updated successfully")
        )
});


export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!projectId) throw new ApiError(401, "ProjectId is required");
    if (!userId) throw new ApiError(400, "Not authorized");

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            name: true,
            workspaceId: true,
        }
    });

    if (!project) throw new ApiError(404, "Project not found");

    const deleteProject = await prisma.project.delete({
        where: { id: projectId },
    });

    if (!deleteProject) throw new ApiError(403, "Error while deleting the Project");

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Project deleted successfully")
        )
});


export const getProjectMembers = asyncHandler(
    async (req: Request, res: Response) => {
        const { projectId } = req.params;
        if (!projectId) throw new ApiError(401, "ProjectId is required");

        const projectAccess = await prisma.projectAccess.findMany({
            where: {
                projectId,
                hasAccess: true,
            },
            include: {
                workspaceMember: {
                    include: {
                        User: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                lastLogin: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "asc",
            }
        });

        const members = projectAccess.map((access) => ({
            workspaceMemberId: access.workspaceMemberId,
            userId: access.workspaceMember.User.id,
            name: access.workspaceMember.User.name,
            email: access.workspaceMember.User.email,
            lastLogin: access.workspaceMember.User.lastLogin,
            accessLevel: access.workspaceMember.accessLevel,
            joinedAt: access.createdAt,
        }));

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        members,
                        total: members.length
                    },
                    "Project members fetch successfully"
                )
            )
});


export const getProjectActivities = asyncHandler(
    async(req:Request, res:Response) => {
        const {projectId} = req.params;
        if(!projectId) throw new ApiError(401, "ProjectId is required");

        const limit = parseInt(req.query.limit as string) || 50;

        const activities = await prisma.activity.findMany({
            where:{
                projectId,
            },
            include:{
                user: {
                    select:{
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {createdAt: "desc"},
            take: limit,
        });

        if(!activities) throw new ApiError(404, "No activity found for this project");

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        activities
                    },
                    "Project activities fetched successfully"
                )
            )
    });