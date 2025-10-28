"use client";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

interface CsvAnalytics {
  upload: {
    id: string;
    filename: string;
    uploadedAt: string;
    uploadedBy: {
      id: string;
      name: string;
      email: string;
    };
    summaryJson: {
      rowCount: number;
      columnCount: number;
      columns: string[];
    };
  };
  analytics: {
    rowCount: number;
    columnCount: number;
    columns: string[];
    columnTypes: Record<string, string>;
    columnStats: Record<string, any>;
    sentimentSummary?: any;
    sentimentBreakdown?: { positive: number; neutral: number; negative: number; total: number };
    chartData: any[];
    branchStats?: Array<{ branch: string; avgRating: number; count: number }>;
    topComplaintTerms?: Array<{ term: string; count: number }>;
    topPraiseTerms?: Array<{ term: string; count: number }>;
    aiSummary?: string;
  };
}

async function fetchAnalytics(id: string) {
  const res = await fetch(`/api/analytics/csv/${id}`);
  let data: any = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    const err: any = new Error(data?.error || `Request failed with ${res.status}`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

export default function CsvAnalyticsClient({ id }: { id: string }) {
  const { data, error, isLoading, mutate, isValidating } = useSWR<CsvAnalytics>(
    id ? ["csv-analytics", id] : null,
    () => fetchAnalytics(id),
    { refreshInterval: 30000, revalidateOnFocus: false }
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Local cache for aiSummary
  const cacheKey = useMemo(() => `aiSummaryCache_${id}`, [id]);
  useEffect(() => {
    if (data?.analytics?.aiSummary) {
      const payload = { summary: data.analytics.aiSummary, ts: Date.now() };
      try { localStorage.setItem(cacheKey, JSON.stringify(payload)); } catch {}
    }
  }, [cacheKey, data?.analytics?.aiSummary]);

  const cachedSummary: string | null = useMemo(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj.summary ?? null;
    } catch {
      return null;
    }
  }, [cacheKey, isLoading]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6"><div className="h-4 w-1/3 bg-gray-200 rounded mb-4" /><div className="h-8 w-1/4 bg-gray-200 rounded" /></div>
            <div className="bg-white rounded-lg shadow p-6"><div className="h-4 w-1/3 bg-gray-200 rounded mb-4" /><div className="h-8 w-1/4 bg-gray-200 rounded" /></div>
            <div className="bg-white rounded-lg shadow p-6"><div className="h-4 w-1/3 bg-gray-200 rounded mb-4" /><div className="h-8 w-1/4 bg-gray-200 rounded" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const status = (error as any)?.status;
    const msg = (error as any)?.message || "Error loading analytics";
    if (status === 404) toast.error("Upload not found or has expired.");
    else if (status === 429) toast.error("Rate limit exceeded. Please try again shortly.");
    else if (status === 403 || status === 401) toast.error("Forbidden: Admin access required.");
    else toast.error(msg);
    return <div className="p-8 text-red-500">{msg}</div>;
  }

  if (!data) return null;

  const { upload, analytics } = data;

  const COLORS = highContrast ? ["#000000","#FF0000","#00AA00","#0055FF","#FF9900","#5500AA"] : ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      {/* Key Metrics Card */}
      {analytics.sentimentBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-2">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-md border p-4">
              <p className="text-sm text-gray-600">Positive</p>
              <p className="text-3xl font-bold text-green-600">{analytics.sentimentBreakdown.positive}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-gray-600">Neutral</p>
              <p className="text-3xl font-bold text-gray-700">{analytics.sentimentBreakdown.neutral}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-sm text-gray-600">Negative</p>
              <p className="text-3xl font-bold text-red-600">{analytics.sentimentBreakdown.negative}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Total: {analytics.sentimentBreakdown.total} • Positive: {Math.round((analytics.sentimentBreakdown.positive / Math.max(1, analytics.sentimentBreakdown.total)) * 100)}% • Negative: {Math.round((analytics.sentimentBreakdown.negative / Math.max(1, analytics.sentimentBreakdown.total)) * 100)}%
          </p>
        </motion.div>
      )}

      {/* AI Summary Card */}
      {(analytics.aiSummary || cachedSummary) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl shadow p-6 mb-6"
          aria-live="polite"
        >
          <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
          <p className="whitespace-pre-line leading-relaxed opacity-95">{analytics.aiSummary ?? cachedSummary}</p>
          <div className="mt-4 flex gap-3 items-center">
            <button
              onClick={async () => {
                setAiLoading(true);
                try {
                  await mutate();
                } catch (e) {
                  toast.error("Failed to regenerate insights");
                } finally {
                  setAiLoading(false);
                }
              }}
              className="bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded transition"
              aria-busy={aiLoading}
            >
              {aiLoading ? "Regenerating…" : "Regenerate Insights"}
            </button>
            <label className="inline-flex items-center gap-2 text-sm opacity-90">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="accent-white"
              />
              High contrast charts
            </label>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6 mb-6"
      >
        <h1 className="text-3xl font-bold mb-2">{upload.filename}</h1>
        <p className="text-gray-600">
          Uploaded by {upload.uploadedBy.name} on {new Date(upload.uploadedAt).toLocaleString()}
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-semibold mb-2 opacity-90">Total Rows</h3>
          <p className="text-4xl font-bold">{analytics.rowCount.toLocaleString()}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-semibold mb-2 opacity-90">Total Columns</h3>
          <p className="text-4xl font-bold">{analytics.columnCount}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6"
        >
          <h3 className="text-sm font-semibold mb-2 opacity-90">Unique Columns</h3>
          <p className="text-4xl font-bold">{Object.keys(analytics.columnTypes).length}</p>
        </motion.div>
      </div>

      {/* Column Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow p-6 mb-6"
      >
        <h2 className="text-xl font-semibold mb-4">Column Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {analytics.columns.map((col, idx) => (
            <div key={idx} className="border rounded p-3">
              <p className="font-medium text-sm truncate" title={col}>
                {col}
              </p>
              <p className="text-xs text-gray-500 capitalize">{analytics.columnTypes[col]}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sentiment Summary */}
      {analytics.sentimentSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Sentiment Summary</h2>
          {analytics.sentimentSummary.counts ? (
            <div role="img" aria-label="Pie chart of sentiment distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.sentimentSummary.counts).map(([name, value]) => ({
                    name,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(analytics.sentimentSummary.counts).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">Average Rating</p>
              <p className="text-4xl font-bold text-blue-600">{analytics.sentimentSummary.avgRating}</p>
              <p className="text-sm text-gray-500">{analytics.sentimentSummary.total} reviews</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Top Issues and Praise */}
      {(analytics.topComplaintTerms?.length || analytics.topPraiseTerms?.length) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Themes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.topComplaintTerms?.length ? (
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Top Negative Themes</h3>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {analytics.topComplaintTerms.slice(0, 10).map((t, i) => (
                    <li key={i}>{t.term} ({t.count})</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {analytics.topPraiseTerms?.length ? (
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Top Positive Mentions</h3>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {analytics.topPraiseTerms.slice(0, 10).map((t, i) => (
                    <li key={i}>{t.term} ({t.count})</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}

      {/* Chart Data */}
      {analytics.chartData && analytics.chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4">Trends Over Time</h2>
          <div role="img" aria-label="Line chart of average rating and review count over time">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgRating" stroke={highContrast ? "#000000" : "#3b82f6"} strokeWidth={2} />
              <Line type="monotone" dataKey="count" stroke={highContrast ? "#FF0000" : "#10b981"} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Column Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Column Statistics</h2>
        <div className="space-y-4">
          {analytics.columns.map((col, idx) => {
            const stats = analytics.columnStats[col];
            const type = analytics.columnTypes[col];
            return (
              <div key={idx} className="border-b pb-4">
                <h3 className="font-semibold text-sm mb-2">{col}</h3>
                {type === "numeric" && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Min: {stats.min}</p>
                    <p>Max: {stats.max}</p>
                    <p>Avg: {stats.avg.toFixed(2)}</p>
                  </div>
                )}
                {type === "date" && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Earliest: {new Date(stats.earliest).toLocaleDateString()}</p>
                    <p>Latest: {new Date(stats.latest).toLocaleDateString()}</p>
                  </div>
                )}
                {type === "text" && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Unique Values: {stats.uniqueCount}</p>
                    <p>Top Values: {stats.topValues.slice(0, 3).join(", ")}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Branch Stats */}
      {analytics.branchStats && analytics.branchStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow p-6 mt-6"
        >
          <h2 className="text-xl font-semibold mb-4">Top Branches</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Branch</th>
                  <th className="py-2 pr-4">Avg Rating</th>
                  <th className="py-2 pr-4">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {analytics.branchStats.map((b, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 pr-4">{b.branch}</td>
                    <td className="py-2 pr-4">{b.avgRating.toFixed(2)}</td>
                    <td className="py-2 pr-4">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
