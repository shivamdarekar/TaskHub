# Email Service Fix for Railway Deployment

## ✅ SOLUTION IMPLEMENTED: Brevo Integration (Recommended!)

Railway blocks all SMTP ports - **Brevo is now integrated and ready to use!**

### Why Brevo?
- ✅ **300 emails/day FREE forever** (best free tier!)
- ✅ **No domain verification needed** - works immediately
- ✅ **Send to ANY email address** - perfect for testing
- ✅ **Works on Railway/Heroku/all cloud platforms**
- ✅ **Professional enough for college/resume projects**

---

## Quick Setup - Brevo (5 minutes)

### 1. Sign Up for Brevo
1. Go to: https://www.brevo.com
2. Click "Sign up free"
3. Verify your email
4. Complete account setup

### 2. Get Your API Key
1. Login to Brevo dashboard
2. Go to: https://app.brevo.com/settings/keys/api
3. Click "Generate a new API key"
4. Name it: "TaskHub Production"
5. Copy the API key (starts with `xkeysib-...`)

### 3. Add to Railway Environment Variables
In your Railway project dashboard → **Variables** tab:
```bash
BREVO_API_KEY=xkeysib-your_actual_key_here
EMAIL_FROM=TaskHub <darekarshivam0@gmail.com>
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 4. Deploy
- Railway auto-deploys on env changes
- Check logs for: `📧 Using Brevo for email delivery`

### 5. Test
- Register a new user with ANY email
- Email should arrive instantly! ✅

---

## Email Service Priority System

The system automatically chooses the best available option:

1. **Brevo** (if `BREVO_API_KEY` exists) ← **Recommended for Railway** ✅
2. **Resend** (if `RESEND_API_KEY` exists) ⚠️ Requires domain
3. **SMTP** (if `NODE_ENV=production`) ❌ Blocked on Railway  
4. **Ethereal** (for development) 🧪 Testing only

---

## What Was Implemented

### Files Created/Modified:
1. ✅ [email.brevo.ts](src/services/email.brevo.ts) - Brevo HTTP API integration
2. ✅ [email.resend.ts](src/services/email.resend.ts) - Resend integration (backup)
3. ✅ [email.service.ts](src/services/email.service.ts) - Smart priority system
4. ✅ [app.ts](src/app.ts) - Updated email provider detection
5. ✅ [.env.example](/.env.example) - Updated with all options
6. ✅ Packages installed: `@getbrevo/brevo`, `axios`, `resend`

### How It Works:
- System checks for `BREVO_API_KEY` first
- Falls back to Resend → SMTP → Ethereal if not found
- All existing email functions work unchanged
- No code changes needed elsewhere

---

## Comparison: Brevo vs Resend vs SMTP

| Feature | **Brevo** | Resend | Gmail SMTP |
|---------|-----------|--------|------------|
| **Free Tier** | 300/day | 100/day | Unlimited |
| **Domain Required** | ❌ No | ✅ Yes (for multiple recipients) | ❌ No |
| **Works on Railway** | ✅ Yes | ✅ Yes | ❌ No (blocked) |
| **Send to Any Email** | ✅ Yes | ⚠️ Only your own without domain | ✅ Yes |
| **Setup Time** | 5 min | 5 min | 2 min (local only) |
| **Best For** | **Production** | Custom domains | Local development |

**Winner for Railway: Brevo** 🏆

---

## Alternative Free Options

If Brevo doesn't work for some reason:

### 1. SendGrid (Twilio)
- 100 emails/day free
- Requires phone verification
- No domain needed
- Works on Railway

### 2. Mailgun
- 5,000 emails/month free (first 3 months)
- Requires credit card (not charged)
- Works on Railway

### 3. Elastic Email
- 100 emails/day free
- No domain needed
- Works on Railway

---

## Testing Locally

Your `.env` file has 3 options commented:

```bash
# Uncomment ONE of these:

# Option 1: Test with Brevo (recommended)
BREVO_API_KEY=xkeysib-your_key_here

# Option 2: Test with Resend (limited without domain)
# RESEND_API_KEY=re_your_key_here

# Option 3: Use Gmail SMTP (works locally)
SMTP_HOST=smtp.gmail.com
# ... (already configured)
```

The system automatically uses whichever is uncommented!

---

## Problem (Original Issue)
Connection timeout when sending verification emails on Railway. The error occurs because:
1. **Railway blocks outbound SMTP connections** on standard ports (25, 587) for security
2. Gmail SMTP requires stable connections that cloud platforms often restrict
3. Missing timeout configurations cause the app to hang

## What I Fixed

### 1. Updated `email.service.ts`
- ✅ Changed default port from 587 to **465 with SSL** (better cloud compatibility)
- ✅ Added connection, greeting, and socket timeouts (30 seconds each)
- ✅ Disabled connection pooling to prevent hanging connections
- ✅ Added debug logging option for troubleshooting
- ✅ Better error handling

### 2. Updated `verifyEmail.ts`
- ✅ Added Promise timeout to prevent hanging requests
- ✅ Detailed error logging with connection details
- ✅ Specific error messages for timeout and auth failures

### 3. Updated `.env.example`
- ✅ Added documentation for cloud deployment
- ✅ Changed recommended port to 465
- ✅ Added DEBUG_EMAIL option

## Immediate Steps - Update Railway Environment Variables

### Option 1: Try Port 465 with SSL (Quick Fix)
In your Railway project dashboard, update these variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=darekarshivam0@gmail.com
SMTP_PASSWORD=bmnf bzpl ukoy vtrs
EMAIL_FROM="TaskHub <darekarshivam0@gmail.com>"
NODE_ENV=production
DEBUG_EMAIL=true  # Enable debug logs temporarily
```

**Then redeploy your backend on Railway.**

### Check Railway Logs
After redeploying, check logs for:
- Connection details being logged
- Whether port 465 works
- Any authentication errors

## Long-term Solution: Use Dedicated Email Service

If Gmail SMTP still doesn't work (Railway may block all SMTP), switch to an HTTP-based email service:

### Recommended Services (Free Tiers Available):

#### 1. **Resend** (Easiest, Modern)
- 3,000 emails/month free
- Clean API, great for developers
- Sign up: https://resend.com

```bash
# Railway env
RESEND_API_KEY=re_your_key_here
```

#### 2. **SendGrid** (Popular)
- 100 emails/day free
- Sign up: https://sendgrid.com

```bash
# Railway env
SENDGRID_API_KEY=SG.your_key_here
```

#### 3. **Mailgun**
- 5,000 emails/month free (first 3 months)
- Sign up: https://www.mailgun.com

```bash
# Railway env
MAILGUN_API_KEY=your_key_here
MAILGUN_DOMAIN=your_domain
```

## Option A: Implement Resend (Recommended)

### 1. Install Package
```bash
npm install resend
```

### 2. Create `backend/src/services/email.resend.ts`
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailWithResend = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'TaskHub <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Resend error:', error);
    throw new Error('Failed to send email with Resend');
  }
};
```

### 3. Update `verifyEmail.ts` to use Resend
Replace the transporter logic with:
```typescript
import { sendEmailWithResend } from './email.resend';

export const sendVerificationEmail = async (
    email: string,
    userName: string,
    verificationToken: string,
    redirect?: string
) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;

        const html = createVerificationEmailTemplate(userName, verificationLink);
        
        await sendEmailWithResend(
            email,
            'Verify Your Email Address - TaskHub',
            html
        );

        return { success: true };

    } catch (error: any) {
        console.error("Error while sending verification email", error);
        throw new ApiError(500, "Failed to send verification email");
    }
};
```

## Option B: Keep Gmail but Try Alternative Ports

If you want to stick with Gmail, try these Railway-specific workarounds:

### 1. Check Railway's Public Networking
Railway may require you to enable public outbound networking for SMTP.

### 2. Use Gmail's Alternative Settings
```bash
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 3. Contact Railway Support
Ask if they allow SMTP on specific ports or if there's a whitelist.

## Testing After Fix

### 1. Test Locally First
Set `NODE_ENV=production` in your local `.env` and test:
```bash
cd backend
npm run dev
```

Try registering a user - you should see debug logs.

### 2. Test on Railway
After deploying:
1. Check Railway logs for connection details
2. Try user registration
3. Check logs for "Email sent successfully" or specific errors

## Quick Debug Checklist

- [ ] `SMTP_PORT=465` in Railway env
- [ ] `SMTP_SECURE=true` in Railway env
- [ ] `DEBUG_EMAIL=true` temporarily enabled
- [ ] Gmail App Password is correct (no spaces)
- [ ] Railway backend redeployed after env changes
- [ ] Check Railway logs for connection attempts
- [ ] Verify SMTP credentials work locally with NODE_ENV=production

## Still Not Working?

If SMTP remains blocked on Railway:
1. **Switch to Resend** (5 minutes to implement, works instantly)
2. **Try Railway's recommended email service** in their docs
3. **Deploy to alternative platform** (Render, Vercel functions) that allows SMTP

## Need Help?
The most reliable solution is switching to an HTTP-based email service like Resend. This avoids all SMTP port blocking issues that cloud platforms have.

---

**Created:** 2026-03-08  
**Status:** Fixed code, awaiting Railway configuration
