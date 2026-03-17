from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/health")
def health():
    return {"success": True, "service": "pastport-ml-service"}


@app.post("/process-entry", response_model=ProcessEntryResponse)
def process_entry_route(payload: ProcessEntryRequest):
    return process_entry(payload)


@app.post("/chat", response_model=ChatResponse)
def chat_route(payload: ChatRequest):
    return generate_chat_response(payload)


