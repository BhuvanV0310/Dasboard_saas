# 🧪 End-to-End Testing Checklist

**Server Status:** ✅ Running at http://localhost:3000  
**Database:** ✅ Connected to Neon PostgreSQL  
**Test Date:** October 27, 2025

---

## 📋 Test Credentials

```
Admin Account:
  Email: admin@example.com
  Password: admin123
  Role: ADMIN

Regular User:
  Email: user@example.com
  Password: user123
  Role: CUSTOMER
```

---

## 1️⃣ AUTHENTICATION TESTING

### 1.1 User Registration (Signup)

**Endpoint:** `POST /api/auth/register`  
**Frontend URL:** http://localhost:3000/auth/signup

**Test Case 1: Successful Registration**
```json
Input:
{
  "email": "newuser@test.com",
  "password": "password123",
  "name": "Test User"
}

Expected Output:
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "newuser@test.com",
    "name": "Test User",
    "role": "CUSTOMER",
    "createdAt": "timestamp"
  }
}

Status Code: 201
```

**Test Case 2: Duplicate Email**
```json
Input:
{
  "email": "admin@example.com",
  "password": "password123"
}

Expected Output:
{
  "error": "User with this email already exists"
}

Status Code: 409
```

**Test Case 3: Weak Password**
```json
Input:
{
  "email": "test@test.com",
  "password": "123"
}

Expected Output:
{
  "error": "Password must be at least 6 characters"
}

Status Code: 400
```

**Test Case 4: Missing Fields**
```json
Input:
{
  "email": "test@test.com"
}

Expected Output:
{
  "error": "Email and password are required"
}

Status Code: 400
```

---

### 1.2 User Login

**Endpoint:** `POST /api/auth/login`  
**Frontend URL:** http://localhost:3000/auth/login

**Test Case 1: Admin Login (with adminKey)**
```json
Input:
{
  "email": "admin@example.com",
  "password": "admin123",
  "adminKey": "Admin123"
}

Expected Output:
{
  "success": true,
  "token": "jwt-token-string",
  "role": "admin"
}

Status Code: 200

Notes:
- Token should be stored in localStorage or cookies
- Redirect to /dashboard should occur
- Check if admin dashboard is displayed
```

**Test Case 2: Regular User Login**
```json
Input:
{
  "email": "user@example.com",
  "password": "user123"
}

Expected Output:
{
  "success": true,
  "token": "jwt-token-string",
  "role": "user"
}

Status Code: 200

Notes:
- Should redirect to user dashboard
- No admin panels should be visible
```

**Test Case 3: Invalid Credentials**
```json
Input:
{
  "email": "user@example.com",
  "password": "wrongpassword"
}

Expected Output:
{
  "success": false,
  "message": "Invalid credentials"
}

Status Code: 401
```

**Test Case 4: Non-existent User**
```json
Input:
{
  "email": "notfound@example.com",
  "password": "password123"
}

Expected Output:
{
  "success": false,
  "message": "Invalid credentials"
}

Status Code: 401
```

---

### 1.3 NextAuth Session Login

**Endpoint:** `POST /api/auth/[...nextauth]`  
**Frontend:** Uses NextAuth signIn()

**Test Case 1: Credentials Sign In**
```javascript
// In browser console or frontend
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'admin@example.com',
  password: 'admin123',
  redirect: false
});

Expected:
- Returns { ok: true, error: null }
- Session created in database
- User redirected to callback URL or /dashboard
```

**Test Case 2: Get Session**
```javascript
// In browser console
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();

Expected Session Object:
{
  user: {
    id: "uuid",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN",
    branchId: null
  },
  expires: "timestamp"
}
```

---

## 2️⃣ USER MANAGEMENT (Admin Only)

### 2.1 List All Users

**Endpoint:** `GET /api/auth/list-users`  
**Frontend:** Admin Dashboard > Users Panel

**Test Case 1: Get All Users (Admin)**
```
URL: http://localhost:3000/api/auth/list-users
Headers:
  Authorization: Bearer <admin-token>

Expected Output:
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "timestamp"
    },
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Regular User",
      "role": "user",
      "createdAt": "timestamp"
    }
  ]
}

Status Code: 200
```

**Test Case 2: Unauthorized Access (No Token)**
```
Expected Output:
{
  "success": false,
  "message": "Authentication required"
}

Status Code: 401
```

**Frontend Testing:**
- [ ] Navigate to http://localhost:3000/dashboard (as admin)
- [ ] Click on "Users" tab
- [ ] Verify all users are displayed in a table
- [ ] Check if email, name, role, and created date are shown
- [ ] Verify edit and delete buttons are present

---

### 2.2 Delete User

**Endpoint:** `POST /api/auth/delete-user`

**Test Case 1: Delete User (Admin)**
```json
Input:
{
  "email": "newuser@test.com"
}

Headers:
  Authorization: Bearer <admin-token>

Expected Output:
{
  "success": true,
  "message": "User deleted successfully"
}

Status Code: 200
```

**Test Case 2: Delete Non-existent User**
```json
Input:
{
  "email": "notfound@test.com"
}

Expected Output:
{
  "success": false,
  "message": "User not found"
}

Status Code: 404
```

**Frontend Testing:**
- [ ] In Users panel, click delete button on a user
- [ ] Confirm deletion in modal
- [ ] User should be removed from the list
- [ ] Success toast should appear

---

### 2.3 Update User (MISSING - Needs Implementation)

**Expected Endpoint:** `PUT /api/users/[id]`  
**Status:** ❌ NOT IMPLEMENTED

**Should Include:**
```json
Input:
{
  "name": "Updated Name",
  "role": "ADMIN",
  "branchId": "uuid"
}

Expected Output:
{
  "success": true,
  "user": { /* updated user object */ }
}
```

---

## 3️⃣ BRANCH MANAGEMENT

### 3.1 List Branches (MISSING - Needs Implementation)

**Expected Endpoint:** `GET /api/branches`  
**Status:** ❌ NOT IMPLEMENTED

**Should Return:**
```json
{
  "branches": [
    {
      "id": "uuid",
      "name": "Downtown Branch",
      "location": "New York, NY",
      "address": "123 Main Street",
      "userId": "uuid",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

**Frontend Testing:**
- [ ] Navigate to http://localhost:3000/branches
- [ ] Check if BranchManagement component loads
- [ ] Currently uses mock data - needs API integration

---

### 3.2 Create Branch (MISSING)

**Expected Endpoint:** `POST /api/branches`  
**Status:** ❌ NOT IMPLEMENTED

**Should Accept:**
```json
{
  "name": "New Branch",
  "location": "Los Angeles, CA",
  "address": "456 Oak Avenue"
}

Expected Output:
{
  "success": true,
  "branch": { /* created branch object */ }
}

Status Code: 201
```

---

### 3.3 Update Branch (MISSING)

**Expected Endpoint:** `PUT /api/branches/[id]`  
**Status:** ❌ NOT IMPLEMENTED

---

### 3.4 Delete Branch (MISSING)

**Expected Endpoint:** `DELETE /api/branches/[id]`  
**Status:** ❌ NOT IMPLEMENTED

---

## 4️⃣ PAYMENT MANAGEMENT

### 4.1 List Payments (MISSING - Needs Implementation)

**Expected Endpoint:** `GET /api/payments`  
**Status:** ❌ NOT IMPLEMENTED

**Should Return:**
```json
{
  "payments": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 99.99,
      "status": "COMPLETED",
      "planName": "Pro Plan",
      "stripePaymentIntentId": "pi_xxx",
      "createdAt": "timestamp"
    }
  ]
}
```

**Filters Needed:**
- Status (PENDING, COMPLETED, CANCELLED, FAILED)
- User ID
- Date range

**Frontend Testing:**
- [ ] Navigate to Admin Dashboard > Payments tab
- [ ] Currently shows mock data
- [ ] Should display from database

---

### 4.2 Create Stripe Checkout Session

**Endpoint:** `POST /api/stripe/create-checkout-session`  
**Status:** ✅ IMPLEMENTED

**Test Case 1: Create Checkout for Plan**
```json
Input:
{
  "planId": "uuid-of-pro-plan"
}

Headers:
  Authorization: Bearer <user-token>

Expected Output:
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/xxx"
}

Status Code: 200

Notes:
- Payment record created with status PENDING
- User's stripeCustomerId created if doesn't exist
- Redirects to Stripe Checkout page
```

**Test Case 2: Invalid Plan ID**
```json
Input:
{
  "planId": "invalid-uuid"
}

Expected Output:
{
  "error": "Plan not found"
}

Status Code: 404
```

**Frontend Testing:**
- [ ] Navigate to http://localhost:3000/pricing
- [ ] Click "Subscribe" on any plan
- [ ] Should redirect to Stripe Checkout (test mode)
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete payment
- [ ] Should redirect back to app
- [ ] Payment status should update to COMPLETED

---

### 4.3 Stripe Webhook Handler

**Endpoint:** `POST /api/stripe/webhook`  
**Status:** ✅ IMPLEMENTED

**Test Events:**
1. `checkout.session.completed` - Payment successful
2. `payment_intent.succeeded` - Payment confirmed
3. `payment_intent.payment_failed` - Payment failed

**Testing:**
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

**Expected Behavior:**
- Payment status updated in database
- User's activePlanId updated
- Email notification (if implemented)

---

## 5️⃣ PLAN MANAGEMENT

### 5.1 List Plans

**Endpoint:** `GET /api/plans`  
**Status:** ✅ IMPLEMENTED

**Test Case 1: Get Active Plans**
```
URL: http://localhost:3000/api/plans

Expected Output:
{
  "plans": [
    {
      "id": "uuid",
      "name": "Basic Plan",
      "price": 49.99,
      "description": "Perfect for small businesses",
      "features": ["Up to 5 branches", "Basic sentiment analysis", ...],
      "status": "ACTIVE",
      "stripePriceId": null,
      "stripeProductId": null,
      "createdAt": "timestamp"
    },
    { /* Pro Plan */ },
    { /* Enterprise Plan */ }
  ]
}

Status Code: 200
```

**Frontend Testing:**
- [ ] Navigate to http://localhost:3000/pricing
- [ ] Verify 3 plans are displayed
- [ ] Check pricing shows correctly
- [ ] Features list should be visible
- [ ] Subscribe buttons should work

---

### 5.2 Create Plan (MISSING)

**Expected Endpoint:** `POST /api/plans`  
**Status:** ❌ NOT IMPLEMENTED (Admin only)

**Should Accept:**
```json
{
  "name": "Premium Plan",
  "price": 199.99,
  "description": "For enterprise customers",
  "features": ["Unlimited branches", "24/7 support"],
  "stripePriceId": "price_xxx",
  "stripeProductId": "prod_xxx"
}
```

---

### 5.3 Update Plan (MISSING)

**Expected Endpoint:** `PUT /api/plans/[id]`  
**Status:** ❌ NOT IMPLEMENTED

---

### 5.4 Delete Plan (MISSING)

**Expected Endpoint:** `DELETE /api/plans/[id]`  
**Status:** ❌ NOT IMPLEMENTED

---

## 6️⃣ PROFILE MANAGEMENT

### 6.1 View Own Profile (MISSING)

**Expected Endpoint:** `GET /api/profile`  
**Status:** ❌ NOT IMPLEMENTED

**Should Return:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Regular User",
    "role": "CUSTOMER",
    "image": null,
    "branchId": null,
    "activePlanId": "uuid",
    "activePlan": {
      "name": "Pro Plan",
      "price": 99.99
    },
    "createdAt": "timestamp"
  }
}
```

---

### 6.2 Update Own Profile (MISSING)

**Expected Endpoint:** `PUT /api/profile`  
**Status:** ❌ NOT IMPLEMENTED

**Should Accept:**
```json
{
  "name": "Updated Name",
  "image": "https://example.com/avatar.jpg"
}
```

---

### 6.3 Change Password (MISSING)

**Expected Endpoint:** `PUT /api/profile/password`  
**Status:** ❌ NOT IMPLEMENTED

**Should Accept:**
```json
{
  "currentPassword": "user123",
  "newPassword": "newSecurePassword123"
}
```

---

## 7️⃣ REVIEW MANAGEMENT

### 7.1 List Reviews

**Endpoint:** `GET /api/reviews`  
**Status:** ✅ IMPLEMENTED (Returns mock + sample data)

**Test Case 1: Get All Reviews**
```
URL: http://localhost:3000/api/reviews

Expected Output:
{
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "branchId": "uuid",
      "text": "Great service! Very satisfied...",
      "rating": 5,
      "sentiment": "positive",
      "category": "service",
      "sentimentScore": null,
      "sentimentLabel": null,
      "createdAt": "timestamp"
    }
  ]
}

Status Code: 200
```

**Frontend Testing:**
- [ ] Navigate to reviews page
- [ ] Check if reviews from database are displayed
- [ ] Sentiment badges should show (positive/negative/neutral)

---

### 7.2 Create Review

**Endpoint:** `POST /api/reviews`  
**Status:** ✅ IMPLEMENTED (Uses Prisma)

**Test Case 1: Create New Review**
```json
Input:
{
  "text": "Excellent product quality and fast delivery!",
  "rating": 5,
  "branchId": "uuid-of-downtown-branch",
  "category": "product"
}

Headers:
  Authorization: Bearer <user-token>

Expected Output:
{
  "id": "uuid",
  "userId": "uuid",
  "branchId": "uuid",
  "text": "Excellent product quality...",
  "rating": 5,
  "sentiment": "positive",
  "sentimentScore": 0.95,
  "sentimentLabel": "POSITIVE",
  "category": "product",
  "createdAt": "timestamp"
}

Status Code: 201

Notes:
- AI sentiment analysis should be triggered
- sentimentScore calculated by AI
- sentimentLabel determined (POSITIVE/NEGATIVE/NEUTRAL)
```

**Test Case 2: Create Review Without Authentication**
```json
Expected Output:
{
  "error": "Authentication required"
}

Status Code: 401
```

---

### 7.3 Review Analytics (MISSING)

**Expected Endpoint:** `GET /api/reviews/stats`  
**Status:** ❌ NOT IMPLEMENTED

**Should Return:**
```json
{
  "total": 100,
  "positive": 75,
  "negative": 15,
  "neutral": 10,
  "averageRating": 4.2,
  "sentimentTrend": [
    { "date": "2025-10-20", "positive": 20, "negative": 5 }
  ],
  "categoryBreakdown": {
    "product": 40,
    "service": 35,
    "delivery": 25
  }
}
```

---

## 8️⃣ DASHBOARD VIEWS

### 8.1 Admin Dashboard

**URL:** http://localhost:3000/dashboard  
**Auth Required:** ADMIN role

**Test Checklist:**
- [ ] Login as admin@example.com / admin123
- [ ] Navigate to /dashboard
- [ ] Verify "Admin Dashboard" heading is shown
- [ ] Check tabs are visible:
  - [ ] Users
  - [ ] Payments
  - [ ] Plans
  - [ ] Profile
- [ ] **Users Tab:**
  - [ ] List of users displayed
  - [ ] Edit and Delete buttons work
  - [ ] Add new user button present
- [ ] **Payments Tab:**
  - [ ] Payment history displayed
  - [ ] Status filters work (All/Pending/Completed/Cancelled)
  - [ ] Shows correct data from database
- [ ] **Plans Tab:**
  - [ ] All subscription plans listed
  - [ ] Edit/Delete functionality (if implemented)
- [ ] **Profile Tab:**
  - [ ] Shows admin profile information
  - [ ] Can edit profile (if implemented)

**Expected Behavior:**
- Admin sees all tabs and panels
- Can manage users, payments, plans
- Has access to all analytics

---

### 8.2 User Dashboard

**URL:** http://localhost:3000/dashboard  
**Auth Required:** CUSTOMER role

**Test Checklist:**
- [ ] Login as user@example.com / user123
- [ ] Navigate to /dashboard
- [ ] Verify "User Dashboard" heading is shown
- [ ] Check available sections:
  - [ ] My Subscription (current plan)
  - [ ] My Branches
  - [ ] Recent Reviews
  - [ ] Analytics (if accessible)
- [ ] **My Subscription:**
  - [ ] Shows current active plan
  - [ ] Upgrade button present
  - [ ] Billing history visible
- [ ] **My Branches:**
  - [ ] List of user's branches
  - [ ] Add/Edit/Delete functionality
- [ ] **Recent Reviews:**
  - [ ] Shows user's submitted reviews
  - [ ] Sentiment analysis visible

**Expected Behavior:**
- User sees limited view (no admin panels)
- Can only manage own data
- Cannot access other users' information

---

### 8.3 Role-Based Access Control

**Test Checklist:**
- [ ] **Unauthorized Access:**
  - Navigate to /dashboard without login
  - Should redirect to /auth/login
  
- [ ] **User Accessing Admin Routes:**
  - Login as user@example.com
  - Try to access admin-only features
  - Should show "Access Denied" or hide options
  
- [ ] **Admin Accessing All Routes:**
  - Login as admin@example.com
  - Should have full access to all features

---

## 9️⃣ STRIPE CHECKOUT FLOW

### 9.1 Complete Payment Flow

**Test Checklist:**

**Step 1: Select Plan**
- [ ] Navigate to http://localhost:3000/pricing
- [ ] Click "Subscribe" on "Pro Plan" ($99.99)
- [ ] Verify authentication check (redirect to login if not logged in)

**Step 2: Create Checkout Session**
- [ ] API call to `/api/stripe/create-checkout-session`
- [ ] Verify request includes correct planId
- [ ] Check response has sessionId and url
- [ ] Database should create PENDING payment record

**Step 3: Stripe Checkout Page**
- [ ] User redirected to Stripe Checkout
- [ ] Verify plan details shown correctly
- [ ] Amount displays: $99.99

**Step 4: Test Payment**
```
Test Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Step 5: Webhook Processing**
- [ ] After successful payment, webhook triggered
- [ ] Payment status updated to COMPLETED
- [ ] User's activePlanId updated
- [ ] Stripe customer ID saved

**Step 6: Return to Application**
- [ ] User redirected back to success page
- [ ] Dashboard shows updated subscription
- [ ] Payment appears in payment history

**Test Failed Payment:**
```
Test Card: 4000 0000 0000 0002 (Declined)
Expected: Payment fails, status stays PENDING or changes to FAILED
```

---

### 9.2 Subscription Management (MISSING)

**Expected Features:**
- [ ] View current subscription
- [ ] Cancel subscription
- [ ] Update payment method
- [ ] View billing history
- [ ] Download invoices

**Status:** ❌ Needs Stripe Customer Portal integration

---

## 🔟 CSV UPLOAD & ANALYTICS

### 10.1 CSV File Upload

**Endpoint:** `POST /api/map-upload`  
**Status:** ✅ IMPLEMENTED

**Test Case 1: Upload Valid CSV**
```
URL: http://localhost:3000/api/map-upload
Method: POST
Content-Type: multipart/form-data

Input:
- files: [reviews.csv]
- companyName: "Test Company"

Expected Behavior:
1. File uploaded to Python_models/uploads/
2. Python sentiment analysis script runs
3. Creates public/chart_data.json
4. Creates public/top_worst_reviews.json
5. Returns summary data

Status Code: 200
```

**Test CSV Format:**
```csv
review_text,rating,date
"Great product, highly recommend!",5,2025-10-20
"Poor customer service",2,2025-10-21
"Average experience",3,2025-10-22
```

**Frontend Testing:**
- [ ] Navigate to CSV upload page
- [ ] Select reviews.csv file
- [ ] Enter company name
- [ ] Click upload
- [ ] Progress bar should show
- [ ] Success message appears
- [ ] Redirected to analytics view

---

### 10.2 Validate CSV Format

**Endpoint:** `POST /api/validate-upload`  
**Status:** ✅ IMPLEMENTED

**Test Case 1: Validate CSV Structure**
```
Input: CSV file

Expected Output:
{
  "valid": true,
  "headers": ["review_text", "rating", "date"],
  "sampleRows": [
    { "review_text": "Great product...", "rating": "5", "date": "2025-10-20" }
  ],
  "rowCount": 100
}

Status Code: 200
```

---

### 10.3 Process CSV Data

**Endpoint:** `POST /api/process-upload`  
**Status:** ✅ IMPLEMENTED

**Expected Flow:**
1. Receives uploaded CSV
2. Calls Python sentiment analysis
3. Generates sentiment scores
4. Creates visualization data
5. Saves to database (CsvUpload table)

---

### 10.4 View Analytics Dashboard

**Endpoint:** `GET /api/analytics`  
**Status:** ✅ IMPLEMENTED

**Test Case 1: Get Analytics Data**
```
URL: http://localhost:3000/api/analytics

Expected Output:
{
  "chartData": {
    "labels": ["Positive", "Negative", "Neutral"],
    "datasets": [{
      "data": [75, 15, 10],
      "backgroundColor": ["#4CAF50", "#F44336", "#FFC107"]
    }]
  },
  "topWorstReviews": [
    {
      "text": "Terrible experience...",
      "sentiment_score": -0.9,
      "category": "service"
    }
  ]
}

Status Code: 200
```

**Frontend Testing:**
- [ ] Navigate to analytics dashboard
- [ ] Verify pie chart displays sentiment distribution
- [ ] Bar chart shows category breakdown
- [ ] Top worst reviews listed with scores
- [ ] Date filters work (if implemented)
- [ ] Export functionality (if implemented)

---

### 10.5 Get Specific CSV Analytics

**Endpoint:** `GET /api/analytics/csv/[id]`  
**Status:** ✅ IMPLEMENTED

**Test Case 1: Get Analysis for Uploaded CSV**
```
URL: http://localhost:3000/api/analytics/csv/[csv-upload-id]

Expected Output:
{
  "upload": {
    "id": "uuid",
    "filename": "reviews.csv",
    "uploadedAt": "timestamp",
    "summaryJson": { /* analysis summary */ }
  },
  "chartData": { /* visualization data */ }
}

Status Code: 200
```

---

## 1️⃣1️⃣ HEALTH CHECK & MONITORING

### 11.1 API Health Check

**Endpoint:** `GET /api/health`  
**Status:** ✅ IMPLEMENTED

**Test Case:**
```
URL: http://localhost:3000/api/health

Expected Output:
{
  "status": "healthy",
  "timestamp": "2025-10-27T...",
  "database": {
    "connected": true,
    "provider": "postgresql",
    "host": "ep-proud-paper-xxx.neon.tech"
  },
  "services": {
    "prisma": "operational",
    "nextAuth": "operational",
    "stripe": "operational"
  }
}

Status Code: 200
```

**Notes:**
- Use this to verify all services are running
- Check before starting other tests

---

## 📊 TESTING SUMMARY

### ✅ Implemented & Working (15 endpoints)
1. ✅ POST /api/auth/register - User registration
2. ✅ POST /api/auth/login - User login (file-based)
3. ✅ POST /api/auth/[...nextauth] - NextAuth authentication
4. ✅ GET /api/auth/list-users - List all users
5. ✅ POST /api/auth/delete-user - Delete user
6. ✅ GET /api/plans - List subscription plans
7. ✅ POST /api/stripe/create-checkout-session - Create Stripe checkout
8. ✅ POST /api/stripe/webhook - Handle Stripe webhooks
9. ✅ GET /api/reviews - List reviews
10. ✅ POST /api/reviews - Create review
11. ✅ POST /api/map-upload - Upload CSV
12. ✅ POST /api/validate-upload - Validate CSV
13. ✅ POST /api/process-upload - Process CSV
14. ✅ GET /api/analytics - Get analytics data
15. ✅ GET /api/health - Health check

### ❌ Missing & Need Implementation (18 endpoints)
1. ❌ GET /api/users - List users (paginated)
2. ❌ GET /api/users/[id] - Get user details
3. ❌ PUT /api/users/[id] - Update user
4. ❌ GET /api/branches - List branches
5. ❌ POST /api/branches - Create branch
6. ❌ PUT /api/branches/[id] - Update branch
7. ❌ DELETE /api/branches/[id] - Delete branch
8. ❌ GET /api/payments - List payments
9. ❌ GET /api/payments/[id] - Get payment details
10. ❌ POST /api/plans - Create plan
11. ❌ PUT /api/plans/[id] - Update plan
12. ❌ DELETE /api/plans/[id] - Delete plan
13. ❌ GET /api/profile - Get own profile
14. ❌ PUT /api/profile - Update own profile
15. ❌ PUT /api/profile/password - Change password
16. ❌ GET /api/reviews/stats - Review statistics
17. ❌ PUT /api/reviews/[id] - Update review
18. ❌ DELETE /api/reviews/[id] - Delete review

---

## 🎯 PRIORITY TESTING ORDER

### Phase 1: Core Authentication (Start Here)
1. [ ] Test health check endpoint
2. [ ] Test user registration
3. [ ] Test user login (both methods)
4. [ ] Test session creation with NextAuth
5. [ ] Verify role-based access

### Phase 2: Database Operations
1. [ ] Test listing users
2. [ ] Test deleting users
3. [ ] Test listing plans
4. [ ] Test listing reviews from database
5. [ ] Test creating reviews

### Phase 3: Payment Integration
1. [ ] Test Stripe checkout creation
2. [ ] Test payment flow with test card
3. [ ] Verify webhook processing
4. [ ] Check payment records in database

### Phase 4: Analytics & CSV
1. [ ] Test CSV upload
2. [ ] Test CSV validation
3. [ ] Test analytics data retrieval
4. [ ] Verify Python sentiment analysis

### Phase 5: Frontend Integration
1. [ ] Test all dashboard views
2. [ ] Test role-based UI rendering
3. [ ] Test forms and modals
4. [ ] Test error handling

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Authentication required"
**Solution:** Ensure JWT token is included in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Issue 2: "CORS errors"
**Solution:** Check middleware.ts configuration for allowed origins

### Issue 3: "Database connection failed"
**Solution:** 
- Verify DATABASE_URL in .env
- Run `npm run db:test` to check connection
- Ensure Neon database is active

### Issue 4: "Stripe test mode not working"
**Solution:**
- Use test API keys (sk_test_xxx)
- Use test card numbers (4242 4242 4242 4242)
- Check webhook endpoint is accessible

### Issue 5: "CSV upload fails"
**Solution:**
- Check file size limit
- Verify CSV format matches expected headers
- Ensure Python environment is set up

### Issue 6: "NextAuth session not persisting"
**Solution:**
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies and retry

---

## 📝 TEST RESULTS TEMPLATE

Use this template to track your testing:

```
Test Date: October 27, 2025
Tester: [Your Name]
Environment: Development (localhost:3000)
Database: Neon PostgreSQL

Authentication Tests:
[ ] Registration - PASS/FAIL - Notes: ___
[ ] Login - PASS/FAIL - Notes: ___
[ ] Session - PASS/FAIL - Notes: ___

User Management:
[ ] List Users - PASS/FAIL - Notes: ___
[ ] Delete User - PASS/FAIL - Notes: ___

[Continue for all sections...]

Critical Issues Found:
1. [Description]
2. [Description]

Blockers:
1. [Description]

Next Steps:
1. [Action item]
2. [Action item]
```

---

## 🚀 NEXT STEPS AFTER TESTING

Based on test results, prioritize:

1. **Fix Critical Bugs** - Any blocking issues from authentication or database
2. **Implement Missing APIs** - Start with Branch and Payment endpoints
3. **Complete Profile Management** - User profile CRUD
4. **Enhanced Analytics** - Review statistics and trends
5. **Production Deployment** - Deploy to Vercel with production database

---

**Testing Status: Ready to Begin** ✅  
**Server: Running** ✅  
**Database: Connected** ✅  
**Documentation: Complete** ✅

Start testing from Phase 1 and work through each section systematically!
