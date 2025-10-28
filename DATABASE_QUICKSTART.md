# 🚀 Quick Start: Database Setup

This guide will get your PostgreSQL database connected and working in **5 minutes**.

---

## 📋 What You'll Need

1. A PostgreSQL database (we'll help you get a free one)
2. 5 minutes of your time

---

## 🎯 Step-by-Step Setup

### Step 1: Get a Free PostgreSQL Database (2 minutes)

**Option A: Neon.tech (Recommended - Easiest)**

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" (use GitHub for fastest signup)
3. Click "Create Project"
4. Name it: `dash-reviews`
5. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx-xxx.neon.tech/neondb?sslmode=require`)

**Option B: Supabase**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up and create new project
3. Go to Settings > Database > Connection String (URI mode)
4. Copy the connection string

### Step 2: Configure Your Environment (1 minute)

1. Open the `.env` file in your project root
2. Find this line:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/dash_reviews?schema=public"
   ```
3. Replace it with your connection string from Step 1:
   ```env
   DATABASE_URL="postgresql://your-actual-connection-string-here"
   ```
4. Save the file

### Step 3: Run the Setup Script (2 minutes)

Open your terminal and run:

```bash
npm run setup:db
```

This automated script will:
- ✅ Generate Prisma Client
- ✅ Create all database tables
- ✅ Seed sample data
- ✅ Verify everything works

**That's it! Your database is ready! 🎉**

---

## 🧪 Test Your Setup

### 1. Check if everything works:
```bash
npm run db:test
```

### 2. View your data visually:
```bash
npm run db:studio
```
Opens at `http://localhost:5555`

### 3. Test login:
```bash
npm run dev
```
Then go to `http://localhost:3000/auth/login`

**Test Credentials:**
- **Admin:** `admin@example.com` / `admin123`
- **User:** `user@example.com` / `user123`

---

## 📊 What Got Created?

Your database now has:

| Table | Records | Description |
|-------|---------|-------------|
| **Users** | 2 | Admin and regular user accounts |
| **Plans** | 3 | Basic, Pro, and Enterprise plans |
| **Branches** | 2 | Sample business locations |
| **Payments** | 2 | Sample payment records |
| **Reviews** | 3 | Sample reviews with sentiment |

---

## 🛠️ Useful Commands

```bash
# Database Management
npm run db:studio        # Visual database browser
npm run db:test          # Test connection
npm run db:verify        # Comprehensive verification
npm run db:seed          # Add more sample data
npm run db:reset         # Reset database (WARNING: deletes all data)

# Development
npm run dev              # Start dev server
npm run auth:test        # Test authentication

# Utilities
npm run secret:generate  # Generate new NEXTAUTH_SECRET
```

---

## 🆘 Troubleshooting

### "Can't reach database server"

**Problem:** DATABASE_URL is incorrect or database is unreachable.

**Fix:**
1. Double-check your DATABASE_URL in `.env`
2. Make sure there are no spaces or extra quotes
3. Verify your database is active (check Neon/Supabase dashboard)
4. Ensure `?sslmode=require` is at the end of the URL

### "Environment variable not found: DATABASE_URL"

**Problem:** .env file not loaded.

**Fix:**
1. Make sure `.env` file exists in project root
2. Restart your terminal/IDE
3. Run `npm run setup:db` again

### "Prisma Client not generated"

**Problem:** Prisma Client needs to be generated.

**Fix:**
```bash
npm run db:generate
```

### Still having issues?

1. Check the detailed guide: `DATABASE_SETUP_GUIDE.md`
2. Try resetting: `npm run db:reset` (WARNING: deletes all data)
3. Check your database provider's status page

---

## 🔐 Security Notes

- ✅ `.env` is already in `.gitignore` (never commit it!)
- ✅ Passwords are hashed with bcrypt
- ✅ SSL is enabled by default with Neon/Supabase
- ⚠️ Change NEXTAUTH_SECRET before production: `npm run secret:generate`

---

## 📚 Learn More

- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Docs:** https://neon.tech/docs
- **Full Setup Guide:** See `DATABASE_SETUP_GUIDE.md`

---

## ✅ Quick Checklist

- [ ] Got PostgreSQL connection string from Neon/Supabase
- [ ] Updated DATABASE_URL in `.env`
- [ ] Ran `npm run setup:db` successfully
- [ ] Can access Prisma Studio (`npm run db:studio`)
- [ ] Can login at `http://localhost:3000/auth/login`

**All checked? You're ready to build! 🚀**
