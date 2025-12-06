# Deployment Guide

This guide covers deploying Qalin Sara Inventory to production.

## Deployment Options

| Platform | Recommended | Notes |
|----------|-------------|-------|
| [Vercel](#vercel-recommended) | ✅ Yes | Best for Next.js, free tier available |
| [Netlify](#netlify) | ✅ Yes | Good alternative, free tier available |
| [Railway](#railway) | ⚠️ Okay | Good for full-stack, charges may apply |
| [Self-hosted](#self-hosted) | ⚠️ Okay | Requires server management |

---

## Vercel (Recommended)

Vercel is the recommended platform as it's built by the Next.js team.

### Prerequisites

- GitHub account with your code pushed
- Vercel account ([sign up free](https://vercel.com))

### Deployment Steps

1. **Connect Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the repository

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

3. **Set Environment Variables**
   
   Add these in the Vercel dashboard:
   
   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g., https://your-app.vercel.app) |

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app is live!

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create a Pull Request

---

## Netlify

### Deployment Steps

1. **Connect Repository**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add the same variables as listed for Vercel

4. **Deploy**
   - Netlify will automatically build and deploy

### Note on Next.js Support

Netlify has good Next.js support via the `@netlify/plugin-nextjs` plugin, which should be auto-detected.

---

## Railway

### Deployment Steps

1. **Create Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure**
   - Railway auto-detects Next.js
   - Add environment variables in the Variables tab

3. **Deploy**
   - Railway will automatically build and deploy

---

## Self-Hosted

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Update next.config.ts**
   ```typescript
   const nextConfig = {
     output: 'standalone',
     // ... other config
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t qalin-sara .
   docker run -p 3000:3000 --env-file .env.production qalin-sara
   ```

### Using PM2

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Build the app**
   ```bash
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "qalin-sara" -- start
   ```

4. **Set up auto-restart**
   ```bash
   pm2 startup
   pm2 save
   ```

---

## Production Checklist

### Before Deployment

- [ ] All environment variables are set
- [ ] Database migrations are run on production Supabase
- [ ] Storage buckets are configured
- [ ] At least one admin user is created
- [ ] Build succeeds locally (`npm run build`)

### After Deployment

- [ ] Verify the app loads correctly
- [ ] Test login functionality
- [ ] Test creating a product with image upload
- [ ] Test creating an order
- [ ] Test creating an invoice
- [ ] Check that notifications work
- [ ] Verify theme switching works

### Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] Storage bucket policies are configured
- [ ] Sign-up is disabled (if not needed)
- [ ] HTTPS is enforced

---

## Monitoring

### Vercel Analytics

Enable Vercel Analytics for:
- Page views
- Web Vitals
- Error tracking

### Supabase Dashboard

Monitor in Supabase:
- Database usage
- Auth users
- Storage usage
- API requests

---

## Troubleshooting

### Build Fails

1. Check build logs for specific errors
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check if your IP is allowed (if using IP restrictions)
3. Ensure RLS policies allow your operations

### Image Upload Fails

1. Check storage bucket exists
2. Verify storage policies
3. Check file size limits

### 500 Errors

1. Check server logs in your deployment platform
2. Verify environment variables
3. Check Supabase service status




