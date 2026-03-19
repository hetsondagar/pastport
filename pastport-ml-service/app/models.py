from __future__ import annotations

from functools import lru_cache

from .runtime import fast_mode_enabled


@lru_cache(maxsize=1)
def get_embedding_model():
    if fast_mode_enabled():
        raise RuntimeError("Embedding model loading is disabled in fast mode")

    # Lazy import keeps startup RSS lower on constrained instances.
    from sentence_transformers import SentenceTransformer

    # all-MiniLM-L6-v2 as required
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def get_sentiment_pipeline():
    if fast_mode_enabled():
        raise RuntimeError("Sentiment pipeline loading is disabled in fast mode")

    from transformers import pipeline

    # distilbert-base-uncased-finetuned-sst-2-english as required
    return pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


@lru_cache(maxsize=1)
def get_emotion_pipeline():
    if fast_mode_enabled():
        raise RuntimeError("Emotion pipeline loading is disabled in fast mode")

    from transformers import pipeline

    # j-hartmann/emotion-english-distilroberta-base as required
    return pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)


@lru_cache(maxsize=1)
def get_generation_pipeline():
    if fast_mode_enabled():
        raise RuntimeError("Generation pipeline loading is disabled in fast mode")

    from transformers import pipeline

    # Use a smaller text2text model to keep memory/latency manageable on Render.
    return pipeline("text2text-generation", model="google/flan-t5-small")


