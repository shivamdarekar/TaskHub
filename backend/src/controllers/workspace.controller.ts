import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../config/prisma";

interface workspaceBody{
    name: string;
    description?: string;
    ownerId: string;
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

    const hasAccess = await prisma.workspaceMembers.findFirst({
        where:{
            userId,
        }
    });

    if((!hasAccess)) throw new ApiError(403,"You don't have access to this workspace");


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

    const hasAccess = await prisma.workspaceMembers.findFirst({
        where:{
            userId,
            workspaceId
        }
    });

    if((!hasAccess)) throw new ApiError(403,"You don't have access to this workspace");

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

    const hasAccess = await prisma.workspaceMembers.findFirst({
        where:{
            userId,
            workspaceId,
        }
    });

    if(!hasAccess){
        throw new ApiError(403,"You don't have access to this workspace");
    }

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
                    email: true
                },
            },
            _count: {
                select: {
                    members: true,
                    projects: true,
                },
            },
            members: {
                where: { userId },
                select: { id: true },
                take: 1,
            },
        },
    });

    if (!workspace || workspace.members.length === 0) {
        throw new ApiError(workspace ? 403 : 404, workspace ? "You don't have access to this workspace" : "Workspace not found");
    }

    //task stats
    const taskStats = await prisma.task.groupBy({
        by: ["status"],
        where: {
            project: {
                workspaceId,
            },
        },
        _count: {
            status: true,
        },
    });

    const totalTasks = taskStats.reduce((sum, t) => sum + t._count.status, 0);
    const completedTasks =
        taskStats.find((t) => t.status === "COMPLETED")?._count.status ?? 0;
    
    const myTaskCount = await prisma.task.count({
        where: {
            assigneeId: userId,
            project: {
                workspaceId
            },
        },
    });

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

    //recent projects
    const recentProjects = await prisma.project.findMany({
        where: { workspaceId },
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
    });

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
            totalProjects: workspace._count.projects,
            totalTasks,
            myTasks: myTaskCount,
            completedTasks,
            teamMembers: workspace._count.members,
            taskByStatus: taskStats.map((t) => ({
                status: t.status,
                count: t._count.status,
            })),
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

export {
    createWorkSpace,
    getUserWorkspace,
    getWorkspaceById,
    getWorkspaceMembers,
    getWorkspaceOverview
}