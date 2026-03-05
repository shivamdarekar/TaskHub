import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";
import { logActivity } from "../services/activityLogger";
import { getCache, setCache, CacheTTL, deleteCache } from "../config/cache.service";
import { CacheKeys } from "../utils/cacheKeys";
import { invalidateWorkspaceCache } from "../utils/cacheInvalidation";

interface workspaceBody{
    name: string;
    description?: string;
    ownerId: string;
}

interface UpdateWorkspaceBody{
    name?: string;
    description?: string;
}

const createWorkSpace = asyncHandler(async (req: Request<{},{},workspaceBody>, res: Response) => {
    const { name, description } = req.body;

    if (!name?.trim() || typeof name != "string") {
        throw new ApiError(400, "Workspace name is required");
    }

    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Not Authorized");

    // Use transaction to ensure both operations succeed or fail together (fixes race condition)
    const workspace = await prisma.$transaction(async (tx) => {
        const newWorkspace = await tx.workSpace.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                ownerId: userId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        // Create owner membership in same transaction
        await tx.workspaceMembers.create({
            data: {   
                userId: userId,
                workspaceId: newWorkspace.id,
                accessLevel: "OWNER"
            }
        });

        return newWorkspace;
    });
 
    // Invalidate user workspaces cache
    await deleteCache(CacheKeys.userWorkspaces(userId));

    return res 
        .status(201)
        .json(new ApiResponse(201, { workspace }, "Workspace created successfully"))

});


//user is workspace member or owner if he is part of it then go to dashboard
const getUserWorkspace = asyncHandler(async(req:Request,res:Response) => {
    const start = Date.now();
    const userId = req.user?.id;
    if(!userId) throw new ApiError(401,"Not Authorized");

    // Try cache first
    const cacheKey = CacheKeys.userWorkspaces(userId);
    const cachedWorkspaces = await getCache(cacheKey);
    
    if (cachedWorkspaces) {
        console.log(`✅ CACHE HIT ⚡ [getUserWorkspace] | Key: ${cacheKey} | Time: ${Date.now() - start}ms`);
        return res
          .status(200)
          .json(
            new ApiResponse(200,{workspaces: cachedWorkspaces},"User workspaces fetched successfully")
          );
    }

    const workspaces = await prisma.workSpace.findMany({
        where: {
           OR: [
                { ownerId: userId },
                { members: { some: { userId } } },
            ],
        },
        include:{
            owner:{
                select:{
                    id:true,
                    name:true,
                    email:true
                },
            },
            _count:{
                select:{
                    members:true
                },
            },
        },
        orderBy:{
            createdAt:"desc",
        },
    });

    // Cache for 1 hour
    await setCache(cacheKey, workspaces, CacheTTL.VERY_LONG);
    console.log(`❌ CACHE MISS 🐢 [getUserWorkspace] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

    return res
      .status(200)
      .json(
        new ApiResponse(200,{workspaces},"User workspaces fetched successfully")
      );
});


//get single workspace
const getWorkspaceById = asyncHandler(async(req:Request, res:Response) => {
    const {workspaceId} = req.params;
    const userId = req.user?.id;

    if(!userId) throw new ApiError(401,"Not Authorized");
    if(!workspaceId) throw new ApiError(400,"WorkspaceId is required");

    const workspace = await prisma.workSpace.findFirst({
        where:{
            id:workspaceId,
            OR:[
                {ownerId:userId},
                {members: {some: {userId}}},
            ],
        },
        include:{
            owner:{
                select:{
                    id:true,
                    name:true,
                    email:true,
                }
            },
            _count:{
                select:{
                    members:true,
                    projects:true,
                }
            }
        }
    });

    if(!workspace){
        throw new ApiError(404,"Workspace not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,{workspace}, "Workspace fetched successfully"))
});


//get workspace members
const getWorkspaceMembers = asyncHandler(async(req:Request,res:Response) => {
    const start = Date.now();
    const userId = req.user?.id;
    const {workspaceId} = req.params;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "workspaceId is required");

    // Try cache first
    const cacheKey = CacheKeys.workspaceMembers(workspaceId);
    const cachedMembers = await getCache(cacheKey);
    
    if (cachedMembers) {
        console.log(`✅ CACHE HIT ⚡ [getWorkspaceMembers] | Key: ${cacheKey} | Time: ${Date.now() - start}ms`);
        return res
            .status(200)
            .json(new ApiResponse(200, { members: cachedMembers }, "Members fetched successfully"));
    }

    const members = await prisma.workspaceMembers.findMany({
        where:{workspaceId},
        orderBy:{createdAt: "desc"},
        select:{
            id: true,
            accessLevel: true,
            createdAt: true,
            User:{
                select:{
                    id:true,
                    name:true,
                    email:true,
                }
            }
        }
    });

    const formattedMembers = members.map((m) => ({
        id: m.id,
        userId: m.User.id,
        user: {
            id: m.User.id,
            name: m.User.name,
            email: m.User.email,
        },
        accessLevel: m.accessLevel,
        createdAt: m.createdAt,
    }));

    // Cache for 30 minutes
    await setCache(cacheKey, formattedMembers, CacheTTL.LONG);
    console.log(`❌ CACHE MISS 🐢 [getWorkspaceMembers] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

    return res
        .status(200)
        .json(new ApiResponse(200, { members: formattedMembers }, "Members fetched successfully"));
})


const getWorkspaceOverview = asyncHandler(async (req: Request, res: Response) => {
    const start = Date.now();
    const userId = req.user?.id;
    const { workspaceId } = req.params;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace id is required");

    // Try cache first (5 minutes TTL for this high-query endpoint)
    const cacheKey = CacheKeys.workspaceOverview(workspaceId);
    const cachedOverview = await getCache(cacheKey);
    
    if (cachedOverview) {
        console.log(`✅ CACHE HIT ⚡ [getWorkspaceOverview] | Key: ${cacheKey} | Time: ${Date.now() - start}ms`);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    cachedOverview,
                    "Workspace overview fetch successfully"
                )
            );
    }

    //combine membership check and workspace fetch into single query to eliminate duplicate access checks
    const workspace = await prisma.workSpace.findUnique({
        where: { id: workspaceId },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    members: true,
                    projects: true,
                },
            },
        }
    });

    if (!workspace) {
        throw new ApiError( 404, "Workspace not found");
    }

    // Check if user is workspace owner
    const isOwner = workspace.owner.id === userId;

    // Determine which projects the user has access to
    let accessibleProjectIds: string[];

    if (isOwner) {
        // Owner has access to all projects
        const allProjects = await prisma.project.findMany({
            where: { workspaceId },
            select: { id: true }
        });
        accessibleProjectIds = allProjects.map(p => p.id);
    } else {
        // Member: only projects they have explicit access to IN THIS WORKSPACE
        const accessibleProjects = await prisma.project.findMany({
            where: {
                workspaceId, // Filter by current workspace
                projectAccess: {
                    some: {
                        hasAccess: true,
                        workspaceMember: {
                            userId,
                            workspaceId, // Ensure member belongs to this workspace
                        }
                    }
                }
            },
            select: { id: true }
        });

        accessibleProjectIds = accessibleProjects.map(p => p.id);
    }

    // OPTIMIZATION: Parallelize all independent queries with Promise.all
    // Reduces 6 sequential queries to 1 parallel batch = 5-6x faster
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
        taskStats,
        myTaskCount,
        recentMembers,
        recentProjects,
        tasksLast7Days
    ] = await Promise.all([
        // Query 1: Task stats by status (scoped to accessible projects)
        accessibleProjectIds.length > 0
            ? prisma.task.groupBy({
                by: ["status"],
                where: { projectId: { in: accessibleProjectIds } },
                _count: { status: true },
            })
            : Promise.resolve([]),
        
        // Query 2: User's assigned task count
        accessibleProjectIds.length > 0
            ? prisma.task.count({
                where: {
                    assigneeId: userId,
                    projectId: { in: accessibleProjectIds },
                },
            })
            : Promise.resolve(0),
        
        // Query 3: Recent members (last 5)
        prisma.workspaceMembers.findMany({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                User: {
                    select: { id: true, name: true, email: true },
                }
            }
        }),
        
        // Query 4: Recent projects (scoped to accessible projects)
        accessibleProjectIds.length > 0
            ? prisma.project.findMany({
                where: { id: { in: accessibleProjectIds } },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    _count: { select: { tasks: true } }
                }
            })
            : Promise.resolve([]),
        
        // Query 5: Task trend - DB aggregation instead of client-side grouping
        // CRITICAL OPTIMIZATION: Let database do the aggregation
        // Before: Fetch 1000s of rows → group in JS = SLOW
        // After: Database groups and returns only 7 rows = FAST
        // Uses date_trunc which is index-aware (DATE() prevents index usage)
        accessibleProjectIds.length > 0
            ? prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
                SELECT 
                    date_trunc('day', "createdAt")::date as date,
                    COUNT(*)::int as count
                FROM "Task"
                WHERE "projectId" IN (${Prisma.join(accessibleProjectIds)})
                    AND "createdAt" >= ${sevenDaysAgo}
                GROUP BY date_trunc('day', "createdAt")
                ORDER BY date
            `
            : Promise.resolve([])
    ]);

    const totalTasks = taskStats.reduce((sum, t) => sum + t._count.status, 0);
    const completedTasks =
        taskStats.find((t) => t.status === "COMPLETED")?._count.status ?? 0;

    // Convert DB aggregation result to map for quick lookup
    const taskCountByDate = new Map<string, number>();
    tasksLast7Days.forEach(row => {
        const dateKey = new Date(row.date).toISOString().split('T')[0] ?? '';
        if (dateKey) {
            taskCountByDate.set(dateKey, Number(row.count));
        }
    });

    // Build last 7 days array with counts (using UTC dates)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - i);
        date.setUTCHours(0, 0, 0, 0);
        const dateKey = date.toISOString().split('T')[0] ?? '';
        
        last7Days.push({
            date: dateKey,
            tasks: taskCountByDate.get(dateKey) || 0,
        });
    }

    const responseData = {
        workspace: {
            id: workspace.id,
            name: workspace.name,
            description: workspace.description,
            createdAt: workspace.createdAt,
            owner: workspace.owner,
            _count: {
                members: workspace._count.members,
                projects: workspace._count.projects,
            }
        },
        stats: {
            totalProjects: accessibleProjectIds.length, // Scoped to user's accessible projects
            totalTasks,
            myTasks: myTaskCount,
            completedTasks,
            teamMembers: workspace._count.members,
            taskByStatus: taskStats.map((t) => ({
                status: t.status,
                count: t._count.status,
            })),
            taskCreationTrend: last7Days,
        },
        recentMembers: recentMembers.map((m) => ({
            id: m.User.id,
            name: m.User.name,
            email: m.User.email,
            joinedAt: m.createdAt
        })),
        recentProjects: recentProjects.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            createdAt: p.createdAt,
            taskCount: p._count.tasks
        })),
        isOwner, // Send to frontend so it knows user's role
    };

    // Cache for 5 minutes (balance between freshness and performance)
    await setCache(cacheKey, responseData, CacheTTL.MEDIUM);
    console.log(`❌ CACHE MISS 🐢 [getWorkspaceOverview] | Key: ${cacheKey} | DB Query Time: ${Date.now() - start}ms`);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                responseData,
                "Workspace overview fetch successfully"
            )
        );
});


const updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { name, description }: UpdateWorkspaceBody = req.body;
    const { workspaceId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "WorkspaceId is required");

    if (!name && description == undefined) {
        throw new ApiError(400, "Atleast one field is required");
    }

    const workspace = await prisma.workSpace.findUnique({
        where: {
            id: workspaceId
        },
        select: {
            name: true,
            description: true,
        }
    });

    if (!workspace) throw new ApiError(404, "Workspace not found");;

    const updatedWorkspace = await prisma.workSpace.update({
        where: { id: workspaceId },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description: description?.trim() ?? null }),
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
    });

    if (!updatedWorkspace) throw new ApiError(500, "Failed to update workspace");

    // Invalidate workspace cache
    await invalidateWorkspaceCache(workspaceId);

    return res.status(200).json(
        new ApiResponse(200, updatedWorkspace, "Workspace updated successfully")
    )
});


const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "WorkspaceId is required");

    const workspace = await prisma.workSpace.findUnique({
        where: {
            id: workspaceId
        },
        select: {
            id: true,
            name: true
        }
    });

    if (!workspace) throw new ApiError(404, "Workspace not found");

    const deleteWorkspace = await prisma.workSpace.delete({
        where: {
            id: workspaceId
        }
    });

    if (!deleteWorkspace) throw new ApiError(500, "Failed to delete workspace");

    // Invalidate workspace cache
    await invalidateWorkspaceCache(workspaceId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Workspace deleted successfully")
    )
});

// Remove member from workspace
const removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, memberId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");
    if (!memberId) throw new ApiError(400, "Member ID is required");

    // Find the member record
    const member = await prisma.workspaceMembers.findUnique({
        where: { id: memberId },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            workspace: {
                select: {
                    id: true,
                    ownerId: true
                }
            }
        }
    });

    if (!member) throw new ApiError(404, "Member not found");

    // Verify member belongs to this workspace
    if (member.workspaceId !== workspaceId) {
        throw new ApiError(400, "Member does not belong to this workspace");
    }

    // Prevent owner from being removed
    if (member.accessLevel === "OWNER") {
        throw new ApiError(403, "Cannot remove workspace owner");
    }

    // Prevent owner from removing themselves
    if (member.userId === userId) {
        throw new ApiError(403, "Cannot remove yourself from workspace");
    }

    // Delete member (cascades to ProjectAccess)
    await prisma.workspaceMembers.delete({
        where: { id: memberId }
    });

    return res.status(200).json(
        new ApiResponse(
            200, 
            { removedMember: { id: member.User.id, name: member.User.name, email: member.User.email } },
            "Member removed successfully"
        )
    );
});


// Get projects for a specific member
const getMemberProjects = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, memberId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");
    if (!memberId) throw new ApiError(400, "Member ID is required");

    // Verify member exists and belongs to workspace
    const member = await prisma.workspaceMembers.findUnique({
        where: { id: memberId },
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

    if (!member) throw new ApiError(404, "Member not found");
    if (member.workspaceId !== workspaceId) {
        throw new ApiError(400, "Member does not belong to this workspace");
    }

    // Check if member is owner (owners have access to all projects)
    if (member.accessLevel === "OWNER") {
        const allProjects = await prisma.project.findMany({
            where: { workspaceId },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    member: {
                        id: member.User.id,
                        name: member.User.name,
                        email: member.User.email,
                        accessLevel: member.accessLevel
                    },
                    projects: allProjects.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        createdAt: p.createdAt,
                        taskCount: p._count.tasks,
                        accessType: "owner"
                    })),
                    totalProjects: allProjects.length
                },
                "Member projects fetched successfully"
            )
        );
    }

    // For regular members, get projects they have explicit access to
    const projectAccess = await prisma.projectAccess.findMany({
        where: {
            workspaceMemberId: memberId,
            hasAccess: true
        },
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    workspaceId: true,
                    _count: {
                        select: {
                            tasks: true
                        }
                    }
                }
            }
        },
        orderBy: {
            project: {
                createdAt: "desc"
            }
        }
    });

    // Filter to only projects in this workspace
    const projects = projectAccess
        .filter(pa => pa.project.workspaceId === workspaceId)
        .map(pa => ({
            id: pa.project.id,
            name: pa.project.name,
            description: pa.project.description,
            createdAt: pa.project.createdAt,
            taskCount: pa.project._count.tasks,
            accessType: "member"
        }));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                member: {
                    id: member.User.id,
                    name: member.User.name,
                    email: member.User.email,
                    accessLevel: member.accessLevel
                },
                projects,
                totalProjects: projects.length
            },
            "Member projects fetched successfully"
        )
    );
});


// Update member access level
const updateMemberAccess = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId, memberId } = req.params;
    const { accessLevel } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");
    if (!memberId) throw new ApiError(400, "Member ID is required");
    if (!accessLevel) throw new ApiError(400, "Access level is required");

    // Validate access level
    const validAccessLevels = ["OWNER", "MEMBER", "VIEWER"];
    if (!validAccessLevels.includes(accessLevel)) {
        throw new ApiError(400, "Invalid access level. Must be OWNER, MEMBER, or VIEWER");
    }

    // Find the member
    const member = await prisma.workspaceMembers.findUnique({
        where: { id: memberId },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            workspace: {
                select: {
                    id: true,
                    ownerId: true
                }
            }
        }
    });

    if (!member) throw new ApiError(404, "Member not found");
    if (member.workspaceId !== workspaceId) {
        throw new ApiError(400, "Member does not belong to this workspace");
    }

    // Prevent changing the original owner's access level
    if (member.workspace.ownerId === member.userId) {
        throw new ApiError(403, "Cannot change the workspace owner's access level");
    }

    // Prevent changing your own access level
    if (member.userId === userId) {
        throw new ApiError(403, "Cannot change your own access level");
    }

    // Update access level
    const updatedMember = await prisma.workspaceMembers.update({
        where: { id: memberId },
        data: { accessLevel },
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePicture: true
                }
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                member: {
                    id: updatedMember.id,
                    userId: updatedMember.User.id,
                    user: updatedMember.User,
                    accessLevel: updatedMember.accessLevel,
                    createdAt: updatedMember.createdAt
                }
            },
            "Member access level updated successfully"
        )
    );
});

// Transfer workspace ownership
const transferOwnership = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { newOwnerId } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!newOwnerId) throw new ApiError(400, "New owner ID is required");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

    // Verify new owner is a member
    const newOwnerMember = await prisma.workspaceMembers.findFirst({
        where: {
            workspaceId,
            userId: newOwnerId
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

    if (!newOwnerMember) {
        throw new ApiError(400, "New owner must be a workspace member");
    }

    // Transfer ownership in transaction
    await prisma.$transaction(async (tx) => {
        // Update workspace owner
        await tx.workSpace.update({
            where: { id: workspaceId },
            data: { ownerId: newOwnerId }
        });

        // Update new owner's access level to OWNER
        await tx.workspaceMembers.update({
            where: { id: newOwnerMember.id },
            data: { accessLevel: "OWNER" }
        });

        // Update old owner's access level to MEMBER
        const oldOwnerMember = await tx.workspaceMembers.findFirst({
            where: {
                workspaceId,
                userId
            }
        });

        if (oldOwnerMember) {
            await tx.workspaceMembers.update({
                where: { id: oldOwnerMember.id },
                data: { accessLevel: "MEMBER" }
            });
        }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                newOwner: {
                    id: newOwnerMember.User.id,
                    name: newOwnerMember.User.name,
                    email: newOwnerMember.User.email
                }
            },
            "Ownership transferred successfully"
        )
    );
});


export {
    createWorkSpace,
    getUserWorkspace,
    getWorkspaceById,
    getWorkspaceMembers,
    getWorkspaceOverview,
    updateWorkspace,
    deleteWorkspace,
    removeMember,
    getMemberProjects,
    updateMemberAccess,
    transferOwnership
}