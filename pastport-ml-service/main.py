from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from collections import deque

from app.schemas import ProcessEntryRequest, ProcessEntryResponse, ChatRequest, ChatResponse
from app.pipeline import process_entry
from app.chat_engine import generate_chat_response


app = FastAPI(title="PastPort ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request queue for rate limiting on constrained resources
_request_queue = deque()
_max_concurrent = 2  # Limit concurrent transformer model executions
_active_requests = 0
_queue_lock = asyncio.Lock()


async def _acquire_request_slot():
    """Acquire a slot from the request queue. Blocks if at capacity."""
    global _active_requests
    async with _queue_lock:
        while _active_requests >= _max_concurrent:
            await asyncio.sleep(0.1)
        _active_requests += 1


async def _release_request_slot():
    """Release a slot from the request queue."""
    global _active_requests
    async with _queue_lock:
        _active_requests = max(0, _active_requests - 1)


@app.get("/health")
def health():
    return {"success": True, "service": "pastport-ml-service", "active_requests": _active_requests}


@app.post("/process-entry", response_model=ProcessEntryResponse)
async def process_entry_route(payload: ProcessEntryRequest):
    """Process journal/capsule entry with rate limiting on constrained resources."""
    if _active_requests >= _max_concurrent:
        raise HTTPException(status_code=429, detail="Service overloaded, please retry in a moment")
    
    await _acquire_request_slot()
    try:
        return process_entry(payload)
    finally:
        await _release_request_slot()


@app.post("/chat", response_model=ChatResponse)
async def chat_route(payload: ChatRequest):
    """Generate chat response with rate limiting on constrained resources."""
    if _active_requests >= _max_concurrent:
        raise HTTPException(status_code=429, detail="Service overloaded, please retry in a moment")
    
    await _acquire_request_slot()
    try:
        return generate_chat_response(payload)
    finally:
        await _release_request_slot()


