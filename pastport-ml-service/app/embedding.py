from __future__ import annotations

from typing import List
import re
import os

import numpy as np

from .models import get_embedding_model


EMBED_DIM = 384


def _fast_mode_enabled() -> bool:
    val = (os.getenv("PASTPORT_ML_FAST_MODE") or "").strip().lower()
    if val in {"1", "true", "yes", "on"}:
        return True
    # Render free instances can be slow on first model load; default fast mode there.
    return (os.getenv("RENDER") or "").strip().lower() == "true"


def _lightweight_embed(text: str, dim: int = EMBED_DIM) -> List[float]:
    vec = np.zeros(dim, dtype=np.float32)
    tokens = re.findall(r"[a-zA-Z']+", (text or "").lower())
    if not tokens:
        return vec.tolist()

    for tok in tokens:
        idx = hash(tok) % dim
        vec[idx] += 1.0

    norm = float(np.linalg.norm(vec))
    if norm > 0:
        vec /= norm
    return vec.tolist()


def embed_text(text: str) -> List[float]:
    if _fast_mode_enabled():
        return _lightweight_embed(text)

    try:
        model = get_embedding_model()
        vec = model.encode(text, normalize_embeddings=False)
        return np.asarray(vec, dtype=np.float32).tolist()
    except Exception:
        return _lightweight_embed(text)


