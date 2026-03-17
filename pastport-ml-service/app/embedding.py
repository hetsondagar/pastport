from __future__ import annotations

from typing import List

import numpy as np

from .models import get_embedding_model


def embed_text(text: str) -> List[float]:
    model = get_embedding_model()
    vec = model.encode(text, normalize_embeddings=False)
    return np.asarray(vec, dtype=np.float32).tolist()


