# Analytics Dashboard - Technical & Visual Overview

## Visual Features

- Modern, responsive layout (Stripe/Linear style)
- Animated transitions (Framer Motion)
- Real-time data updates (SWR)
- Rich charts (Recharts)
- Error/loading states for smooth UX

---

## Components

- **KPIStatCard**: Key metrics (plans sold, revenue, users, MRR)
- **RevenueTrendChart**: Line chart for revenue/payments
- **UserGrowthChart**: Bar chart for user roles
- **SentimentPieChart**: Pie chart for sentiment distribution
- **BranchPerformanceBar**: Bar chart for branch sales/sentiment

---

## Technical Architecture

- **API**: `/api/analytics` endpoint aggregates all metrics
- **Frontend**: `/dashboard/analytics` page fetches and visualizes data
- **Security**: Admin-only access via middleware and session check
- **Realtime**: SWR refreshes data every 10s
- **Database**: Prisma ORM for all aggregations

---

## Usage Flow

1. Admin logs in
2. Navigates to `/dashboard/analytics`
3. Dashboard loads metrics and charts
4. Data auto-refreshes every 10 seconds
5. Error/loading states handle network issues

---

## Customization

- Add new metrics by updating `/api/analytics`
- Extend charts/components for more insights
- Adjust refresh interval in SWR as needed

---

## Related Docs
- [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)
- [ANALYTICS_QUERY_LOGIC.md](./ANALYTICS_QUERY_LOGIC.md)
