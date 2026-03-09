import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { createBrevoTransporter } from "./email.brevo";

// Singleton transporter to reuse connections
let transporter: nodemailer.Transporter | null = null;

//configure transporter
const initializeTransporter = async () => {
    // ── Priority 1: Use Brevo if API key is available (recommended for production) ──
    if (process.env.BREVO_API_KEY) {
        console.log('📧 Using Brevo for email delivery');
        return createBrevoTransporter();
    }

    // ── Priority 2: Use SMTP for production (may be blocked on cloud platforms) ──
    //for production, use actual smtp credentials
    if (process.env.NODE_ENV === 'production') {
        console.log('📧 Using SMTP for email delivery');
        // Use port 465 with SSL for better compatibility with cloud platforms like Railway
        const port = Number(process.env.SMTP_PORT) || 465;
        const secure = port === 465 ? true : (process.env.SMTP_SECURE === 'true');
        
        const smtpConfig: SMTPTransport.Options = {
            host: process.env.SMTP_HOST,
            port: port,
            secure: secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            // Add timeouts to prevent hanging connections
            connectionTimeout: 30000, // 30 seconds
            greetingTimeout: 30000,
            socketTimeout: 30000,
            // Add debug logging in production to troubleshoot
            logger: process.env.DEBUG_EMAIL === 'true',
            debug: process.env.DEBUG_EMAIL === 'true',
        };
        
        return nodemailer.createTransport(smtpConfig);
    }

    // ── Priority 3: Use Ethereal for development/testing ──
    console.log('📧 Using Ethereal for email testing');
    const account = await nodemailer.createTestAccount();
    
    const etherealConfig: SMTPTransport.Options = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: account.user,
            pass: account.pass,
        },
    };
    
    return nodemailer.createTransport(etherealConfig);
};

// Get or create transporter (singleton pattern)
export const getTransporter = async () => {
    if (transporter) {
        return transporter;
    }

    transporter = await initializeTransporter();
    
    // Verify connection (works for both Resend and SMTP)
    try {
        await transporter.verify();
        console.log('✅ Email service is ready to send emails');
    } catch (error) {
        console.error('❌ Email service connection failed:', error);
        transporter = null; // Reset so it can be retried
        throw error;
    }
    
    return transporter;
};

// Export for backward compatibility (deprecated)
export const createTransporter = getTransporter;