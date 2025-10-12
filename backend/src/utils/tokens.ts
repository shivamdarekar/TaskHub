import { generateAccessToken, generateRefreshToken } from "./auth";
import prisma from "../config/prisma";
import { ApiError } from "./apiError";

export const generateTokens = async (userId: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        return { accessToken, refreshToken };

        } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
}