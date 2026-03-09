# Email Service Configuration Guide

## ✅ CURRENT IMPLEMENTATION: 3-Option Priority System

Your email service automatically selects the best available provider:
1. **Brevo** (HTTP API) - Production ← **Recommended for Railway** ✅
2. **SMTP** (Gmail) - Local development
3. **Ethereal** (Auto-fallback) - Testing only

### Why Brevo for Production?
- ✅ **300 emails/day FREE forever** (best free tier!)
- ✅ **No domain verification needed** - works immediately
- ✅ **Send to ANY email address** - perfect for testing
- ✅ **Works on Railway/Heroku/all cloud platforms** (uses HTTPS, not SMTP ports)
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
2. **SMTP** (if `NODE_ENV=production`) ⚠️ Blocked on Railway (works locally)
3. **Ethereal** (auto-fallback in development) 🧪 Testing only

---

## What's Implemented

### Files Modified:
1. ✅ [email.brevo.ts](src/services/email.brevo.ts) - Brevo HTTP API integration (uses axios)
2. ✅ [email.service.ts](src/services/email.service.ts) - Smart 3-provider priority system
3. ✅ [verifyEmail.ts](src/services/verifyEmail.ts) - Uses getTransporter() with timeout protection
4. ✅ [resetPass.ts](src/services/resetPass.ts) - Uses getTransporter()
5. ✅ [TwoFA.ts](src/services/TwoFA.ts) - Uses getTransporter()
6. ✅ [inviteMember.ts](src/services/inviteMember.ts) - Uses getTransporter()
7. ✅ [subscriptionEmail.ts](src/services/subscriptionEmail.ts) - Uses getTransporter()
8. ✅ [app.ts](src/app.ts) - Email provider detection in startup logs
9. ✅ [.env.example](/.env.example) - Documentation for all 3 options

### Packages Installed:
- `axios` - For Brevo HTTP API calls
- `nodemailer` - Base email functionality

### How It Works:
- Singleton pattern: transporter reused across all email services
- Connection verification before sending
- Automatic provider selection (Brevo → SMTP → Ethereal)
- All existing email functions work unchanged
- No code changes needed in controllers or routes

---

## Comparison: Brevo vs Gmail SMTP

| Feature | **Brevo (HTTP API)** | **Gmail SMTP** |
|---------|----------------------|----------------|
| **Free Tier** | 300/day | Unlimited |
| **Domain Required** | ❌ No | ❌ No |
| **Works on Railway** | ✅ Yes (HTTPS) | ❌ No (ports blocked) |
| **Works Locally** | ✅ Yes | ✅ Yes |
| **Send to Any Email** | ✅ Yes | ✅ Yes |
| **Setup Time** | 5 min | 2 min |
| **Port Used** | 443 (HTTPS) | 465/587 (SMTP) |
| **Best For** | **Production (Railway)** | Local development |

**Winner for Railway: Brevo** 🏆 (HTTPS never gets blocked)

---

## Alternative Free Email Services (If Needed)

If Brevo doesn't work for some reason:

### 1. SendGrid (Twilio)
- 100 emails/day free
- Uses HTTP API (works on Railway)
- Setup: https://sendgrid.com

### 2. Mailgun
- 5,000 emails/month free (first 3 months)
- Requires credit card verification
- Uses HTTP API (works on Railway)

### 3. Amazon SES
- 62,000 emails/month free (AWS free tier)
- Requires AWS account
- Most scalable option

**Note:** All HTTP-based services work on Railway. Avoid SMTP-only services.

---

## Testing Locally

Your `.env` file supports 3 options:

```bash
# Option 1: Test with Brevo (recommended - same as production)
BREVO_API_KEY=xkeysib-your_key_here
EMAIL_FROM="TaskHub <your_email@gmail.com>"

# Option 2: Use Gmail SMTP (works locally)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM="TaskHub <your_email@gmail.com>"

# Option 3: Ethereal (auto-enabled if nothing else configured)
# No setup needed - creates test account automatically
# View emails at: https://ethereal.email
```

The system automatically uses whichever is configured first (Brevo → SMTP → Ethereal)!

---

## Original Problem & Solution

### The Issue
Connection timeout when sending verification emails on Railway deployment:
- **Root Cause:** Railway blocks all SMTP ports (25/465/587) for spam prevention
- **Symptom:** `ETIMEDOUT` errors when trying to send emails via Gmail SMTP
- **Impact:** User registration/password reset emails not sending in production

### The Fix
Implemented 3-provider system with smart fallback:
1. **Brevo (HTTP API)** - Production solution using axios for direct API calls
2. **SMTP (Gmail)** - Local development with proper timeout configurations  
3. **Ethereal** - Automatic testing fallback

### Key Improvements
- ✅ Singleton pattern to reuse transporter across app
- ✅ Connection verification before sending
- ✅ 30-second timeouts to prevent hanging
- ✅ Automatic provider detection and fallback
- ✅ Comprehensive error handling and logging
- ✅ Uses HTTPS (port 443) in production - never blocked

---

## How to Switch Email Providers

If you need to change providers, just update environment variables:

### Switch to Brevo (Recommended)
```bash
# Railway environment variables
BREVO_API_KEY=xkeysib-your_key_here
EMAIL_FROM="TaskHub <your@email.com>"
```

### Switch to SMTP (Local only)
```bash
# .env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM="TaskHub <your@email.com>"
```

No code changes needed - the system auto-detects!

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

## Production Deployment Checklist (Railway)

- [ ] `BREVO_API_KEY` added to Railway environment variables (starts with `xkeysib-`)
- [ ] `EMAIL_FROM` configured (e.g., "TaskHub <your@email.com>")
- [ ] `NODE_ENV=production` set in Railway
- [ ] `FRONTEND_URL` points to your Vercel deployment
- [ ] Backend redeployed after env changes
- [ ] Check Railway logs for: `📧 Using Brevo for email delivery`
- [ ] Test user registration to verify emails arrive

## Local Development Checklist

- [ ] Either `BREVO_API_KEY` or SMTP credentials in `.env`
- [ ] `EMAIL_FROM` configured
- [ ] Run `npm run dev` and check console for email provider detection
- [ ] Test registration - check console for email logs
- [ ] If using Ethereal, check https://ethereal.email for test emails

## Troubleshooting

### "Connection timeout" on Railway
- ✅ **Solution:** Use Brevo (HTTP API), not SMTP
- Railway blocks all SMTP ports (25/465/587) by design

### "Key not found" with Brevo
- Check you're using **API key** (starts with `xkeysib-`)
- NOT SMTP key (starts with `xsmtpsib-`)
- Get from: https://app.brevo.com/settings/keys/api

### Emails not arriving
1. Check Railway logs for email provider detection
2. Verify `EMAIL_FROM` format: `Name <email@domain.com>`
3. Check spam/junk folder
4. Verify Brevo API key is valid

## Still Not Working?

1. **Check Railway logs** for specific error messages
2. **Verify environment variables** are set correctly (no typos)
3. **Test locally first** with same Brevo credentials
4. **Check Brevo dashboard** (https://app.brevo.com) for:
   - API key status
   - Email sending logs
   - Daily limit (300 emails)
   - Account verification status

## Technical Details

### Why Axios for Brevo?
- Direct HTTP API calls (no SDK needed)
- Smaller bundle size
- Better control over requests
- Simpler debugging

### Email Service Architecture
```typescript
// Singleton pattern - one transporter for entire app
getTransporter() → initializeTransporter() → {
  1. Try Brevo (HTTP API via axios)
  2. Fallback to SMTP (local only)
  3. Fallback to Ethereal (dev testing)
}
```

All email services use `getTransporter()` for consistency.

---

**Last Updated:** March 9, 2026  
**Status:** ✅ Production-ready with Brevo  
**Current Providers:** Brevo (production) + SMTP (local) + Ethereal (dev)
