import { Request, Response } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import prisma from "../config/prisma";
import crypto from "crypto";
import { sendWorkspaceInviteEmail } from "../services/inviteMember";

interface InviteBody{
    email?: string;
}

//generate unique invite token
const generateInviteToken = ():string => {
    return crypto.randomBytes(32).toString('hex');
}

export const createWorkspaceInvite = asyncHandler(async(req: Request, res:Response) => {
    const {email}: InviteBody = req.body;
    const {workspaceId} = req.params;
    const userId = req.user?.id;

    if(!userId) throw new ApiError(401, "Not Authorized");
    if(!workspaceId) throw new ApiError(400, "WorkspaceId is required");

    //verify workspace existes and user is owner by middleware

    //check if user is already member of workspace
    if(email){
        const existingUser = await prisma.user.findUnique({
          where:{ email },
          include:{
            workspaces:{
                where: { workspaceId }
            }
          }
        });

        if(existingUser?.workspaces && existingUser.workspaces.length > 0){
            throw new ApiError(400, "User is already a member of this workspace");
        }
    }

     //create invite token (expires in 7 days)
        const inviteToken = generateInviteToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.workspaceInvite.create({
            data: {
                workspaceId,
                email: email || null,
                inviteToken,
                invitedBy: userId,
                expiresAt,
            },
            include: {
                workspace:{
                    select: { name:true }
                }
            }
        });

        //send email if email provided
        if(email){
            const inviteLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspaceId}/join/${inviteToken}`
            await sendWorkspaceInviteEmail(
                email,
                invite.workspace.name,
                inviteLink
            );
        }

        const inviteLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspaceId}/join/${inviteToken}`;

        return res.status(201).json(
            new ApiResponse(
                201,
                {inviteToken, inviteLink, expiresAt},
                email 
                    ? "Invitation sent successfully"
                    : "Invite link generated successfully"
            )
        )
});


//get workspace invite details for join page
export const getInviteDetails = asyncHandler(async(req:Request, res:Response) => {
    const { workspaceId, inviteToken} = req.params;

    if(!workspaceId || !inviteToken) throw new ApiError(400, "Invalid invite Token");

    const invite = await prisma.workspaceInvite.findUnique({
        where:{
            inviteToken
        },
        include:{
            workspace:{
                select:{
                    id: true,
                    name:true,
                    description: true,
                    _count: {
                        select: {members: true, projects: true}
                    }
                }
            },
            inviter:{
                select:{
                    name: true,
                    email: true,
                }
            }
        }
    });

    if(!invite) throw new ApiError(404, "Invalid or Expired invite link");

    if(invite.workspaceId !== workspaceId) throw new ApiError(400, "Invite link does not match workspace");

    if(invite.usedAt) {
        throw new ApiError(400, "This invite has already been used");
    }

    if(new Date() > invite.expiresAt){
        throw new ApiError(400, "This invite link has expired");
    }

    return res.status(200).json(
        new ApiResponse(200, { invite }, "Invite details fetched successfully")
    );
});


//join workspace using invite token
export const joinWorkspaceViaInvite = asyncHandler(async(req:Request, res:Response) => {
    const {workspaceId, inviteToken} = req.params;
    const userId = req.user?.id;

    if(!userId) throw new ApiError(401, "Not Authorized");
    if(!workspaceId || !inviteToken) throw new ApiError(400, "Invalid invite token");

    //get current user's email first (needed for email-specific invite validation)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
    });

    //verify invite
    const invite = await prisma.workspaceInvite.findUnique({
        where:{
            inviteToken
        },
        include:{
            workspace:{
                select:{
                    id: true, 
                    name: true,
                    ownerId: true,
                }
            }
        }
    });

    if(!invite || invite.workspaceId !== workspaceId){
        throw new ApiError(404, "Invalid invite link");
    }

    if(invite.usedAt) {
        throw new ApiError(400, "This invite has already been used");
    }

    if(new Date() > invite.expiresAt){
        throw new ApiError(400, "This invite link has expired");
    }

    //Check email match BEFORE checking membership to fail fast
    //This prevents unauthorized users from even checking if they're members
    if(invite.email && user?.email !== invite.email){
        throw new ApiError(403, "This invite was sent to a different email address");
    }

    //check if user is already a member BEFORE transaction (idempotent operation)
    const existingMember = await prisma.workspaceMembers.findUnique({
        where:{
            userId_workspaceId: {
                userId,
                workspaceId
            }
        }
    });

    //if already a member, return success (idempotent behavior)
    if(existingMember) {
        return res.status(200).json(
            new ApiResponse(
                200,
                { workspaceId, member: existingMember, alreadyMember: true },
                "You are already a member of this workspace"
            )
        );
    }

    //add user to workspace with race-safe invite consumption
    const member = await prisma.$transaction(async (tx) => {
        //double-check membership inside transaction for race safety
        const memberCheck = await tx.workspaceMembers.findUnique({
            where:{
                userId_workspaceId: {
                    userId,
                    workspaceId
                }
            }
        });

        //if someone joined between our check and transaction, return existing member
        if(memberCheck) {
            return { member: memberCheck, alreadyMember: true };
        }

        //conditionally mark invite as used (only if not already used)
        //this prevents race conditions where two requests try to use the same invite
        const updateResult = await tx.workspaceInvite.updateMany({
            where:{
                id: invite.id,
                usedAt: null, // Only update if not already used
            },
            data:{ usedAt: new Date() },
        });

        //if update count is 0, invite was already consumed by another request
        if(updateResult.count === 0){
            throw new ApiError(400, "This invite has already been used");
        }

        //create workspace membership
        const newMember = await tx.workspaceMembers.create({
            data:{
                userId,
                workspaceId,
                accessLevel: "MEMBER",
            }
        });

        return { member: newMember, alreadyMember: false };
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { workspaceId, member: member.member, alreadyMember: member.alreadyMember },
            member.alreadyMember 
                ? "You are already a member of this workspace"
                : `Successfully joined ${invite.workspace.name}`
        )
    )
});


//resend/revoke invite link (generate new token)
export const resetInviteLink = asyncHandler(async(req:Request, res:Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

    //verify ownership via  middleware

    //delete all unused general invites
    await prisma.workspaceInvite.deleteMany({
        where: {
            workspaceId,
            email: null,
            usedAt: null,
        },
    });

    //generate new invite token
    const inviteToken = generateInviteToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.workspaceInvite.create({
            data: {
                workspaceId,
                inviteToken,
                invitedBy: userId,
                expiresAt,
            },
        });

    const inviteLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspaceId}/join/${inviteToken}`;

    return res.status(200).json(
        new ApiResponse(
            200,
            { inviteToken, inviteLink, expiresAt },
            "Invite link reset successfully"
        )
    );
});



