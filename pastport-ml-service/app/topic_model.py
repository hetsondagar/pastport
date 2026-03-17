from __future__ import annotations

from typing import List

import re

import numpy as np
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer


THEME_KEYWORDS = {
    "career": ["intern", "job", "career", "work", "office", "resume", "interview", "boss", "team", "project"],
    "relationships": ["friend", "friends", "relationship", "partner", "girlfriend", "boyfriend", "family", "mom", "dad", "sister", "brother"],
    "health": ["sleep", "diet", "exercise", "gym", "health", "doctor", "anxiety", "stress", "panic", "therapy"],
    "learning": ["study", "learn", "class", "course", "homework", "exam", "school", "college", "practice", "skill"],
    "stress": ["stress", "overwhelmed", "burnout", "tired", "pressure", "worried", "scared", "deadline"],
    "goals": ["goal", "plan", "dream", "future", "commit", "habit", "discipline", "progress", "improve"],
}


def _clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text


def detect_topics(texts: List[str], n_topics: int = 6) -> List[List[str]]:
    """
    Unsupervised topic modeling (TF-IDF + NMF) + mapping to PastPort themes via keyword overlap.
    Returns list of theme labels per input text.
    """
    if not texts:
        return []

    cleaned = [_clean(t)[:6000] for t in texts]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2),
        min_df=1,
    )
    X = vectorizer.fit_transform(cleaned)

    # If we have too few docs, skip NMF and do keyword matching only.
    if X.shape[0] < 5:
        return [_keyword_topics(t) for t in cleaned]

    nmf = NMF(n_components=min(n_topics, max(2, X.shape[0] - 1)), random_state=42, init="nndsvda", max_iter=400)
    W = nmf.fit_transform(X)
    H = nmf.components_
    feature_names = np.array(vectorizer.get_feature_names_out())

    # Get top terms per topic
    top_terms_per_topic = []
    for topic_idx in range(H.shape[0]):
        top = feature_names[np.argsort(H[topic_idx])[-12:]].tolist()
        top_terms_per_topic.append(top)

    results: List[List[str]] = []
    for i, text in enumerate(cleaned):
        # Pick dominant NMF topic
        dominant_topic = int(np.argmax(W[i]))
        terms = top_terms_per_topic[dominant_topic]
        themes = _map_terms_to_themes(terms) or _keyword_topics(text)
        results.append(themes[:3] if themes else ["other"])
    return results


def detect_topics_single(text: str) -> List[str]:
    # Run lightweight keyword mapping for single entry (faster for per-entry pipeline).
    return _keyword_topics(_clean(text))[:3] or ["other"]


def _map_terms_to_themes(terms: List[str]) -> List[str]:
    term_set = set(terms)
    scored = []
    for theme, kws in THEME_KEYWORDS.items():
        overlap = sum(1 for k in kws if k in term_set)
        if overlap > 0:
            scored.append((theme, overlap))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [t for t, _ in scored]


def _keyword_topics(text: str) -> List[str]:
    scored = []
    tokens = set(re.findall(r"[a-z']+", text.lower()))
    for theme, kws in THEME_KEYWORDS.items():
        overlap = sum(1 for k in kws if k in tokens)
        if overlap > 0:
            scored.append((theme, overlap))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [t for t, _ in scored]


