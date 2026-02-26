import nodemailer, { getTestMessageUrl } from "nodemailer";
import { ApiError } from "../utils/apiError";
import { createTransporter } from "./email.service";

// Subscription confirmation email template
const createSubscriptionConfirmationTemplate = (userName: string, plan: string, frequency: string, amount: number, expiryDate: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Confirmed</title>
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
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .checkmark {
          color: #ffffff;
          font-size: 36px;
          font-weight: bold;
        }
        .header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1f2937;
        }
        .plan-details {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          border-left: 4px solid #3b82f6;
        }
        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(59, 130, 246, 0.2);
        }
        .plan-name {
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
        }
        .plan-badge {
          background: #3b82f6;
          color: #ffffff;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }
        .detail-value {
          color: #1f2937;
          font-weight: 600;
        }
        .features {
          margin: 30px 0;
        }
        .features h3 {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 16px;
        }
        .feature-list {
          list-style: none;
          padding: 0;
        }
        .feature-item {
          padding: 10px 0;
          padding-left: 30px;
          position: relative;
          color: #4b5563;
        }
        .feature-item:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: bold;
          font-size: 18px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .footer-links {
          margin-top: 16px;
        }
        .footer-link {
          color: #3b82f6;
          text-decoration: none;
          margin: 0 12px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="success-icon">
            <span class="checkmark">✓</span>
          </div>
          <h1>Payment Successful! 🎉</h1>
          <p>Your subscription is now active</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hi ${userName},</div>
          
          <p style="color: #4b5563; margin-bottom: 24px;">
            Thank you for subscribing to TaskHub! Your payment has been processed successfully, 
            and your ${plan} plan is now active. You now have access to all premium features.
          </p>
          
          <div class="plan-details">
            <div class="plan-header">
              <span class="plan-name">${plan} Plan</span>
              <span class="plan-badge">${frequency === 'monthly' ? 'Monthly' : 'Yearly'}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Amount Paid</span>
              <span class="detail-value">₹${amount.toFixed(2)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Billing Cycle</span>
              <span class="detail-value">${frequency === 'monthly' ? 'Monthly' : 'Yearly'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Next Billing Date</span>
              <span class="detail-value">${expiryDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="detail-value" style="color: #10b981;">Active ✓</span>
            </div>
          </div>
          
          <div class="features">
            <h3>What's included in your ${plan} plan:</h3>
            <ul class="feature-list">
              ${plan === 'PRO' ? `
                <li class="feature-item">Up to 10 Workspaces</li>
                <li class="feature-item">Unlimited Projects & Tasks</li>
                <li class="feature-item">Team Collaboration (Up to 20 Members)</li>
                <li class="feature-item">Calendar & Timeline Views</li>
                <li class="feature-item">File Storage (10 Files Per Task)</li>
              ` : `
                <li class="feature-item">Unlimited Workspaces</li>
                <li class="feature-item">Unlimited Projects & Tasks</li>
                <li class="feature-item">Unlimited Team Collaboration</li>
                <li class="feature-item">All Pro Features</li>
                <li class="feature-item">Unlimited File Storage</li>
                <li class="feature-item">Priority Support</li>
              `}
            </ul>
          </div>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/workspace" class="cta-button">
              Go to Dashboard →
            </a>
          </center>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <strong>Need help?</strong> Our support team is here for you. 
            Reply to this email or visit our <a href="${process.env.FRONTEND_URL}/contact" style="color: #3b82f6; text-decoration: none;">help center</a>.
          </p>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            You're receiving this email because you made a purchase at TaskHub.
          </div>
          <div class="footer-links">
            <a href="${process.env.FRONTEND_URL}/pricing" class="footer-link">View Plans</a>
            <a href="${process.env.FRONTEND_URL}" class="footer-link">Visit TaskHub</a>
          </div>
          <div style="margin-top: 20px; color: #9ca3af; font-size: 13px;">
            © ${new Date().getFullYear()} TaskHub. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
};

// Payment failed email template
const createPaymentFailedTemplate = (userName: string, plan: string, reason: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
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
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .warning-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .warning-mark {
          color: #ffffff;
          font-size: 36px;
          font-weight: bold;
        }
        .header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .content {
          padding: 40px 30px;
        }
        .alert-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="warning-icon">
            <span class="warning-mark">!</span>
          </div>
          <h1>Payment Failed</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Hi ${userName},</p>
          
          <p style="color: #4b5563; margin-bottom: 24px;">
            We were unable to process your payment for the <strong>${plan} plan</strong>.
          </p>
          
          <div class="alert-box">
            <p style="color: #991b1b; font-weight: 600; margin-bottom: 8px;">Reason:</p>
            <p style="color: #7f1d1d;">${reason}</p>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            Don't worry! You can try again or use a different payment method.
          </p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/pricing" class="cta-button">
              Try Again →
            </a>
          </center>
        </div>
        
        <div class="footer">
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Contact our support team at <a href="mailto:support@taskhub.com" style="color: #3b82f6;">support@taskhub.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
};

// Subscription cancelled email template
const createSubscriptionCancelledTemplate = (userName: string, plan: string, expiryDate: string) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Subscription Cancelled</title>
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
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
        }
        .content {
          padding: 40px 30px;
        }
        .info-box {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>Subscription Cancelled</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Hi ${userName},</p>
          
          <p style="color: #4b5563; margin-bottom: 24px;">
            Your <strong>${plan} plan</strong> subscription has been cancelled. We're sorry to see you go!
          </p>
          
          <div class="info-box">
            <p style="color: #1e40af; font-weight: 600; margin-bottom: 8px;">You still have access until:</p>
            <p style="color: #1e3a8a; font-size: 18px; font-weight: 700;">${expiryDate}</p>
          </div>
          
          <p style="color: #4b5563; margin-bottom: 20px;">
            After this date, your account will be downgraded to the Free plan. 
            You can reactivate your subscription anytime before then.
          </p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/pricing" class="cta-button">
              Reactivate Subscription →
            </a>
          </center>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            We'd love to hear your feedback! Reply to this email and let us know how we can improve.
          </p>
        </div>
        
        <div class="footer">
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for using TaskHub. We hope to see you again soon!
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
};

// Send subscription confirmation email
export const sendSubscriptionConfirmationEmail = async (
    userEmail: string, 
    userName: string, 
    plan: string, 
    frequency: string, 
    amount: number,
    expiryDate: Date
) => {
    try {
        const transporter = await createTransporter();
        
        const formattedExpiryDate = expiryDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const info = await transporter.sendMail({
            from: `"TaskHub" <${process.env.EMAIL_FROM || 'noreply@taskhub.com'}>`,
            to: userEmail,
            subject: `🎉 Welcome to TaskHub ${plan} Plan!`,
            html: createSubscriptionConfirmationTemplate(userName, plan, frequency, amount, formattedExpiryDate)
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log('Subscription confirmation email preview:', getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending subscription confirmation email:', error);
        throw new ApiError(500, 'Failed to send subscription confirmation email');
    }
};

// Send payment failed email
export const sendPaymentFailedEmail = async (
    userEmail: string, 
    userName: string, 
    plan: string, 
    reason: string
) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: `"TaskHub" <${process.env.EMAIL_FROM || 'noreply@taskhub.com'}>`,
            to: userEmail,
            subject: `Payment Failed - TaskHub ${plan} Plan`,
            html: createPaymentFailedTemplate(userName, plan, reason)
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log('Payment failed email preview:', getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending payment failed email:', error);
        // Don't throw error - email failure shouldn't block the main flow
    }
};

// Send subscription cancelled email
export const sendSubscriptionCancelledEmail = async (
    userEmail: string, 
    userName: string, 
    plan: string, 
    expiryDate: Date
) => {
    try {
        const transporter = await createTransporter();
        
        const formattedExpiryDate = expiryDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const info = await transporter.sendMail({
            from: `"TaskHub" <${process.env.EMAIL_FROM || 'noreply@taskhub.com'}>`,
            to: userEmail,
            subject: `Subscription Cancelled - TaskHub`,
            html: createSubscriptionCancelledTemplate(userName, plan, formattedExpiryDate)
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log('Subscription cancelled email preview:', getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending subscription cancelled email:', error);
        // Don't throw error - email failure shouldn't block the main flow
    }
};
