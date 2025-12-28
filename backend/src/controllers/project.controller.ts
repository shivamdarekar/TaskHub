import prisma from "../config/prisma";
import { logActivity, ActivityType } from "../services/activityLogger";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asynchandler";
import { Request, Response } from "express";

interface ProjectBody {
    name: string;
    description?: string;
    memberIds?: string[]; //array of user IDs to grant access
}

interface UpdateProjectBody {
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

    if (!project) throw new ApiError(500, "Error while creating project")

    //log activity (async, doesn't block response if it fails)
    logActivity({
        type: ActivityType.PROJECT_CREATED,
        description: `Created Project ${name}`,
        userId,
        projectId: project.id,
    }).catch((err) => {
        console.error(`Failed to log activity for project ${project.id}:`, err);
        // Don't throw - activity logging failure shouldn't break the response
    });

    return res.status(201).json(
        new ApiResponse(201, { project }, "Project created successfully")
    );
});


export const getProjectBasicInfo = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) throw new ApiError(400, "ProjectId is required");

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            workspace: {
                select: {
                    id: true,
                    name: true,
                },
            },
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!project) throw new ApiError(404, "Project not found");

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project data fetched"));
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

        // Optimize query: limit tasks to avoid N+1 problem, use _count for totals
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                tasks: {
                    select: {
                        id: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                        createdAt: true,
                        assigneeId: true,
                    },
                    take: 100
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
                        tasks: true,  // Use _count for total count
                    },
                },
            },
        });

        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        // Calculate statistics from loaded tasks (up to 100)
        const total = project._count.tasks;
        const completed = project.tasks.filter(t => t.status === "COMPLETED").length;
        const overdue = project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED").length;

        const tasksByStatus = {
            TODO: project.tasks.filter(t => t.status === "TODO").length,
            IN_PROGRESS: project.tasks.filter(t => t.status === "IN_PROGRESS").length,
            IN_REVIEW: project.tasks.filter(t => t.status === "IN_REVIEW").length,
            COMPLETED: completed,
            BACKLOG: project.tasks.filter(t => t.status === "BACKLOG").length,
        };

        const tasksByPriority = {
            LOW: project.tasks.filter(t => t.priority === "LOW").length,
            MEDIUM: project.tasks.filter(t => t.priority === "MEDIUM").length,
            HIGH: project.tasks.filter(t => t.priority === "HIGH").length,
            CRITICAL: project.tasks.filter(t => t.priority === "CRITICAL").length,
        };


        return res.status(200).json(new ApiResponse(200, {
            stats: {
                totalTasks: total,
                completedTasks: completed,
                overdueTasks: overdue,
                totalComments: project._count.comments,
                totalFiles: project._count.files,
                totalMembers: project.projectAccess.length,
            },
            tasksByStatus,
            tasksByPriority,
        }, "Overview fetched"));
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

    const currentProject = await prisma.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            name: true,
            description: true,
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

    //log activity (async, doesn't block response if it fails)
    const changes: string[] = [];
    if (name && name !== currentProject?.name) changes.push(`name to "${name}"`);
    if (description !== undefined && description?.trim() !== currentProject?.description) {
        changes.push(description);
    }

    if (changes.length > 0) {
        logActivity({
            type: ActivityType.PROJECT_UPDATED,
            description: `Updated project ${changes.join(" and ")}`,
            userId,
            projectId,
        }).catch((err) => {
            console.error(`Failed to log activity for project ${projectId}:`, err);
            // Don't throw - activity logging failure shouldn't break the response
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

    // Log deletion (async, doesn't block response if it fails)
    logActivity({
        type: ActivityType.PROJECT_DELETED,
        description: `Deleted project "${project.name}"`,
        userId,
        projectId,
    }).catch((err) => {
        console.error(`Failed to log activity for project ${projectId}:`, err);
        // Don't throw - activity logging failure shouldn't break the response
    });

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
                    },
                    "Project members fetch successfully"
                )
            )
    });


export const getProjectActivities = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new ApiError(401, "Not Authorized");
  if (!projectId) throw new ApiError(400, "Project ID is required");

  const {
    page = "1",
    limit = "20",
  } = req.query;

  const pageNumber = Math.max(parseInt(page as string, 10), 1);
  const pageSize = Math.min(Math.max(parseInt(limit as string, 10), 1), 100);
  const skip = (pageNumber - 1) * pageSize;

  const [activities, total] = await prisma.$transaction([
    prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.activity.count({
      where: { projectId },
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        activities,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
          hasNext: pageNumber * pageSize < total,
          hasPrev: pageNumber > 1,
        },
      },
      "Project activities fetched successfully"
    )
  );
});


export const getRecentProjectActivities = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    if (!projectId) throw new ApiError(401, "ProjectId is required");
    
  const activities = await prisma.activity.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return res.json(
    new ApiResponse(
      200,
      { activities },
      "Recent activities fetched"
    )
  );
});
