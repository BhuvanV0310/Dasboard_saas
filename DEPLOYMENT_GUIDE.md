# Production Deployment Guide

This guide covers deploying the SaaS Review Dashboard to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Vercel Deployment](#vercel-deployment)
- [Railway Deployment (Alternative)](#railway-deployment-alternative)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services
1. **PostgreSQL Database** (12+)
   - Recommended: Neon, Supabase, Railway, or Amazon RDS
   - Minimum specs: 1GB RAM, 10GB storage
   - SSL connection required for production

2. **Vercel Account** (Free or Pro)
   - For Next.js app deployment
   - Built-in CDN and edge caching

3. **Stripe Account** (Live mode)
   - For payment processing
   - Webhook endpoint configured

4. **OpenAI API Key** (Optional)
   - For AI-powered insights
   - Fallback provided if unavailable

5. **Sentry Account** (Optional)
   - For error monitoring
   - Recommended for production

### Local Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build the application (test)
npm run build
```

---

## Environment Setup

### 1. Copy Environment Template
```bash
cp .env.production.example .env.production
```

### 2. Configure Required Variables
Edit `.env.production`:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&sslmode=require"

# NextAuth.js (Required)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# Stripe (Required for payments)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# OpenAI (Optional)
OPENAI_API_KEY="sk-..."

# Sentry (Optional but recommended)
SENTRY_DSN="https://...@sentry.io/..."
```

### 3. Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Database Setup

### 1. Provision PostgreSQL Database
Choose a provider:
- **Neon** (Recommended): serverless PostgreSQL
- **Supabase**: PostgreSQL with additional features
- **Railway**: simple PostgreSQL deployment
- **Amazon RDS**: enterprise-grade PostgreSQL

### 2. Get Connection String
Example format:
```
postgresql://username:password@host:5432/database?schema=public&sslmode=require
```

### 3. Run Migrations
```bash
# Set DATABASE_URL in terminal
export DATABASE_URL="your-connection-string"

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 4. Verify Database
```bash
# Check connection
npx prisma db pull

# View data
npx prisma studio
```

---

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Project
```bash
vercel link
```

### 4. Add Environment Variables
```bash
# Add via CLI
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add OPENAI_API_KEY
vercel env add SENTRY_DSN

# Or add via Vercel Dashboard:
# Project Settings > Environment Variables
```

### 5. Deploy
```bash
# Deploy to production
vercel --prod

# Or push to main branch (automatic deployment)
git push origin main
```

### 6. Configure Custom Domain
1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add your custom domain (e.g., `app.yourdomain.com`)
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable to match domain

---

## Railway Deployment (Alternative)

### 1. Install Railway CLI
```bash
npm i -g @railway/cli
```

### 2. Login
```bash
railway login
```

### 3. Initialize Project
```bash
railway init
```

### 4. Add PostgreSQL
```bash
railway add postgresql
```

### 5. Deploy
```bash
railway up
```

### 6. Configure Variables
```bash
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
# Add other variables...
```

---

## Post-Deployment

### 1. Configure Stripe Webhooks
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 2. Test Authentication
```bash
# Create first admin user via API
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@yourcompany.com",
    "password": "secure-password",
    "role": "ADMIN"
  }'
```

### 3. Verify AI Integration
1. Upload a test CSV file
2. Check if AI summary generates
3. If OpenAI unavailable, verify fallback message appears

### 4. Test Payment Flow
1. Go to Pricing page
2. Select a plan
3. Complete test checkout (use Stripe test card: `4242 4242 4242 4242`)
4. Verify subscription in dashboard

---

## Monitoring

### 1. Enable Sentry (Recommended)
```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Set SENTRY_DSN in environment variables
```

### 2. View Logs
**Vercel:**
```bash
vercel logs --follow
```

**Railway:**
```bash
railway logs
```

### 3. Database Monitoring
- Check connection pool usage
- Monitor slow queries
- Set up alerts for downtime

### 4. Uptime Monitoring
Set up external monitors:
- UptimeRobot
- Pingdom
- Better Uptime

---

## Troubleshooting

### Build Failures

**Problem:** Prisma client not generated
```bash
# Solution: Add build command
npm run build
# Or in vercel.json:
"buildCommand": "prisma generate && next build"
```

**Problem:** TypeScript errors
```bash
# Check types
npm run type-check

# Fix errors and redeploy
```

### Database Issues

**Problem:** Connection timeout
- Verify DATABASE_URL is correct
- Check SSL mode: add `?sslmode=require`
- Verify database is not paused (serverless DBs)

**Problem:** Migration failed
```bash
# Reset database (WARNING: destroys data)
npx prisma migrate reset

# Or manually fix and retry
npx prisma migrate deploy
```

### Authentication Issues

**Problem:** "Invalid NEXTAUTH_SECRET"
```bash
# Generate new secret
openssl rand -base64 32

# Update environment variable
vercel env add NEXTAUTH_SECRET
```

**Problem:** CORS errors
- Verify NEXTAUTH_URL matches deployment URL
- Ensure HTTPS is used in production

### Payment Issues

**Problem:** Webhook signature verification failed
- Copy correct webhook secret from Stripe Dashboard
- Ensure webhook endpoint is publicly accessible
- Check webhook logs in Stripe Dashboard

### Performance Issues

**Problem:** Slow page loads
- Enable Vercel Analytics
- Check database query performance
- Add database indexes (see `prisma/schema.prisma`)
- Optimize images with Next.js Image component

---

## Security Checklist

- [ ] All environment variables are secure secrets
- [ ] Database uses SSL connections
- [ ] NEXTAUTH_URL uses HTTPS in production
- [ ] Stripe is in live mode (not test mode)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on API routes
- [ ] Admin routes protected with role checks
- [ ] Error messages don't expose sensitive data
- [ ] Sentry DSN is private
- [ ] Database credentials rotated regularly

---

## Maintenance

### Regular Tasks
1. **Weekly**: Check error logs in Sentry
2. **Monthly**: Review database performance
3. **Quarterly**: Update dependencies
4. **As needed**: Rotate secrets and credentials

### Backup Strategy
```bash
# Backup database (example with pg_dump)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20240101.sql
```

---

## Support

For issues or questions:
1. Check [GitHub Issues](https://github.com/your-repo/issues)
2. Review [Vercel Docs](https://vercel.com/docs)
3. Check [Prisma Docs](https://www.prisma.io/docs)
4. Contact: support@yourcompany.com

---

**Last Updated:** 2024
**Version:** 1.0.0
