## PastPort ML Service (FastAPI)

### Render Deploy Note

This service is pinned to Python 3.11 via `runtime.txt` and `.python-version`.
If Render still uses another version, set `PYTHON_VERSION=3.11.10` in Render environment variables.

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

### Production Notes (Render)

- `POST /chat` and `POST /process-entry` must be called with `POST` (not `GET`/`HEAD`).
- Set `WEB_CONCURRENCY=1`.
- Use Python 3.11 (`runtime.txt` / `.python-version` already pinned).
- This service uses CPU-only torch wheels via `requirements.txt`.

### Endpoints

- `GET /health`
- `POST /process-entry`: embeddings + sentiment + emotion + topics
- `POST /chat`: time-aware retrieval + personality conditioning + response + citations


