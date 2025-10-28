# CSV Analytics Setup Guide

## Overview
This guide explains how to enable CSV analytics in the SaaS Review Dashboard, allowing admins to upload CSV files and generate custom analytics dashboards.

## Features
- Drag-and-drop CSV upload UI (react-dropzone)
- File validation (.csv, max 10MB)
- Upload progress and status toasts (react-hot-toast)
- Server-side parsing and metadata extraction
- Upload history table
- Admin-only access
- Automatic redirect to analytics dashboard after upload
- Dynamic charts and visualizations (Recharts)
- Column type inference and statistics
- Sentiment analysis for review data
- Animated dashboard components (Framer Motion)

## Implementation Steps

### 1. Prisma Model
Add `CsvUpload` model to `prisma/schema.prisma`:
```prisma
model CsvUpload {
  id           String   @id @default(uuid())
  filename     String
  filepath     String
  uploadedById String
  uploadedBy   User     @relation(fields: [uploadedById], references: [id])
  uploadedAt   DateTime @default(now())
  summaryJson  Json?
  chartConfig  Json?

  @@index([uploadedById])
}
```

### 2. API Endpoints

#### `/api/uploads` (POST, GET)
- **POST**: Accepts multipart/form-data, validates file, saves to `/tmp/uploads`, parses CSV with fast-csv, stores metadata in CsvUpload
- **GET**: Returns upload history for the authenticated admin user

#### `/api/analytics/csv/[id]` (GET)
- Reads CSV file, infers column types (numeric, date, text)
- Generates summary statistics for each column
- Performs sentiment analysis if sentiment/rating columns exist
- Returns chart-ready data for visualization

### 3. Frontend UI

#### `/dashboard/uploads` Page
Components:
- `UploadCard`: Drag-and-drop upload, file details, upload button
- `UploadProgressBar`: Shows upload progress during upload
- `UploadHistoryTable`: Lists previous uploads with filename, row/column count, date

#### `/dashboard/analytics/csv/[id]` Page
Components:
- `CsvAnalyticsClient`: Main dashboard with:
  - Summary cards (total rows, columns, unique columns)
  - Column types grid
  - Sentiment summary (pie chart or average rating)
  - Trends over time (line chart)
  - Column statistics (min, max, avg for numeric; date ranges; unique values for text)

### 4. Access Control
- Restrict both pages to admins using NextAuth role check
- Redirect non-admin users to `/dashboard`

### 5. Navigation
- Add 'CSV Uploads' link to sidebar navigation (admin-only)

### 6. Dependencies
```bash
npm install react-dropzone react-hot-toast fast-csv
```

## Usage
1. Admin navigates to "CSV Uploads" in sidebar
2. Drag and drop or select a CSV file (max 10MB)
3. File details displayed before upload
4. Click "Upload" to submit
5. On success, redirected to analytics dashboard
6. View summary cards, charts, sentiment analysis, and column statistics
7. Access upload history to view previous uploads

## File Structure
```
app/
  api/
    uploads/
      route.ts                      # POST, GET endpoints for CSV upload
    analytics/
      csv/
        [id]/
          route.ts                  # GET endpoint for CSV analytics
  dashboard/
    uploads/
      page.tsx                      # Main upload page
      components/
        UploadCard.tsx              # Drag-and-drop upload
        UploadProgressBar.tsx       # Progress indicator
        UploadHistoryTable.tsx      # Upload history
    analytics/
      csv/
        [id]/
          page.tsx                  # Analytics page wrapper
          CsvAnalyticsClient.tsx    # Client-side analytics dashboard
```

## Data Flow
1. User uploads CSV → `/api/uploads` (POST)
2. Server validates, saves, parses CSV → Returns upload ID
3. Frontend redirects to `/dashboard/analytics/csv/[id]`
4. Client fetches analytics → `/api/analytics/csv/[id]` (GET)
5. Server reads CSV, infers types, generates stats → Returns analytics data
6. Client renders charts, summaries, and statistics
