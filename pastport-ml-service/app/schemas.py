from __future__ import annotations

from datetime import datetime
from typing import Literal, List, Optional, Dict, Any

from pydantic import BaseModel, Field


class ProcessEntryRequest(BaseModel):
    userId: str
    sourceType: Literal["journal", "capsule"] = "journal"
    sourceId: str
    text: str = Field(min_length=1, max_length=20000)
    createdAt: datetime


class ProcessEntryResponse(BaseModel):
    embedding: List[float]
    sentimentLabel: Literal["positive", "negative"]
    sentimentScore: float
    emotionLabel: Literal["joy", "sadness", "anger", "fear", "surprise", "neutral"]
    emotionScore: float
    topics: List[str]


class MemoryForRetrieval(BaseModel):
    id: str
    sourceType: Literal["journal", "capsule"]
    createdAt: datetime
    text: str
    embedding: List[float]

    # Optional metadata that can improve prompt conditioning
    sentimentScore: Optional[float] = None
    emotionLabel: Optional[str] = None
    topics: Optional[List[str]] = None


class PersonalityVector(BaseModel):
    optimismScore: float = 0.5
    ambitionScore: float = 0.5
    anxietyScore: float = 0.5
    reflectionScore: float = 0.5
    socialFocusScore: float = 0.5
    extra: Dict[str, Any] = Field(default_factory=dict)


class ChatRequest(BaseModel):
    userId: str
    mode: Literal["past", "present", "future"]
    timestamp: Optional[datetime] = None  # used for past/present anchoring
    message: str = Field(min_length=1, max_length=4000)
    candidateMemories: List[MemoryForRetrieval] = Field(default_factory=list)
    personality: Optional[PersonalityVector] = None

    # When mode=future, pass historical monthly personality states for forecasting
    # Format: [{"ds": "2024-01-01", "optimismScore": 0.6, ...}, ...]
    personalityHistory: Optional[List[Dict[str, Any]]] = None
    forecastYears: int = 3


class Citation(BaseModel):
    id: str
    sourceType: Literal["journal", "capsule"]
    createdAt: datetime
    excerpt: str
    similarity: float


class ChatResponse(BaseModel):
    mode: Literal["past", "present", "future"]
    response: str
    citations: List[Citation]
    usedPersonality: PersonalityVector


