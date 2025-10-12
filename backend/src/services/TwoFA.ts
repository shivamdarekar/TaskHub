import nodemailer from "nodemailer";
import { ApiError } from "../utils/apiError";
import { createTransporter } from "./email.service";

const createTwoFAEmailTemplate = (userName: string, otp: string) => {
    return `
     <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Login Verification Code</title>
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
          <h2>TaskHub Login Verification</h2>
        </div>
        
        <p>Hello ${userName},</p>
        
        <p>Your two-factor authentication code for TaskHub is:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
        
        <p>This code will expire in 10 minutes.</p>
        
        <p>If you didn't attempt to login to TaskHub, please secure your account immediately.</p>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TaskHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
 `;
};

export const sendTwoFAEmail = async (
    email: string,
    userName: string,
    otp: string
) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"TaskHub" <noreply@taskhub.com>',
            to: email,
            subject: 'Your TaskHub Login Verification code',
            html: createTwoFAEmailTemplate(userName, otp),
        };

        const info = await transporter.sendMail(mailOptions);

        if (process.env.NODE_ENV !== 'production' && info.messageId) {
            console.log('Email preview url:', nodemailer.getTestMessageUrl(info));
        }

        return info;

    } catch (err) {
        console.error('Error sending 2FA email: ',err);
        throw new ApiError(500, 'Failed to send verification code');
    }
}