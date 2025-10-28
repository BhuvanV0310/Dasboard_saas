# CSV Analytics Quick Start Guide

## Prerequisites
- PostgreSQL database running
- Node.js installed
- Admin user account created

## Setup Steps

### 1. Install Dependencies
```bash
npm install react-dropzone react-hot-toast fast-csv
```

### 2. Run Prisma Migration
```bash
npx prisma migrate dev --name add_csv_upload_model
```

This will:
- Create the `CsvUpload` table in PostgreSQL
- Add the relation to the `User` model
- Generate Prisma client types

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Restart Development Server
```bash
npm run dev
```

## Testing the Implementation

### Step 1: Login as Admin
1. Navigate to `http://localhost:3000/auth/login`
2. Login with an admin account
3. Verify you see the admin sidebar

### Step 2: Access CSV Uploads
1. Click "CSV Uploads" in the sidebar
2. Verify the upload page loads
3. You should see:
   - Drag-and-drop upload area
   - File upload instructions
   - Empty upload history table

### Step 3: Upload Sample CSV
1. Use the provided `test_data/sample_reviews.csv` file
2. Drag and drop it into the upload area OR click to select
3. Verify file details are displayed:
   - Filename: sample_reviews.csv
   - Size: ~1.5 KB
4. Click "Upload" button
5. Verify:
   - Progress bar appears
   - Success toast displays
   - Redirect to analytics dashboard

### Step 4: View Analytics Dashboard
After successful upload, you should see:

**Summary Cards:**
- Total Rows: 20
- Total Columns: 6
- Unique Columns: 6

**Column Types Grid:**
- date: date
- branch: text
- review: text
- rating: numeric
- sentiment: text
- category: text

**Sentiment Summary:**
- Pie chart with Positive/Negative/Neutral distribution
- Or average rating display

**Trends Over Time:**
- Line chart showing avgRating and count by date

**Column Statistics:**
- Detailed stats for each column

### Step 5: Test Upload History
1. Navigate back to "CSV Uploads"
2. Verify the upload history table shows:
   - Filename: sample_reviews.csv
   - Rows: 20
   - Columns: 6
   - Upload date and time

## Expected Results

### Upload API Response (POST /api/uploads)
```json
{
  "uploadId": "abc123...",
  "rowCount": 20,
  "columnCount": 6,
  "columns": ["date", "branch", "review", "rating", "sentiment", "category"]
}
```

### Analytics API Response (GET /api/analytics/csv/[id])
```json
{
  "upload": {
    "id": "abc123...",
    "filename": "sample_reviews.csv",
    "uploadedAt": "2025-10-25T...",
    "uploadedBy": { "id": "...", "name": "Admin", "email": "admin@example.com" },
    "summaryJson": { "rowCount": 20, "columnCount": 6, "columns": [...] }
  },
  "analytics": {
    "rowCount": 20,
    "columnCount": 6,
    "columns": ["date", "branch", "review", "rating", "sentiment", "category"],
    "columnTypes": { "date": "date", "rating": "numeric", ... },
    "columnStats": { "rating": { "min": 2, "max": 5, "avg": 3.9 }, ... },
    "sentimentSummary": {
      "column": "sentiment",
      "counts": { "Positive": 11, "Negative": 6, "Neutral": 3 },
      "total": 20
    },
    "chartData": [
      { "date": "2025-10-01", "avgRating": 4, "count": 2 },
      ...
    ]
  }
}
```

## Troubleshooting

### Issue: "Unauthorized" error
- Ensure you're logged in as an admin user
- Check that session.user.role === "ADMIN"

### Issue: "Upload failed" error
- Verify file is .csv format
- Check file size is under 10MB
- Ensure `/tmp/uploads` directory exists

### Issue: TypeScript errors in editor
- Run `npx prisma generate` to update types
- Restart TypeScript server (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

### Issue: Charts not rendering
- Verify CSV has proper data format
- Check browser console for errors
- Ensure recharts is installed

### Issue: Upload history empty
- Verify database connection
- Check that CsvUpload model exists in Prisma schema
- Ensure migration was run successfully

## Additional Test Cases

### Test Case 1: Invalid File Type
1. Try uploading a .txt file
2. Expected: Error toast "Invalid file type. Only .csv allowed."

### Test Case 2: File Too Large
1. Try uploading a CSV > 10MB
2. Expected: Error toast "File too large. Max 10MB."

### Test Case 3: Malformed CSV
1. Upload a CSV with missing columns or bad formatting
2. Expected: Error toast "CSV parse error"

### Test Case 4: Non-Admin Access
1. Login as a non-admin user
2. Try accessing `/dashboard/uploads`
3. Expected: Redirect to `/dashboard`

## Next Steps
1. ✅ Test with various CSV formats
2. ✅ Verify all charts render correctly
3. ✅ Test error handling
4. ✅ Check performance with large CSVs
5. ⚠️ Implement AI summary generation (optional)
6. ⚠️ Add unit tests
7. ⚠️ Deploy to production

## Support Files
- Sample CSV: `test_data/sample_reviews.csv`
- Documentation: `CSV_ANALYTICS_SETUP.md`
- Flow diagram: `CSV_ANALYTICS_FLOW.md`
- Model reference: `CSV_MODEL_REFERENCE.md`

## Success Checklist
- [ ] Dependencies installed
- [ ] Prisma migration run
- [ ] Development server running
- [ ] Admin user created
- [ ] Upload page accessible
- [ ] CSV upload successful
- [ ] Analytics dashboard displays
- [ ] Charts render correctly
- [ ] Upload history shows records
- [ ] Error handling works
- [ ] Navigation updated
- [ ] All documentation reviewed
