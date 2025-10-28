# 📊 Database Schema Summary

This document provides a comprehensive overview of all database models and their relationships in the Dash application.

---

## 🗄️ Database Overview

- **Database Type:** PostgreSQL
- **ORM:** Prisma v6.18.0
- **Total Models:** 8
- **Total Relations:** 12+

---

## 📋 Models Summary

### 1. **User** 👤
Main user authentication and profile model.

```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  emailVerified    DateTime?
  password         String?
  name             String?
  image            String?
  role             Role      @default(CUSTOMER)
  branchId         String?
  stripeCustomerId String?   @unique
  activePlanId     String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  activePlan   Plan?       @relation(fields: [activePlanId], references: [id])
  branches     Branch[]
  payments     Payment[]
  reviews      Review[]
  accounts     Account[]
  sessions     Session[]
  csvUploads   CsvUpload[]
}
```

**Purpose:** Stores user accounts with authentication data  
**Key Features:**
- UUID primary keys
- Role-based access control (ADMIN, CUSTOMER, DELIVERY_PARTNER)
- Stripe customer integration
- Email verification support
- Password hashing (bcrypt)

**Indexes:**
- `email` (unique)
- `stripeCustomerId` (unique)
- `role`
- `createdAt`

---

### 2. **Account** 🔐
NextAuth OAuth accounts (Google, GitHub, etc.)

```prisma
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

**Purpose:** OAuth provider accounts  
**Supports:** Google, GitHub, and other OAuth providers

---

### 3. **Session** 🎫
NextAuth session management

```prisma
model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Purpose:** Database-backed sessions  
**Strategy:** JWT by default (configurable)

---

### 4. **VerificationToken** ✉️
Email verification tokens

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}
```

**Purpose:** Email verification and magic links

---

### 5. **Plan** 💳
Subscription plans

```prisma
model Plan {
  id              String     @id @default(uuid())
  name            String
  price           Float
  description     String
  features        String[]
  status          PlanStatus @default(ACTIVE)
  stripePriceId   String?    @unique
  stripeProductId String?    @unique
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  
  users User[]
}

enum PlanStatus {
  ACTIVE
  INACTIVE
}
```

**Purpose:** Subscription plan definitions  
**Key Features:**
- Array of features
- Stripe integration
- Active/Inactive status

**Default Plans:**
1. **Basic Plan** - $49.99/month
2. **Pro Plan** - $99.99/month
3. **Enterprise Plan** - $299.99/month

---

### 6. **Branch** 🏢
Business locations/branches

```prisma
model Branch {
  id        String   @id @default(uuid())
  name      String
  location  String?
  address   String?
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviews Review[]
}
```

**Purpose:** Store business locations for review tracking  
**Relations:**
- Belongs to User
- Has many Reviews

---

### 7. **Payment** 💰
Payment transactions

```prisma
model Payment {
  id                    String        @id @default(uuid())
  userId                String
  planId                String?
  amount                Float
  status                PaymentStatus @default(PENDING)
  stripePaymentIntentId String?       @unique
  stripeSessionId       String?       @unique
  planName              String?
  metadata              Json?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum PaymentStatus {
  PENDING
  COMPLETED
  CANCELLED
  FAILED
}
```

**Purpose:** Track all payment transactions  
**Key Features:**
- Stripe integration
- Payment status tracking
- Flexible metadata (JSON)

**Statuses:**
- ⏳ PENDING - Payment initiated
- ✅ COMPLETED - Payment successful
- ❌ CANCELLED - Payment cancelled by user
- 🔴 FAILED - Payment failed

---

### 8. **Review** ⭐
Customer reviews with AI sentiment analysis

```prisma
model Review {
  id               String            @id @default(uuid())
  userId           String
  branchId         String?
  text             String            @db.Text
  rating           Int?
  sentiment        String?
  category         String?
  sentimentScore   Float?
  sentimentLabel   SentimentLabel?
  feedbackCategory FeedbackCategory?
  aiConfidence     Float?
  analyzedAt       DateTime?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch Branch? @relation(fields: [branchId], references: [id], onDelete: SetNull)
}

enum SentimentLabel {
  POSITIVE
  NEGATIVE
  NEUTRAL
}

enum FeedbackCategory {
  PRODUCT
  SERVICE
  DELIVERY
  OTHER
}
```

**Purpose:** Store customer reviews with AI-powered sentiment analysis  
**Key Features:**
- AI sentiment scoring
- Category classification
- Confidence scores
- Branch association

---

### 9. **CsvUpload** 📊
Track CSV file uploads for analytics

```prisma
model CsvUpload {
  id           String   @id @default(uuid())
  filename     String
  filepath     String
  uploadedById String
  uploadedAt   DateTime @default(now())
  summaryJson  Json?
  chartConfig  Json?
  
  uploadedBy User @relation(fields: [uploadedById], references: [id])
}
```

**Purpose:** Track CSV uploads and analytics data  
**Key Features:**
- File metadata
- JSON summaries
- Chart configurations

---

## 🔗 Relationship Diagram

```
User (👤)
├─── 1:N ──> Account (OAuth)
├─── 1:N ──> Session
├─── 1:N ──> Branch
├─── 1:N ──> Payment
├─── 1:N ──> Review
├─── 1:N ──> CsvUpload
└─── N:1 ──> Plan (activePlan)

Branch (🏢)
└─── 1:N ──> Review

Review (⭐)
├─── N:1 ──> User
└─── N:1 ──> Branch (optional)

Payment (💰)
└─── N:1 ──> User
```

---

## 📈 Enums

### Role
```typescript
enum Role {
  ADMIN             // Full system access
  CUSTOMER          // Standard user
  DELIVERY_PARTNER  // Delivery service users
}
```

### PlanStatus
```typescript
enum PlanStatus {
  ACTIVE    // Available for purchase
  INACTIVE  // Hidden from users
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING    // Payment initiated
  COMPLETED  // Successfully paid
  CANCELLED  // User cancelled
  FAILED     // Payment failed
}
```

### SentimentLabel
```typescript
enum SentimentLabel {
  POSITIVE   // Good feedback
  NEGATIVE   // Bad feedback
  NEUTRAL    // Mixed/neutral feedback
}
```

### FeedbackCategory
```typescript
enum FeedbackCategory {
  PRODUCT   // Product-related feedback
  SERVICE   // Service-related feedback
  DELIVERY  // Delivery-related feedback
  OTHER     // Uncategorized
}
```

---

## 🎯 Key Features

### Authentication & Authorization
- ✅ NextAuth.js integration
- ✅ Email/password authentication
- ✅ OAuth (Google) support
- ✅ Role-based access control
- ✅ Session management
- ✅ Email verification

### Payment Processing
- ✅ Stripe integration
- ✅ Subscription management
- ✅ Payment tracking
- ✅ Webhook support

### Analytics & Insights
- ✅ AI-powered sentiment analysis
- ✅ Review categorization
- ✅ CSV data processing
- ✅ Confidence scoring

### Data Management
- ✅ Soft deletes (SetNull for optional relations)
- ✅ Cascade deletes for user data
- ✅ Timestamps (createdAt, updatedAt)
- ✅ UUID primary keys

---

## 🔒 Security Features

### Password Security
- Bcrypt hashing (10 rounds)
- No plaintext storage
- Server-side validation

### Data Protection
- Environment variable isolation
- SSL-enforced connections
- Prepared statements (SQL injection protection)
- Input validation with Zod

### Access Control
- Role-based permissions
- User-scoped data queries
- Authentication middleware

---

## 📊 Indexes

Optimized for performance with strategic indexes:

### User Table
- `email` (unique, for login)
- `stripeCustomerId` (unique, for payments)
- `role` (for admin queries)
- `createdAt` (for sorting)

### Payment Table
- `userId` (for user payments)
- `status` (for filtering)
- `stripeSessionId` (unique, for webhooks)
- `createdAt` (for sorting)

### Review Table
- `userId` (for user reviews)
- `branchId` (for branch reviews)
- `sentiment` (for analytics)
- `sentimentLabel` (for filtering)
- `createdAt` (for sorting)

### Branch Table
- `userId` (for user branches)
- `createdAt` (for sorting)

---

## 🚀 Sample Data (Seeded)

After running `npm run db:seed`, you get:

### Users
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| user@example.com | user123 | CUSTOMER |

### Plans
| Name | Price | Features |
|------|-------|----------|
| Basic | $49.99 | 5 branches, basic analytics |
| Pro | $99.99 | 20 branches, advanced analytics |
| Enterprise | $299.99 | Unlimited, AI insights |

### Branches
- Downtown Branch (New York, NY)
- Uptown Branch (Brooklyn, NY)

### Payments
- 1 completed payment ($99.99)
- 1 pending payment ($99.99)

### Reviews
- 3 sample reviews with different sentiments

---

## 🔄 Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema (no migration files)
npm run db:push

# Create migration (with history)
npm run db:migrate

# Reset database (⚠️ deletes all data)
npm run db:reset

# View database visually
npm run db:studio
```

---

## 📚 Additional Resources

- **Prisma Schema:** `prisma/schema.prisma`
- **Seed Script:** `prisma/seed.ts`
- **DB Client:** `lib/db.ts`
- **Auth Config:** `lib/auth-config.ts`

---

## ✅ Database Status

- [x] Schema designed and implemented
- [x] Relations configured
- [x] Indexes optimized
- [x] Seed data prepared
- [x] Authentication integrated
- [x] Payment system ready
- [x] Analytics models ready
- [x] Role-based access configured

**Status:** ✅ FULLY READY FOR PRODUCTION

---

*Last Updated: October 27, 2025*
