# 🗄️ Database Setup Guide - PostgreSQL with Prisma

This guide will help you set up your PostgreSQL database and connect it to your application using Prisma ORM.

---

## 📋 Prerequisites

- Node.js installed (v18 or higher)
- npm or yarn package manager
- Internet connection (for cloud database)

---

## 🚀 Quick Setup (5 minutes)

### Option 1: Neon.tech (Recommended - FREE)

Neon is a serverless PostgreSQL database with a generous free tier.

1. **Create Account**
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up with GitHub, Google, or Email (FREE)

2. **Create New Project**
   - Click "Create Project"
   - Project name: `dash-reviews` (or your choice)
   - Region: Choose closest to you
   - PostgreSQL version: 15 or 16
   - Click "Create Project"

3. **Copy Connection String**
   - After creation, you'll see the connection string
   - It looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - Copy this entire string

4. **Update .env File**
   - Open `.env` in your project root
   - Replace the `DATABASE_URL` value with your connection string:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

5. **Done!** Continue to [Prisma Setup](#prisma-setup) below.

---

### Option 2: Supabase (Alternative - FREE)

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get the connection string from Settings > Database > Connection String (URI mode)
4. Update `.env` with your connection string

---

### Option 3: Local PostgreSQL

If you have PostgreSQL installed locally:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/dash_reviews"
```

---

## 🔧 Prisma Setup

Once you have your `DATABASE_URL` configured, run these commands:

### 1. Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma Client based on your schema.

### 2. Push Schema to Database

```bash
npm run db:push
```

This creates all tables in your database based on `prisma/schema.prisma`.

**What gets created:**
- ✅ User table (for authentication)
- ✅ Account & Session tables (for NextAuth)
- ✅ Plan table (subscription plans)
- ✅ Branch table (business locations)
- ✅ Payment table (transaction records)
- ✅ Review table (customer reviews with sentiment)
- ✅ CsvUpload table (analytics tracking)

### 3. Seed Sample Data

```bash
npm run db:seed
```

This creates sample data for testing:
- **2 Users:**
  - Admin: `admin@example.com` / `admin123`
  - User: `user@example.com` / `user123`
- **3 Subscription Plans:** Basic, Pro, Enterprise
- **2 Branches:** Downtown and Uptown
- **2 Payments:** One completed, one pending
- **3 Reviews:** With different sentiments

### 4. Verify Connection

```bash
npm run db:test
```

This runs a comprehensive test of your database connection and displays:
- ✅ Connection status
- ✅ Record counts
- ✅ Sample data
- ✅ Relationship tests

### 5. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Test queries
- Inspect relationships

---

## 📊 Database Schema Overview

### User Model
```prisma
- id: UUID (primary key)
- email: String (unique)
- password: String (hashed)
- name: String
- role: ADMIN | CUSTOMER | DELIVERY_PARTNER
- stripeCustomerId: String (for payments)
- createdAt, updatedAt: DateTime
```

### Plan Model
```prisma
- id: UUID (primary key)
- name: String
- price: Float
- description: String
- features: String[] (array)
- status: ACTIVE | INACTIVE
- stripePriceId, stripeProductId: String
```

### Branch Model
```prisma
- id: UUID (primary key)
- name: String
- location: String
- address: String
- userId: String (foreign key to User)
```

### Payment Model
```prisma
- id: UUID (primary key)
- userId: String (foreign key)
- amount: Float
- status: PENDING | COMPLETED | CANCELLED | FAILED
- stripePaymentIntentId: String
```

### Review Model
```prisma
- id: UUID (primary key)
- userId: String (foreign key)
- branchId: String (foreign key)
- text: String
- rating: Int
- sentiment: String
- sentimentScore: Float (AI-powered)
- sentimentLabel: POSITIVE | NEGATIVE | NEUTRAL
```

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**Problem:** DATABASE_URL is incorrect or database is not accessible.

**Solutions:**
1. Double-check your DATABASE_URL in `.env`
2. Ensure no extra spaces or quotes
3. Verify your database is running
4. Check firewall/network settings
5. For Neon/Supabase, ensure `?sslmode=require` is at the end

### Error: "Environment variable not found: DATABASE_URL"

**Problem:** .env file not loaded.

**Solutions:**
1. Ensure `.env` file is in project root
2. Restart your terminal/IDE
3. Check if `.env` is in `.gitignore` (it should be)

### Error: "Table does not exist"

**Problem:** Schema not synced with database.

**Solutions:**
```bash
npm run db:push
```

### Error: "Prisma Client not generated"

**Problem:** Prisma Client needs to be generated.

**Solutions:**
```bash
npm run db:generate
```

### Migration Issues

If you need to reset the database:
```bash
# Warning: This deletes all data!
npm run db:push -- --force-reset
npm run db:seed
```

---

## 🔐 Security Best Practices

1. **Never commit .env to Git**
   - Already in `.gitignore`
   - Use `.env.example` for templates

2. **Use Strong Passwords**
   - For production, use long random strings
   - Consider password managers

3. **Enable SSL**
   - Always use `?sslmode=require` in production
   - Neon and Supabase enforce SSL by default

4. **Rotate Secrets**
   - Change NEXTAUTH_SECRET regularly
   - Use different secrets for dev/prod

5. **Limit Access**
   - Use read-only credentials for analytics
   - Create separate users for different services

---

## 📚 Useful Commands

```bash
# Database Commands
npm run db:generate      # Generate Prisma Client
npm run db:push          # Sync schema to database (no migrations)
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed sample data
npm run db:test          # Test database connection

# Development
npm run dev              # Start dev server

# Testing
npm run auth:test        # Test authentication
```

---

## 🎯 Next Steps

After completing database setup:

1. ✅ **Test Authentication**
   ```bash
   npm run auth:test
   ```

2. ✅ **Start Development Server**
   ```bash
   npm run dev
   ```

3. ✅ **Login with Test Credentials**
   - Admin: `admin@example.com` / `admin123`
   - User: `user@example.com` / `user123`

4. ✅ **Check Prisma Studio**
   ```bash
   npm run db:studio
   ```

5. ✅ **Build Missing APIs**
   - Branch CRUD endpoints
   - User management endpoints
   - Payment management endpoints

---

## 🆘 Need Help?

- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Docs:** https://neon.tech/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## ✅ Verification Checklist

- [ ] DATABASE_URL configured in `.env`
- [ ] `npm run db:generate` completed successfully
- [ ] `npm run db:push` completed successfully
- [ ] `npm run db:seed` completed successfully
- [ ] `npm run db:test` shows all tests passing
- [ ] Can access Prisma Studio (`npm run db:studio`)
- [ ] Can see data in database
- [ ] Can login with test credentials

**Status:** Ready for development! 🚀
