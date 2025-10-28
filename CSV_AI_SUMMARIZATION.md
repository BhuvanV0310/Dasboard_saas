# CSV AI Summarization

## Overview
The CSV Analytics Engine integrates AI-powered insights to generate concise, natural-language summaries for each uploaded CSV. Summaries highlight top-performing branches, sentiment distribution, and notable trends.

## What’s Implemented
- AI summary is generated server-side in `GET /api/analytics/csv/[id]` using `generateAISummary` from `lib/ai.ts`.
- The analytics response now includes `analytics.aiSummary` and `analytics.branchStats`.
- The analytics dashboard (`/dashboard/analytics/csv/[id]`) renders an “AI Insights” card at the top.
- SWR refresh (every 30s) keeps insights up to date; uploading a new CSV generates a new summary immediately.
- Admin-only access is enforced both server-side and client-side.

## How It Works
1. Server reads and analyzes the CSV into structured analytics: column types, stats, sentiment summary, trends.
2. Server computes `branchStats` (average rating and count per branch) when rating and branch columns exist.
3. Server calls `generateAISummary(analytics)` to produce a concise narrative:
   - Uses OpenAI (if `OPENAI_API_KEY` is set) for high-quality summaries.
   - Falls back to a deterministic summary if AI is unavailable.
4. Client retrieves `aiSummary` and displays it prominently.

## Usage in Code
```ts
// app/api/analytics/csv/[id]/route.ts
import { generateAISummary } from '@/lib/ai';

const aiSummary = await generateAISummary({
  filename: upload.filename,
  rowCount: rows.length,
  columns,
  sentimentSummary,
  branchStats,
  columnStats,
});

return NextResponse.json({
  // ...
  analytics: { /* ... */, branchStats, aiSummary },
});
```

```tsx
// app/dashboard/analytics/csv/[id]/CsvAnalyticsClient.tsx
{analytics.aiSummary && (
  <div className="...">
    <h2>AI Insights</h2>
    <p>{analytics.aiSummary}</p>
  </div>
)}
```

## Environment Configuration
- Set `OPENAI_API_KEY` to enable OpenAI-based summaries.
- Optionally set `HF_ACCESS_TOKEN` for Hugging Face features (used in sentiment helper; not required for summaries).

## Prompts and Fallback
- OpenAI prompt asks for a concise 3–6 sentence summary highlighting metrics.
- If OpenAI is not configured or fails, deterministic summary includes:
  - Top performing branch (avg rating and counts)
  - Most common sentiment or overall average rating

## Admin-Only and Real-Time Updates
- API checks `session.user.role === 'ADMIN'`.
- Pages check role case-insensitively and redirect non-admins.
- SWR refreshes every 30 seconds, ensuring summaries stay current.

## Future Enhancements
- Cache summaries per upload to reduce API costs.
- Add drill-down AI Q&A on columns and segments.
- Provide “Explain this chart” interactions.
- Add rate-limiting and observability around AI calls.
