# Backend — Agentic Government Scheme Eligibility Assistant

Flask backend powered by a **LangGraph multi-agent pipeline** using Gemini 1.5 Flash
and ChromaDB for RAG-based scheme retrieval.

## Stack

| Component       | Technology                          |
|-----------------|-------------------------------------|
| API framework   | Flask 3.1 + flask-cors              |
| LLM             | Gemini 1.5 Flash (via LangChain)    |
| Agent workflow  | LangGraph StateGraph                |
| Vector store    | ChromaDB (local persistent)         |
| Embeddings      | all-MiniLM-L6-v2 (auto-downloaded)  |

## Setup

**1. Install dependencies**
```bash
pip install -r backend/requirements.txt
```

**2. Set your Gemini API key**
```bash
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```
Get a free key at: https://aistudio.google.com/apikey

**3. Seed ChromaDB (run once)**
```bash
python backend/agents/seed.py
```
This embeds 20 Indian government scheme documents into the local vector store.

**4. Start the server**
```bash
python -m backend.app
```
Runs on `http://127.0.0.1:5000`

## Agent Pipeline

```
POST /api/check-eligibility
         │
         ▼
  ┌─────────────────────┐
  │  EligibilityAgent   │  Gemini LLM — analyses profile, identifies
  │                     │  eligible scheme categories
  └────────┬────────────┘
           │ eligible_categories
           ▼
  ┌─────────────────────┐
  │   RAGSearchAgent    │  ChromaDB — semantic search over 20 scheme
  │                     │  documents using enhanced query
  └────────┬────────────┘
           │ retrieved_documents
           ▼
  ┌─────────────────────┐
  │ RecommendationAgent │  Gemini LLM — generates personalised
  │                     │  recommendations with eligibility match,
  │                     │  benefits, documents, apply links
  └────────┬────────────┘
           │ final_response → parsed into scheme cards
           ▼
       JSON response
```

## API Endpoints

### `POST /api/check-eligibility`

**Request:**
```json
{
  "full_name":            "Ravi Kumar",
  "age":                  35,
  "gender":               "Male",
  "state":                "Uttar Pradesh",
  "district":             "Lucknow",
  "annual_family_income": 90000,
  "occupation":           "Farmer",
  "category":             "OBC",
  "disability_status":    "No"
}
```

**Response:**
```json
{
  "status": "success",
  "processing_time_ms": 3200,
  "agent_status": {
    "eligibility_agent":    "complete",
    "retrieval_agent":      "complete",
    "recommendation_agent": "complete"
  },
  "agent_logs": [
    {"time": "00:01.234", "agent": "EligibilityAgent", "message": "..."},
    ...
  ],
  "schemes": [
    {
      "name":               "PM Kisan Samman Nidhi",
      "match_percent":      92,
      "description":        "...",
      "benefits":           ["..."],
      "required_documents": ["..."],
      "apply_url":          "https://pmkisan.gov.in/"
    }
  ],
  "llm_full_response": "...",
  "meta": {
    "detected_categories": ["Farmer Welfare", "Financial Inclusion"],
    "retrieved_sources":   ["..."],
    "schemes_returned":    4
  }
}
```

### `GET /api/health`
```json
{"status": "ok", "service": "gov-scheme-eligibility-backend"}
```

### `GET /api/schemes`
Returns IDs and count of all seeded ChromaDB documents.

## Running with the React frontend

**Terminal 1 — Flask:**
```bash
python -m backend.app
```

**Terminal 2 — Vite:**
```bash
npm run dev
```

Toggle **"Use Mock Data"** off in the UI to call the real backend.
All `/api/*` requests are proxied automatically by Vite to `http://127.0.0.1:5000`.
