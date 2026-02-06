import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }).min(1, { message: "Name is required" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain a special character" })

});

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" })
});

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain a special character" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ["confirmPassword"]
});

export const toggle2FASchema = z.object({
    password: z.string().min(1, "Password is required")
});

export const updateProfileSchema = z.object({
    name: z.string()
        .trim()
        .min(1, { message: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(100, { message: "Name cannot exceed 100 characters" })
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain a special character" }),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

export const deleteAccountSchema = z.object({
    password: z.string().min(1, { message: "Password is required" }),
    confirmation: z.literal("DELETE", { message: "Please type DELETE to confirm" })
});

// Workspace Schemas
export const createWorkspaceSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Workspace name is required")
        .min(3, "Workspace name must be at least 3 characters")
        .max(100, "Workspace name cannot exceed 100 characters"),
    description: z.string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional()
        .nullable(),
});

export const updateWorkspaceSchema = z.object({
    name: z.string()
        .trim()
        .min(3, "Workspace name must be at least 3 characters")
        .max(100, "Workspace name cannot exceed 100 characters")
        .optional(),
    description: z.string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional()
        .nullable(),
});

// Project Schemas
export const createProjectSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Project name is required")
        .min(3, "Project name must be at least 3 characters")
        .max(100, "Project name cannot exceed 100 characters"),
    description: z.string()
        .trim()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional()
        .nullable(),
    memberIds: z.array(z.string().uuid("Invalid user ID format"))
        .optional()
        .default([]),
});

export const updateProjectSchema = z.object({
    name: z.string()
        .trim()
        .min(3, "Project name must be at least 3 characters")
        .max(100, "Project name cannot exceed 100 characters")
        .optional(),
    description: z.string()
        .trim()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional()
        .nullable(),
});

export const addProjectMembersSchema = z.object({
    memberIds: z.array(z.string().uuid("Invalid user ID format"))
        .min(1, "At least one member ID is required"),
});

export const removeProjectMemberSchema = z.object({
    userId: z.string().uuid("Invalid user ID format"),
});

// Task Schemas (can be extended for task operations)
export const createTaskSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Task title is required")
        .min(3, "Task title must be at least 3 characters")
        .max(200, "Task title cannot exceed 200 characters"),
    description: z.string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional()
        .nullable(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        .optional()
        .default("MEDIUM"),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "BACKLOG"])
        .optional()
        .default("TODO"),
    dueDate: z.string().datetime().optional().nullable(),
    assigneeId: z.string().uuid("Invalid assignee ID format").optional().nullable(),
});

export const updateTaskSchema = z.object({
    title: z.string()
        .trim()
        .min(3, "Task title must be at least 3 characters")
        .max(200, "Task title cannot exceed 200 characters")
        .optional(),
    description: z.string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional()
        .nullable(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        .optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "BACKLOG"])
        .optional(),
    dueDate: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
    assigneeId: z.string().uuid("Invalid assignee ID format").optional().nullable(),
});
