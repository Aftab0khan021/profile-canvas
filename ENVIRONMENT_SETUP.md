# Environment Variables Setup Guide

## Required Environment Variables

### Frontend (.env)

Add these to your `.env` file in the project root:

```env
# Existing variables
VITE_SUPABASE_PROJECT_ID=dwdhjkthnthbyxwouqnc
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_URL=https://dwdhjkthnthbyxwouqnc.supabase.co
VITE_APP_URL=https://portfolio-hubs.vercel.app

# NEW: Add reCAPTCHA Site Key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key_here
```

### Backend (Supabase Edge Function Secrets)

These need to be set in your Supabase dashboard or via Supabase CLI:

```bash
# Already configured
RESEND_API_KEY=re_...

# NEW: Add reCAPTCHA Secret Key
RECAPTCHA_SECRET_KEY=your_recaptcha_v3_secret_key_here

# Auto-configured by Supabase (no action needed)
SUPABASE_URL=https://dwdhjkthnthbyxwouqnc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## Setup Instructions

### 1. Get reCAPTCHA v3 Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label**: FolioX Portfolio Contact Form
   - **reCAPTCHA type**: Select **"reCAPTCHA v3"**
   - **Domains**: Add your domains:
     - `localhost` (for local development)
     - `portfolio-hubs.vercel.app` (your production domain)
     - Add any other domains you use
4. Accept the terms and click **Submit**
5. You'll receive two keys:
   - **Site Key** (starts with `6L...`) → Use for `VITE_RECAPTCHA_SITE_KEY`
   - **Secret Key** (starts with `6L...`) → Use for `RECAPTCHA_SECRET_KEY`

### 2. Add Frontend Environment Variable

Update your `.env` file:

```bash
# Add this line
VITE_RECAPTCHA_SITE_KEY=6Lc_YOUR_SITE_KEY_HERE
```

**Important**: After updating `.env`, restart your dev server:
```bash
npm run dev
```

### 3. Add Backend Environment Variable (Supabase)

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `dwdhjkthnthbyxwouqnc`
3. Navigate to **Settings** → **Edge Functions**
4. Scroll to **Secrets** section
5. Click **Add new secret**
6. Enter:
   - **Name**: `RECAPTCHA_SECRET_KEY`
   - **Value**: Your reCAPTCHA secret key (starts with `6L...`)
7. Click **Save**

#### Option B: Using Supabase CLI

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref dwdhjkthnthbyxwouqnc

# Set the secret
npx supabase secrets set RECAPTCHA_SECRET_KEY=6L_YOUR_SECRET_KEY_HERE
```

### 4. Deploy Database Migration

Run the migration to create the `rate_limits` table:

```bash
# If using Supabase CLI
npx supabase db push

# Or apply manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/20260124103000_create_rate_limits_table.sql
# 3. Run the SQL
```

### 5. Deploy Edge Function

Deploy the updated `send-contact-email` function:

```bash
# Deploy the function
npx supabase functions deploy send-contact-email

# Verify deployment
npx supabase functions list
```

---

## Verification

### Test reCAPTCHA Integration

1. Open your portfolio contact form
2. Open browser DevTools → Console
3. Submit a message
4. Check for:
   - ✅ "reCAPTCHA verification successful, score: X.XX" in Edge Function logs
   - ✅ No 403 errors

### Test Rate Limiting

1. Submit 3 messages quickly (within 60 seconds)
2. Try to submit a 4th message
3. You should see:
   - ✅ Error message: "Too many requests. Please wait X seconds..."
   - ✅ Submit button disabled with countdown timer
   - ✅ 429 status code in network tab

### Check Logs

View Edge Function logs in Supabase Dashboard:
1. Go to **Edge Functions** → `send-contact-email`
2. Click **Logs** tab
3. Look for:
   - "reCAPTCHA verification successful"
   - "Request from IP: X.X.X.X"
   - "Rate limit exceeded" (if testing rate limiting)

---

## Troubleshooting

### reCAPTCHA Not Working

**Issue**: "Security verification failed"

**Solutions**:
- ✅ Verify `VITE_RECAPTCHA_SITE_KEY` is set in `.env`
- ✅ Restart dev server after adding env variable
- ✅ Check domain is added in reCAPTCHA admin console
- ✅ Verify `RECAPTCHA_SECRET_KEY` is set in Supabase Edge Function secrets

### Rate Limiting Not Working

**Issue**: Can submit unlimited messages

**Solutions**:
- ✅ Verify `rate_limits` table exists in database
- ✅ Check Edge Function has access to `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Review Edge Function logs for errors
- ✅ Ensure migration was applied successfully

### "Cannot find module" TypeScript Errors

**Issue**: TypeScript errors in `send-contact-email/index.ts`

**Solution**: These are expected! Deno imports won't resolve in Node.js environment. They work fine when deployed to Supabase Edge Functions. You can safely ignore these errors.

---

## Environment Variable Summary

| Variable | Location | Required | Purpose |
|----------|----------|----------|---------|
| `VITE_RECAPTCHA_SITE_KEY` | `.env` (frontend) | ✅ Yes | reCAPTCHA v3 site key for frontend |
| `RECAPTCHA_SECRET_KEY` | Supabase Secrets | ✅ Yes | reCAPTCHA v3 secret key for backend verification |
| `RESEND_API_KEY` | Supabase Secrets | ✅ Yes | Email sending via Resend API |
| `SUPABASE_URL` | Auto-configured | ✅ Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configured | ✅ Yes | Service role key for database access |

---

## Security Notes

> [!IMPORTANT]
> **Never commit your `.env` file to Git!** It's already in `.gitignore`, but double-check.

> [!WARNING]
> **Secret keys are sensitive!** Never share your `RECAPTCHA_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` publicly.

> [!TIP]
> **For production**: Set environment variables in your hosting platform (Vercel, Netlify, etc.) as well.
