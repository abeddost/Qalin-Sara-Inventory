# Vercel Deployment Guide for Qalin Sara Inventory

This guide will walk you through deploying your Qalin Sara Inventory application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A Supabase project set up and configured
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Supabase Project

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (for `SUPABASE_SERVICE_ROLE_KEY` - optional but recommended)

4. Make sure your database migrations have been run:
   - Go to **SQL Editor** in Supabase
   - Run all migration files from `supabase/migrations/` folder

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign in to Vercel**
   - Go to https://vercel.com
   - Sign in with your GitHub/GitLab/Bitbucket account

2. **Import Your Project**
   - Click **"Add New..."** → **"Project"**
   - Import your Git repository containing this project
   - Vercel will automatically detect it's a Next.js project

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Leave as default (`.`)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   
   Click **"Environment Variables"** and add the following:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Production, Preview, Development |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) | Production, Preview |

   **Important Notes:**
   - For Production: Add all variables
   - For Preview: Add all variables
   - For Development: Add Supabase variables only (NEXT_PUBLIC_APP_URL not needed)

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Link to existing project? **No** (first time) or **Yes** (if updating)
   - Project name: Enter your desired project name
   - Directory: `.` (press Enter for default)

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```
   
   For each variable, select the environments (Production, Preview, Development)

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Supabase for Production

1. **Update Supabase Auth Settings**
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Add your Vercel URL to **Site URL**: `https://your-project.vercel.app`
   - Add to **Redirect URLs**:
     - `https://your-project.vercel.app/**`
     - `https://your-project.vercel.app/auth/callback`

2. **Verify Row Level Security (RLS)**
   - Make sure RLS policies are enabled for all tables
   - Test that authenticated users can access their data

## Step 4: Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Can log in/register
- [ ] Can create/view products
- [ ] Can create/view orders
- [ ] Can create/view invoices
- [ ] Images upload and display correctly
- [ ] All features working as expected

## Troubleshooting

### Build Fails

1. **Check Build Logs**
   - Go to your project in Vercel dashboard
   - Click on the failed deployment
   - Review the build logs for errors

2. **Common Issues:**
   - Missing environment variables → Add them in Vercel dashboard
   - TypeScript errors → Fix locally and push again
   - Missing dependencies → Ensure all dependencies are in `package.json`

### Environment Variables Not Working

1. **Verify Variables are Set**
   - Go to Project Settings → Environment Variables
   - Ensure variables are added for the correct environment (Production/Preview)

2. **Redeploy After Adding Variables**
   - After adding new environment variables, trigger a new deployment
   - Variables starting with `NEXT_PUBLIC_` require a rebuild

### Authentication Issues

1. **Check Supabase Auth Configuration**
   - Verify Site URL and Redirect URLs in Supabase
   - Ensure they match your Vercel deployment URL

2. **Check CORS Settings**
   - Verify Supabase allows requests from your Vercel domain

### Database Connection Issues

1. **Verify Supabase Credentials**
   - Double-check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Ensure you're using the correct project credentials

2. **Check Database Migrations**
   - Ensure all migrations have been run in Supabase
   - Verify tables and policies exist

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs with your custom domain

## Continuous Deployment

Once connected to a Git repository, Vercel will automatically:
- Deploy to **Production** when you push to your main branch
- Create **Preview** deployments for pull requests
- Rebuild on every push

## Monitoring and Analytics

- **Vercel Analytics**: Enable in Project Settings → Analytics
- **Function Logs**: View in Vercel dashboard under your deployment
- **Error Tracking**: Check deployment logs and Supabase logs

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

---

**Congratulations!** Your Qalin Sara Inventory app should now be live on Vercel! 🎉

