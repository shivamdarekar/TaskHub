# Redis Caching Implementation Guide

This guide shows how to implement caching in your controllers using the Redis setup.

## Example 1: Cache User Profile (fetchCurrentUser)

**Location:** `backend/src/controllers/user.controller.ts`

```typescript
import { getCache, setCache, CacheTTL } from "../services/cache.service";
import { CacheKeys } from "../utils/cacheKeys";
import { invalidateUserCache } from "../utils/cacheInvalidation";

const fetchCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Not Authorized");

  // Try cache first
  const cacheKey = CacheKeys.userProfile(userId);
  const cachedUser = await getCache(cacheKey);
  
  if (cachedUser) {
    return res.status(200).json(
      new ApiResponse(200, cachedUser, "User fetched from cache")
    );
  }

  // Fetch from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      // ... other fields
    }
  });

  if (!user) throw new ApiError(404, "User not found");

  // Cache for 1 hour
  await setCache(cacheKey, user, CacheTTL.VERY_LONG);

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

// When updating user profile, invalidate cache
const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  // ... update logic ...
  
  // Invalidate user cache after update
  await invalidateUserCache(userId);
  
  return res.status(200).json(/* ... */);
});
```

## Example 2: Cache Workspace Overview

**Location:** `backend/src/controllers/workspace.controller.ts`

```typescript
import { getCache, setCache, CacheTTL } from "../services/cache.service";
import { CacheKeys } from "../utils/cacheKeys";
import { invalidateWorkspaceCache } from "../utils/cacheInvalidation";

const getWorkspaceOverview = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const userId = req.user?.id;

  // Try cache first
  const cacheKey = CacheKeys.workspaceOverview(workspaceId);
  const cached = await getCache(cacheKey);
  
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, cached, "Workspace overview from cache")
    );
  }

  // Fetch from database
  const overview = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      // ... includes
    }
  });

  // Cache for 5 minutes
  await setCache(cacheKey, overview, CacheTTL.MEDIUM);

  return res.status(200).json(
    new ApiResponse(200, overview, "Workspace overview fetched")
  );
});

// Invalidate when workspace is updated
const updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  // ... update logic ...
  
  await invalidateWorkspaceCache(workspaceId);
  
  return res.status(200).json(/* ... */);
});
```

## Example 3: Cache Project Overview with Status Counts

**Location:** `backend/src/controllers/project.controller.ts`

```typescript
import { getCache, setCache, CacheTTL } from "../services/cache.service";
import { CacheKeys } from "../utils/cacheKeys";
import { invalidateProjectCache } from "../utils/cacheInvalidation";

const getProjectOverview = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new ApiError(401, "Not Authorized");
  if (!projectId) throw new ApiError(400, "ProjectId is required");

  // Try cache first
  const cacheKey = CacheKeys.projectOverview(projectId);
  const cached = await getCache(cacheKey);
  
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, cached, "Project overview from cache")
    );
  }

  // Fetch from database
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: true,
      members: true,
    }
  });

  if (!project) throw new ApiError(404, "Project not found");

  // Calculate status counts
  const statusCounts = {
    TODO: project.tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    COMPLETED: project.tasks.filter(t => t.status === 'COMPLETED').length,
  };

  const result = { project, statusCounts };

  // Cache for 5 minutes
  await setCache(cacheKey, result, CacheTTL.MEDIUM);

  return res.status(200).json(
    new ApiResponse(200, result, "Project overview fetched")
  );
});

// Invalidate when tasks are updated
const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  
  // ... update logic ...
  
  // Invalidate project and task cache
  await invalidateTaskCache(taskId, task.projectId);
  
  return res.status(200).json(/* ... */);
});
```

## Example 4: Cache Kanban Board Tasks

**Location:** `backend/src/controllers/task.controller.ts`

```typescript
import { getCache, setCache, CacheTTL } from "../services/cache.service";
import { CacheKeys } from "../utils/cacheKeys";

const getKanbanTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { view = 'default' } = req.query;

  // Try cache first (shorter TTL for real-time data)
  const cacheKey = CacheKeys.kanbanTasks(projectId, view as string);
  const cached = await getCache(cacheKey);
  
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, cached, "Kanban tasks from cache")
    );
  }

  // Fetch from database
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { position: 'asc' },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      subtasks: true,
    }
  });

  // Group by status
  const kanbanData = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    IN_REVIEW: tasks.filter(t => t.status === 'IN_REVIEW'),
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED'),
  };

  // Cache for 1 minute (shorter TTL for frequently updated data)
  await setCache(cacheKey, kanbanData, CacheTTL.SHORT);

  return res.status(200).json(
    new ApiResponse(200, kanbanData, "Kanban tasks fetched")
  );
});
```

## Example 5: Cache Subscription Limits

**Location:** `backend/src/middleware/subscriptionLimit.middleware.ts`

```typescript
import { getCache, setCache, CacheTTL } from "../services/cache.service";
import { CacheKeys } from "../utils/cacheKeys";

export const checkProjectLimit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Not Authorized");

    // Try cache first
    const cacheKey = CacheKeys.subscriptionLimits(userId);
    let limits = await getCache(cacheKey);

    if (!limits) {
      // Fetch from database
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        select: { 
          plan: true,
          projectLimit: true,
          memberLimit: true,
        }
      });

      limits = subscription || { plan: 'FREE', projectLimit: 5, memberLimit: 3 };

      // Cache for 30 minutes
      await setCache(cacheKey, limits, CacheTTL.LONG);
    }

    // Check limits
    const projectCount = await prisma.project.count({
      where: { createdBy: userId }
    });

    if (projectCount >= limits.projectLimit) {
      throw new ApiError(403, "Project limit reached for your plan");
    }

    next();
  }
);
```

## Cache Invalidation Patterns

### When to Invalidate Cache

1. **User Updates**: Profile changes, settings updates
   ```typescript
   await invalidateUserCache(userId);
   ```

2. **Workspace Updates**: Name, description, members changes
   ```typescript
   await invalidateWorkspaceCache(workspaceId);
   ```

3. **Project Updates**: Any project data changes
   ```typescript
   await invalidateProjectCache(projectId);
   ```

4. **Task Updates**: Task creation, updates, deletions
   ```typescript
   await invalidateTaskCache(taskId, projectId);
   ```

5. **Subscription Updates**: Plan changes, upgrades
   ```typescript
   await invalidateSubscriptionCache(userId);
   ```

## Rate Limiting with Redis

**Location:** `backend/src/middleware/rateLimiter.ts`

```typescript
import { incrementCache } from "../services/cache.service";
import { CacheKeys } from "../utils/cacheKeys";

export const apiRateLimit = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip;
    const endpoint = req.path;
    
    const key = CacheKeys.rateLimit(identifier, endpoint);
    const count = await incrementCache(key, 60); // 60 second window

    if (count > 100) { // 100 requests per minute
      throw new ApiError(429, "Too many requests, please try again later");
    }

    next();
  }
);
```

## Best Practices

1. **Choose Appropriate TTL**: 
   - Short (1 min): Real-time data (kanban, activities)
   - Medium (5 min): Overview data (projects, workspaces)
   - Long (30 min): Subscription limits, configuration
   - Very Long (1 hour): User profiles, static content

2. **Always Handle Cache Failures**: Cache operations should never break your app
   ```typescript
   const cached = await getCache(key);
   if (cached) return cached;
   // Always fallback to database
   ```

3. **Invalidate Strategically**: Clear cache after write operations

4. **Use Consistent Keys**: Always use `CacheKeys` utility for key generation

5. **Monitor Cache Hit Rate**: Track how often cache is used vs. database queries
