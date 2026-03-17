from __future__ import annotations

from typing import Tuple, Literal

from .models import get_emotion_pipeline

EmotionLabel = Literal["joy", "sadness", "anger", "fear", "surprise", "neutral"]


def classify_emotion(text: str) -> Tuple[EmotionLabel, float]:
    pipe = get_emotion_pipeline()
    # top_k=None returns list of dicts for all labels
    raw = pipe(text[:4000])
    # transformers returns [[{label, score}, ...]] for top_k=None
    candidates = raw[0] if raw and isinstance(raw[0], list) else raw
    best = max(candidates, key=lambda x: x["score"])
    label = best["label"].lower()
    score = float(best["score"])

    # Map to required set (the model already uses these labels)
    if label not in ("joy", "sadness", "anger", "fear", "surprise", "neutral"):
        label = "neutral"
    return label, score


