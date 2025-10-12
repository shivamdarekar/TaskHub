import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

//password hashing
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

//password compare
export const comparePassword = async (enteredPassword: string, savedPassword: string) => {
    return await bcrypt.compare(enteredPassword, savedPassword);
}

//create JWT token
export const generateAccessToken = (userId: string) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn:'1d' }
    );
}

export const generateRefreshToken = (userId: string) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn:'7d' }
    );
}


//generate verification token for email
export const generateEmailVerificationToken = (userId: string) => {
    return jwt.sign(
        { id: userId },
        process.env.EMAIL_VERIFICATION_SECRET as string,
        {expiresIn: '10m'}
    )
}

//generate otp for reset password
export const generatePasswordResetOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

//hash otp berfore storing in db
export const hashOtp = (otp: string): string => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};


//Generate 2FA otp
export const generate2FAOtp = ():string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

//generate temporary token for 2FA 
export const generateTwoFAToken = (userId: string) => {
    return jwt.sign(
        { id: userId, twoFARequired: true },
        process.env.TWO_FA_TOKEN_SECRET as string,
        { expiresIn: '10m' }
    );
}
