from __future__ import annotations

from typing import Tuple, Literal
import re

from .models import get_sentiment_pipeline


POSITIVE_WORDS = {
    "happy", "grateful", "excited", "hopeful", "calm", "good", "great", "love", "joy", "better", "proud", "peaceful"
}
NEGATIVE_WORDS = {
    "sad", "angry", "anxious", "worried", "stressed", "bad", "terrible", "fear", "upset", "tired", "hurt", "overwhelmed"
}


def _heuristic_sentiment(text: str) -> Tuple[Literal["positive", "negative"], float]:
    tokens = re.findall(r"[a-zA-Z']+", (text or "").lower())
    if not tokens:
        return "positive", 0.5

    pos = sum(1 for t in tokens if t in POSITIVE_WORDS)
    neg = sum(1 for t in tokens if t in NEGATIVE_WORDS)
    total = max(1, pos + neg)

    if pos >= neg:
        score = 0.5 + (pos - neg) / (2 * total)
        return "positive", float(max(0.5, min(0.99, score)))

    score = 0.5 + (neg - pos) / (2 * total)
    return "negative", float(max(0.5, min(0.99, score)))


def analyze_sentiment(text: str) -> Tuple[Literal["positive", "negative"], float]:
    try:
        pipe = get_sentiment_pipeline()
        out = pipe(text[:4000])[0]  # avoid very long inputs for transformer
        label = out["label"].lower()  # POSITIVE/NEGATIVE
        score = float(out["score"])
        if label not in ("positive", "negative"):
            label = "positive" if score >= 0.5 else "negative"
        return label, score
    except Exception:
        return _heuristic_sentiment(text)


