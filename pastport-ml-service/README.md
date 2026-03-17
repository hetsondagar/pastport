## PastPort ML Service (FastAPI)

### Setup

From repo root:

```bash
cd pastport-ml-service
python -m venv .venv
./.venv/Scripts/activate
pip install -r requirements.txt
```

### Run

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Endpoints

- `GET /health`
- `POST /process-entry`: embeddings + sentiment + emotion + topics
- `POST /chat`: time-aware retrieval + personality conditioning + response + citations


