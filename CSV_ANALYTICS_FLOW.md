# CSV Analytics Flow

## Overview
This document describes the end-to-end flow of CSV analytics in the SaaS Review Dashboard.

## Flow Diagram

```
Admin Login
    ↓
Navigate to "CSV Uploads"
    ↓
[/dashboard/uploads]
    ↓
Drag & Drop CSV File
    ↓
Display File Details (name, size)
    ↓
Click "Upload"
    ↓
[POST /api/uploads]
    ├─ Validate file type (.csv)
    ├─ Validate file size (<10MB)
    ├─ Save to /tmp/uploads
    ├─ Parse CSV with fast-csv
    ├─ Extract row/column count
    └─ Create CsvUpload record in DB
    ↓
Return Upload ID
    ↓
Redirect to [/dashboard/analytics/csv/[id]]
    ↓
[GET /api/analytics/csv/[id]]
    ├─ Fetch CsvUpload record
    ├─ Read CSV file
    ├─ Infer column types (numeric, date, text)
    ├─ Generate column statistics
    ├─ Perform sentiment analysis
    └─ Generate chart-ready data
    ↓
Return Analytics Data
    ↓
Render Dashboard
    ├─ Summary Cards (rows, columns)
    ├─ Column Types Grid
    ├─ Sentiment Summary (pie/rating)
    ├─ Trends Over Time (line chart)
    └─ Column Statistics
```

## Step-by-Step Breakdown

### Step 1: File Upload
- Admin accesses `/dashboard/uploads`
- Uses react-dropzone to drag/drop or select CSV file
- File validation: `.csv` extension, max 10MB
- File details displayed: name, size

### Step 2: Server-Side Processing
- POST to `/api/uploads` with multipart/form-data
- Server validates file type and size
- File saved to `/tmp/uploads` with timestamped filename
- CSV parsed using fast-csv library
- Row count, column count, column names extracted
- CsvUpload record created in PostgreSQL via Prisma

### Step 3: Analytics Generation
- Client redirected to `/dashboard/analytics/csv/[id]`
- GET request to `/api/analytics/csv/[id]`
- Server reads CSV file from disk
- Column type inference:
  - Numeric: All values parseable as numbers
  - Date: All values parseable as dates
  - Text: Default for non-numeric, non-date columns
- Statistics generation:
  - Numeric: min, max, average
  - Date: earliest, latest
  - Text: unique count, top values

### Step 4: Sentiment Analysis
- If 'sentiment' column exists: Count occurrences of each sentiment value
- If 'rating' column exists: Calculate average rating
- Prepare data for pie chart or rating display

### Step 5: Chart Data Generation
- If date and rating columns exist:
  - Group rows by date
  - Calculate average rating per date
  - Sort chronologically
- Return array of `{ date, avgRating, count }` objects

### Step 6: Dashboard Rendering
- Client-side React component fetches analytics data via SWR
- Animated cards display summary metrics (Framer Motion)
- Recharts components render:
  - Pie chart for sentiment distribution
  - Line chart for trends over time
  - Grid for column types
  - List for column statistics

## Error Handling

### Upload Errors
- Unauthorized: 403 Forbidden (non-admin users)
- Invalid file type: 400 Bad Request
- File too large: 400 Bad Request
- Parse error: 400 Bad Request with details

### Analytics Errors
- Upload not found: 404 Not Found
- File read error: 500 Internal Server Error
- Parse error: 500 Internal Server Error

## Security
- Admin-only access enforced via NextAuth role check
- File type validation on server-side
- File size limit enforced (10MB)
- Files stored in secure `/tmp/uploads` directory
- Database queries scoped to authenticated user

## Performance
- SWR for client-side caching and revalidation (30s interval)
- Incremental parsing with fast-csv streams
- Column statistics calculated once and cached in response
- Chart data pre-processed on server for efficient rendering
