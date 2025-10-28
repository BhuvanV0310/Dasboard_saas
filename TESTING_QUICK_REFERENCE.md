# 🧪 Quick Testing Reference

## 🎯 Quick Start Testing Guide

**Server:** http://localhost:3000  
**Status:** ✅ Running

---

## 📦 Test Data (Pre-loaded)

```bash
# Admin Account
Email: admin@example.com
Password: admin123
Role: ADMIN

# Regular User
Email: user@example.com
Password: user123
Role: CUSTOMER

# Plans (3 total)
- Basic: $49.99/mo
- Pro: $99.99/mo
- Enterprise: $299.99/mo

# Branches (2 total)
- Downtown Branch (New York, NY)
- Uptown Branch (Brooklyn, NY)

# Reviews: 3 sample reviews
# Payments: 2 sample payments
```

---

## 🔥 Critical Tests (Start Here)

### 1. Health Check
```bash
curl http://localhost:3000/api/health
# Should return: { "status": "healthy", ... }
```

### 2. Login Test
```bash
# Visit browser
http://localhost:3000/auth/login

# Enter credentials
Email: admin@example.com
Password: admin123
Admin Key: Admin123 (if prompted)

# Expected: Redirect to /dashboard
```

### 3. Database Verification
```bash
npm run db:test
# Should show: ✅ 2 users, 3 plans, 2 branches
```

---

## 🌐 API Endpoints Quick Reference

### Authentication
| Method | Endpoint | Status | Auth Required |
|--------|----------|--------|---------------|
| POST | `/api/auth/register` | ✅ | No |
| POST | `/api/auth/login` | ✅ | No |
| GET | `/api/auth/list-users` | ✅ | Yes (Admin) |
| POST | `/api/auth/delete-user` | ✅ | Yes (Admin) |

### Plans
| Method | Endpoint | Status | Auth Required |
|--------|----------|--------|---------------|
| GET | `/api/plans` | ✅ | No |
| POST | `/api/plans` | ❌ | Yes (Admin) |
| PUT | `/api/plans/[id]` | ❌ | Yes (Admin) |
| DELETE | `/api/plans/[id]` | ❌ | Yes (Admin) |

### Payments (Stripe)
| Method | Endpoint | Status | Auth Required |
|--------|----------|--------|---------------|
| POST | `/api/stripe/create-checkout-session` | ✅ | Yes |
| POST | `/api/stripe/webhook` | ✅ | No (Stripe) |
| GET | `/api/payments` | ❌ | Yes |

### Reviews
| Method | Endpoint | Status | Auth Required |
|--------|----------|--------|---------------|
| GET | `/api/reviews` | ✅ | No |
| POST | `/api/reviews` | ✅ | Yes |
| GET | `/api/reviews/stats` | ❌ | No |

### Branches
| Method | Endpoint | Status | Auth Required |
|--------|----------|--------|---------------|
| GET | `/api/branches` | ❌ | Yes |
| POST | `/api/branches` | ❌ | Yes |
| PUT | `/api/branches/[id]` | ❌ | Yes |
| DELETE | `/api/branches/[id]` | ❌ | Yes |

### CSV & Analytics
| Method | Endpoint | Status | Auth Required |
|--------|----------|--------|---------------|
| POST | `/api/map-upload` | ✅ | Yes |
| POST | `/api/validate-upload` | ✅ | Yes |
| GET | `/api/analytics` | ✅ | No |
| GET | `/api/analytics/csv/[id]` | ✅ | Yes |

---

## 🧪 cURL Test Commands

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "adminKey": "Admin123"
  }'
```

### Get Plans
```bash
curl http://localhost:3000/api/plans
```

### List Users (with auth)
```bash
TOKEN="your-jwt-token-here"

curl http://localhost:3000/api/auth/list-users \
  -H "Authorization: Bearer $TOKEN"
```

### Create Review
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Great service!",
    "rating": 5,
    "category": "service"
  }'
```

---

## 🎨 Frontend Testing URLs

### Public Pages
- Homepage: http://localhost:3000
- Login: http://localhost:3000/auth/login
- Signup: http://localhost:3000/auth/signup
- Pricing: http://localhost:3000/pricing
- Plans: http://localhost:3000/plans

### Protected Pages (Require Login)
- Dashboard: http://localhost:3000/dashboard
- Branches: http://localhost:3000/branches
- Reviews: http://localhost:3000/reviews
- Profile: http://localhost:3000/profile (if exists)

### Admin Only
- User Management: http://localhost:3000/dashboard (Users tab)
- Payment Management: http://localhost:3000/dashboard (Payments tab)
- Plan Management: http://localhost:3000/dashboard (Plans tab)

---

## 💳 Stripe Test Cards

### Successful Payment
```
Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
ZIP: 12345
```

### Payment Declined
```
Card: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123
```

### Requires Authentication (3D Secure)
```
Card: 4000 0027 6000 3184
Expiry: 12/25
CVC: 123
```

---

## 🔍 Browser DevTools Testing

### Check Authentication Token
```javascript
// In browser console
localStorage.getItem('token')
// or
document.cookie
```

### Test NextAuth Session
```javascript
// In browser console (on a page using NextAuth)
import { useSession } from 'next-auth/react';

// In React component:
const { data: session, status } = useSession();
console.log(session);
```

### Check API Response
```javascript
// In browser console
fetch('http://localhost:3000/api/plans')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## 📊 Database Verification Commands

```bash
# Test database connection
npm run db:test

# Comprehensive verification
npm run db:verify

# Open Prisma Studio (visual browser)
npm run db:studio
# Opens at http://localhost:5555

# Re-seed database (reset data)
npm run db:reset

# Check data directly
npm run db:studio
# Navigate to each table and verify records
```

---

## ✅ Quick Test Checklist

Copy and paste this to track your testing:

```
□ Server is running (http://localhost:3000)
□ Database connected (npm run db:test)
□ Health check passes (/api/health)

Authentication:
□ Can register new user
□ Can login as admin
□ Can login as regular user
□ Session persists on refresh

Dashboard:
□ Admin sees admin dashboard
□ User sees user dashboard
□ Role-based UI works correctly

Plans:
□ Can view plans on /pricing
□ Plans load from database
□ Can click subscribe button

Payments:
□ Can create checkout session
□ Redirects to Stripe
□ Test payment completes
□ Webhook processes payment

Database:
□ Prisma Studio opens
□ Can see all tables
□ Data matches expectations

CSV/Analytics:
□ Can upload CSV
□ Sentiment analysis runs
□ Charts display correctly
```

---

## 🐛 Quick Troubleshooting

### Issue: Login doesn't work
```bash
# Check if user exists
npm run db:studio
# Navigate to User table
# Verify admin@example.com exists
```

### Issue: API returns 401
```bash
# Check token
# In browser console:
localStorage.getItem('token')
# Should return JWT token
```

### Issue: Database connection error
```bash
# Verify DATABASE_URL
cat .env | grep DATABASE_URL

# Test connection
npm run db:test
```

### Issue: Prisma Client error
```bash
# Regenerate client
npm run db:generate

# Push schema again
npm run db:push
```

---

## 📈 Test Coverage Summary

**Total Endpoints:** 33  
**Implemented:** 15 (45%)  
**Missing:** 18 (55%)

**Critical Working:**
- ✅ Authentication
- ✅ Plans listing
- ✅ Reviews creation
- ✅ Stripe checkout
- ✅ CSV upload

**Critical Missing:**
- ❌ Branch CRUD
- ❌ User CRUD (except list/delete)
- ❌ Payment listing
- ❌ Profile management
- ❌ Plan CRUD (admin)

---

## 🎯 Testing Priority

1. **HIGH PRIORITY** (Test First)
   - Login/Authentication
   - Database connectivity
   - Health checks
   - Basic data retrieval

2. **MEDIUM PRIORITY** (Test Next)
   - Payment flow
   - CSV upload
   - Review creation
   - Dashboard views

3. **LOW PRIORITY** (Test Last)
   - Advanced analytics
   - Profile editing
   - Subscription management

---

## 📞 Support Resources

- **Full Testing Guide:** `TESTING_CHECKLIST.md`
- **Database Docs:** `DATABASE_MODELS_SUMMARY.md`
- **Setup Guide:** `DATABASE_QUICKSTART.md`

---

**Ready to test? Start with the Critical Tests section above! 🚀**
