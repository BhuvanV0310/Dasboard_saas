# CsvUpload Prisma Model Reference

## Model Definition

```
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

## Field Descriptions
- **id**: Unique identifier for each upload
- **filename**: Original name of the uploaded CSV file
- **filepath**: Server path to the stored CSV file
- **uploadedById**: User ID of the uploader
- **uploadedBy**: Relation to the User model
- **uploadedAt**: Timestamp of upload
- **summaryJson**: JSON summary of the CSV (row count, column count, columns, etc.)
- **chartConfig**: Optional JSON for frontend chart configuration

## Example Record
```
{
  "id": "c1a2b3...",
  "filename": "reviews_oct.csv",
  "filepath": "/tmp/uploads/1698250000000_reviews_oct.csv",
  "uploadedById": "user123",
  "uploadedAt": "2025-10-25T12:34:56.789Z",
  "summaryJson": {
    "rowCount": 1200,
    "columnCount": 6,
    "columns": ["date", "branch", "review", "rating", "sentiment", "category"]
  },
  "chartConfig": null
}
```

## Usage
- Used to track and analyze uploaded CSV files for custom analytics dashboards
- Enables admins to view, summarize, and visualize external data sources
