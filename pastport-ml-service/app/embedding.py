from __future__ import annotations

from typing import List
import re

import numpy as np

from .models import get_embedding_model


EMBED_DIM = 384


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
    try:
        model = get_embedding_model()
        vec = model.encode(text, normalize_embeddings=False)
        return np.asarray(vec, dtype=np.float32).tolist()
    except Exception:
        return _lightweight_embed(text)


