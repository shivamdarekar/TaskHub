import { ApiError } from "../utils/apiError";
import { createTransporter } from "./email.service";
import nodemailer from "nodemailer";

const createInviteTemplate = (inviteLink: string, workspaceName: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Workspace Invitation</title>
    </head>
    <body style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px;">
            <h1 style="color: #1f2937; margin-bottom: 20px;">You're Invited!</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                You've been invited to join the workspace <strong>${workspaceName}</strong> on TaskHub.
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Click the button below to accept the invitation and start collaborating:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" 
                   style="background: linear-gradient(to right, #2563eb, #4f46e5); 
                          color: white; 
                          padding: 14px 32px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block;
                          font-weight: 600;">
                    Join Workspace
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
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