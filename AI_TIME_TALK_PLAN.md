# PastPort AI ?Time Talk? ? Implementation Plan

This document describes a complete, practical approach to add an AI feature that lets a user ?talk? with their past, present, and future self using the context stored in journals and time capsules.

---

## 1) Goals

- Let users ask questions and receive answers grounded in their own journals and capsules.
- Provide three ?modes? (Past / Present / Future) with different context filters.
- Keep answers accurate, safe, and constrained to the user?s data.
- Make the feature scalable and cost?controlled.

---

## 2) Core UX

### 2.1 Entry Points

- **New page**: ?Time Talk? (AI Chat) in the main navigation.
- **Optional**: A ?Ask AI? button on journal/capsule views that pre?loads context.

### 2.2 Modes

- **Past**: Use entries dated **before today**; prefer older content.
- **Present**: Use entries from **last 30?90 days**.
- **Future**: Use **future?locked capsules** or ?goal?/?plans? tagged items; optionally allow unlocked future notes.

### 2.3 Chat Behavior

- The assistant only answers from the user?s stored content.
- If insufficient context exists, it says so and asks follow?ups.
- Provide citations to source items (journal entry date, capsule title) so the user can see provenance.

---

## 3) Data & Models

### 3.1 New Model: AIConversation

**Collection**: `ai_conversations`

Fields:
- `userId`: ObjectId, required
- `mode`: "past" | "present" | "future"
- `title`: string (optional, auto?generated)
- `messages`: array of:
  - `role`: "user" | "assistant" | "system"
  - `content`: string
  - `createdAt`: Date
  - `sources`: array of { type: "journal"|"capsule", id, title, date }
- `createdAt`, `updatedAt`

### 3.2 Optional Model: AIUsage

Track tokens/cost per user/day for limits.

---

## 4) Retrieval Strategy (Context Building)

### 4.1 Source Data

- **Journals**: `JournalEntry` (content, date, mood, tags)
- **Capsules**: `Capsule` (message, unlockDate, isUnlocked, category, tags)

### 4.2 Filters per Mode

- **Past**: `date < today` AND `isUnlocked === true`
- **Present**: `date >= today-90 days` AND `isUnlocked === true`
- **Future**: `unlockDate > today` (use metadata only) OR unlocked goal/plan entries

### 4.3 Simple Relevance Scoring (MVP)

- Split user question into keywords.
- Search on `content` / `message` using Mongo text index.
- Score by:
  - keyword hits
  - recency (if mode=present)
  - past distance (if mode=past)
  - tag match

### 4.4 Advanced Retrieval (Phase 2)

- Use vector embeddings for entries (stored in DB).
- Retrieve top?k semantic matches per mode.
- Re?rank with keyword + recency.

---

## 5) AI Provider Integration

### 5.1 Adapter Pattern

Create a small `aiClient` module in backend:

- `generateAnswer({ question, mode, context, systemPrompt })`
- Isolate provider (OpenAI/Anthropic/Gemini/local) in a single file.

### 5.2 Prompt Structure (MVP)

System prompt outline:

- You are the user?s {mode} self.
- Only use provided context.
- If missing info, say you don?t know and ask for clarification.
- Provide short references to sources.

User message:
- The question asked.

Context:
- Summarized bullet list of the top N entries.

---

## 6) Backend API Design

### 6.1 POST /api/ai/chat

Request:
```json
{
  "mode": "past",
  "message": "How did I feel before my first semester?",
  "conversationId": "optional"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "conversationId": "...",
    "reply": "...",
    "sources": [
      { "type": "journal", "id": "...", "title": "", "date": "2025-09-12" }
    ]
  }
}
```

### 6.2 GET /api/ai/conversations

Returns conversation list for user.

### 6.3 GET /api/ai/conversations/:id

Returns chat history + sources.

---

## 7) Frontend Implementation

### 7.1 New Page

`/time-talk`

Components:
- Mode selector (Past / Present / Future)
- Chat window (messages with sources)
- Input box + send button
- Conversation sidebar (optional)

### 7.2 API Client

Add methods:
- `aiChat({ mode, message, conversationId })`
- `getAIConversations()`
- `getAIConversation(id)`

### 7.3 Source Linking

- For each AI reply, show ?Based on:? with links to journal/capsule detail pages.

---

## 8) Safety & Privacy

- Only use **user?s own** data.
- Exclude locked capsules unless explicitly allowed.
- Strip HTML, scripts in content (already done in backend).
- Add rate limiting on AI endpoints.
- Store minimal chat history if user opts out.

---

## 9) Step?By?Step Build Plan

### Phase 1: MVP (1?2 weeks)

1. Create new backend route `/api/ai/chat`.
2. Implement retrieval (Mongo text index + filters).
3. Build AI adapter with a provider or mock response.
4. Add ?Time Talk? page with chat UI.
5. Display sources in answers.

### Phase 2: Better Retrieval (2?3 weeks)

1. Add embeddings + vector search.
2. Add re?ranking and summarization.
3. Add conversation persistence (AIConversation model).

### Phase 3: Personalization

1. Memory summaries per month/year.
2. AI ?self? personality tuning (tone sliders).
3. Push suggestions (e.g., ?Write to your future self?).

---

## 10) Open Decisions (Confirm Before Building)

- Provider: OpenAI / Anthropic / Gemini / Local?
- Use locked capsules for ?future self??
- Save conversations or keep stateless?
- Maximum context window per response?

---

## 11) Example Behavior

**User**: ?What advice did I give myself about exams??

**Assistant (Past)**:
?From your journal on 2025?11?04, you wrote that staying consistent mattered more than last?minute cramming. You also mentioned taking short breaks to stay calm. Would you like me to pull the full entry??

Sources:
- Journal: 2025?11?04

---

## 12) Minimal Schema Additions (Mongo Indexes)

- `JournalEntry`: text index on `content` and `tags`.
- `Capsule`: text index on `message` and `tags`.

---

## 13) Suggested File Locations

Backend:
- `backend/controllers/aiController.js`
- `backend/routes/ai.js`
- `backend/utils/aiClient.js`
- `backend/models/AIConversation.js`

Frontend:
- `frontend/src/pages/TimeTalk.tsx`
- `frontend/src/components/TimeTalkChat.tsx`
- `frontend/src/lib/api.js` (add ai endpoints)

---

## 14) Summary

This plan keeps the AI grounded in the user?s personal data, provides clear modes for ?past/present/future,? and can start with a simple retrieval approach that scales into semantic search later. It also respects privacy and avoids hallucinations by strictly limiting context.
