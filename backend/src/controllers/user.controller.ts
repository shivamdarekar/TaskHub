import { asyncHandler } from "../utils/asynchandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { Request, Response } from "express";
import { generateTokens } from "../utils/tokens";
import prisma from "../config/prisma";
import { comparePassword, generate2FAOtp, generateEmailVerificationToken, generatePasswordResetOtp, generateTwoFAToken, hashOtp, hashPassword } from "../utils/auth";
import { CookieOptions } from 'express';
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../services/verifyEmail";
import { sendPasswordResetOTP } from "../services/resetPass";
import { sendTwoFAEmail } from "../services/TwoFA";


interface RegisterUserBody {
  name: string;
  email: string;
  password: string;
}

interface LoginUserBody {
  email: string
  password: string
}

interface ForgorPasswordBody {
  email: string
}

interface VerifyOtpBody {
  email: string
  otp: string
}

interface ResetPasswordBody {
  email: string
  password: string
  confirmPassword: string
}

interface Toggle2FABody {
  password: string;
}

interface Verify2FABody {
  email: string;
  twoFAToken: string;
  otp: string;
}


//register User
const registerUser = asyncHandler(async (req: Request<{}, {}, RegisterUserBody>, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) throw new ApiError(400, "All fields are required");

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) throw new ApiError(409, "User already exists");

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  if (!user) throw new ApiError(500, "Error while creating User");

  //generate verification token
  const verificationToken = generateEmailVerificationToken(user.id);

  //send email with verification link
  await sendVerificationEmail(user.email, user.name, verificationToken);

  return res
    .status(201)
    .json(new ApiResponse(201, "Verification link send to you registered email"));
});


//verify email
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token != 'string') {
    throw new ApiError(400, "Invalid verification token");
  }

  try {
    //verify the token
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET as string) as { id: string };

    //update user's verification status
    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { isEmailverified: true }
    });

    if (!user) throw new ApiError(404, "User not found");

    return res
      .status(200).json(
        new ApiResponse(200, { verified: true }, "Email verified Successfully")
      )

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Verification Token expired");
    }

    throw new ApiError(400, "Invalid verification token");
  }
});


//resend verification 
const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  //find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) throw new ApiError(404, "User not found");

  //if email already verified
  if (user.isEmailverified) {
    return res.status(200).json(
      new ApiResponse(200, {}, "Email is already verified, Please login")
    )
  };

  const verificationToken = generateEmailVerificationToken(user.id);

  await sendVerificationEmail(user.email, user.name, verificationToken);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Verification link sent to your email"));
});


//toggle 2FA status
const toggle2FA = asyncHandler(async (req: Request<{}, {}, Toggle2FABody>, res: Response) => {
  const { password } = req.body;
  const userId = req.user?.id;

  if (!userId) throw new ApiError(400, "Not Authorized");
  if (!password) throw new ApiError(400, "Password is required to change 2FA settings");

  //find user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  //toggle 2FA status
  const is2FAenabled = !user.is2FAenabled;

  await prisma.user.update({
    where: { id: user.id },
    data: { is2FAenabled }
  });

  return res.status(200).json(
    new ApiResponse(200, { is2FAenabled }, `Two-Factor authentication ${is2FAenabled ? 'enabled' : 'disabled'} successfull`)
  );
});


//login User
const loginUser = asyncHandler(async (req: Request<{}, {}, LoginUserBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, "Email and Password are required");

  //find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(404, "Invalid Credentials");
  }

  //check email is verified
  if (!user.isEmailverified) {
    throw new ApiError(403, "Please verify your email first before logging in");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  //check if 2FA is enabled
  if (user.is2FAenabled) {
    const otp = generate2FAOtp();
    const hashedOtp = hashOtp(otp);

    //update user with new otp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFAotp: hashedOtp,
        twoFAotpExpires: new Date(Date.now() + 10 * 60 * 1000) //10 min
      }
    });

    //generate temporary token for 2FA verification
    const twoFAToken = generateTwoFAToken(user.id);

    //send otp via email
    await sendTwoFAEmail(user.email, user.name, otp);

    return res.status(200).json(
      new ApiResponse(200, {
        requiresTwoFA: true,
        twoFAToken,
        email: user.email
      }, "2FA verification required")
    );
  }

  //generate tokens 
  const { accessToken, refreshToken } = await generateTokens(user.id);

  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture ?? null,
    isEmailVerified: user.isEmailverified,
    is2FAenabled: user.is2FAenabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: safeUser }, "User Logged in successfully"))
});


//verify 2FA otp
const verify2FA = asyncHandler(async (req: Request<{}, {}, Verify2FABody>, res: Response) => {
  const { email, twoFAToken, otp } = req.body;

  if (!email || !twoFAToken || !otp) {
    throw new ApiError(400, "All fields are required");
  }

  try {
    //verify temp token
    const decoded = jwt.verify(twoFAToken, process.env.TWO_FA_TOKEN_SECRET as string) as {
      id: string;
      twoFARequired: boolean;
    };

    if (!decoded.twoFARequired) {
      throw new ApiError(400, "Invalid 2FA session");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.email != email) {
      throw new ApiError(400, "Invalid verification attempt");
    }

    if (!user.twoFAotp) {
      throw new ApiError(400, "No verification code was sent");
    }

    if (user.twoFAotpExpires && user.twoFAotpExpires < new Date()) {
      throw new ApiError(401, "Verification code has expired");
    }

    //verify otp
    const hashedOtp = hashOtp(otp);
    if (hashedOtp !== user.twoFAotp) {
      throw new ApiError(401, "Invalid verification code");
    }

    //clear otp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFAotp: null,
        twoFAotpExpires: null,
        lastLogin: new Date()
      }
    });

    //generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture ?? null,
      isEmailVerified: user.isEmailverified,
      is2FAenabled: user.is2FAenabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: safeUser }, "Two-Factor authentication successful"))
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "2FA session expired, Please login again")
    }

    if (error instanceof ApiError) throw error;

    throw new ApiError(400, "Invalid 2FA verification attempt");
  }
});


//send password reset otp
const sendPassResetOtp = asyncHandler(async (req: Request<{}, {}, ForgorPasswordBody>, res: Response) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(401, "User not Exists");
  };

  if (!user.isEmailverified) {
    throw new ApiError(403, "Please Verify your email first before reseting the password")
  }

  //generate otp
  const otp = generatePasswordResetOtp();
  const hashedOtp = hashOtp(otp);

  //save otp in db with expiry
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetOtp: hashedOtp,
      passwordResetOtpExpires: new Date(Date.now() + 10 * 60 * 1000) //10 min
    }
  });

  //send otp via email
  await sendPasswordResetOTP(user.email, user.name, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent to your email"));
});


//verify otp
const verifyOtp = asyncHandler(async (req: Request<{}, {}, VerifyOtpBody>, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Email and OTP is required");

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) throw new ApiError(404, "User not found");
  if (!user.passwordResetOtp) throw new ApiError(400, "No OTP requested");

  //check id otp expired
  if (user.passwordResetOtpExpires && user.passwordResetOtpExpires < new Date()) {
    throw new ApiError(401, "OTP has expired. Please request for new one");
  }

  //verify otp
  const hashedOtp = hashOtp(otp);
  if (hashedOtp !== user.passwordResetOtp) {
    throw new ApiError(401, "Invalid OTP");
  }

  return res.status(200).json(
    new ApiResponse(200, { verified: true }, "OTP verified successfully")
  )
});


//reset password
const resetPassword = asyncHandler(async (req: Request<{}, {}, ResetPasswordBody>, res: Response) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Password do not match");
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) throw new ApiError(404, "User not found");

  // Check if OTP was verified (must have OTP field but not be expired)
  if (!user.passwordResetOtp) {
    throw new ApiError(401, "Please verifiy OTP before resetting password");
  }

  if (user.passwordResetOtpExpires && user.passwordResetOtpExpires < new Date()) {
    throw new ApiError(401, "OTP session has expired");
  }

  //hash new password
  const hashedPassword = await hashPassword(password);

  //update password and clear otp
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetOtp: null,
      passwordResetOtpExpires: null
    }
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset successful. Please login with new Password")
  )
});


//logout user
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) throw new ApiError(401, "Not Authoorized");

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: null
    }
  });

  if (!user) throw new ApiError(401, "Error in user logout process ");

  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully"))
});


//fetch curent user
const fetchCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Not Authorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isEmailverified: true,
      is2FAenabled: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture ?? null,
    isEmailVerified: user.isEmailverified,
    is2FAenabled: user.is2FAenabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { user: safeUser }, "Current user fetched successfully"));
});


const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not provided");
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string };

    // Find user and check if refresh token matches
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        refreshToken: true,
        isEmailverified: true,
      }
    });

    if (!user) {
      throw new ApiError(404, "Invalid refresh token");
    }

    // Verify that the token in DB matches the incoming token
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is invalid or has been used");
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user.id);

    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Refresh token expired. Please login again");
    }
    if (error instanceof ApiError) throw error;

    throw new ApiError(401, "Invalid refresh token");
  }
});

//todo
//resend otp
//change name


export {
  registerUser,
  verifyEmail,
  loginUser,
  resendVerification,
  sendPassResetOtp,
  verifyOtp,
  resetPassword,
  logoutUser,
  toggle2FA,
  verify2FA,
  fetchCurrentUser,
  refreshAccessToken
};
