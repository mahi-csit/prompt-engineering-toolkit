# Setup Guide

## Prerequisites
- Python 3.11+
- Node.js 18+

## Backend

```bash
cd backend
pip install -r requirements.txt
```

Edit `.env` and add your API keys:
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...
ANTHROPIC_API_KEY=sk-ant-...
```

Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/api/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

## Running Tests

```bash
# Backend integration tests (server must be running)
pip install httpx pytest
pytest tests/test_backend.py -v

# Unit tests
pytest tests/test_prompt_service.py -v

# Frontend tests
cd frontend && npm run test
```
