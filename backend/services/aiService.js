import JournalEmbedding from '../models/JournalEmbedding.js';
import CapsuleEmbedding from '../models/CapsuleEmbedding.js';
import JournalEntry from '../models/JournalEntry.js';
import Capsule from '../models/Capsule.js';
import PersonalityState from '../models/PersonalityState.js';

const DEFAULT_ML_URL = 'http://localhost:8000';

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const mod = await import('node-fetch'); // fallback if running older node
  return mod.default;
}

function clamp01(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function positivityFromSentiment(label, score) {
  const s = clamp01(score);
  return label === 'negative' ? (1 - s) : s;
}

function monthStartUTC(d) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1));
}

async function callMl(endpoint, body) {
  const mlBase = (process.env.ML_SERVICE_URL || DEFAULT_ML_URL).replace(/\/$/, '');
  const f = await getFetch();
  const timeoutMs = Number(process.env.ML_SERVICE_TIMEOUT_MS || 120000);
  const retries = Number(process.env.ML_SERVICE_RETRIES || 1);

  let resp;
  let lastErr = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      resp = await f(`${mlBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      lastErr = null;
      clearTimeout(timeout);
      break;
    } catch (e) {
      clearTimeout(timeout);
      lastErr = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  if (!resp && lastErr) {
    const isTimeout = lastErr?.name === 'AbortError';
    const err = new Error(`ML service unreachable (${isTimeout ? 'timeout' : 'network'})`);
    err.statusCode = isTimeout ? 504 : 502;
    err.meta = { endpoint, mlBase, timeoutMs, retries };
    throw err;
  }

  let data = null;
  try {
    data = await resp.json();
  } catch (_) {}
  if (!resp.ok) {
    const err = new Error(`ML service error (${resp.status})`);
    err.statusCode = resp.status >= 500 ? 502 : resp.status;
    err.data = data;
    err.meta = { endpoint, mlBase, timeoutMs, retries };
    throw err;
  }
  return data;
}

export async function processJournalEntryEmbedding(journalEntry) {
  const payload = {
    userId: journalEntry.userId.toString(),
    sourceType: 'journal',
    sourceId: journalEntry._id.toString(),
    text: journalEntry.content,
    createdAt: journalEntry.date || journalEntry.createdAt || new Date(),
  };
  const features = await callMl('/process-entry', payload);

  const doc = await JournalEmbedding.findOneAndUpdate(
    { userId: journalEntry.userId, journalId: journalEntry._id },
    {
      userId: journalEntry.userId,
      journalId: journalEntry._id,
      embedding: features.embedding,
      sentimentLabel: features.sentimentLabel,
      sentimentScore: features.sentimentScore,
      emotionLabel: features.emotionLabel,
      emotionScore: features.emotionScore,
      topics: features.topics || [],
      createdAt: payload.createdAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Update monthly personality snapshot for that month
  await upsertMonthlyPersonality(journalEntry.userId, payload.createdAt);

  return doc;
}

export async function processCapsuleEmbedding(capsule) {
  const payload = {
    userId: capsule.creator.toString(),
    sourceType: 'capsule',
    sourceId: capsule._id.toString(),
    text: `${capsule.title}\n\n${capsule.message}`,
    createdAt: capsule.createdAt || new Date(),
  };
  const features = await callMl('/process-entry', payload);

  const doc = await CapsuleEmbedding.findOneAndUpdate(
    { userId: capsule.creator, capsuleId: capsule._id },
    {
      userId: capsule.creator,
      capsuleId: capsule._id,
      embedding: features.embedding,
      sentimentLabel: features.sentimentLabel,
      sentimentScore: features.sentimentScore,
      emotionLabel: features.emotionLabel,
      emotionScore: features.emotionScore,
      topics: features.topics || [],
      createdAt: payload.createdAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await upsertMonthlyPersonality(capsule.creator, payload.createdAt);
  return doc;
}

export async function upsertMonthlyPersonality(userId, anyDate) {
  const ts = monthStartUTC(anyDate);
  const monthEnd = new Date(Date.UTC(ts.getUTCFullYear(), ts.getUTCMonth() + 1, 1));

  const [journalEmbeds, capsuleEmbeds] = await Promise.all([
    JournalEmbedding.find({ userId, createdAt: { $gte: ts, $lt: monthEnd } }).lean(),
    CapsuleEmbedding.find({ userId, createdAt: { $gte: ts, $lt: monthEnd } }).lean(),
  ]);

  const all = [...journalEmbeds, ...capsuleEmbeds];
  const n = all.length || 1;

  const optimism = all.reduce((acc, e) => acc + positivityFromSentiment(e.sentimentLabel, e.sentimentScore), 0) / n;
  const ambition = all.reduce((acc, e) => acc + ((e.topics || []).includes('career') ? 1 : 0), 0) / n;
  const anxiety = all.reduce((acc, e) => acc + (e.emotionLabel === 'fear' ? 1 : 0), 0) / n;
  const social = all.reduce((acc, e) => acc + ((e.topics || []).includes('relationships') ? 1 : 0), 0) / n;

  // Reflection is about journaling frequency (entries per day-ish).
  const daysInMonth = Math.max(1, Math.round((monthEnd - ts) / (1000 * 60 * 60 * 24)));
  const journalCount = journalEmbeds.length;
  const reflection = clamp01(journalCount / Math.max(10, daysInMonth)); // normalize: 10+ entries/month ~ 1.0

  await PersonalityState.findOneAndUpdate(
    { userId, timestamp: ts },
    {
      userId,
      timestamp: ts,
      optimismScore: clamp01(optimism),
      ambitionScore: clamp01(ambition),
      anxietyScore: clamp01(anxiety),
      reflectionScore: clamp01(reflection),
      socialFocusScore: clamp01(social),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function buildChatPayload({ userId, mode, timestamp, message }) {
  const ts = timestamp ? new Date(timestamp) : null;
  const timeFilter = {};
  if (mode === 'past' && ts) timeFilter.$lt = ts;
  if ((mode === 'present') && ts) timeFilter.$lte = ts;
  if (mode === 'future') timeFilter.$lte = new Date(); // all known history

  const MAX_CANDIDATES = 600;

  const [journalCandidates, capsuleCandidates] = await Promise.all([
    JournalEmbedding.find({
      userId,
      ...(Object.keys(timeFilter).length ? { createdAt: timeFilter } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(MAX_CANDIDATES)
      .populate('journalId', 'content date createdAt')
      .lean(),
    CapsuleEmbedding.find({
      userId,
      ...(Object.keys(timeFilter).length ? { createdAt: timeFilter } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(MAX_CANDIDATES)
      .populate('capsuleId', 'title message createdAt')
      .lean(),
  ]);

  const candidateMemories = [];
  for (const e of journalCandidates) {
    if (!e.journalId) continue;
    candidateMemories.push({
      id: e.journalId._id.toString(),
      sourceType: 'journal',
      createdAt: e.journalId.date || e.journalId.createdAt || e.createdAt,
      text: e.journalId.content,
      embedding: e.embedding,
      sentimentScore: e.sentimentScore,
      emotionLabel: e.emotionLabel,
      topics: e.topics,
    });
  }
  for (const e of capsuleCandidates) {
    if (!e.capsuleId) continue;
    candidateMemories.push({
      id: e.capsuleId._id.toString(),
      sourceType: 'capsule',
      createdAt: e.capsuleId.createdAt || e.createdAt,
      text: `${e.capsuleId.title}\n\n${e.capsuleId.message}`,
      embedding: e.embedding,
      sentimentScore: e.sentimentScore,
      emotionLabel: e.emotionLabel,
      topics: e.topics,
    });
  }

  // Personality: choose monthly snapshot closest at/before ts (for past/present); latest for present; forecast input for future.
  let personality = null;
  let personalityHistory = null;

  if (mode === 'future') {
    const hist = await PersonalityState.find({ userId }).sort({ timestamp: 1 }).lean();
    personalityHistory = hist.map((h) => ({
      ds: h.timestamp,
      optimismScore: h.optimismScore,
      ambitionScore: h.ambitionScore,
      anxietyScore: h.anxietyScore,
      reflectionScore: h.reflectionScore,
      socialFocusScore: h.socialFocusScore,
    }));
  } else {
    const anchor = ts || new Date();
    const snap = await PersonalityState.findOne({ userId, timestamp: { $lte: monthStartUTC(anchor) } })
      .sort({ timestamp: -1 })
      .lean();
    if (snap) {
      personality = {
        optimismScore: snap.optimismScore,
        ambitionScore: snap.ambitionScore,
        anxietyScore: snap.anxietyScore,
        reflectionScore: snap.reflectionScore,
        socialFocusScore: snap.socialFocusScore,
      };
    }
  }

  return {
    userId: userId.toString(),
    mode,
    timestamp: ts,
    message,
    candidateMemories,
    personality,
    personalityHistory,
    forecastYears: 3,
  };
}

export async function chatWithTemporalSelf({ userId, mode, timestamp, message }) {
  const payload = await buildChatPayload({ userId, mode, timestamp, message });
  return callMl('/chat', payload);
}

export async function getAiAnalytics(userId) {
  const embeds = await JournalEmbedding.find({ userId }).sort({ createdAt: 1 }).lean();
  const topicCounts = {};
  const sentimentSeries = [];

  for (const e of embeds) {
    const month = monthStartUTC(e.createdAt).toISOString().slice(0, 10);
    const positivity = positivityFromSentiment(e.sentimentLabel, e.sentimentScore);
    sentimentSeries.push({ month, positivity });
    for (const t of (e.topics || [])) {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
  }

  // Aggregate monthly positivity
  const agg = {};
  for (const p of sentimentSeries) {
    agg[p.month] = agg[p.month] || { month: p.month, sum: 0, n: 0 };
    agg[p.month].sum += p.positivity;
    agg[p.month].n += 1;
  }
  const sentimentOverTime = Object.values(agg).map((x) => ({
    month: x.month,
    avgPositivity: x.n ? x.sum / x.n : 0.5,
    count: x.n,
  }));

  const latestPersonality = await PersonalityState.findOne({ userId }).sort({ timestamp: -1 }).lean();

  return {
    sentimentOverTime,
    topicDistribution: Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count),
    latestPersonality: latestPersonality ? {
      timestamp: latestPersonality.timestamp,
      optimismScore: latestPersonality.optimismScore,
      ambitionScore: latestPersonality.ambitionScore,
      anxietyScore: latestPersonality.anxietyScore,
      reflectionScore: latestPersonality.reflectionScore,
      socialFocusScore: latestPersonality.socialFocusScore,
    } : null,
  };
}


