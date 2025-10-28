# CSV Upload UI Guide

## Components
- **UploadCard**: Drag-and-drop CSV upload, file details, upload button, progress bar
- **UploadProgressBar**: Shows upload progress during upload
- **UploadHistoryTable**: Displays previous uploads with filename, row/column count, date

## Flow
1. Admin visits `/dashboard/uploads` (access restricted)
2. UploadCard allows drag-and-drop or file picker for CSV
3. File details shown before upload
4. On upload, POST to `/api/uploads`, show progress and toasts
5. On success, redirect to analytics dashboard for uploaded file
6. UploadHistoryTable shows all previous uploads

## Libraries Used
- `react-dropzone` for drag-and-drop
- `react-hot-toast` for notifications
- SWR for upload history

## Example UI
- Upload area with drag-and-drop
- File details (name, size)
- Upload button
- Progress bar
- Upload history table
