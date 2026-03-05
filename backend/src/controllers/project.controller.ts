import prisma from "../config/prisma";
import { logActivity, ActivityType } from "../services/activityLogger";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asynchandler";
import { Request, Response } from "express";
import { getCache, setCache, CacheTTL, deleteCache } from "../config/cache.service";
import { CacheKeys } from "../utils/cacheKeys";
import { invalidateProjectCache } from "../utils/cacheInvalidation";

interface ProjectBody {
    name: string;
    description?: string;
    memberIds?: string[]; // array of WORKSPACE MEMBER IDs (not user IDs) to grant access
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

    // Find the workspace member id of the creator
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

        // Grant access to selected members (if any)
        // FIXED: memberIds are WORKSPACE MEMBER IDs, not user IDs
        if (memberIds && memberIds.length > 0) {
            // Validate that all memberIds belong to this workspace
            const validMembers = await tx.workspaceMembers.findMany({
                where: {
                    workspaceId,
                    id: { in: memberIds } 
                }
            });

            if (validMembers.length > 0) {
                const accessRecords = validMembers.map((m) => ({
                    projectId: newProject.id,
                    workspaceMemberId: m.id,
                    hasAccess: true,
                }));

                await tx.projectAccess.createMany({ 
                    data: accessRecords,
                    skipDuplicates: true 
                });
            }
        }

        // Always grant access to the creator (owner) - use upsert to avoid duplicates
        // This ensures creator always has access even if they selected themselves
        await tx.projectAccess.upsert({
            where: {
                workspaceMemberId_projectId: {
                    workspaceMemberId: creatorMembership.id,
                    projectId: newProject.id,
                }
            },
            create: {
                projectId: newProject.id,
                workspaceMemberId: creatorMembership.id,
                hasAccess: true,
            },
            update: {
                hasAccess: true,
            }
        });

        return newProject;
    });

    if (!project) throw new ApiError(500, "Error while creating project")

    // Invalidate workspace projects cache
    await deleteCache(CacheKeys.workspaceProjects(workspaceId));

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
        const start = Date.now();
        const { workspaceId } = req.params;
        const userId = req.user?.id;

        if (!workspaceId) throw new ApiError(401, "workspaceId is required");
        if (!userId) throw new ApiError(400, "Not Authorized");

        // Try cache first
        const cacheKey = CacheKeys.workspaceProjects(workspaceId);
        const cachedProjects = await getCache(cacheKey);
        
        if (cachedProjects) {
            console.log(`✅ CACHE HIT ⚡ [getWorkspaceProjects] | Key: ${cacheKey} | Time: ${Date.now() - start}ms`);
            return res.status(200).json(
                new ApiResponse(200, { projects: cachedProjects }, "Workspace projects fetched")
            );
        }

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

            // Cache for 10 minutes
            await setCache(cacheKey, projects, CacheTTL.MEDIUM * 2);
            console.log(`❌ CACHE MISS 🐢 [getWorkspaceProjects] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

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

        // Cache for 10 minutes
        await setCache(cacheKey, projects, CacheTTL.MEDIUM * 2);
        console.log(`❌ CACHE MISS 🐢 [getWorkspaceProjects] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

        return res.status(200).json(
            new ApiResponse(200, { projects }, "Workspace projects fetched successfully")
        )
    }
);


export const getProjectOverview = asyncHandler(
    async (req: Request, res: Response) => {
        const start = Date.now();
        const { projectId } = req.params;

        if (!projectId) throw new ApiError(401, "ProjectId is required");

        // Try cache first
        const cacheKey = CacheKeys.projectOverview(projectId);
        const cachedOverview = await getCache(cacheKey);
        
        if (cachedOverview) {
            console.log(`✅ CACHE HIT ⚡ [getProjectOverview] | Key: ${cacheKey} | Time: ${Date.now() - start}ms`);
            return res.status(200).json(new ApiResponse(200, cachedOverview, "Project overview fetched successfully"));
        }

        // OPTIMIZATION: Use Promise.all instead of $transaction for parallel execution
        // $transaction runs queries SEQUENTIALLY, Promise.all runs them in PARALLEL
        // Expected improvement: 1379ms -> ~300-400ms (3-4x faster)
        const [project, statusCounts, priorityCounts, overdueCount] = await Promise.all([
            // Query 1: Get basic project info
            prisma.project.findUnique({
                where: { id: projectId },
                select: {
                    _count: {
                        select: { comments: true, files: true, tasks: true }
                    },
                    projectAccess: {
                        where: { hasAccess: true },
                        select: { id: true }
                    }
                }
            }),
            
            // Query 2: Group by status - aggregate all status counts in single query
            prisma.task.groupBy({
                by: ['status'],
                where: { projectId },
                _count: true,  // This returns proper count
                orderBy: { status: 'asc' }
            }),
            
            // Query 3: Group by priority - aggregate all priority counts in single query
            prisma.task.groupBy({
                by: ['priority'],
                where: { projectId },
                _count: true,  // This returns proper count
                orderBy: { priority: 'asc' }
            }),
            
            // Query 4: Overdue count
            prisma.task.count({
                where: {
                    projectId,
                    dueDate: { lt: new Date() },
                    status: { not: "COMPLETED" }
                }
            })
        ]);

        if (!project) throw new ApiError(404, "Project not found");

        // Transform aggregated data - _count is the numeric count when using _count: true
        const tasksByStatus = {
            TODO: 0,
            IN_PROGRESS: 0,
            IN_REVIEW: 0,
            COMPLETED: 0,
            BACKLOG: 0,
        };
        
        statusCounts.forEach(s => {
            // TypeScript type guard: _count is number when using groupBy with _count: true
            if (typeof s._count === 'number') {
                tasksByStatus[s.status] = s._count;
            }
        });

        const tasksByPriority = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            CRITICAL: 0,
        };
        
        priorityCounts.forEach(p => {
            // TypeScript type guard: _count is number when using groupBy with _count: true
            if (typeof p._count === 'number') {
                tasksByPriority[p.priority] = p._count;
            }
        });

        const responseData = {
            stats: {
                totalTasks: project._count.tasks,
                completedTasks: tasksByStatus.COMPLETED,
                overdueTasks: overdueCount,
                totalComments: project._count.comments,
                totalFiles: project._count.files,
                totalMembers: project.projectAccess.length,
            },
            tasksByStatus,
            tasksByPriority,
        };

        // Cache for 5 minutes
        await setCache(cacheKey, responseData, CacheTTL.MEDIUM);
        console.log(`❌ CACHE MISS 🐢 [getProjectOverview] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

        return res.status(200).json(new ApiResponse(200, responseData, "Overview fetched"));
    }
);


export const updateProject = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { name, description }: UpdateProjectBody = req.body;
    const userId = req.user?.id;
    const project = req.project; // Get from middleware

    if (!userId) throw new ApiError(400, "Not Authorized");
    if (!projectId) throw new ApiError(400, "Project ID is required");
    if (!project) throw new ApiError(500, "Project data not found in request");

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

    // Invalidate project cache
    await invalidateProjectCache(projectId);

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
    const project = req.project; // Get from middleware

    if (!userId) throw new ApiError(400, "Not authorized");
    if (!projectId) throw new ApiError(400, "Project ID is required");
    if (!project) throw new ApiError(500, "Project data not found in request");

    const deleteProject = await prisma.project.delete({
        where: { id: projectId },
    });

    if (!deleteProject) throw new ApiError(403, "Error while deleting the Project");

    // Invalidate project cache
    await invalidateProjectCache(projectId);

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Project deleted successfully")
        )
});


export const getProjectMembers = asyncHandler(
    async (req: Request, res: Response) => {
        const start = Date.now();
        const { projectId } = req.params;
        if (!projectId) throw new ApiError(401, "ProjectId is required");

        // Try cache first
        const cacheKey = CacheKeys.projectMembers(projectId);
        const cachedMembers = await getCache(cacheKey);
        
        if (cachedMembers) {
            console.log(`✅ CACHE HIT ⚡ [getProjectMembers] | Key: ${cacheKey} | Time: ${Date.now() - start}ms`);
            return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        { members: cachedMembers },
                        "Project members fetch successfully"
                    )
                );
        }

        const projectAccess = await prisma.projectAccess.findMany({
            where: {
                projectId,
                hasAccess: true,
            },
            select: {
                workspaceMemberId: true,
                createdAt: true,
                workspaceMember: {
                    select: {
                        accessLevel: true,
                        User: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
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
            accessLevel: access.workspaceMember.accessLevel,
            joinedAt: access.createdAt,
        }));

        // Cache for 30 minutes
        await setCache(cacheKey, members, CacheTTL.LONG);
        console.log(`❌ CACHE MISS 🐢 [getProjectMembers] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

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
  const start = Date.now();
  const { projectId } = req.params;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    if (!projectId) throw new ApiError(401, "ProjectId is required");
    
  // Try cache first (2 minutes TTL for activity feed)
  const cacheKey = CacheKeys.projectRecentActivities(projectId);
  const cachedActivities = await getCache(cacheKey);
  
  if (cachedActivities) {
      console.log(`✅ CACHE HIT ⚡ [getRecentProjectActivities] | Key: ${cacheKey} | Time: ${Date.now() - start}ms`);
      return res.json(
        new ApiResponse(
          200,
          { activities: cachedActivities },
          "Recent activities fetched"
        )
      );
  }

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

  // Cache for 2 minutes (activity feed changes frequently)
  await setCache(cacheKey, activities, CacheTTL.SHORT * 2);
  console.log(`❌ CACHE MISS 🐢 [getRecentProjectActivities] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

  return res.json(
    new ApiResponse(
      200,
      { activities },
      "Recent activities fetched"
    )
  );
});


// Add members to project
export const addProjectMembers = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { memberIds }: { memberIds: string[] } = req.body;
    const userId = req.user?.id;
    const project = req.project; // Get from middleware

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!projectId) throw new ApiError(400, "Project ID is required");
    if (!project) throw new ApiError(500, "Project data not found in request");

    // Get workspace members for the provided user IDs
    const workspaceMembers = await prisma.workspaceMembers.findMany({
        where: {
            workspaceId: project.workspaceId,
            userId: { in: memberIds }
        },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (workspaceMembers.length === 0) {
        throw new ApiError(400, "No valid workspace members found");
    }

    // Check which members already have access
    const existingAccess = await prisma.projectAccess.findMany({
        where: {
            projectId,
            workspaceMemberId: { in: workspaceMembers.map(m => m.id) }
        },
        select: { workspaceMemberId: true }
    });

    const existingMemberIds = new Set(existingAccess.map(a => a.workspaceMemberId));
    const newMembers = workspaceMembers.filter(m => !existingMemberIds.has(m.id));

    if (newMembers.length === 0) {
        throw new ApiError(400, "All selected members already have access to this project");
    }

    // Add new members to project
    await prisma.projectAccess.createMany({
        data: newMembers.map(m => ({
            projectId,
            workspaceMemberId: m.id,
            hasAccess: true
        })),
        skipDuplicates: true
    });

    // Log activity for each new member
    const activityPromises = newMembers.map(member =>
        logActivity({
            type: ActivityType.PROJECT_MEMBER_ADDED,
            description: `Added ${member.User.name} to project`,
            userId,
            projectId,
        }).catch(err => console.error(`Failed to log activity:`, err))
    );

    await Promise.all(activityPromises);

    return res.status(200).json(
        new ApiResponse(
            200,
            { addedCount: newMembers.length, members: newMembers.map(m => m.User) },
            `Successfully added ${newMembers.length} member(s) to project`
        )
    );
});


// Remove member from project
export const removeProjectMember = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { userId: memberUserId }: { userId: string } = req.body;
    const userId = req.user?.id;
    const project = req.project; // Get from middleware

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!memberUserId) throw new ApiError(400, "Member user ID is required");
    if (!project) throw new ApiError(500, "Project data not found in request");

    if (!projectId) throw new ApiError(400, "ProjectId is required");

    // Prevent removing yourself
    if (memberUserId === userId) {
        throw new ApiError(400, "You cannot remove yourself from the project");
    }

    // Cannot remove the project creator
    if (project.createdBy === memberUserId) {
        throw new ApiError(400, "Cannot remove project creator from the project");
    }

    // Get workspace member record
    const workspaceMember = await prisma.workspaceMembers.findUnique({
        where: {
            userId_workspaceId: {
                userId: memberUserId,
                workspaceId: project.workspaceId
            }
        },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (!workspaceMember) {
        throw new ApiError(404, "Member not found in workspace");
    }

    // Check if member has project access
    const projectAccess = await prisma.projectAccess.findFirst({
        where: {
            projectId,
            workspaceMemberId: workspaceMember.id
        }
    });

    if (!projectAccess) {
        throw new ApiError(400, "Member does not have access to this project");
    }

    // Remove project access
    await prisma.projectAccess.delete({
        where: {
            id: projectAccess.id
        }
    });

    // Log activity
    logActivity({
        type: ActivityType.PROJECT_MEMBER_REMOVED,
        description: `Removed ${workspaceMember.User.name} from project`,
        userId,
        projectId,
    }).catch(err => console.error(`Failed to log activity:`, err));

    return res.status(200).json(
        new ApiResponse(
            200,
            { removedMember: workspaceMember.User },
            "Member removed from project successfully"
        )
    );
});


// Get available workspace members (not in project)
export const getAvailableMembers = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const userId = req.user?.id;
    const project = req.project; // Get from middleware

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!projectId) throw new ApiError(400, "Project ID is required");
    if (!project) throw new ApiError(500, "Project data not found in request");

    // Get workspace members who don't have access to this project
    const availableMembersData = await prisma.workspaceMembers.findMany({
        where: {
            workspaceId: project.workspaceId,
            projectAccess: {
                none: {
                    projectId
                }
            }
        },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    const availableMembers = availableMembersData.map(member => ({
        id: member.User.id,
        name: member.User.name,
        email: member.User.email,
        accessLevel: member.accessLevel,
        joinedAt: member.createdAt
    }));

    return res.status(200).json(
        new ApiResponse(
            200,
            { members: availableMembers },
            "Available members fetched successfully"
        )
    );
});
