import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';

export type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface SentimentResult {
  score: number;        // normalized between -1 and 1
  label: SentimentLabel;
  confidence: number;   // 0..1
}

const openaiApiKey = process.env.OPENAI_API_KEY;
const hfToken = process.env.HF_ACCESS_TOKEN;

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const hf = hfToken ? new HfInference(hfToken) : null;

// Normalize label variants to our enum
function normalizeLabel(raw: string): SentimentLabel {
  const v = raw.toLowerCase();
  if (v.includes('pos')) return 'POSITIVE';
  if (v.includes('neg')) return 'NEGATIVE';
  return 'NEUTRAL';
}

function clamp(n: number, min = -1, max = 1) {
  return Math.max(min, Math.min(max, n));
}

// Heuristic fallback using simple keyword lexicon
function heuristicSentiment(text: string): SentimentResult {
  const positiveWords = ['good','great','excellent','amazing','love','fantastic','happy','satisfied','awesome','perfect'];
  const negativeWords = ['bad','terrible','awful','hate','poor','angry','unsatisfied','horrible','worst','disappointed'];
  const tokens = text.toLowerCase().split(/[^a-zA-Z]+/);
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    if (positiveWords.includes(t)) score += 1;
    if (negativeWords.includes(t)) score -= 1;
  }
  const normalized = clamp(score / Math.max(1, tokens.length / 10));
  const label: SentimentLabel = normalized > 0.15 ? 'POSITIVE' : normalized < -0.15 ? 'NEGATIVE' : 'NEUTRAL';
  const confidence = Math.min(1, Math.abs(normalized));
  return { score: normalized, label, confidence };
}

// OpenAI primary analyzer
async function analyzeWithOpenAI(text: string): Promise<SentimentResult | null> {
  if (!openai) return null;
  try {
    const prompt = `You are a precise sentiment analyzer. Analyze the user's review and respond ONLY as strict JSON with keys: score (float -1..1), label (POSITIVE|NEGATIVE|NEUTRAL), confidence (0..1). Review: "${text.replace(/"/g, '\\"')}"`;

    const resp = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
    });

    const content = resp.output_text?.trim() || '';
    let json: any;
    try { json = JSON.parse(content); } catch {
      // try to extract JSON
      const match = content.match(/\{[\s\S]*\}/);
      if (match) json = JSON.parse(match[0]); else throw new Error('Invalid JSON from OpenAI');
    }
    const score = clamp(Number(json.score));
    const label = normalizeLabel(String(json.label || 'NEUTRAL'));
    const confidence = Math.max(0, Math.min(1, Number(json.confidence ?? Math.abs(score))));
    return { score, label, confidence };
  } catch (e) {
    console.warn('OpenAI analysis failed, falling back:', e);
    return null;
  }
}

// HuggingFace fallback using sentiment-analysis pipeline
async function analyzeWithHF(text: string): Promise<SentimentResult | null> {
  if (!hf) return null;
  try {
    const result = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: text,
    });
    const top = Array.isArray(result) ? result[0] : result;
    const label = normalizeLabel(String(top.label || 'NEUTRAL'));
    const rawScore = typeof top.score === 'number' ? top.score : 0.5;
    const score = label === 'POSITIVE' ? rawScore : label === 'NEGATIVE' ? -rawScore : 0;
    const confidence = Math.max(0, Math.min(1, rawScore));
    return { score: clamp(score), label, confidence };
  } catch (e) {
    console.warn('HuggingFace analysis failed, falling back:', e);
    return null;
  }
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Try OpenAI
  const o = await analyzeWithOpenAI(text);
  if (o) return o;
  // Try HF
  const h = await analyzeWithHF(text);
  if (h) return h;
  // Heuristic
  return heuristicSentiment(text);
}

// ===== CSV Analytics AI Summary =====
export interface AISummaryInput {
  filename?: string;
  rowCount: number;
  columns: string[];
  sentimentSummary?: any;
  sentimentBreakdown?: { positive: number; neutral: number; negative: number; total: number };
  branchStats?: Array<{ branch: string; avgRating: number; count: number }>;
  columnStats?: Record<string, any>;
  topComplaintTerms?: Array<{ term: string; count: number }>;
  topPraiseTerms?: Array<{ term: string; count: number }>;
}

export async function generateAISummary(input: AISummaryInput): Promise<string> {
  const {
    filename = 'uploaded.csv',
    rowCount,
    columns,
    sentimentSummary,
    sentimentBreakdown,
    branchStats = [],
    columnStats = {},
    topComplaintTerms = [],
    topPraiseTerms = [],
  } = input;

  // Compose a compact context snapshot
  const topBranch = branchStats.length
    ? [...branchStats].sort((a, b) => b.avgRating - a.avgRating)[0]
    : null;

  let sentimentLine = 'No explicit sentiment column found.';
  if (sentimentSummary?.counts) {
    const entries = Object.entries(sentimentSummary.counts as Record<string, number>);
    const total = entries.reduce((a, [, v]) => a + (v as number), 0) || 1;
    const sorted = entries.sort((a, b) => (b[1] as number) - (a[1] as number));
    const [top, topVal] = sorted[0] ?? ['N/A', 0];
    const pct = Math.round(((topVal as number) / total) * 100);
    sentimentLine = `Most common sentiment is ${String(top)} (${pct}%).`;
  } else if (sentimentSummary?.avgRating) {
    sentimentLine = `Average rating is ${Number(sentimentSummary.avgRating).toFixed(2)} over ${sentimentSummary.total} rows.`;
  }

  // Key metrics line for positive/neutral/negative breakdown
  let keyMetricsLine = '';
  if (sentimentBreakdown && sentimentBreakdown.total > 0) {
    const { positive, neutral, negative, total } = sentimentBreakdown;
    const posPct = Math.round((positive / total) * 100);
    const negPct = Math.round((negative / total) * 100);
    const neuPct = Math.max(0, 100 - posPct - negPct);
    keyMetricsLine = `Good vs Bad: ${positive} positive (${posPct}%), ${negative} negative (${negPct}%), ${neutral} neutral (${neuPct}%) out of ${total} reviews.`;
  }

  const fallbackSections: string[] = [];
  fallbackSections.push(`Executive Summary:\n- ${`Analyzing ${filename} with ${rowCount} rows and ${columns.length} columns.`}`);
  if (keyMetricsLine) fallbackSections.push(`Key Metrics:\n- ${keyMetricsLine}`);
  fallbackSections.push(`Sentiment:\n- ${sentimentLine}`);
  if (topBranch) fallbackSections.push(`Performance Highlights:\n- Top branch: ${topBranch.branch} (avg ${topBranch.avgRating.toFixed(2)} from ${topBranch.count} reviews).`);
  if (topComplaintTerms.length) {
    const items = topComplaintTerms.slice(0, 8).map(t => `${t.term} (${t.count})`).join(', ');
    fallbackSections.push(`Top Negative Themes:\n- ${items}`);
  }
  if (topPraiseTerms.length) {
    const items = topPraiseTerms.slice(0, 8).map(t => `${t.term} (${t.count})`).join(', ');
    fallbackSections.push(`Top Positive Mentions:\n- ${items}`);
  }
  // Actionable recommendations (heuristic)
  const recs: string[] = [];
  const lowerTerms = new Set(topComplaintTerms.map(t => t.term));
  const hasWait = Array.from(lowerTerms).some(t => /(wait|queue|delay|slow)/.test(t));
  const hasStaff = Array.from(lowerTerms).some(t => /(staff|service|support|rude|attitude)/.test(t));
  const hasPrice = Array.from(lowerTerms).some(t => /(price|expensive|cost|fees)/.test(t));
  const hasQuality = Array.from(lowerTerms).some(t => /(quality|defect|broken|faulty|taste)/.test(t));
  if (hasWait) recs.push('Reduce wait times by adding staffing during peak hours and offering scheduled slots.');
  if (hasStaff) recs.push('Run a targeted staff training and implement a post-resolution follow-up to recover detractors.');
  if (hasPrice) recs.push('Review pricing transparency and highlight value (bundles, guarantees) in communications.');
  if (hasQuality) recs.push('Introduce a quality check and rapid replacement workflow for defect-related complaints.');
  if (!recs.length) recs.push('Ask detractors to share specifics via a short survey; close the loop within 48 hours and request updated reviews after resolution.');
  fallbackSections.push(`Recommendations:\n- ${recs.join('\n- ')}`);

  const fallbackText = fallbackSections.join('\n\n');

  // Prefer OpenAI for a richer narrative
  if (openai) {
    try {
      const prompt = `You are a senior CX analyst. Using the analytics below, produce a professional, brand-owner-ready insight report with sections and bullet points (plain text only, no markdown symbols like * or #). Keep it crisp and actionable. Include:\n1) Executive Summary (1-2 bullets).\n2) Key Metrics: counts and percentages of positive, neutral, negative reviews.\n3) Sentiment Drivers: top negative themes (with counts) and top positive mentions.\n4) Performance Highlights: best/worst branches if available.\n5) High-Impact Recommendations: 3-5 prioritized, specific actions tied to the drivers.\n\nCSV: ${filename}\nRows: ${rowCount}\nColumns: ${columns.join(', ')}\nSentiment breakdown: ${JSON.stringify(sentimentBreakdown || {})}\nSentiment summary: ${JSON.stringify(sentimentSummary || {})}\nTop negative themes: ${JSON.stringify(topComplaintTerms || []).slice(0, 1500)}\nTop positive mentions: ${JSON.stringify(topPraiseTerms || []).slice(0, 1500)}\nBranch stats (avgRating,count): ${JSON.stringify(branchStats || []).slice(0, 2000)}\nColumn stats: ${JSON.stringify(columnStats || {}).slice(0, 1500)}\n\nReturn plain text only with clear section headings and bullet points.`;

      const createResp = openai.responses.create({ model: 'gpt-4o-mini', input: prompt });
      const withTimeout = new Promise<Awaited<ReturnType<typeof openai.responses.create>>>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('OpenAI timeout after 8s')), 8000);
        createResp.then((r) => { clearTimeout(t); resolve(r); }).catch((e) => { clearTimeout(t); reject(e); });
      });
      const resp = await withTimeout;
      const text = (((resp as any).output_text) || '').trim();
      if (text) return text;
    } catch (e) {
      console.warn('OpenAI summary failed, falling back:', e);
    }
  }

  // Fallback deterministic summary
  return fallbackText;
}
