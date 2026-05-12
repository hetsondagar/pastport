import axios from 'axios';
import logger from '../config/logger.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';
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

function getModelCandidates() {
  const raw = process.env.GROQ_MODEL_CANDIDATES;
  if (!raw) return [DEFAULT_MODEL, 'llama-3.1-70b-versatile', 'llama3-8b-8192'];
  const parsed = raw
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  if (!parsed.length) return [DEFAULT_MODEL];
  if (!parsed.includes(DEFAULT_MODEL)) parsed.unshift(DEFAULT_MODEL);
  return parsed;
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
