# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PipelineAI is a web app that accepts messy CSV data and uses Claude AI to detect data quality issues and generate a production-ready Python (pandas) cleaning script.

## Architecture

Two separate deployment targets exist in parallel:

**Vercel deployment** (primary, in `frontend/`):
- React + Vite SPA served statically
- `frontend/api/generate-pipeline.py` — a Vercel serverless function using Python's stdlib `http.server` (no third-party deps, calls Anthropic API via `urllib`)
- `frontend/vercel.json` routes `/api/*` to the serverless function and everything else to `index.html`

**Railway/Heroku deployment** (in `backend/`):
- FastAPI app (`backend/main.py`) served by uvicorn
- Uses the `anthropic` SDK instead of raw `urllib`
- `backend/railway.toml` and `backend/Procfile` configure deployment

Both deployments use model `claude-haiku-4-5-20251001` and share the same prompt structure. The frontend fetch call targets `/api/generate-pipeline` — in Vercel this resolves to the serverless function; in local dev you need to run the backend separately.

## Development Commands

### Frontend
```bash
cd frontend
npm install
npm run dev       # start Vite dev server (localhost:5173)
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Set `ANTHROPIC_API_KEY` in a `.env` file inside `backend/` (loaded via `python-dotenv`).

### Local dev note
The Vite dev server has no proxy configured, so frontend calls to `/api/generate-pipeline` will 404 in dev. Either:
- Add a proxy in `frontend/vite.config.js` pointing `/api` → `http://localhost:8000`, or
- Test against the deployed Vercel URL directly

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/App.jsx` | Entire frontend — single component with all UI and state |
| `frontend/api/generate-pipeline.py` | Vercel serverless handler (stdlib only) |
| `backend/main.py` | FastAPI equivalent for Railway deployment |

## Sidebar UI Note

The sidebar items "History", "Schema Detect", "Data Preview", and "Type Validator" are visual placeholders only — they have no functionality implemented.

## Claude API Usage

The Anthropic API is called with a structured prompt expecting three sections in the response: `ISSUES:`, `SCRIPT:`, and `EXPLANATION:`. Both the FastAPI backend and the Vercel serverless function parse this format identically using string splits. The model is `claude-haiku-4-5-20251001`.
