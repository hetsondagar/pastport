from __future__ import annotations

from .schemas import ProcessEntryRequest, ProcessEntryResponse
from .embedding import embed_text
from .sentiment import analyze_sentiment
from .emotion import classify_emotion
from .topic_model import detect_topics_single


def process_entry(payload: ProcessEntryRequest) -> ProcessEntryResponse:
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


