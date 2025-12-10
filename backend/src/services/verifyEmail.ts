import nodemailer, { getTestMessageUrl } from "nodemailer";
import { ApiError } from "../utils/apiError";
import { createTransporter } from "./email.service";

//html template
const createVerificationEmailTemplate = (userName: string, verificationLink: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: #f3f4f6;
          padding: 20px;
        }
        .email-wrapper {
          max-width: 480px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .header {
          background: #3b82f6;
          padding: 20px;
          text-align: center;
        }
        .logo {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .logo-text {
          color: #ffffff;
          font-size: 18px;
          font-weight: bold;
        }
        .header h1 {
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        .content {
          padding: 20px;
        }
        .greeting {
          font-size: 15px;
          font-weight: 600;
          color: #172b4d;
          margin-bottom: 8px;
        }
        .message {
          color: #5e6c84;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .button-container {
          text-align: center;
          margin: 16px 0;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
        }
        .info-box {
          background: #f4f5f7;
          padding: 10px 12px;
          border-radius: 4px;
          margin: 12px 0;
        }
        .info-box p {
          color: #5e6c84;
          font-size: 12px;
          margin: 0;
        }
        .footer {
          background: #fafbfc;
          padding: 16px;
          text-align: center;
          border-top: 1px solid #dfe1e6;
        }
        .footer p {
          color: #8993a4;
          font-size: 11px;
          margin: 4px 0;
        }
        .divider {
          height: 1px;
          background: #dfe1e6;
          margin: 12px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo">
            <span class="logo-text">TH</span>
          </div>
          <h1>Verify Your Email</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hello ${userName},</p>
          
          <p class="message">
            Welcome to TaskHub! Please verify your email address to complete your registration.
          </p>
          
          <div class="button-container">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          
          <div class="info-box">
            <p><strong>Note:</strong> This link expires in 10 minutes.</p>
          </div>
          
          <div class="divider"></div>
          
          <p class="message" style="font-size: 13px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TaskHub. All rights reserved.</p>
          <p style="margin-top: 8px;">This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};


//send verification email function
export const sendVerificationEmail = async (
    email: string,
    userName: string,
    verificationToken: string
) => {
    try {
        const transporter = await createTransporter();

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"TaskHub" <noreply@taskhub.com>',
            to: email,
            subject: 'Verify Your Email Address - TaskHub',
            html: createVerificationEmailTemplate(userName, verificationLink),
        };

        const info = await transporter.sendMail(mailOptions);

        //log email preview url in development
        if (process.env.NODE_ENV !== 'production' && info.messageId) {
            console.log('Email preview url:', nodemailer, getTestMessageUrl(info));
        }

        return info;

    } catch (error) {
        console.error("Error while sending verification email", error);
        throw new ApiError(500, "Failed to send verification email");
    }
};