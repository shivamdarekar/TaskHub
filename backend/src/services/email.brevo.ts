import nodemailer from 'nodemailer';
import axios from 'axios';

// Create a nodemailer-compatible transporter using Brevo (Sendinblue) HTTP API
export const createBrevoTransporter = () => {
    const apiKey = process.env.BREVO_API_KEY;
    
    if (!apiKey) {
        throw new Error('BREVO_API_KEY is not configured');
    }
    
    // Create a nodemailer-like interface for compatibility
    return {
        verify: async () => {
            if (!process.env.BREVO_API_KEY) {
                throw new Error('BREVO_API_KEY is not configured');
            }
            console.log('✅ Brevo API key configured');
            return true;
        },
        sendMail: async (mailOptions: {
            from: string;
            to: string;
            subject: string;
            html: string;
        }) => {
            try {
                // Parse the from address - handle both formats:
                // "TaskHub <email@example.com>" or just "email@example.com"
                const fromMatch = mailOptions.from.match(/^(.+?)\s*<(.+?)>$/);
                const fromName = fromMatch?.[1]?.trim().replace(/"/g, '') ?? 'TaskHub';
                const fromEmail = fromMatch?.[2]?.trim() ?? mailOptions.from;
                
                const payload = {
                    sender: { 
                        name: fromName, 
                        email: fromEmail 
                    },
                    to: [{ email: mailOptions.to }],
                    subject: mailOptions.subject,
                    htmlContent: mailOptions.html,
                };

                const response = await axios.post(
                    'https://api.brevo.com/v3/smtp/email',
                    payload,
                    {
                        headers: {
                            'api-key': apiKey,
                            'Content-Type': 'application/json',
                            'accept': 'application/json',
                        },
                    }
                );

                console.log('📧 Email sent via Brevo:', response.data?.messageId || 'success');
                
                // Return nodemailer-compatible response
                return {
                    messageId: response.data?.messageId || 'brevo-success',
                    accepted: [mailOptions.to],
                    rejected: [],
                    response: 'OK',
                };
            } catch (error: any) {
                console.error('❌ Brevo error:', error.response?.data || error.message);
                throw new Error(`Failed to send email via Brevo: ${error.response?.data?.message || error.message}`);
            }
        },
    } as nodemailer.Transporter;
};
