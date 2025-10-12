import { ApiError } from "../utils/apiError";
import { createTransporter } from "./email.service";
import nodemailer from "nodemailer";


const createPasswordResetOTPTemplate = (userName: string, otp: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #e1e1e1;
          border-radius: 5px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #e1e1e1;
          margin-bottom: 20px;
        }
        .otp-container {
          margin: 20px 0;
          text-align: center;
        }
        .otp-code {
          font-size: 32px;
          letter-spacing: 5px;
          font-weight: bold;
          color: #007bff;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          text-align: center;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>TaskHub Password Reset</h2>
        </div>
        
        <p>Hello ${userName},</p>
        
        <p>We received a request to reset your password. Use the following OTP code to reset your password:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
        
        <p>This code will expire in 10 minutes for security reasons.</p>
        
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TaskHub. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendPasswordResetOTP = async(
    email: string,
    userName: string,
    otp:string
) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"TaskHub" <noreply@taskhub.com>',
            to: email,
            subject: 'Your Password Reset OTP - TaskHub',
            html: createPasswordResetOTPTemplate(userName, otp),
        };

        const info = await transporter.sendMail(mailOptions);

        //log email preview url in development
        if (process.env.NODE_ENV !== 'production' && info.messageId) {
            console.log('Email privew url:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending otp email:', error);
        throw new ApiError(500, "Failed to send OTP email");
    }
}