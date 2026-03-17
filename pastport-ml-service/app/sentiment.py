from __future__ import annotations

from typing import Tuple, Literal

from .models import get_sentiment_pipeline


def analyze_sentiment(text: str) -> Tuple[Literal["positive", "negative"], float]:
    pipe = get_sentiment_pipeline()
    out = pipe(text[:4000])[0]  # avoid very long inputs for transformer
    label = out["label"].lower()  # POSITIVE/NEGATIVE
    score = float(out["score"])
    if label not in ("positive", "negative"):
        # fallback
        label = "positive" if score >= 0.5 else "negative"
    return label, score


