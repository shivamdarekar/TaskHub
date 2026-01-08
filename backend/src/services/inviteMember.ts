import { ApiError } from "../utils/apiError";
import { createTransporter } from "./email.service";
import nodemailer from "nodemailer";

const createInviteTemplate = (inviteLink: string, workspaceName: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Invitation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
                <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <span style="color: white; font-size: 24px; font-weight: bold;">TH</span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">You're Invited!</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Join your team on TaskHub</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <p style="color: #374151; font-size: 18px; margin: 0 0 16px 0; text-align: center;">
                    You've been invited to join the workspace <strong style="color: #1f2937;">${workspaceName}</strong>
                </p>
                
                <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0; text-align: center;">
                    Click the button below to accept the invitation and start collaborating with your team.
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${inviteLink}" 
                       style="display: inline-block;
                              background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                              color: white;
                              text-decoration: none;
                              padding: 16px 32px;
                              border-radius: 8px;
                              font-weight: 600;
                              font-size: 16px;
                              box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
                              transition: all 0.2s ease;">
                        Join Workspace
                    </a>
                </div>
                
                <!-- Divider -->
                <div style="border-top: 1px solid #e5e7eb; margin: 32px 0; padding-top: 24px;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0; text-align: center;">
                        Having trouble with the button? Copy and paste this link:
                    </p>
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
                        <a href="${inviteLink}" style="color: #2563eb; font-size: 14px; word-break: break-all; text-decoration: none;">${inviteLink}</a>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                    This invitation will expire in 7 days.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    If you didn't expect this invitation, you can safely ignore this email.
                </p>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                        © ${new Date().getFullYear()} TaskHub. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const sendWorkspaceInviteEmail = async(
    email: string,
    workspaceName: string,
    inviteLink: string,
) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"TaskHub" <noreply@taskhub.com>',
            to: email,
            subject: `Invitation to join ${workspaceName}`,
            html: createInviteTemplate(inviteLink, workspaceName),
        };

        const info = await transporter.sendMail(mailOptions);

            //log email preview url in development
            if (process.env.NODE_ENV !== 'production' && info.messageId) {
                console.log('Email preview url:', nodemailer.getTestMessageUrl(info));
            }

        //console.log(info);
        return info;
    } catch (error) {
        console.error('Error sending invite email:', error);
        throw new ApiError(500, "Failed to send invite email");
    }
}