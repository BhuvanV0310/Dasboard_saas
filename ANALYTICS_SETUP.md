# Analytics Dashboard Setup Guide

## Overview

This guide explains how to set up and use the comprehensive Analytics Dashboard for your SaaS Review Dashboard project. The dashboard provides real-time business and sentiment insights for admins, similar to Stripe or Linear.

---

## Prerequisites

- PostgreSQL database configured and migrated
- Prisma ORM set up
- Stripe API keys in `.env` for revenue data
- Admin user account for dashboard access
- All dependencies installed:
  - `recharts`, `framer-motion`, `swr`, `openai`, `@huggingface/inference`

---

## Environment Variables

Add the following to your `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

---

## Database Migration

Run migrations to ensure all tables and fields are present:

```bash
npm run db:generate
npm run db:migrate
```

---

## Install Dependencies

```bash
npm install recharts framer-motion swr
```

---

## Start Development Server

```bash
npm run dev
```

---

## Accessing the Dashboard

- Log in as an admin user
- Navigate to `/dashboard/analytics`
- Only users with `role: 'ADMIN'` can access this route

---

## Real-Time Updates

- Dashboard uses SWR for live data fetching from `/api/analytics`
- Data refreshes every 10 seconds
- All metrics update automatically

---

## Testing

- Submit test payments and reviews
- Verify metrics update in real-time
- Test on mobile and desktop for responsive design
- Simulate errors by disconnecting database/API

---

## Troubleshooting

- **Unauthorized error**: Ensure you are logged in as an admin
- **Missing data**: Check database migrations and Stripe setup
- **Chart errors**: Verify all dependencies are installed

---

## Related Docs
- [ANALYTICS_QUERY_LOGIC.md](./ANALYTICS_QUERY_LOGIC.md)
- [ANALYTICS_DASHBOARD_SUMMARY.md](./ANALYTICS_DASHBOARD_SUMMARY.md)
