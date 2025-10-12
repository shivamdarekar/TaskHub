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
        .button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
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
          <h2>TaskHub Email Verification</h2>
        </div>
        
        <p>Hello ${userName},</p>
        
        <p>Thank you for signing up for TaskHub. To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${verificationLink}" class="button">Verify Email Address</a>
        </div>
        
        <p>This verification link will expire in 10 minutes.</p>
        
        <p>If you did not create an account, you can safely ignore this email.</p>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TaskHub. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
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