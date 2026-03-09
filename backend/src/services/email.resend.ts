import { Resend } from 'resend';
import nodemailer from 'nodemailer';

let resendClient: Resend | null = null;

// Initialize Resend client
const getResendClient = () => {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
};

// Create a nodemailer-compatible transporter using Resend
export const createResendTransporter = () => {
    const client = getResendClient();
    
    // Create a nodemailer-like interface for compatibility
    return {
        verify: async () => {
            // Resend doesn't need verification, but we'll check if API key exists
            if (!process.env.RESEND_API_KEY) {
                throw new Error('RESEND_API_KEY is not configured');
            }
            console.log('✅ Resend API key configured');
            return true;
        },
        sendMail: async (mailOptions: {
            from: string;
            to: string;
            subject: string;
            html: string;
        }) => {
            try {
                const result = await client.emails.send({
                    from: mailOptions.from || process.env.EMAIL_FROM || 'TaskHub <onboarding@resend.dev>',
                    to: [mailOptions.to],
                    subject: mailOptions.subject,
                    html: mailOptions.html,
                });

                // Check for errors in response
                if (result.error) {
                    console.error('❌ Resend error:', result.error);
                    throw new Error(`Failed to send email via Resend: ${result.error.message}`);
                }

                console.log('📧 Email sent via Resend:', result.data?.id || 'success');
                
                // Return nodemailer-compatible response
                return {
                    messageId: result.data?.id || 'resend-success',
                    accepted: [mailOptions.to],
                    rejected: [],
                    response: 'OK',
                };
            } catch (error: any) {
                console.error('❌ Resend error:', error);
                throw new Error(`Failed to send email via Resend: ${error.message}`);
            }
        },
    } as nodemailer.Transporter;
};
