import { deleteCachePattern, deleteCache } from '../config/cache.service';
import { CacheKeys } from './cacheKeys';

/**
 * Cache invalidation helpers to keep cache in sync with database updates
 */

export const invalidateUserCache = async (userId: string): Promise<void> => {
  await Promise.all([
    deleteCache(CacheKeys.user(userId)),
    deleteCache(CacheKeys.userProfile(userId)),
    deleteCache(CacheKeys.userStats(userId)),
    deleteCache(CacheKeys.userWorkspaces(userId)),
    deleteCache(CacheKeys.subscription(userId)),
    deleteCache(CacheKeys.subscriptionLimits(userId)),
  ]);
};

export const invalidateWorkspaceCache = async (workspaceId: string): Promise<void> => {
  await Promise.all([
    deleteCache(CacheKeys.workspace(workspaceId)),
    deleteCache(CacheKeys.workspaceOverview(workspaceId)),
    deleteCache(CacheKeys.workspaceMembers(workspaceId)),
    deleteCache(CacheKeys.workspaceProjects(workspaceId)),
  ]);
};

export const invalidateProjectCache = async (projectId: string): Promise<void> => {
  await Promise.all([
    deleteCache(CacheKeys.project(projectId)),
    deleteCache(CacheKeys.projectOverview(projectId)),
    deleteCache(CacheKeys.projectMembers(projectId)),
    deleteCachePattern(CacheKeys.projectTasks(projectId, 0, '*')),
    deleteCachePattern(`project:${projectId}:tasks:*`),
    deleteCachePattern(`project:${projectId}:kanban:*`),
    deleteCachePattern(`project:${projectId}:calendar:*`),
    deleteCachePattern(`project:${projectId}:activities:*`),
  ]);
};

export const invalidateTaskCache = async (taskId: string, projectId: string): Promise<void> => {
  await Promise.all([
    deleteCache(CacheKeys.task(taskId)),
    deleteCache(CacheKeys.taskComments(taskId)),
    invalidateProjectCache(projectId),
  ]);
};

export const invalidateSubscriptionCache = async (userId: string): Promise<void> => {
  await Promise.all([
    deleteCache(CacheKeys.subscription(userId)),
    deleteCache(CacheKeys.subscriptionLimits(userId)),
  ]);
};
