# SaaS Review Dashboard - Production Documentation

> **Production-Ready SaaS Application**  
> Full-stack TypeScript dashboard with PostgreSQL, NextAuth, Stripe, AI-powered analytics, and CSV data ingestion.

---

## 🚀 Quick Start (Production)

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+ (with SSL)
- Vercel account (or alternative hosting)
- Stripe account (live mode)
- OpenAI API key (optional)

### Deployment Steps
```bash
# 1. Clone repository
git clone <your-repo-url>
cd Dash-main

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.production.example .env.production
# Edit .env.production with your production values

# 4. Run database migrations
npx prisma migrate deploy

# 5. Deploy to Vercel
vercel --prod
```

**For detailed instructions, see:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📋 Features

### ✅ Core Features
- **User Authentication**: Secure JWT-based auth with NextAuth.js
- **Role-Based Access Control**: ADMIN, CUSTOMER, DELIVERY_PARTNER roles
- **Payment Integration**: Stripe subscriptions with webhook processing
- **Review Management**: CRUD operations for customer reviews
- **Branch Management**: Multi-location business support
- **Analytics Dashboard**: Real-time metrics and sentiment analysis

### 🆕 CSV Analytics Engine
- **File Upload**: Drag-and-drop CSV upload with validation
- **Smart Parsing**: Auto-detect column types (numeric, date, text)
- **Data Visualization**: Interactive charts with Recharts
- **AI-Powered Insights**: OpenAI-generated summaries (8s timeout with fallback)
- **Branch Statistics**: Aggregate ratings by location
- **Sentiment Analysis**: Automatic sentiment extraction and visualization

### 🎨 UI/UX Polish
- **Skeleton Loaders**: Smooth loading states for better UX
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Mode Support**: High-contrast mode toggle
- **Toast Notifications**: Real-time user feedback with react-hot-toast

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL with SSL |
| **Authentication** | NextAuth.js (JWT sessions) |
| **Payments** | Stripe Checkout + Webhooks |
| **AI** | OpenAI GPT-4 (with fallback) |
| **File Processing** | fast-csv (streaming parser) |
| **Styling** | Tailwind CSS, Framer Motion |
| **Charts** | Recharts |
| **Monitoring** | Sentry (optional) |
| **Deployment** | Vercel (recommended) |

### Project Structure
```
Dash-main/
├── app/                       # Next.js App Router
│   ├── api/                   # Backend API routes
│   │   ├── analytics/         # Analytics endpoints
│   │   ├── auth/              # Authentication endpoints
│   │   ├── uploads/           # CSV upload endpoints
│   │   ├── reviews/           # Review CRUD
│   │   └── stripe/            # Payment webhooks
│   ├── dashboard/             # Protected dashboard pages
│   │   ├── uploads/           # CSV upload UI
│   │   └── analytics/         # CSV analytics UI
│   ├── components/            # Reusable React components
│   └── lib/                   # Shared utilities
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma          # Prisma data models
│   └── migrations/            # SQL migration history
├── lib/                       # Core utilities
│   ├── auth-config.ts         # NextAuth configuration
│   ├── auth-helpers-server.ts # Auth utilities for API routes
│   ├── db.ts                  # Prisma client instance
│   ├── stripe.ts              # Stripe SDK setup
│   ├── ai.ts                  # OpenAI integration
│   ├── logger.ts              # Centralized error logging
│   └── env.ts                 # Environment validation
├── public/                    # Static assets
├── vercel.json                # Vercel deployment config
├── .env.production.example    # Environment template
└── DEPLOYMENT_GUIDE.md        # Deployment instructions
```

---

## 🔐 Security

### Authentication & Authorization
- JWT sessions with 30-day expiration
- Role-based middleware on all protected routes
- Password hashing with bcrypt (10 rounds)
- CSRF protection via NextAuth.js

### API Security
- All sensitive routes require authentication
- Role checks prevent unauthorized access
- Input validation and sanitization
- File upload size limits (10MB for CSV)
- Rate limiting on public endpoints

### Data Protection
- SSL-encrypted database connections
- Environment variables never exposed to client
- Sensitive data excluded from logs
- Stripe webhook signature verification
- HTTPS enforcement in production

---

## 📊 Database Schema

### Key Models
```prisma
model User {
  id        String   @id @default(uuid())
  name      String?
  email     String   @unique
  password  String
  role      String   @default("CUSTOMER")
  createdAt DateTime @default(now())
  
  @@index([role])
  @@index([createdAt])
}

model Payment {
  id                String   @id @default(uuid())
  userId            String
  amount            Float
  status            String
  stripeSessionId   String?  @unique
  createdAt         DateTime @default(now())
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Review {
  id             String   @id @default(uuid())
  userId         String
  branchId       String
  rating         Int
  comment        String?
  sentiment      Float?
  sentimentLabel String?
  createdAt      DateTime @default(now())
  
  @@index([userId])
  @@index([branchId])
  @@index([sentiment])
  @@index([sentimentLabel])
  @@index([createdAt])
}

model CsvUpload {
  id            String   @id @default(uuid())
  filename      String
  filepath      String
  uploadedById  String
  uploadedAt    DateTime @default(now())
  summaryJson   Json?
  chartConfig   Json?
  
  @@index([uploadedById])
  @@index([uploadedAt])
}
```

**See full schema:** [prisma/schema.prisma](./prisma/schema.prisma)

---

## 🔌 API Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/session` - Get current session

### CSV Upload & Analytics
- `POST /api/uploads` - Upload CSV file (ADMIN only)
- `GET /api/uploads` - List all uploads (ADMIN only)
- `GET /api/analytics/csv/[id]` - Get analytics for upload (ADMIN only)

### Payments
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout
- `POST /api/stripe/webhook` - Process Stripe webhook events

### Reviews
- `GET /api/reviews` - List reviews (paginated)
- `POST /api/reviews` - Create review (authenticated)
- `PATCH /api/reviews/[id]` - Update review (owner/admin)
- `DELETE /api/reviews/[id]` - Delete review (owner/admin)

**For detailed API docs:** See individual route files in `app/api/`

---

## 🧪 Testing

### Local Development Testing
```bash
# Start development server
npm run dev

# Open http://localhost:3000

# Test authentication
# 1. Register at /auth/signup
# 2. Login at /auth/login
# 3. Access dashboard at /dashboard

# Test CSV upload (as ADMIN)
# 1. Navigate to /dashboard/uploads
# 2. Drag and drop a CSV file
# 3. View analytics at /dashboard/analytics/csv/[id]

# Test payment flow
# 1. Go to /pricing
# 2. Select a plan
# 3. Use test card: 4242 4242 4242 4242
# 4. Verify payment in database
```

### Production QA
**Complete checklist:** [PRODUCTION_QA_CHECKLIST.md](./PRODUCTION_QA_CHECKLIST.md)

---

## 📦 Environment Variables

### Required
```env
DATABASE_URL="postgresql://..."           # PostgreSQL connection string
NEXTAUTH_SECRET="32-char-secret"          # JWT signing secret
NEXTAUTH_URL="https://your-domain.com"    # Production URL
STRIPE_SECRET_KEY="sk_live_..."           # Stripe live secret key
STRIPE_PUBLISHABLE_KEY="pk_live_..."      # Stripe live publishable key
STRIPE_WEBHOOK_SECRET="whsec_..."         # Stripe webhook secret
```

### Optional
```env
OPENAI_API_KEY="sk-..."                   # For AI summaries (fallback if missing)
SENTRY_DSN="https://...@sentry.io/..."    # Error monitoring
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..." # Client-side Stripe key
```

**Full reference:** [.env.production.example](./.env.production.example)

---

## 🔧 Maintenance

### Regular Tasks
| Frequency | Task |
|-----------|------|
| **Daily** | Check error logs in Sentry |
| **Weekly** | Review database query performance |
| **Monthly** | Update dependencies (`npm update`) |
| **Quarterly** | Rotate secrets and credentials |
| **As Needed** | Scale database resources |

### Database Backups
```bash
# Backup (PostgreSQL)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20240101.sql
```

### Monitoring
- **Sentry**: Real-time error tracking
- **Vercel Analytics**: Page performance
- **Database Metrics**: Connection pool, query times
- **Uptime Monitors**: External health checks

---

## 🆘 Troubleshooting

### Common Issues

**Build fails with Prisma error**
```bash
# Solution: Generate Prisma client before build
npx prisma generate
npm run build
```

**Database connection timeout**
```bash
# Solution: Verify connection string format
postgresql://user:pass@host:5432/db?sslmode=require
```

**Stripe webhook fails**
```bash
# Solution: Verify webhook secret matches Stripe Dashboard
vercel env add STRIPE_WEBHOOK_SECRET
```

**AI summary times out**
- Timeout is 8 seconds (intentional)
- Fallback message displays automatically
- Verify `OPENAI_API_KEY` is correct

**For detailed troubleshooting:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Step-by-step deployment instructions |
| [PRODUCTION_QA_CHECKLIST.md](./PRODUCTION_QA_CHECKLIST.md) | Pre-launch quality assurance |
| [CSV_ANALYTICS_SETUP.md](./CSV_ANALYTICS_SETUP.md) | CSV feature documentation |
| [CSV_QUICK_START.md](./CSV_QUICK_START.md) | Testing CSV features |
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Database configuration |
| [PAYMENT_SETUP.md](./PAYMENT_SETUP.md) | Stripe integration guide |

---

## 🤝 Support

### Resources
- **GitHub Issues**: Report bugs or request features
- **Documentation**: See files listed above
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Docs**: https://stripe.com/docs

### Contact
- Email: support@yourcompany.com
- Slack: #saas-dashboard

---

## 📄 License

Proprietary - All rights reserved

---

## 🏆 Production Readiness

| Category | Status |
|----------|--------|
| ✅ Authentication | Production-ready with NextAuth.js |
| ✅ Database | Optimized with indexes |
| ✅ Payments | Stripe live mode integrated |
| ✅ CSV Analytics | Fully functional with AI |
| ✅ Error Handling | Centralized logging with Sentry |
| ✅ Security | Role-based access control |
| ✅ Performance | Database indexes, query optimization |
| ✅ Monitoring | Error tracking and logging |
| ✅ Deployment | Vercel configuration ready |
| ✅ Documentation | Comprehensive guides |

**Status:** ✅ **READY FOR PRODUCTION DEPLOYMENT**

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained By:** Your Team
