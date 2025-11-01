import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/auth-helpers-server';
import { logError, logInfo } from '@/lib/logger';
import { checkRateLimit, getClientIp, generateRateLimitKey } from '@/lib/rate-limit';
import { createReadStream } from 'fs';
import { parse } from 'fast-csv';
import { generateAISummary } from '@/lib/ai';

export async function GET(req: Request, context: any) {
  let id = '';
  try {
    // Support both sync and async params shapes (Next.js may provide params as a Promise)
    const paramsObj = (context && context.params) ? await context.params : {};
    id = paramsObj.id;
      // Auth: Only allow admin
      const { error, session } = await requireRole('ADMIN');
      if (error) return error;

      // Rate limiting: 10 requests per minute per user/IP
      const ip = getClientIp(req);
      const rateLimitKey = generateRateLimitKey(session!.user.id, ip);
      const rateLimit = checkRateLimit(rateLimitKey, { maxRequests: 10, windowMs: 60000 });
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            error: 'Too many analytics requests. Please try again later.',
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': String(rateLimit.remaining),
              'X-RateLimit-Reset': String(Math.floor(rateLimit.resetAt / 1000)),
            },
          }
        );
      }

  // const { id } = params; (extracted above)

      // Fetch upload record
      const upload = await prisma.csvUpload.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
  }

  // Parse CSV for detailed analytics
  // To avoid loading very large CSVs fully into memory (which can cause
  // serverless timeouts or OOMs), sample rows up to SAMPLE_LIMIT while
  // still counting the total number of rows. Sampling keeps analytics fast
  // for large files while preserving representative results.
  const SAMPLE_LIMIT = 5000; // adjust as needed
  const sampledRows: Record<string, any>[] = [];
  let totalRowCount = 0;
  const stream = createReadStream(upload.filepath);

  await new Promise((resolve, reject) => {
    stream
      .pipe(parse({ headers: true }))
      .on('error', reject)
      .on('data', (row: Record<string, any>) => {
        totalRowCount++;
        if (sampledRows.length < SAMPLE_LIMIT) sampledRows.push(row);
      })
      .on('end', resolve);
  });

  // Use sampledRows for downstream analysis but report accurate total rows
  const rows = sampledRows;

  // Analyze columns
  const columns = Object.keys(rows[0] || {});
  const columnTypes: Record<string, string> = {};
  const columnStats: Record<string, any> = {};

  columns.forEach((col) => {
    const values = rows.map((r) => r[col]).filter((v) => v != null && v !== '');
    
    // Infer type
    const isNumeric = values.every((v) => !isNaN(Number(v)));
    const isDate = values.every((v) => !isNaN(Date.parse(v)));
    
    if (isNumeric) {
      columnTypes[col] = 'numeric';
      const nums = values.map(Number);
      columnStats[col] = {
        min: Math.min(...nums),
        max: Math.max(...nums),
        avg: nums.reduce((a, b) => a + b, 0) / nums.length,
      };
    } else if (isDate) {
      columnTypes[col] = 'date';
      columnStats[col] = {
        earliest: new Date(Math.min(...values.map((v) => Date.parse(v)))).toISOString(),
        latest: new Date(Math.max(...values.map((v) => Date.parse(v)))).toISOString(),
      };
    } else {
      columnTypes[col] = 'text';
      const uniqueValues = [...new Set(values)];
      columnStats[col] = {
        uniqueCount: uniqueValues.length,
        topValues: uniqueValues.slice(0, 10),
      };
    }
  });

  // Sentiment analysis if 'sentiment' or 'rating' column exists
  let sentimentSummary: any = null;
  const sentimentCol = columns.find((c) => c.toLowerCase().includes('sentiment'));
  const ratingCol = columns.find((c) => c.toLowerCase().includes('rating'));
  // Candidate text column for themes
  const textCol = columns.find((c) => /review|text|comment|feedback/i.test(c));

  // Derived breakdown (good/bad/neutral)
  let sentimentBreakdown: { positive: number; neutral: number; negative: number; total: number } | null = null;

  if (sentimentCol) {
    const sentiments = rows.map((r) => r[sentimentCol]).filter(Boolean);
    const sentimentCounts: Record<string, number> = {};
    sentiments.forEach((s) => {
      sentimentCounts[s] = (sentimentCounts[s] || 0) + 1;
    });
    sentimentSummary = {
      column: sentimentCol,
      counts: sentimentCounts,
      total: sentiments.length,
    };
    // Normalize to positive/neutral/negative buckets when possible
    const norm = { positive: 0, neutral: 0, negative: 0 };
    for (const [k, v] of Object.entries(sentimentCounts)) {
      const key = String(k).toLowerCase();
      if (/(pos|good|great|excellent|satisfied|happy)/.test(key)) norm.positive += v as number;
      else if (/(neg|bad|poor|terrible|unsatisfied|angry|worst|hate)/.test(key)) norm.negative += v as number;
      else norm.neutral += v as number;
    }
    sentimentBreakdown = { ...norm, total: sentiments.length };
  } else if (ratingCol) {
    const ratings = rows.map((r) => Number(r[ratingCol])).filter((r) => !isNaN(r));
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    sentimentSummary = {
      column: ratingCol,
      avgRating: avgRating.toFixed(2),
      total: ratings.length,
    };
    // Derive counts using a common star rating rubric: >=4 positive, 3 neutral, <=2 negative
    let positive = 0, neutral = 0, negative = 0;
    ratings.forEach((r) => {
      if (r >= 4) positive++; else if (r <= 2) negative++; else neutral++;
    });
    sentimentBreakdown = { positive, neutral, negative, total: ratings.length };
  }

  // Chart data for visualization
  const chartData: any[] = [];
  const dateCol = columns.find((c) => columnTypes[c] === 'date');
  if (dateCol && ratingCol) {
    // Group by date and avg rating
    const grouped: Record<string, number[]> = {};
    rows.forEach((r) => {
      const date = new Date(r[dateCol]).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(Number(r[ratingCol]));
    });
    Object.entries(grouped).forEach(([date, ratings]) => {
      chartData.push({
        date,
        avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        count: ratings.length,
      });
    });
    chartData.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Branch stats (avg rating per branch) if branch and rating columns exist
  const branchCol = columns.find((c) => c.toLowerCase().includes('branch'));
  const branchStats: Array<{ branch: string; avgRating: number; count: number }> = [];
  if (branchCol && ratingCol) {
    const grouped: Record<string, number[]> = {};
    rows.forEach((r) => {
      const b = String(r[branchCol] ?? '').trim();
      const val = Number(r[ratingCol]);
      if (!b || isNaN(val)) return;
      if (!grouped[b]) grouped[b] = [];
      grouped[b].push(val);
    });
    Object.entries(grouped).forEach(([branch, vals]) => {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      branchStats.push({ branch, avgRating: avg, count: vals.length });
    });
    branchStats.sort((a, b) => b.avgRating - a.avgRating);
  }

  // Extract top terms (complaints/praise) from text column
  const stopwords = new Set(['the','a','an','and','or','but','if','on','in','at','to','for','of','with','is','it','this','that','was','were','are','be','as','we','i','you','they','he','she','them','our','your','from','by','not','very','so','too','also','had','have','has']);
  const countTerms = (texts: string[]) => {
    const freq: Record<string, number> = {};
    for (const t of texts) {
      if (!t) continue;
      const words = String(t).toLowerCase().split(/[^a-z]+/).filter(Boolean);
      for (const w of words) {
        if (w.length < 3 || stopwords.has(w)) continue;
        freq[w] = (freq[w] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 15)
      .map(([term, count]) => ({ term, count }));
  };

  let topComplaintTerms: Array<{ term: string; count: number }> = [];
  let topPraiseTerms: Array<{ term: string; count: number }> = [];
  if (textCol && sentimentBreakdown) {
    // Segment rows by derived sentiment when available
    const negTexts = rows
      .filter((r) => {
        if (ratingCol) {
          const val = Number(r[ratingCol]);
          return !isNaN(val) && val <= 2;
        }
        if (sentimentCol) {
          const s = String(r[sentimentCol] ?? '').toLowerCase();
          return /(neg|bad|poor|terrible|worst|hate|angry|unsatisfied)/.test(s);
        }
        return false;
      })
      .map((r) => String(r[textCol] ?? ''));
    const posTexts = rows
      .filter((r) => {
        if (ratingCol) {
          const val = Number(r[ratingCol]);
          return !isNaN(val) && val >= 4;
        }
        if (sentimentCol) {
          const s = String(r[sentimentCol] ?? '').toLowerCase();
          return /(pos|good|great|excellent|love|happy|satisfied|awesome)/.test(s);
        }
        return false;
      })
      .map((r) => String(r[textCol] ?? ''));

    topComplaintTerms = countTerms(negTexts);
    topPraiseTerms = countTerms(posTexts);
  }

  // AI summary (best-effort; gracefully fallback inside generator)
  const aiSummary = await generateAISummary({
    filename: upload.filename,
    rowCount: totalRowCount,
    columns,
    sentimentSummary,
    sentimentBreakdown: sentimentBreakdown ?? undefined,
    topComplaintTerms,
    topPraiseTerms,
    branchStats,
    columnStats,
  });
  logInfo('CSV analytics generated', { uploadId: id, rowCount: totalRowCount, sampled: rows.length < totalRowCount ? true : false });

    return NextResponse.json({
    upload: {
      id: upload.id,
      filename: upload.filename,
      uploadedAt: upload.uploadedAt,
      uploadedBy: upload.uploadedBy,
      summaryJson: upload.summaryJson,
    },
    analytics: {
      rowCount: totalRowCount,
      columnCount: columns.length,
      columns,
      columnTypes,
      columnStats,
      sentimentSummary,
      sentimentBreakdown,
      chartData,
      branchStats,
      topComplaintTerms,
      topPraiseTerms,
      aiSummary,
    },
  });
  } catch (error) {
  logError(error instanceof Error ? error : String(error), { endpoint: '/api/analytics/csv/[id]', uploadId: id });
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}
