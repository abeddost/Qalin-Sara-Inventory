# Internal Server Error on Login - Fix Guide

## Issue
You're getting an "Internal Server Error" when trying to log in locally.

## Root Causes

### 1. Corrupted Next.js Build Cache
The `.next` folder can get corrupted during development, causing file system errors.

### 2. Supabase Auth Issues
- No users exist in your Supabase project
- Environment variables are incorrect
- Supabase project is paused or inaccessible

## Solutions

### Solution 1: Clean Restart Development Server

I've already cleared your `.next` cache. Now restart your dev server:

**PowerShell:**
```powershell
# Stop the current dev server (Ctrl+C)
# Then run:
npm run dev
```

### Solution 2: Verify Supabase User Exists

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. **If no users exist**, create one:
   - Click **"Add user"**
   - Select **"Create new user"**
   - Enter:
     - **Email**: your@email.com
     - **Password**: YourPassword123!
     - ✅ **Auto Confirm User** (check this box!)
   - Click **"Create user"**

### Solution 3: Verify Environment Variables

Open your `.env.local` file and verify:

```bash
# Make sure these match your Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**To verify they're correct:**
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Settings** → **API**
3. Compare:
   - **Project URL** should match `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** should match `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Solution 4: Check Supabase Project Status

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Make sure your project is **not paused**
3. If paused, click **"Restore project"**

### Solution 5: Clear Browser & Restart

1. **Clear browser cookies** for localhost:3000 (see LOCAL_DEV_FIX.md)
2. **Close all browser tabs** with localhost:3000
3. **Stop the dev server** (Ctrl+C in terminal)
4. **Delete .next folder** (if you haven't already):
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
5. **Restart dev server**:
   ```powershell
   npm run dev
   ```
6. **Open a fresh browser tab** (or incognito window)
7. Navigate to `http://localhost:3000/login`

## Testing Your Fix

After completing the above:

1. Navigate to `http://localhost:3000/login`
2. Enter the email and password you created in Supabase
3. Click "Sign In"
4. You should be redirected to `/products`

## Common Error Messages

| Error | Solution |
|-------|----------|
| "Invalid login credentials" | Wrong email/password, or user doesn't exist in Supabase Auth |
| "Internal Server Error" | Check terminal logs for specific error |
| "Missing environment variable" | .env.local is missing or has wrong values |
| "Invalid Refresh Token" | Clear browser cookies |

## Checking Terminal Logs

Look at your terminal where `npm run dev` is running. You should see:

✅ **Good output:**
```
✓ Compiled /login in 1322ms
GET /login 200 in 1526ms
```

❌ **Bad output (look for these):**
```
Error [AuthApiError]: ...
Missing required environment variable: ...
ENOENT: no such file or directory ...
```

## Still Having Issues?

1. **Check your terminal output** for specific error messages
2. **Take a screenshot** of the error in terminal
3. **Check browser console** (F12 → Console tab)
4. **Verify database migrations** were run (see DATABASE_SETUP.md)

## Quick Checklist

- [ ] Cleared `.next` folder
- [ ] Restarted dev server
- [ ] Verified `.env.local` has correct Supabase credentials
- [ ] Created at least one user in Supabase Auth
- [ ] User has "Auto Confirm" enabled
- [ ] Supabase project is not paused
- [ ] Cleared browser cookies for localhost:3000
- [ ] Using correct email/password when logging in

