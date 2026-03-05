/**
 * Cache key generators for consistent Redis key naming
 */
export const CacheKeys = {
  // ========================================
  // User Related
  // ========================================
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userStats: (userId: string) => `user:${userId}:stats`,
  userWorkspaces: (userId: string) => `user:${userId}:workspaces`,
  
  // ========================================
  // Workspace Related
  // ========================================
  workspace: (workspaceId: string) => `workspace:${workspaceId}`,
  workspaceOverview: (workspaceId: string) => `workspace:${workspaceId}:overview`,
  workspaceMembers: (workspaceId: string) => `workspace:${workspaceId}:members`,
  workspaceProjects: (workspaceId: string) => `workspace:${workspaceId}:projects`,
  
  // ========================================
  // Project Related
  // ========================================
  project: (projectId: string) => `project:${projectId}`,
  projectOverview: (projectId: string) => `project:${projectId}:overview`,
  projectMembers: (projectId: string) => `project:${projectId}:members`,
  projectTasks: (projectId: string, page: number = 1, filters: string = 'all') => 
    `project:${projectId}:tasks:p${page}:${filters}`,
  projectActivities: (projectId: string, page: number = 1) => 
    `project:${projectId}:activities:p${page}`,
  projectRecentActivities: (projectId: string) => 
    `project:${projectId}:activities:recent`,
  
  // ========================================
  // Task Related
  // ========================================
  task: (taskId: string) => `task:${taskId}`,
  taskComments: (taskId: string) => `task:${taskId}:comments`,
  kanbanTasks: (projectId: string, view: string = 'default') => 
    `project:${projectId}:kanban:${view}`,
  calendarTasks: (projectId: string, startDate: string, endDate: string) => 
    `project:${projectId}:calendar:${startDate}:${endDate}`,
  userTasks: (workspaceId: string, userId: string, page: number = 1) => 
    `workspace:${workspaceId}:user:${userId}:tasks:p${page}`,
  
  // ========================================
  // Subscription Related
  // ========================================
  subscription: (userId: string) => `subscription:${userId}`,
  subscriptionLimits: (userId: string) => `subscription:${userId}:limits`,
  
  // ========================================
  // Rate Limiting
  // ========================================
  rateLimit: (identifier: string, endpoint: string) => 
    `rateLimit:${identifier}:${endpoint}`,
} as const;
