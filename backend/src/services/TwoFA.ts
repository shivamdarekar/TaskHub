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
        .otp-container {
          background: #f4f5f7;
          border: 1px solid #dfe1e6;
          border-radius: 6px;
          padding: 16px;
          text-align: center;
          margin: 16px 0;
        }
        .otp-label {
          color: #5e6c84;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .otp-code {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #172b4d;
          font-family: 'Courier New', monospace;
        }
        .warning-box {
          background: #ffebe6;
          padding: 10px 12px;
          border-radius: 4px;
          margin: 12px 0;
        }
        .warning-box p {
          color: #bf2600;
          font-size: 12px;
          margin: 0;
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
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo">
            <span class="logo-text">TH</span>
          </div>
          <h1>Login Verification</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hello ${userName},</p>
          
          <p class="message">
            We detected a login attempt to your TaskHub account. Use the code below to complete sign-in.
          </p>
          
          <div class="otp-container">
            <div class="otp-label">2FA Code</div>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="info-box">
            <p><strong>Note:</strong> This code expires in 10 minutes.</p>
          </div>
          
          <div class="warning-box">
            <p><strong>Security Alert:</strong> If you didn't attempt to login, please secure your account immediately.</p>
          </div>
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
