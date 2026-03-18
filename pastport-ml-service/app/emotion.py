from __future__ import annotations

from typing import Tuple, Literal
import re
import os

from .models import get_emotion_pipeline

EmotionLabel = Literal["joy", "sadness", "anger", "fear", "surprise", "neutral"]


EMOTION_LEXICON = {
    "joy": {"happy", "joy", "grateful", "excited", "delighted", "peaceful", "hopeful"},
    "sadness": {"sad", "down", "lonely", "hurt", "cry", "heartbroken"},
    "anger": {"angry", "mad", "furious", "annoyed", "frustrated"},
    "fear": {"anxious", "afraid", "scared", "worried", "panic", "nervous"},
    "surprise": {"surprised", "shocked", "unexpected", "amazed"},
}

def _heuristic_emotion(text: str) -> Tuple[EmotionLabel, float]:
    tokens = re.findall(r"[a-zA-Z']+", (text or "").lower())
    if not tokens:
        return "neutral", 0.55

    scores = {k: 0 for k in EMOTION_LEXICON.keys()}
    for tok in tokens:
        for emo, words in EMOTION_LEXICON.items():
            if tok in words:
                scores[emo] += 1

    best = max(scores.items(), key=lambda x: x[1])
    if best[1] == 0:
        return "neutral", 0.55

    label = best[0]
    strength = min(0.95, 0.6 + (best[1] / max(1, len(tokens))) * 4)
    return label, float(strength)


def classify_emotion(text: str) -> Tuple[EmotionLabel, float]:
    val = (os.getenv("PASTPORT_ML_FAST_MODE") or "").strip().lower()
    render = (os.getenv("RENDER") or "").strip().lower() == "true"
    if val in {"1", "true", "yes", "on"} or (render and val not in {"0", "false", "no", "off"}):
        return _heuristic_emotion(text)

    try:
        pipe = get_emotion_pipeline()
        raw = pipe(text[:4000])
        candidates = raw[0] if raw and isinstance(raw[0], list) else raw
        best = max(candidates, key=lambda x: x["score"])
        label = best["label"].lower()
        score = float(best["score"])

        if label not in ("joy", "sadness", "anger", "fear", "surprise", "neutral"):
            label = "neutral"
        return label, score
    except Exception:
        return _heuristic_emotion(text)


