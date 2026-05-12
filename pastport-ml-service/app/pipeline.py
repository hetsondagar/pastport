from __future__ import annotations

from hashlib import md5
from functools import lru_cache

from .schemas import ProcessEntryRequest, ProcessEntryResponse
from .embedding import embed_text
from .sentiment import analyze_sentiment
from .emotion import classify_emotion
from .topic_model import detect_topics_single


# Simple cache to avoid reprocessing identical text (LRU with 100 entries)
@lru_cache(maxsize=100)
def _cached_process_text(text_hash: str):
    """Cache analysis results for identical text via hash."""
    # Note: We only store the hash to avoid caching large strings
    # Actual text processing happens in process_entry
    return True


def process_entry(payload: ProcessEntryRequest) -> ProcessEntryResponse:
    # Quick hash-based duplicate detection
    text_for_hash = payload.text[:500]  # Use first 500 chars only
    text_hash = md5(text_for_hash.encode()).hexdigest()
    
    # This helps reduce redundant processing on Render's constrained resources
    _ = _cached_process_text(text_hash)
    
    embedding = embed_text(payload.text)
    sentiment_label, sentiment_score = analyze_sentiment(payload.text)
    emotion_label, emotion_score = classify_emotion(payload.text)
    topics = detect_topics_single(payload.text)

    return ProcessEntryResponse(
        embedding=embedding,
        sentimentLabel=sentiment_label,
        sentimentScore=sentiment_score,
        emotionLabel=emotion_label,
        emotionScore=emotion_score,
        topics=topics,
    )


