from __future__ import annotations

from datetime import datetime
from typing import List, Tuple
import re

from .schemas import ChatRequest, ChatResponse, Citation, PersonalityVector, MemoryForRetrieval
from .embedding import embed_text
from .retrieval import rank_memories
from .forecast import forecast_personality
from .models import get_generation_pipeline
from .runtime import fast_mode_enabled


def _mode_header(mode: str, ts: datetime | None) -> str:
    if mode == "past" and ts:
        return f"You are the user's Past Self from {ts.year}."
    if mode == "present":
        return "You are the user's Present Self."
    if mode == "future" and ts:
        return f"You are the user's Future Self, imagining the year {ts.year} and beyond."
    if mode == "future":
        return "You are the user's Future Self."
    return "You are the user's self."


def _format_personality(p: PersonalityVector) -> str:
    return (
        f"optimism {p.optimismScore:.2f}\n"
        f"ambition {p.ambitionScore:.2f}\n"
        f"anxiety {p.anxietyScore:.2f}\n"
        f"reflection {p.reflectionScore:.2f}\n"
        f"socialFocus {p.socialFocusScore:.2f}"
    )


def _excerpt(text: str, n: int = 260) -> str:
    t = " ".join(text.strip().split())
    return t[:n] + ("…" if len(t) > n else "")


def _compact(text: str) -> str:
    return " ".join((text or "").split()).strip()


def _short_date(ts: datetime) -> str:
    return ts.strftime("%B %d").replace(" 0", " ")


def _question_terms(question: str) -> set[str]:
    stop = {
        "the", "a", "an", "to", "of", "in", "on", "for", "with", "and", "or", "is", "are", "was",
        "were", "do", "did", "what", "when", "how", "why", "am", "i", "my", "me", "this", "that",
        "it", "you", "we", "our", "should", "week", "about", "right", "now"
    }
    tokens = re.findall(r"[a-zA-Z']+", (question or "").lower())
    return {tok for tok in tokens if len(tok) > 2 and tok not in stop}


def _score_memory_for_question(question: str, memory_text: str, sim_score: float) -> float:
    q_terms = _question_terms(question)
    if not q_terms:
        return sim_score
    m_tokens = set(re.findall(r"[a-zA-Z']+", (memory_text or "").lower()))
    overlap = len(q_terms & m_tokens)
    # Keep retrieval signal dominant; keyword overlap fine-tunes ranking.
    return (sim_score * 10.0) + float(overlap)


def _ranked_memories_for_fast_mode(
    question: str,
    ranked: List[Tuple[MemoryForRetrieval, float]],
    limit: int = 3,
) -> List[Tuple[MemoryForRetrieval, float]]:
    if not ranked:
        return []
    rescored = sorted(
        ranked,
        key=lambda item: _score_memory_for_question(question, item[0].text, item[1]),
        reverse=True,
    )
    return rescored[:limit]


def _personality_prefix(personality: PersonalityVector) -> str:
    if personality.anxietyScore > 0.6:
        return "It makes sense you're feeling uncertain."
    if personality.optimismScore > 0.7:
        return "You've been handling things well."
    if personality.ambitionScore > 0.75:
        return "You're clearly pushing yourself in a meaningful direction."
    return ""


def _mode_intro(mode: str) -> str:
    if mode == "past":
        return "Looking back,"
    if mode == "future":
        return "From where you're heading,"
    return ""


def fast_mode_response(
    question: str,
    ranked: List[Tuple[MemoryForRetrieval, float]],
    personality: PersonalityVector,
    mode: str,
) -> str:
    q = (question or "").strip()
    q_lower = q.lower()
    top_memories = _ranked_memories_for_fast_mode(q, ranked, limit=3)

    if not top_memories:
        return "What matters most right now is choosing one clear next step today and following through on it."

    prefix = _personality_prefix(personality)
    intro = _mode_intro(mode)

    def wrap(body: str) -> str:
        parts = [p for p in [prefix, intro, body] if p]
        return " ".join(parts)

    status_markers = ["am i", "did i", "was i", "do i"]
    guidance_markers = ["what should", "how should", "focus", "next step", "this week"]
    fact_markers = ["what", "when", "did", "was", "happened", "result", "exam"]

    # Explicit status intent for yes/no style questions.
    if any(m in q_lower for m in status_markers):
        status_keywords = ["breakup", "broken up", "job", "exam", "result", "passed", "failed"]
        target = next((kw for kw in status_keywords if kw in q_lower), None)
        if target:
            for mem, _ in top_memories:
                mt = mem.text.lower()
                if target in mt or (target == "broken up" and "breakup" in mt):
                    body = f"Yes, on {_short_date(mem.createdAt)} you mentioned that {_excerpt(_compact(mem.text), 150)}."
                    return wrap(body)

        mem, _ = top_memories[0]
        body = f"Based on {_short_date(mem.createdAt)}, you wrote that {_excerpt(_compact(mem.text), 150)}."
        return wrap(body)

    # Guidance intent should blend 2-3 memories into one direct suggestion.
    if any(m in q_lower for m in guidance_markers):
        top_texts = [_compact(m.text) for m, _ in top_memories[:2] if _compact(m.text)]
        first_mem, _ = top_memories[0]
        if len(top_texts) >= 2:
            body = (
                f"A strong focus this week is to build on {_excerpt(top_texts[0], 110)} while making room for {_excerpt(top_texts[1], 100)}. "
                f"That balance fits what you were navigating around {_short_date(first_mem.createdAt)}."
            )
            return wrap(body)

        body = (
            f"This week, focus on the next concrete move from {_excerpt(top_texts[0], 130)}. "
            f"You already pointed to this around {_short_date(first_mem.createdAt)}."
        )
        return wrap(body)

    # Fact intent: answer with the most relevant memory detail.
    if any(m in q_lower for m in fact_markers):
        mem, _ = top_memories[0]
        body = f"On {_short_date(mem.createdAt)}, you noted that {_excerpt(_compact(mem.text), 170)}."
        return wrap(body)

    # Default: concise, personalized reflection anchored in the best memory.
    mem, _ = top_memories[0]
    body = (
        f"The clearest answer right now comes from {_short_date(mem.createdAt)}: {_excerpt(_compact(mem.text), 170)}. "
        "Use that as your anchor for your next decision."
    )
    return wrap(body)


def _build_prompt(mode: str, ts: datetime | None, pv: PersonalityVector, ranked: List[Tuple[MemoryForRetrieval, float]], user_msg: str) -> str:
    mem_lines = []
    for m, s in ranked:
        mem_lines.append(f"- [{m.createdAt.date().isoformat()}] ({m.sourceType}) { _excerpt(m.text, 240) }")
    memories_block = "\n".join(mem_lines) if mem_lines else "- (no relevant memories found)"

    header = _mode_header(mode, ts)
    prompt = f"""{header}

Personality traits (0..1):
{_format_personality(pv)}

Relevant memories (chronological context; do not invent details outside these):
{memories_block}

User question:
{user_msg}

Instructions:
- Answer as that self (tone + knowledge constraints).
- Be specific, grounded in memories when possible.
- If uncertain, say what you would do next rather than hallucinating.
- Include 1-3 short citations inline like: (Mar 2023 journal) when referencing a memory.
"""
    return prompt


def _generate_text(prompt: str) -> str:
    gen = get_generation_pipeline()
    out = gen(prompt, max_new_tokens=128, do_sample=False, clean_up_tokenization_spaces=False)[0]["generated_text"]
    return out.strip()


def _fallback_text(mode: str, ranked: List[Tuple[MemoryForRetrieval, float]], user_msg: str, personality: PersonalityVector) -> str:
    return fast_mode_response(user_msg, ranked, personality, mode)


def generate_chat_response(payload: ChatRequest) -> ChatResponse:
    ts = payload.timestamp

    # Determine personality vector
    used_personality = payload.personality or PersonalityVector()
    if payload.mode == "future" and payload.personalityHistory:
        forecast = forecast_personality(payload.personalityHistory, years=max(1, min(5, payload.forecastYears)))
        used_personality = PersonalityVector(**forecast)

    # Retrieval
    q_emb = embed_text(payload.message)
    ranked = rank_memories(q_emb, payload.candidateMemories, top_k=5)

    # Prompt + generation
    prompt = _build_prompt(payload.mode, ts, used_personality, ranked, payload.message)
    try:
        if fast_mode_enabled():
            response_text = fast_mode_response(payload.message, ranked, used_personality, payload.mode)
        else:
            response_text = _generate_text(prompt)
    except Exception:
        response_text = _fallback_text(payload.mode, ranked, payload.message, used_personality)

    # Citations
    citations: List[Citation] = []
    for m, s in ranked:
        citations.append(
            Citation(
                id=m.id,
                sourceType=m.sourceType,
                createdAt=m.createdAt,
                excerpt=_excerpt(m.text, 240),
                similarity=float(s),
            )
        )

    return ChatResponse(mode=payload.mode, response=response_text, citations=citations, usedPersonality=used_personality)


