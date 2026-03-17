from __future__ import annotations

from functools import lru_cache

from sentence_transformers import SentenceTransformer
from transformers import pipeline


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    # all-MiniLM-L6-v2 as required
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def get_sentiment_pipeline():
    # distilbert-base-uncased-finetuned-sst-2-english as required
    return pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")


@lru_cache(maxsize=1)
def get_emotion_pipeline():
    # j-hartmann/emotion-english-distilroberta-base as required
    return pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)


@lru_cache(maxsize=1)
def get_generation_pipeline():
    # Lightweight instruction-ish generator; deterministic-ish with low temperature.
    # (Not specified by prompt; but required to generate an actual chat response.)
    return pipeline("text2text-generation", model="google/flan-t5-base")


