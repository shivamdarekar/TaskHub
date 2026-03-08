import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

// Singleton transporter to reuse connections
let transporter: nodemailer.Transporter | null = null;

//configure transporter
const initializeTransporter = async () => {
    //for production, use actual smtp credentials
    if (process.env.NODE_ENV === 'production') {
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

    //for dev/testing use ethereal
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
    
    // Verify SMTP connection
    try {
        await transporter.verify();
        console.log('✅ SMTP Server is ready to send emails');
    } catch (error) {
        console.error('❌ SMTP Server connection failed:', error);
        transporter = null; // Reset so it can be retried
        throw error;
    }
    
    return transporter;
};

// Export for backward compatibility (deprecated)
export const createTransporter = getTransporter;