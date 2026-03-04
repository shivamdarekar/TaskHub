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
      const workspaceWord = subscription.maxWorkspaces === 1 ? 'workspace' : 'workspaces';
      const deleteCount = workspacesCount - subscription.maxWorkspaces + 1;
      const deleteWord = deleteCount === 1 ? 'workspace' : 'workspaces';
      
      throw new ApiError(
        403,
        `You've reached your workspace limit (${workspacesCount}/${subscription.maxWorkspaces} ${workspaceWord}). Upgrade your ${subscription.plan} plan to create more workspaces, or delete ${deleteCount} ${deleteWord} first.`
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
      const projectWord = subscription.maxProjects === 1 ? 'project' : 'projects';
      const deleteCount = projectsCount - subscription.maxProjects + 1;
      const deleteWord = deleteCount === 1 ? 'project' : 'projects';
      
      throw new ApiError(
        403,
        `You've reached your project limit (${projectsCount}/${subscription.maxProjects} ${projectWord}). Upgrade your ${subscription.plan} plan to create more projects, or delete ${deleteCount} ${deleteWord} first.`
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
      const taskWord = subscription.maxTasks === 1 ? 'task' : 'tasks';
      const deleteCount = tasksCount - subscription.maxTasks + 1;
      const deleteWord = deleteCount === 1 ? 'task' : 'tasks';
      
      throw new ApiError(
        403,
        `You've reached your task limit (${tasksCount}/${subscription.maxTasks} ${taskWord}). Upgrade your ${subscription.plan} plan to create more tasks, or delete ${deleteCount} ${deleteWord} first.`
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
      const memberWord = subscription.maxMembers === 1 ? 'member' : 'members';
      const removeCount = membersCount - subscription.maxMembers + 1;
      const removeWord = removeCount === 1 ? 'member' : 'members';
      
      throw new ApiError(
        403,
        `This workspace has reached its member limit (${membersCount}/${subscription.maxMembers} ${memberWord}). The workspace owner needs to upgrade their ${subscription.plan} plan or remove ${removeCount} ${removeWord} first.`
      );
    }

    next();
  }
);
