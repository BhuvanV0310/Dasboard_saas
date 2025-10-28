# Production QA Checklist

Complete quality assurance checklist before deploying to production.

## Pre-Deployment Checks

### Environment Configuration
- [ ] All required environment variables set in `.env.production`
- [ ] `DATABASE_URL` points to production PostgreSQL database
- [ ] `NEXTAUTH_SECRET` is a secure 32+ character string
- [ ] `NEXTAUTH_URL` uses HTTPS and matches deployment domain
- [ ] Stripe keys are in **live mode** (not test mode)
- [ ] `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard webhook secret
- [ ] `OPENAI_API_KEY` is valid (or gracefully handles absence)
- [ ] `SENTRY_DSN` configured for error monitoring
- [ ] No `.env.local` or `.env.development` files in production build

### Database Setup
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Database indexes created (User.role, User.createdAt, Payment.createdAt, etc.)
- [ ] Connection pooling configured (recommended: 10-20 connections)
- [ ] SSL mode enabled: `?sslmode=require` in connection string
- [ ] Backup strategy in place
- [ ] Database user has minimum required permissions

### Build & Dependencies
- [ ] TypeScript compiles without errors: `npm run type-check`
- [ ] Production build succeeds: `npm run build`
- [ ] All dependencies up to date: `npm audit fix`
- [ ] No critical vulnerabilities in `npm audit`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] No unused dependencies in `package.json`

---

## Authentication & Authorization

### User Registration
- [ ] User can register with name, email, password
- [ ] Passwords are hashed (bcrypt)
- [ ] Email validation works
- [ ] Duplicate email prevention works
- [ ] Default role is set correctly (CUSTOMER)
- [ ] Registration errors display clearly

### User Login
- [ ] User can login with email and password
- [ ] JWT session tokens are generated
- [ ] Session persists across page reloads
- [ ] Invalid credentials show appropriate error
- [ ] Login redirects to dashboard after success

### Role-Based Access Control
- [ ] ADMIN can access `/dashboard/uploads`
- [ ] ADMIN can access `/api/uploads`
- [ ] ADMIN can access `/api/analytics/csv/[id]`
- [ ] CUSTOMER **cannot** access admin routes
- [ ] Unauthorized access returns 401/403 status codes
- [ ] Role checks are consistent across all protected routes

### Session Management
- [ ] Sessions expire after configured time
- [ ] Logout clears session correctly
- [ ] Multiple tabs/windows share session
- [ ] Session refresh works seamlessly

---

## CSV Upload & Analytics

### File Upload
- [ ] Drag-and-drop upload works
- [ ] Click-to-upload works
- [ ] Only CSV files are accepted
- [ ] Files larger than 10MB are rejected
- [ ] Upload progress bar displays correctly
- [ ] Upload timeout (30s) triggers appropriate message
- [ ] Successful upload shows confirmation toast
- [ ] Upload error displays helpful message

### Upload History
- [ ] Upload history table displays all uploads
- [ ] Upload metadata (filename, date, row count) is correct
- [ ] Skeleton loaders show during data fetch
- [ ] Clicking "View Analytics" navigates to correct page
- [ ] Upload history auto-refreshes every 15 seconds

### CSV Analytics
- [ ] Analytics page loads for uploaded CSV
- [ ] Summary cards display correct metrics (rows, columns, date range)
- [ ] Column type inference is accurate (numeric, date, text)
- [ ] Sentiment pie chart displays if sentiment column exists
- [ ] Trends line chart displays if date + rating columns exist
- [ ] Branch stats table displays if branch + rating columns exist
- [ ] Column statistics show min/max/avg for numeric columns
- [ ] Column statistics show earliest/latest for date columns
- [ ] Column statistics show unique count for text columns

### AI-Powered Insights
- [ ] AI summary generates within 8 seconds (or shows fallback)
- [ ] Regenerate button works correctly
- [ ] AI summary is contextually relevant to CSV data
- [ ] Fallback message displays if OpenAI unavailable
- [ ] AI summary caches in localStorage
- [ ] High-contrast mode toggle works

---

## Payments & Subscriptions

### Plan Selection
- [ ] Pricing page displays all plans
- [ ] Plan features are accurate
- [ ] Plan prices are correct (live mode)
- [ ] "Select Plan" buttons work

### Checkout Flow
- [ ] Clicking "Select Plan" redirects to Stripe Checkout
- [ ] Stripe Checkout displays correct plan and price
- [ ] Test card (`4242 4242 4242 4242`) completes checkout
- [ ] Successful checkout redirects to dashboard
- [ ] Payment record created in database
- [ ] User's subscription status updated

### Webhook Processing
- [ ] Stripe webhook endpoint is publicly accessible
- [ ] Webhook signature verification works
- [ ] `checkout.session.completed` event creates payment record
- [ ] `customer.subscription.updated` event updates status
- [ ] `customer.subscription.deleted` event cancels subscription
- [ ] Webhook errors are logged to Sentry

---

## UI/UX & Accessibility

### Navigation
- [ ] Sidebar navigation works on all pages
- [ ] Active page is highlighted in sidebar
- [ ] Mobile hamburger menu works
- [ ] Logo links to home page
- [ ] Breadcrumbs display correctly

### Loading States
- [ ] Skeleton loaders display during data fetch
- [ ] Spinner shows during AI summary generation
- [ ] Progress bars display during file upload
- [ ] Loading states have `aria-busy="true"` attribute

### Accessibility
- [ ] All buttons have `aria-label` attributes
- [ ] Form inputs have associated labels
- [ ] Error messages use `role="alert"`
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announcements are clear

### Responsive Design
- [ ] Layout works on mobile (320px+)
- [ ] Layout works on tablet (768px+)
- [ ] Layout works on desktop (1024px+)
- [ ] Charts are responsive
- [ ] Tables scroll horizontally on small screens
- [ ] No horizontal overflow

---

## Performance

### Page Load Times
- [ ] Home page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Analytics page loads in < 4 seconds
- [ ] Images are optimized (Next.js Image component)
- [ ] Fonts are preloaded

### API Response Times
- [ ] `/api/auth/login` responds in < 500ms
- [ ] `/api/uploads` GET responds in < 1 second
- [ ] `/api/analytics/csv/[id]` responds in < 5 seconds
- [ ] Stripe checkout session creates in < 2 seconds

### Database Queries
- [ ] Indexes are used for frequent queries
- [ ] No N+1 query problems
- [ ] Query results are paginated where appropriate
- [ ] Connection pool is not exhausted

---

## Error Handling & Monitoring

### Error Logging
- [ ] All API errors are logged to console
- [ ] Sentry captures production errors
- [ ] Error logs include context (userId, endpoint, action)
- [ ] Sensitive data is not logged (passwords, API keys)

### User-Facing Errors
- [ ] 404 page displays for missing routes
- [ ] 500 error page displays for server errors
- [ ] API errors return JSON with `error` field
- [ ] User-friendly error messages (no stack traces)
- [ ] Toast notifications show for transient errors

### Monitoring Setup
- [ ] Sentry DSN configured
- [ ] Error rate alerts configured
- [ ] Uptime monitoring enabled
- [ ] Database connection alerts configured

---

## Security

### Authentication
- [ ] Passwords are hashed with bcrypt (10+ rounds)
- [ ] JWT secrets are secure (32+ characters)
- [ ] Sessions expire after inactivity
- [ ] CSRF protection enabled
- [ ] No credentials in client-side code

### API Security
- [ ] All protected routes require authentication
- [ ] Role checks prevent unauthorized access
- [ ] Input validation prevents SQL injection
- [ ] File uploads are sanitized and size-limited
- [ ] Rate limiting enabled on public endpoints

### Data Protection
- [ ] Database connections use SSL
- [ ] Environment variables are not exposed to client
- [ ] Sensitive data is not logged
- [ ] CORS is configured correctly
- [ ] HTTPS enforced in production

---

## SEO & Metadata

### Page Metadata
- [ ] All pages have `<title>` tags
- [ ] All pages have `<meta name="description">` tags
- [ ] Open Graph tags are present (`og:title`, `og:description`, `og:image`)
- [ ] Twitter Card tags are present
- [ ] Favicon is configured

### Sitemap & Robots
- [ ] `robots.txt` allows crawling
- [ ] `sitemap.xml` lists all public pages
- [ ] Canonical URLs are set
- [ ] Structured data (JSON-LD) for rich results

---

## Final Deployment Checks

### Pre-Launch
- [ ] All checklist items above are complete
- [ ] Staging environment tested thoroughly
- [ ] Deployment rollback plan documented
- [ ] Team notified of deployment schedule
- [ ] Maintenance window scheduled (if needed)

### Post-Launch
- [ ] Verify homepage loads correctly
- [ ] Test login flow end-to-end
- [ ] Test payment flow with real card
- [ ] Monitor error rates in Sentry
- [ ] Check database connection pool usage
- [ ] Verify Stripe webhook events are received
- [ ] Test CSV upload and analytics flow
- [ ] Confirm AI summary generation works

### First 24 Hours
- [ ] Monitor error logs every 2 hours
- [ ] Check user registration conversion
- [ ] Verify payment success rate
- [ ] Review database query performance
- [ ] Monitor API response times
- [ ] Check for any 500 errors
- [ ] Verify uptime is 100%

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Developer | __________ | __________ | ______ |
| QA Lead | __________ | __________ | ______ |
| Product Manager | __________ | __________ | ______ |
| DevOps | __________ | __________ | ______ |

---

**Checklist Version:** 1.0.0  
**Last Updated:** 2024  
**Next Review:** Post-deployment +1 week
