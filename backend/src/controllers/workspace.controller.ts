import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../config/prisma";

const createWorkSpace = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name.trim() || typeof name != "string") {
        throw new ApiError(400, "Workspace name is required");
    }

    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Not Authorized");

    const workspace = await prisma.workSpace.create({
        data: {
            name: name.trim(),
            description: description?.trim(),
            ownerId: userId,
        } as any,
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

    await prisma.workspaceMembers.create({
        data: {   
            userId: userId,
            workspaceId: workspace.id,
            accessLevel: "OWNER"
        }
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
            createdAt:'desc',
        },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200,{workspaces},"User workspaces fetched successfully")
      );
});

export {
    createWorkSpace,
    getUserWorkspace
}