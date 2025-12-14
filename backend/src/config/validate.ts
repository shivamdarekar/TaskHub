import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error: any) {
       // Check if it's a ZodError and handle accordingly
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue) => ({
                field: issue.path.join('.') || 'body',
                message: issue.message
            }));
            
            return next(new ApiError(400, "Validation failed", errorMessages));
        }
        
        // If it's not a ZodError, pass it as a general error
        return next(new ApiError(500, "Internal server error"));
    }
};