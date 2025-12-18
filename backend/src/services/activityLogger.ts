import prisma from "../config/prisma";

export enum ActivityType{
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_DELETED = "PROJECT_DELETED",
  PROJECT_MEMBER_ADDED = "PROJECT_MEMBER_ADDED",
  PROJECT_MEMBER_REMOVED = "PROJECT_MEMBER_REMOVED",

  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
  TASK_PRIORITY_CHANGED = "TASK_PRIORITY_CHANGED",

  COMMENT_ADDED = "COMMENT_ADDED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_DELETED = "COMMENT_DELETED",

  FILE_UPLOADED = "FILE_UPLOADED",
  FILE_DELETED = "FILE_DELETED",
}

interface LogActivityParams{
    type: ActivityType;
    description: string;
    userId: string;
    projectId: string
}

export const logActivity = async({
    type,
    description,
    userId,
    projectId,
}: LogActivityParams) => {
    try{
        await prisma.activity.create({
            data:{
                type,
                description,
                userId,
                projectId,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:",error);
    }
};