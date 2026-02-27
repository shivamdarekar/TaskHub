import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import prisma from "../config/prisma";

// Check if user can create workspace
export const canCreateWorkspace = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) throw new ApiError(401, "Not Authorized");

    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new ApiError(404, "Subscription not found");

    // Check if subscription has expired and auto-downgrade
    const now = new Date();
    if (
      subscription.plan !== "FREE" &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd < now
    ) {
      // Auto-downgrade to FREE limits on expiry
      subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          plan: "FREE",
          status: "EXPIRED",
          frequency: "monthly",
          maxWorkspaces: 1,
          maxMembers: 2,
          maxProjects: 5,
          maxTasks: 20,
          maxStorage: 0,
        },
      });
    }

    // Check if max workspaces is unlimited
    if (subscription.maxWorkspaces === -1) {
      return next();
    }

    // Count current workspaces OWNED by the user (not memberships)
    const workspacesCount = await prisma.workSpace.count({
      where: { ownerId: userId },
    });

    if (workspacesCount >= subscription.maxWorkspaces) {
      throw new ApiError(
        403,
        `You have ${workspacesCount} workspaces but your ${subscription.plan} plan allows ${subscription.maxWorkspaces}. Upgrade to create more or delete ${workspacesCount - subscription.maxWorkspaces + 1} workspace(s).`
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

    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new ApiError(404, "Subscription not found");

    // Check if subscription has expired and auto-downgrade
    const now = new Date();
    if (
      subscription.plan !== "FREE" &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd < now
    ) {
      // Auto-downgrade to FREE limits on expiry
      subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          plan: "FREE",
          status: "EXPIRED",
          frequency: "monthly",
          maxWorkspaces: 1,
          maxMembers: 2,
          maxProjects: 5,
          maxTasks: 20,
          maxStorage: 0,
        },
      });
    }

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
        `You have ${projectsCount} projects but your ${subscription.plan} plan allows ${subscription.maxProjects}. Upgrade to create more or delete ${projectsCount - subscription.maxProjects + 1} project(s).`
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

    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) throw new ApiError(404, "Subscription not found");

    // Check if subscription has expired and auto-downgrade
    const now = new Date();
    if (
      subscription.plan !== "FREE" &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd < now
    ) {
      // Auto-downgrade to FREE limits on expiry
      subscription = await prisma.subscription.update({
        where: { userId },
        data: {
          plan: "FREE",
          status: "EXPIRED",
          frequency: "monthly",
          maxWorkspaces: 1,
          maxMembers: 2,
          maxProjects: 5,
          maxTasks: 20,
          maxStorage: 0,
        },
      });
    }

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
        `You have ${tasksCount} tasks but your ${subscription.plan} plan allows ${subscription.maxTasks}. Upgrade to create more or delete ${tasksCount - subscription.maxTasks + 1} task(s).`
      );
    }

    next();
  }
);

// Check if user can add members to workspace (checks WORKSPACE OWNER's subscription)
export const canAddWorkspaceMembers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { workspaceId } = req.params;

    if (!userId) throw new ApiError(401, "Not Authorized");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

    // Get workspace owner
    const workspace = await prisma.workSpace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (!workspace) throw new ApiError(404, "Workspace not found");

    // Check WORKSPACE OWNER's subscription (not the inviter's)
    let subscription = await prisma.subscription.findUnique({
      where: { userId: workspace.ownerId },
    });

    if (!subscription) throw new ApiError(404, "Workspace owner subscription not found");

    // Check if workspace owner's subscription has expired and auto-downgrade
    const now = new Date();
    if (
      subscription.plan !== "FREE" &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd < now
    ) {
      // Auto-downgrade to FREE limits on expiry
      subscription = await prisma.subscription.update({
        where: { userId: workspace.ownerId },
        data: {
          plan: "FREE",
          status: "EXPIRED",
          frequency: "monthly",
          maxWorkspaces: 1,
          maxMembers: 2,
          maxProjects: 5,
          maxTasks: 20,
          maxStorage: 0,
        },
      });
    }

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
        `This workspace has ${membersCount} members but the owner's ${subscription.plan} plan allows ${subscription.maxMembers}. The workspace owner needs to upgrade their plan or remove ${membersCount - subscription.maxMembers + 1} member(s).`
      );
    }

    next();
  }
);
