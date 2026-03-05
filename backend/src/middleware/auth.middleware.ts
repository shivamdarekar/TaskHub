import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../config/prisma";
import { isBlacklisted } from "../config/redis";

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
        jti?: string; // JWT ID for session tracking
      };
      task?: {
        id: string;
        createdBy: string | null;
        assigneeId?: string | null;
        projectOwnerId: string;
      };
      project?: {
        id: string;
        workspaceId: string;
        createdBy: string | null;
        workspaceOwnerId: string;
      };
    }
  }
}


export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: Token not provided");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as JwtPayload & { jti?: string };

      // Check if token is blacklisted (logged out)
      if (decoded.jti && await isBlacklisted(decoded.jti)) {
        throw new ApiError(401, "Token has been revoked");
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new ApiError(404, "Unauthorized: User not found");
      }

      req.user = decoded.jti ? { ...user, jti: decoded.jti } : user;
      next();
      
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        // send specific error code for expired token
        throw new ApiError(401, "ACCESS_TOKEN_EXPIRED");
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(401, "Unauthorized: Invalid token");
    }
  }
);
