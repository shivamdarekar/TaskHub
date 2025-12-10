import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import prisma from "../config/prisma";

// Check if user is workspace owner
export const isWorkspaceOwner = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const {workspaceId} = req.params

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

    const workspace = await prisma.workSpace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (!workspace) throw new ApiError(404, "Workspace not found");

    if (workspace.ownerId !== userId) {
      throw new ApiError(403, "Only workspace owner can perform this action");
    }

    next();
  }
);

// Check if user has access to workspace (owner or member)
export const hasWorkspaceAccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  if (!userId) throw new ApiError(401, "Not Authorized");
  if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

  // Query 1: workspace existence + owner check
  const workspace = await prisma.workSpace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  if (!workspace) throw new ApiError(404, "Workspace not found");

  // Owner → full access
  if (workspace.ownerId === userId) return next();

  // Query 2: membership check (unique lookup)
  const membership = await prisma.workspaceMembers.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId },
    },
  });

  if (!membership) {
    throw new ApiError(403, "Access denied. You are not a member of this workspace.");
  }

  next();
});


// Check if user is project owner or admin
export const canManageProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    if(!userId) throw new ApiError(401,"Not Authorized");
    if(!projectId) throw new ApiError(400,"ProjectId is required");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          select: { ownerId: true },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (project.workspace.ownerId !== userId) {
      throw new ApiError(403, "Access denied. Only workspace owner can manage projects.");
    }

    next();
  }
);

// Check if user has access to project (any role)
export const hasProjectAccess = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!projectId) throw new ApiError(400, "Project ID is required");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          select: { ownerId: true },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Workspace owner has access to all projects
    if (project.workspace.ownerId === userId) {
      return next();
    }

    // Check if user is workspace member with project access
    const workspaceMember = await prisma.workspaceMembers.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: project.workspaceId,
        },
      },
      include: {
        projectAccess: {
          where: {
            projectId,
            hasAccess: true,
          },
        },
      },
    });

    if (!workspaceMember || workspaceMember.projectAccess.length === 0) {
      throw new ApiError(403, "Access denied. You don't have access to this project.");
    }

    next();
  }
);
