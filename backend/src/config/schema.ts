import { z } from "zod";

export const registerSchema = z.object({
    email: z.email({ message: "Invalid email address" }).nonempty({ message: "Email is required" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }).nonempty({ message: "Name is required" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain a special character" })

});

export const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }).nonempty({ message: "Email is required" }),
    password: z.string().nonempty({ message: "Password is required" })
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
