import axios from 'axios';
import logger from '../config/logger.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** When GROQ_MODEL is unset, or set to a removed ID — see console.groq.com/docs/models */
const DEFAULT_MODEL_FALLBACK = 'openai/gpt-oss-120b';

/**
 * Ordered fallbacks: GPT-OSS production first (Groq’s recommended replacements),
 * then smaller OSS, then Qwen; Llama 3.3 last for accounts where Llama 3.1 fails.
 */
const FALLBACK_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3-32b',
  'llama-3.3-70b-versatile',
];

/** Stripped from GROQ_MODEL / GROQ_MODEL_CANDIDATES so old env vars cannot resurrect broken IDs */
const LEGACY_MODEL_IDS = new Set([
  'mixtral-8x7b-32768',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'llama-3.1-70b-versatile',
]);

let hasLoggedGroqConfig = false;

function diagnosticsEnabled() {
  return (process.env.GROQ_DIAGNOSTIC_LOGS || '1') !== '0';
}

function maskApiKey(key = '') {
  const trimmed = key.trim();
  if (!trimmed) return 'missing';
  if (trimmed.length <= 10) return `${trimmed.slice(0, 2)}***${trimmed.slice(-2)}`;
  return `${trimmed.slice(0, 6)}***${trimmed.slice(-4)}`;
}

function resolvePrimaryModel() {
  const fromEnv = (process.env.GROQ_MODEL || '').trim();
  if (fromEnv && !LEGACY_MODEL_IDS.has(fromEnv)) return fromEnv;
  return DEFAULT_MODEL_FALLBACK;
}

function getModelCandidates() {
  const raw = process.env.GROQ_MODEL_CANDIDATES;
  const parsed = (raw ? raw : FALLBACK_MODELS.join(','))
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)
    .filter((m) => !LEGACY_MODEL_IDS.has(m));

  const primary = resolvePrimaryModel();
  let candidates = parsed.length ? parsed : [...FALLBACK_MODELS];
  if (!candidates.includes(primary)) {
    candidates.unshift(primary);
  }
  return [...new Set(candidates)];
}

export async function generateLLMResponse({ userPrompt, systemPrompt }) {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  const modelCandidates = getModelCandidates();

  if (!hasLoggedGroqConfig && diagnosticsEnabled()) {
    logger.warn(
      `[AI_DIAGNOSTIC] Groq config loaded: apiKeyPresent=${Boolean(apiKey)} apiKeyMasked=${maskApiKey(apiKey)} modelCandidates=${modelCandidates.join(',')}`
    );
    hasLoggedGroqConfig = true;
  }

  if (!apiKey) {
    const err = new Error('GROQ_API_KEY is not configured');
    err.statusCode = 500;
    throw err;
  }

  const timeoutMs = Number(process.env.GROQ_TIMEOUT_MS || 20000);
  let lastError = null;

  for (const model of modelCandidates) {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 240,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: timeoutMs,
        }
      );

      const text = response.data?.choices?.[0]?.message?.content?.trim();
      if (text) return text;

      const emptyErr = new Error('Groq returned empty content');
      emptyErr.statusCode = 502;
      emptyErr.meta = { model, timeoutMs };
      throw emptyErr;
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      const errorMsg = err?.response?.data?.error?.message || err?.message || 'unknown';
      if (diagnosticsEnabled()) {
        logger.warn(`[AI_DIAGNOSTIC] Model ${model} failed: ${errorMsg} (status: ${status})`);
      }
      const isModelIssue = status === 400 || status === 404;
      if (!isModelIssue) break;
    }
  }

  const wrapped = new Error('Groq chat completion failed');
  wrapped.statusCode = 502;
  wrapped.meta = {
    modelCandidates,
    timeoutMs,
    reason: lastError?.message,
    status: lastError?.response?.status,
    data: lastError?.response?.data,
  };
  throw wrapped;
}
