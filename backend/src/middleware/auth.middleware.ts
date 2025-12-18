import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../config/prisma";

// Extend Express Request to include `user`
// export interface AuthRequest extends Request {
//   user?: { id: string; email: string }; // attach minimal user info
// }

// global augmentation (available everywhere, no casting needed)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      task?: {
        id: string;
        createdBy: string;
        assigneeId?: string | null;
        projectOwnerId: string;
      };
    }
  }
}


export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //Get token from cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not provided");
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, "Session expired. Please login again.");
      }
      throw new ApiError(401, "Unauthorized: Invalid or expired token");
    }

    // Find user by ID from token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true }, // minimal info
    });

    if (!user) {
      throw new ApiError(404, "Unauthorized: User not found");
    }

    // Attach user to request
    req.user = user;

    next();
  }
);
