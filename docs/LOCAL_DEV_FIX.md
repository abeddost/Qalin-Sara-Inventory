# Local Development Error Fix

## Issue: Invalid Refresh Token Error

If you see this error in your local development:
```
Error [AuthApiError]: Invalid Refresh Token: Refresh Token Not Found
```

This is a **browser cookie/session issue**, not an environment variable problem.

## Solution: Clear Browser Cookies

### Option 1: Clear All Site Data (Recommended)

1. Open your browser and go to `http://localhost:3000`
2. Press `F12` to open Developer Tools
3. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
4. In the left sidebar, find **Cookies** → `http://localhost:3000`
5. Right-click and select **Clear** or delete all cookies
6. Also clear **Local Storage** and **Session Storage** for localhost
7. Close Developer Tools
8. Refresh the page (`Ctrl+R` or `F5`)

### Option 2: Use Incognito/Private Mode

1. Open a new **Incognito/Private** window
2. Navigate to `http://localhost:3000`
3. Try logging in again

### Option 3: Clear Cookies via Browser Settings

**Chrome:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cookies and other site data"
3. Choose "All time" from the time range
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cookies"
3. Choose "Everything" from the time range
4. Click "Clear Now"

**Edge:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cookies and other site data"
3. Choose "All time"
4. Click "Clear now"

## Why This Happens

- You had a previous login session
- The refresh token was stored in browser cookies
- The token is no longer valid (expired, database was reset, or user was deleted)
- Supabase can't refresh your session with the old token

## After Clearing Cookies

1. The errors should stop appearing in the terminal
2. You'll be redirected to the login page
3. You can log in fresh with your credentials

## If the Error Persists

Make sure you have at least one user in your Supabase database:

1. Go to Supabase Dashboard → Authentication → Users
2. If no users exist, create one:
   - Click "Add user"
   - Choose "Create new user"
   - Enter email and password
   - Click "Create user"

Then try logging in with those credentials.

