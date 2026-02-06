import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../config/prisma";
import { logActivity } from "../services/activityLogger";

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
 
    return res 
        .status(201)
        .json(new ApiResponse(201, { workspace }, "Workspace created successfully"))

});


//user is workspace member or owner if he is part of it then go to dashboard
const getUserWorkspace = asyncHandler(async(req:Request,res:Response) => {
    const userId = req.user?.id;
    if(!userId) throw new ApiError(401,"Not Authorized");

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
    const userId = req.user?.id;
    const {workspaceId} = req.params;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "workspaceId is required");

    const members = await prisma.workspaceMembers.findMany({
        where:{workspaceId},
        orderBy:{createdAt: "desc"},
        include:{
            User:{
                select:{
                    id:true,
                    name:true,
                    email:true,
                    profilePicture:true
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
            profilePicture: m.User.profilePicture,
        },
        accessLevel: m.accessLevel,
        createdAt: m.createdAt,
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, { members: formattedMembers }, "Members fetched successfully"));
})


const getWorkspaceOverview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { workspaceId } = req.params;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace id is required");

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

    //task stats (scoped to accessible projects)
    const taskStats = accessibleProjectIds.length > 0 
        ? await prisma.task.groupBy({
            by: ["status"],
            where: {
                projectId: { in: accessibleProjectIds },
            },
            _count: {
                status: true,
            },
        })
        : [];

    const totalTasks = taskStats.reduce((sum, t) => sum + t._count.status, 0);
    const completedTasks =
        taskStats.find((t) => t.status === "COMPLETED")?._count.status ?? 0;
    
    const myTaskCount = accessibleProjectIds.length > 0
        ? await prisma.task.count({
            where: {
                assigneeId: userId,
                projectId: { in: accessibleProjectIds },
            },
        })
        : 0;

    //recent members(last 5)
    const recentMembers = await prisma.workspaceMembers.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            }
        }
    });

    //recent projects (scoped to accessible projects)
    const recentProjects = accessibleProjectIds.length > 0
        ? await prisma.project.findMany({
            where: { 
                id: { in: accessibleProjectIds },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                _count: {
                    select: {
                        tasks: true,
                    }
                }
            }
        })
        : [];

    // Task creation trend (last 7 days, scoped to accessible projects)
    // Optimized: Single query instead of 7 separate queries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const tasksLast7Days = accessibleProjectIds.length > 0
        ? await prisma.task.findMany({
            where: {
                projectId: { in: accessibleProjectIds },
                createdAt: { gte: sevenDaysAgo }
            },
            select: {
                createdAt: true
            }
        })
        : [];

    // Group tasks by date in JavaScript (using UTC dates for consistency)
    const taskCountByDate = new Map<string, number>();
    tasksLast7Days.forEach(task => {
        const dateKey = task.createdAt.toISOString().split('T')[0] ?? '';
        if (dateKey) {
            taskCountByDate.set(dateKey, (taskCountByDate.get(dateKey) || 0) + 1);
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