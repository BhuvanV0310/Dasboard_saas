# ✅ DATABASE SETUP - COMPLETE INSTRUCTIONS

## 🎯 Current Status

Your database schema is **100% ready**! Here's what's configured:

### ✅ What's Already Done:
- Schema file created (`prisma/schema.prisma`)
- 9 database models defined
- All relationships configured
- Seed script prepared
- Test scripts ready
- Verification scripts created
- Documentation complete

### ⚠️ What You Need to Do:
**One thing: Connect to a PostgreSQL database**

---

## 🚀 5-MINUTE SETUP

### Step 1: Get a Free PostgreSQL Database

**🌟 RECOMMENDED: Neon.tech (100% Free Forever)**

1. Open your browser and go to: **https://neon.tech**

2. Click **"Sign Up"** 
   - Sign up with GitHub (fastest) or email

3. Click **"Create a project"**
   - Project name: `dash-reviews` (or any name you like)
   - Region: Choose closest to your location
   - Click **"Create project"**

4. **COPY THE CONNECTION STRING**
   - You'll see a connection string that looks like:
   ```
   postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   - Click the **📋 copy icon** to copy it

### Step 2: Update Your .env File

1. Open the `.env` file in your project root (it's already created)

2. Find this line:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/dash_reviews?schema=public"
   ```

3. **Replace it** with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

4. Save the file

### Step 3: Run the Automated Setup

Open your terminal in the project directory and run:

```bash
npm run setup:db
```

This single command will:
1. ✅ Generate Prisma Client
2. ✅ Create all database tables
3. ✅ Seed sample data (2 users, 3 plans, 2 branches, etc.)
4. ✅ Verify everything works

**⏱️ Takes 30-60 seconds**

### Step 4: Verify It Worked

```bash
npm run db:test
```

You should see:
- ✅ Database connected successfully!
- ✅ Found 2 users
- ✅ All tests passed!

---

## 🎉 That's It! You're Done!

Your database is now fully operational with:
- ✅ 2 test users (admin and regular user)
- ✅ 3 subscription plans
- ✅ 2 sample branches
- ✅ Sample reviews and payments

### Test Credentials:
- **Admin:** admin@example.com / admin123
- **User:** user@example.com / user123

---

## 📚 Next Steps

### 1. Start the Development Server
```bash
npm run dev
```
Then open: http://localhost:3000

### 2. View Your Database Visually
```bash
npm run db:studio
```
Opens at: http://localhost:5555

### 3. Test Authentication
```bash
npm run auth:test
```

---

## 🛠️ Useful Commands Reference

```bash
# Database Commands
npm run setup:db         # Complete automated setup
npm run db:generate      # Generate Prisma Client
npm run db:push          # Sync schema to database
npm run db:seed          # Add sample data
npm run db:test          # Test connection
npm run db:verify        # Comprehensive verification
npm run db:studio        # Visual database browser
npm run db:reset         # Reset database (⚠️ deletes all data)

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run auth:test        # Test authentication

# Utilities
npm run secret:generate  # Generate secure NEXTAUTH_SECRET
```

---

## 🆘 Troubleshooting

### Issue: "Missing required environment variable: DATABASE_URL"

**Solution:** You need to set up your DATABASE_URL in the `.env` file.

1. Get a connection string from Neon.tech (see Step 1 above)
2. Update `.env` file (see Step 2 above)
3. Run `npm run setup:db`

### Issue: "Can't reach database server"

**Possible causes:**
1. DATABASE_URL is incorrect
2. You have extra spaces or quotes
3. Database is not accessible

**Solution:**
1. Double-check your DATABASE_URL in `.env`
2. Make sure it's exactly as copied from Neon (no extra characters)
3. Test if your database is active in the Neon dashboard

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npm run db:generate
```

### Issue: "Table does not exist"

**Solution:**
```bash
npm run db:push
```

### Still stuck?

1. Read the detailed guide: `DATABASE_SETUP_GUIDE.md`
2. Check the models reference: `DATABASE_MODELS_SUMMARY.md`
3. Try the quick start: `DATABASE_QUICKSTART.md`

---

## 📊 What You'll Have After Setup

### Database Tables:
```
✅ users              (Authentication & profiles)
✅ accounts           (OAuth providers)
✅ sessions           (User sessions)
✅ verification_token (Email verification)
✅ plans              (Subscription plans)
✅ branches           (Business locations)
✅ payments           (Transaction history)
✅ reviews            (Customer reviews with AI sentiment)
✅ csv_uploads        (Analytics data)
```

### Sample Data:
```
✅ 2 Users
   - admin@example.com (ADMIN role)
   - user@example.com (CUSTOMER role)

✅ 3 Subscription Plans
   - Basic Plan ($49.99/month)
   - Pro Plan ($99.99/month)
   - Enterprise Plan ($299.99/month)

✅ 2 Branches
   - Downtown Branch (New York)
   - Uptown Branch (Brooklyn)

✅ 2 Payments
   - 1 completed
   - 1 pending

✅ 3 Reviews
   - With sentiment analysis
   - Linked to branches
```

---

## 🔐 Security Checklist

- [x] `.env` file in `.gitignore` (don't commit it!)
- [x] Passwords hashed with bcrypt
- [x] SSL enabled by default (Neon/Supabase)
- [ ] Generate secure NEXTAUTH_SECRET: `npm run secret:generate`
- [ ] Use different secrets for production

---

## ✅ Verification Checklist

Before moving on, make sure:

- [ ] Got PostgreSQL from Neon.tech (or alternative)
- [ ] Updated DATABASE_URL in `.env`
- [ ] Ran `npm run setup:db` successfully
- [ ] Ran `npm run db:test` - all tests passed
- [ ] Can access Prisma Studio (`npm run db:studio`)
- [ ] Can see data in Prisma Studio
- [ ] Can start dev server (`npm run dev`)
- [ ] Can login with test credentials

**All checked? Your database is production-ready! 🚀**

---

## 📖 Documentation Files

- `DATABASE_QUICKSTART.md` - This file (quick setup)
- `DATABASE_SETUP_GUIDE.md` - Detailed setup guide
- `DATABASE_MODELS_SUMMARY.md` - Complete schema reference
- `prisma/schema.prisma` - The actual schema file

---

## 🎯 Summary

**Time Required:** 5 minutes  
**Difficulty:** Easy  
**Cost:** $0 (using free tier)  
**Result:** Fully functional PostgreSQL database with Prisma ORM

**Ready to build amazing features! 🚀**

---

*Last Updated: October 27, 2025*
