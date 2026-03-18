from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple

import numpy as np

from .schemas import MemoryForRetrieval


def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    # Gracefully handle historic embeddings with different dimensions.
    if a.size == 0 or b.size == 0:
        return 0.0
    if a.shape != b.shape:
        n = min(a.size, b.size)
        if n == 0:
            return 0.0
        a = a[:n]
        b = b[:n]
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-12
    return float(np.dot(a, b) / denom)


def rank_memories(query_embedding: List[float], memories: List[MemoryForRetrieval], top_k: int = 5) -> List[Tuple[MemoryForRetrieval, float]]:
    if not memories:
        return []
    q = np.asarray(query_embedding, dtype=np.float32)
    scored: List[Tuple[MemoryForRetrieval, float]] = []
    for m in memories:
        v = np.asarray(m.embedding, dtype=np.float32)
        s = cosine_sim(q, v)
        scored.append((m, s))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]


