# CSV Analytics UI Guide

This guide documents the UI/UX of the CSV Analytics Engine: loaders, charts, AI insights, and interactions.

## Loading and Skeleton States
- Reusable skeletons in `app/components/ui/Skeleton.tsx`.
- Upload history shows skeleton rows while loading.
- Analytics dashboard shows header, chart, and card skeletons while loading.
- Upload progress bar exposes ARIA progress attributes for screen readers.

## Chart Responsiveness & Accessibility
- All charts wrapped in `ResponsiveContainer` for mobile/desktop.
- Added `role="img"` and `aria-label` wrappers for screen-reader context.
- High-contrast toggle in AI Insights card updates chart color palette for accessibility.

## AI Summary Controls
- AI Insights card renders `analytics.aiSummary` (server-provided) or a cached copy.
- "Regenerate Insights" triggers SWR `mutate()` to recompute server-side summary.
- AI summary cached in `localStorage` keyed by upload ID to minimize flicker and preserve previous insights.

## Error Handling & Notifications
- Toast notifications for analytics fetch failures and regenerate failures.
- Upload flow uses toasts for success, error, and timeout cases.
- Fallback text appears if AI summary is missing or fails.

## Production Readiness
- Client-side fetches use a 30s upload timeout and SWR refresh every 30s.
- OpenAI summary generation has an 8s timeout wrapper; gracefully falls back to deterministic summary.
- Pages export metadata for basic SEO.

## Key Files
- `app/dashboard/analytics/csv/[id]/CsvAnalyticsClient.tsx`
- `app/dashboard/uploads/components/UploadCard.tsx`
- `app/dashboard/uploads/components/UploadHistoryTable.tsx`
- `app/components/ui/Skeleton.tsx`

## Tips
- Prefer small, incremental visual changes with clear feedback.
- Keep charts readable on small screens by limiting series and using tooltips.
