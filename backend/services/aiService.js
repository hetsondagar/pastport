import JournalEmbedding from '../models/JournalEmbedding.js';
import CapsuleEmbedding from '../models/CapsuleEmbedding.js';
import JournalEntry from '../models/JournalEntry.js';
import Capsule from '../models/Capsule.js';
import PersonalityState from '../models/PersonalityState.js';
import { generateLLMResponse } from './llmService.js';
import logger from '../config/logger.js';

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

function cosineSimilarity(a = [], b = []) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  if (!a.length || !b.length || a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = Number(a[i]) || 0;
    const y = Number(b[i]) || 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function derivePersonalityFromHistory(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null;

  const recent = history.slice(-6);
  const avg = (key) => {
    const total = recent.reduce((sum, item) => sum + clamp01(item?.[key]), 0);
    return total / recent.length;
  };

  return {
    optimismScore: avg('optimismScore'),
    ambitionScore: avg('ambitionScore'),
    anxietyScore: avg('anxietyScore'),
    reflectionScore: avg('reflectionScore'),
    socialFocusScore: avg('socialFocusScore'),
  };
}

function formatPersonalityForPrompt(personality) {
  if (!personality) return 'No personality snapshot available.';
  return [
    `Optimism: ${clamp01(personality.optimismScore).toFixed(2)}`,
    `Anxiety: ${clamp01(personality.anxietyScore).toFixed(2)}`,
    `Ambition: ${clamp01(personality.ambitionScore).toFixed(2)}`,
    `Reflection: ${clamp01(personality.reflectionScore).toFixed(2)}`,
    `Social Focus: ${clamp01(personality.socialFocusScore).toFixed(2)}`,
  ].join('\n');
}

function compactText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function shortText(text = '', maxLen = 220) {
  const clean = compactText(text);
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1)}...`;
}

function normalizeMemory(memory) {
  return {
    ...memory,
    content: compactText(memory?.content || memory?.text || ''),
    date: memory?.createdAt,
  };
}

function filterMemories(memories = [], opts = {}) {
  const minLen = opts.minLen ?? 15;
  return memories
    .map(normalizeMemory)
    .filter((m) => {
      const text = m.content.toLowerCase();
      if (!text || text.length < minLen) return false;
      if (text.includes('test')) return false;
      if (text.includes('dummy')) return false;
      if (text.includes('media attachment')) return false;
      return true;
    });
}

function rankMemories(memories = [], question = '') {
  const q = question.toLowerCase().trim();
  const qTerms = q.split(/\s+/).filter((w) => w.length > 2);

  return memories
    .map((m) => {
      const text = m.content.toLowerCase();
      let score = 0;

      if (q && text.includes(q)) score += 2;

      const overlap = qTerms.reduce((acc, term) => (text.includes(term) ? acc + 1 : acc), 0);
      score += overlap * 0.35;
      score += m.content.length / 100;

      if (/job|breakup|family|health|career|habit|goal|study|focus|anxious|grateful/.test(text)) {
        score += 0.4;
      }

      if (Array.isArray(m.topics) && m.topics.length > 0) {
        score += 0.2;
      }

      return { ...m, score };
    })
    .sort((a, b) => b.score - a.score);
}

function detectQuestionType(question = '') {
  const q = question.toLowerCase();

  if (q.includes('should') || q.includes('focus') || q.includes('improve')) {
    return 'advice';
  }

  if (q.includes('movie') || q.includes('eat') || q.includes('suggest')) {
    return 'casual';
  }

  if (
    q.includes('what')
    || q.includes('did')
    || q.includes('when')
    || q.includes('am i')
    || /\btell me about\b/.test(q)
    || /\bwhat\s+(happened|went)\b/.test(q)
  ) {
    return 'factual';
  }

  return 'reflective';
}

/** Start of UTC calendar day for `d`. */
function startOfUtcDay(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
}

/**
 * Detect phrases like "last month" / "last week" and map them to [start, end) in UTC.
 * Windows are interpreted relative to `anchor` (chat timestamp): e.g. past-self at Jan 1 2026 → "last month" is Dec 2025.
 */
function parseRecallTimeRange(question = '', anchorRaw = new Date()) {
  const q = question.toLowerCase();
  const anchor = new Date(anchorRaw);
  if (Number.isNaN(anchor.getTime())) return null;

  const dayStart = startOfUtcDay(anchor);
  if (!dayStart) return null;

  if (/\b(last|past|previous)\s+month\b/.test(q) || /\bover\s+(the\s+)?last\s+month\b/.test(q)) {
    const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
    const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - 1, 1));
    return {
      start,
      end,
      label: 'the calendar month before your anchor date',
    };
  }

  if (/\bthis\s+month\b/.test(q)) {
    const start = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
    const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 1));
    return { start, end, label: 'this calendar month (relative to your anchor date)' };
  }

  if (/\bthis\s+year\b/.test(q) || (/\bhow\s+far\b/.test(q) && /\b(year|come)\b/.test(q))) {
    const start = new Date(Date.UTC(anchor.getUTCFullYear(), 0, 1));
    const end = new Date(dayStart.getTime() + 86400000);
    return {
      start,
      end,
      label: 'year to date through your anchor calendar day (UTC)',
    };
  }

  if (/\b(last|past|previous)\s+week\b/.test(q)) {
    const end = dayStart;
    const start = new Date(end.getTime() - 7 * 86400000);
    return {
      start,
      end,
      label: 'the seven days ending at the start of your anchor calendar day (UTC)',
    };
  }

  if (/\bthis\s+week\b/.test(q)) {
    const end = dayStart;
    const start = new Date(end.getTime() - 7 * 86400000);
    return {
      start,
      end,
      label: 'the last seven days before your anchor calendar day (UTC)',
    };
  }

  if (/\byesterday\b/.test(q)) {
    const end = dayStart;
    const start = new Date(end.getTime() - 86400000);
    return { start, end, label: 'yesterday (UTC)' };
  }

  return null;
}

function memoryInstant(m) {
  const raw = m?.date || m?.createdAt;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

async function fetchRecallFallbackFromDb(userId, recallRange) {
  const range = { $gte: recallRange.start, $lt: recallRange.end };
  const [journals, capsules] = await Promise.all([
    JournalEntry.find({ userId, date: range }).sort({ date: -1 }).limit(18).lean(),
    Capsule.find({ creator: userId, createdAt: range }).sort({ createdAt: -1 }).limit(18).lean(),
  ]);

  const out = [];
  for (const e of journals) {
    out.push({
      id: e._id.toString(),
      sourceType: 'journal',
      createdAt: e.date || e.createdAt,
      text: e.content,
      topics: e.tags || [],
    });
  }
  for (const c of capsules) {
    out.push({
      id: c._id.toString(),
      sourceType: 'capsule',
      createdAt: c.createdAt,
      text: `${c.title}\n\n${c.message}`,
      topics: [],
    });
  }

  return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function dedupeMemoriesById(primary, secondary) {
  const seen = new Set();
  const out = [];
  for (const m of [...primary, ...secondary]) {
    const id = m?.id?.toString?.();
    const key = id || `${m?.createdAt}-${String(m?.text || m?.content || '').slice(0, 48)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...m,
      content: m.content || m.text || '',
    });
  }
  return out;
}

function behaviorInstruction(type) {
  if (type === 'factual') return 'Answer clearly and directly.';
  if (type === 'advice') return 'Give practical and helpful advice.';
  if (type === 'casual') return 'Respond naturally and casually.';
  return 'Respond thoughtfully and reflectively.';
}

function timeModeInstruction(mode) {
  if (mode === 'past') return 'Only use knowledge available at that time.';
  if (mode === 'future') return 'Answer as a future version of the user.';
  return 'Answer as the user in the present moment.';
}

/** Build Mongo date filter for journal `date` / capsule `createdAt` (aligned with embedding time bounds). */
function rawEntryDateFilter(mode, ts) {
  if (mode === 'past' && ts) return { $lt: new Date(ts) };
  if (mode === 'present' && ts) return { $lte: new Date(ts) };
  if (mode === 'future') return { $lte: new Date() };
  return {};
}

/**
 * Always load recent journal rows and capsules from the DB so chat is grounded even without embeddings / ML.
 */
async function fetchRawMemoriesForChat(userId, mode, ts) {
  const df = rawEntryDateFilter(mode, ts);
  const journalQ = { userId, ...(Object.keys(df).length ? { date: df } : {}) };
  const capsuleQ = { creator: userId, ...(Object.keys(df).length ? { createdAt: df } : {}) };

  const [journals, capsules] = await Promise.all([
    JournalEntry.find(journalQ).sort({ date: -1 }).limit(45).lean(),
    Capsule.find(capsuleQ).sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  const out = [];
  for (const e of journals) {
    out.push({
      id: e._id.toString(),
      sourceType: 'journal',
      createdAt: e.date || e.createdAt,
      text: e.content,
      topics: e.tags || [],
      embedding: [],
    });
  }
  for (const c of capsules) {
    out.push({
      id: c._id.toString(),
      sourceType: 'capsule',
      createdAt: c.createdAt,
      text: `${c.title}\n\n${c.message}`,
      topics: c.tags || [],
      embedding: [],
    });
  }

  return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Merge semantic ranking with recent excerpts so prompts always carry real timeline material when any exists. */
function pickGroundedMemories(question, cleanMemories, recallRange) {
  if (!cleanMemories.length) return [];

  if (recallRange) {
    return cleanMemories
      .filter((m) => {
        const inst = memoryInstant(m);
        return inst && inst >= recallRange.start && inst < recallRange.end;
      })
      .sort((a, b) => memoryInstant(b) - memoryInstant(a))
      .slice(0, 10);
  }

  const ranked = rankMemories(cleanMemories, question);
  const byRecency = [...cleanMemories].sort((a, b) => {
    const ta = memoryInstant(a)?.getTime() ?? 0;
    const tb = memoryInstant(b)?.getTime() ?? 0;
    return tb - ta;
  });

  const picked = [];
  const seen = new Set();

  const pushUnique = (m) => {
    const key = m.id?.toString?.() ?? `${memoryInstant(m)?.toISOString()}-${String(m.content || m.text || '').slice(0, 32)}`;
    if (seen.has(key)) return;
    seen.add(key);
    picked.push(m);
  };

  for (const m of ranked) {
    if (picked.length >= 8) break;
    pushUnique(m);
  }
  for (const m of byRecency) {
    if (picked.length >= 12) break;
    pushUnique(m);
  }

  return picked;
}

function buildSmartPrompt({
  question,
  memories,
  personality,
  mode,
  questionType,
  timestamp,
  recallEmpty,
  recallRangeLabel,
  recallRange,
  dbContextEmpty,
}) {
  const hasExcerpts = memories.length > 0;

  const memoryLines = memories.slice(0, 12).map((m) => {
    const inst = memoryInstant(m);
    const day = inst ? inst.toISOString().slice(0, 10) : '(unknown date)';
    const body = shortText(m.content || m.text || '', 260);
    return `(${day}) ${body}`;
  });
  const memoryText = memoryLines.join('\n');

  const personalityText = [
    `Optimism: ${clamp01(personality?.optimismScore ?? 0).toFixed(2)}`,
    `Anxiety: ${clamp01(personality?.anxietyScore ?? 0).toFixed(2)}`,
    `Ambition: ${clamp01(personality?.ambitionScore ?? 0).toFixed(2)}`,
  ].join('\n');

  let contextDirective;
  if (!hasExcerpts) {
    if (dbContextEmpty) {
      contextDirective =
        'The user has no PastPort journal or capsule excerpts for this chat context. Say so plainly and warmly; invite them to jot something in PastPort. Do not invent life events, habits, or pretend you recall details.';
    } else if (recallEmpty && recallRangeLabel) {
      contextDirective = `Nothing they saved falls in ${recallRangeLabel}. Say that clearly without inventing period-specific events.`;
    } else {
      contextDirective =
        'No excerpts were attached to this prompt—keep the reply brief and do not invent diary specifics.';
    }
  } else {
    contextDirective =
      'PastPort excerpts below are real saved logs. Your reply MUST tie to them: name at least one concrete detail, theme, mood, topic, or date from those lines (paraphrase is fine). Humanize and soften the tone, but do not drift into advice that ignores what they actually wrote.';
  }

  const systemPrompt = [
    'You are the user\'s inner voice.',
    'Think clearly, naturally, and personally.',
    'Do not use repetitive templates.',
    'Avoid generic self-help filler (errands, grocery scans, vague \"pause and breathe\") unless the user explicitly asks for that.',
    contextDirective,
    hasExcerpts ? 'Never claim memory gaps if excerpts are provided.' : null,
    recallRange && !recallEmpty && hasExcerpts
      ? 'The user asked about a specific time window—summarize only what appears in the excerpts that fall in that window.'
      : null,
  ].filter(Boolean).join('\n');

  const userPrompt = [
    `You are the user\'s ${mode} self.`,
    timestamp ? `Anchor timestamp: ${new Date(timestamp).toISOString()}` : null,
    recallEmpty && recallRangeLabel
      ? `No journal entries or capsules exist in PastPort for ${recallRangeLabel}. Acknowledge that warmly without inventing events or generic \"I don't remember\" filler.`
      : null,
    '',
    'Personality:',
    personalityText,
    '',
    recallRange
      ? recallEmpty
        ? 'Logged memories in that period:'
        : 'PastPort excerpts from that period (ground your answer here):'
      : hasExcerpts
        ? 'PastPort excerpts (required grounding—use these):'
        : 'PastPort excerpts:',
    memoryText || '(none)',
    '',
    'User question:',
    `"${question}"`,
    '',
    'Instructions:',
    `- ${behaviorInstruction(questionType)}`,
    '- Speak naturally like inner thoughts.',
    '- Stay anchored to the excerpts when present; broaden gently only when the question clearly goes beyond them.',
    '- Be concise (2-5 short lines max).',
    `- ${timeModeInstruction(mode)}`,
  ].filter(Boolean).join('\n');

  return { systemPrompt, userPrompt };
}

function buildSafeFallback({
  questionType,
  question,
  memories,
  recallEmpty,
  recallRangeLabel,
  dbContextEmpty,
}) {
  if (recallEmpty && recallRangeLabel) {
    return `There aren't any PastPort logs saved for ${recallRangeLabel}. Add a journal note or capsule for that stretch and ask again—I’ll mirror it back here.`;
  }

  if (dbContextEmpty) {
    return 'There’s nothing saved in PastPort for this chat view yet—add a journal entry or capsule first, then I can reflect your own words back to you.';
  }

  const top = memories[0];
  if (!top) {
    if (questionType === 'casual') return 'Go with something light and enjoyable tonight. If you share your mood, I can suggest better options.';
    if (questionType === 'factual') return 'I need one more concrete detail to answer this accurately.';
    return 'Pick one small next step you can do today, and I will help you refine it.';
  }

  if (questionType === 'factual') {
    return `A relevant point from your timeline: ${shortText(top.content, 140)}`;
  }
  if (questionType === 'casual') {
    return `You seem to be in the mood for something easy and positive right now. Start with one feel-good pick tonight.`;
  }
  if (questionType === 'advice') {
    return `A practical focus now: ${shortText(top.content, 120)}. Convert that into one concrete action for this week.`;
  }
  return `One meaningful thread right now is ${shortText(top.content, 130)}. Stay with that and take one clear step today.`;
}

async function retrieveRelevantMemories({ userId, question, candidateMemories = [], topK = 5 }) {
  if (!candidateMemories.length) return [];

  let queryEmbedding = null;
  try {
    const features = await callMl('/process-entry', {
      userId: userId.toString(),
      sourceType: 'journal',
      sourceId: `chat-${Date.now()}`,
      text: question,
      createdAt: new Date(),
    });
    queryEmbedding = features?.embedding;
  } catch (_) {
    queryEmbedding = null;
  }

  const scored = candidateMemories
    .map((memory) => {
      const emb = memory.embedding;
      const hasEmb = Array.isArray(emb) && emb.length > 0;
      const similarity = queryEmbedding && hasEmb ? cosineSimilarity(queryEmbedding, emb) : 0;
      return { ...memory, similarity };
    })
    .sort((a, b) => {
      if (b.similarity !== a.similarity) return b.similarity - a.similarity;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return scored.slice(0, topK);
}

async function handleChat({ question, memories, personality, mode, timestamp, recallRange }) {
  let cleanMemories = filterMemories(memories, { minLen: 3 });
  cleanMemories = rankMemories(cleanMemories, question).slice(0, 24);

  const questionType = detectQuestionType(question);

  let recallEmpty = false;
  let selectedMemories = pickGroundedMemories(question, cleanMemories, recallRange);

  if (recallRange) {
    recallEmpty = selectedMemories.length === 0;
  }

  const dbContextEmpty = cleanMemories.length === 0;

  const prompt = buildSmartPrompt({
    question,
    memories: selectedMemories,
    personality: personality || {},
    mode,
    questionType,
    timestamp,
    recallEmpty,
    recallRangeLabel: recallRange?.label,
    recallRange,
    dbContextEmpty,
  });

  try {
    const response = await generateLLMResponse(prompt);
    if (response && response.trim().length > 8) {
      return {
        response,
        source: 'groq',
        questionType,
        usedMemories: selectedMemories,
      };
    }
    throw new Error('empty llm response');
  } catch (err) {
    const meta = err?.meta || {};
    const status = meta.status || 'unknown';
    const reason = meta.reason || err?.message || 'unknown error';
    const errorData = meta.data ? JSON.stringify(meta.data).slice(0, 200) : 'no data';
    logger.warn(
      `Groq response failed in handleChat: ${reason} (status: ${status}, data: ${errorData})`
    );
    return {
      response: buildSafeFallback({
        questionType,
        question,
        memories: selectedMemories,
        recallEmpty,
        recallRangeLabel: recallRange?.label,
        dbContextEmpty,
      }),
      source: 'fallback',
      questionType,
      usedMemories: selectedMemories,
    };
  }
}

async function callMl(endpoint, body) {
  const mlBase = (process.env.ML_SERVICE_URL || DEFAULT_ML_URL).replace(/\/$/, '');
  const f = await getFetch();
  const timeoutMs = Number(process.env.ML_SERVICE_TIMEOUT_MS || 120000);
  const retries = Number(process.env.ML_SERVICE_RETRIES || 1);
  const max429Retries = Number(process.env.ML_SERVICE_429_RETRIES || 3); // Specific 429 retries

  let resp;
  let lastErr = null;
  let attempts429 = 0;

  // Exponential backoff for 429s
  while (attempts429 < max429Retries) {
    let attempt = 0;
    while (attempt <= retries) {
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

        // If got 429, break inner loop and retry with backoff
        if (resp.status === 429) {
          clearTimeout(timeout);
          break;
        }
        // Success or other response, exit both loops
        return resp;
      } catch (e) {
        clearTimeout(timeout);
        lastErr = e;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 800));
        }
        attempt += 1;
      }
    }

    // If we got a 429, apply exponential backoff and retry
    if (resp && resp.status === 429) {
      attempts429 += 1;
      if (attempts429 < max429Retries) {
        const backoffMs = Math.min(5000, 500 * Math.pow(2, attempts429 - 1));
        logger.warn(`ML service rate-limited (429), retrying in ${backoffMs}ms (attempt ${attempts429}/${max429Retries})`);
        await new Promise((r) => setTimeout(r, backoffMs));
        resp = null; // Reset for next attempt
      }
    } else {
      // Not a 429, break
      break;
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
  const usedPersonality = payload.personality || derivePersonalityFromHistory(payload.personalityHistory);

  const anchor = payload.timestamp || new Date();
  const recallRange = parseRecallTimeRange(message, anchor);

  const rawFromDb = await fetchRawMemoriesForChat(userId, mode, anchor);
  const augmentedCandidates = dedupeMemoriesById(payload.candidateMemories, rawFromDb);

  let recallPinned = [];
  if (recallRange) {
    recallPinned = augmentedCandidates
      .filter((m) => {
        const inst = memoryInstant(m);
        return inst && inst >= recallRange.start && inst < recallRange.end;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 18)
      .map((m) => ({
        ...m,
        content: m.text || m.content || '',
      }));

    if (!recallPinned.length) {
      recallPinned = await fetchRecallFallbackFromDb(userId, recallRange);
    }
  }

  const retrieved = await retrieveRelevantMemories({
    userId,
    question: message,
    candidateMemories: augmentedCandidates,
    topK: 28,
  });

  const mergedMemories = dedupeMemoriesById(recallPinned, retrieved);

  const chat = await handleChat({
    question: message,
    memories: mergedMemories,
    personality: usedPersonality,
    mode,
    timestamp: anchor,
    recallRange,
  });

  logger.info(
    `[AI_CHAT] source=${chat.source} type=${chat.questionType} user=${userId} mode=${mode} rawDb=${rawFromDb.length} candidates=${augmentedCandidates.length} retrieved=${retrieved.length} used=${chat.usedMemories.length}`
  );

  return {
    mode,
    response: chat.response,
    citations: chat.usedMemories.map((m) => ({
      id: m.id,
      sourceType: m.sourceType,
      createdAt: m.createdAt,
      excerpt: (m.content || m.text || '').slice(0, 240),
      similarity: m.similarity || 0,
    })),
    usedPersonality,
  };
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


