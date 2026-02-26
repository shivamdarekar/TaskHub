import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import prisma from "../config/prisma";

// Check if user can create workspace
export const canCreateWorkspace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new ApiError(404, "Subscription not found");

    // Check if max workspaces is unlimited
    if (subscription.maxWorkspaces === -1) {
      return next();
    }

    // Count current workspaces
    const workspacesCount = await prisma.workspaceMembers.count({
      where: { userId },
    });

    if (workspacesCount >= subscription.maxWorkspaces) {
      throw new ApiError(
        403,
        `You have reached the maximum workspace limit (${subscription.maxWorkspaces}). Please upgrade your plan.`
      );
    }

    next();
  }
);

// Check if user can create project
export const canCreateProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new ApiError(404, "Subscription not found");

    // Check if max projects is unlimited
    if (subscription.maxProjects === -1) {
      return next();
    }

    // Count current projects
    const projectsCount = await prisma.project.count({
      where: { createdBy: userId },
    });

    if (projectsCount >= subscription.maxProjects) {
      throw new ApiError(
        403,
        `You have reached the maximum project limit (${subscription.maxProjects}). Please upgrade your plan.`
      );
    }

    next();
  }
);

// Check if user can create task
export const canCreateTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new ApiError(404, "Subscription not found");

    // Check if max tasks is unlimited
    if (subscription.maxTasks === -1) {
      return next();
    }

    // Count current tasks
    const tasksCount = await prisma.task.count({
      where: { createdBy: userId },
    });

    if (tasksCount >= subscription.maxTasks) {
      throw new ApiError(
        403,
        `You have reached the maximum task limit (${subscription.maxTasks}). Please upgrade your plan.`
      );
    }

    next();
  }
);

// Check if user can add members to workspace
export const canAddWorkspaceMembers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { workspaceId } = req.params;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new ApiError(404, "Subscription not found");

    // Check if max members is unlimited
    if (subscription.maxMembers === -1) {
      return next();
    }

    // Count current members in workspace
    const membersCount = await prisma.workspaceMembers.count({
      where: { workspaceId },
    });

    if (membersCount >= subscription.maxMembers) {
      throw new ApiError(
        403,
        `You have reached the maximum member limit (${subscription.maxMembers}). Please upgrade your plan.`
      );
    }

    next();
  }
);
