# Analytics Query Logic

## Overview

This document explains the database queries and aggregation logic powering each metric in the Analytics Dashboard.

---

## Metrics & Queries

### 1. Subscription Insights
- **Total Plans Sold**: `prisma.payment.count({ where: { status: 'COMPLETED' } })`
- **Total Revenue**: `prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } })`
- **Active Subscriptions**: `prisma.user.count({ where: { activePlanId: { not: null } } })`

### 2. User Growth
- **Total Users**: `prisma.user.count()`
- **New Signups per Week**: `prisma.user.groupBy({ by: ['createdAt'], _count: { id: true }, orderBy: { createdAt: 'asc' } })`
- **Role Distribution**: `prisma.user.groupBy({ by: ['role'], _count: { id: true } })`

### 3. Branch Performance
- **Top 5 Branches by Sales**: `prisma.branch.findMany({ take: 5, orderBy: { sales: 'desc' }, select: { id, name, sales } })`
- **Branch Sentiment**: `prisma.review.groupBy({ by: ['branchId', 'sentimentLabel'], _avg: { sentimentScore: true }, _count: { id: true } })`

### 4. Sentiment Overview
- **Sentiment Counts**: `prisma.review.groupBy({ by: ['sentimentLabel'], _count: { id: true }, _avg: { aiConfidence: true } })`

### 5. Payments Overview
- **Successful vs Failed Transactions**: `prisma.payment.groupBy({ by: ['status'], _count: { id: true } })`
- **MRR (Monthly Recurring Revenue)**: `prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED', type: 'SUBSCRIPTION' } })`

---

## Time-Based Grouping
- **Signups by Week/Month**: Use `createdAt` field and group by week/month in Prisma or transform in frontend
- **Revenue Trends**: Use payment `createdAt` and aggregate by month

---

## Error Handling
- All queries wrapped in try/catch in API route
- Returns `{ error: 'Unauthorized' }` for non-admins
- Returns `{ error: 'Database error' }` for query failures

---

## Related Docs
- [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)
- [ANALYTICS_DASHBOARD_SUMMARY.md](./ANALYTICS_DASHBOARD_SUMMARY.md)
