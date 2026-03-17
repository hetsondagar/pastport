from __future__ import annotations

from datetime import datetime
from typing import List, Tuple

from .schemas import ChatRequest, ChatResponse, Citation, PersonalityVector, MemoryForRetrieval
from .embedding import embed_text
from .retrieval import rank_memories
from .forecast import forecast_personality
from .models import get_generation_pipeline


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
    out = gen(prompt, max_new_tokens=220, do_sample=False)[0]["generated_text"]
    return out.strip()


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
    response_text = _generate_text(prompt)

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


