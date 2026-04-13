# TalentIQ AI — Umurava Hackathon Build

**Smarter Hiring. Human Control. AI Precision.**

TalentIQ AI is a recruiter-facing, AI-powered talent screening platform that ingests resumes (structured + unstructured), evaluates applicants against a job, ranks top candidates, and provides transparent, human-readable explanations — with an **AI Content Authenticity Detector** that flags suspicious “AI-generated” patterns.

## Tech Stack

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini via `@google/generative-ai`

## Monorepo Structure

- `client/`: recruiter dashboard (Next.js)
- `server/`: REST API + AI orchestration (Express)
- `shared/`: (reserved for shared types/utils)

## Features (Hackathon-ready)

- **Public mode (no login required)**: all core endpoints are accessible without authentication
- **Job management**: create jobs with requirements/skills/experience (+ scoring weights stored on job)
- **Applicant ingestion**
  - Upload **PDF / CSV / XLSX / JSON / TXT**
  - Ingest JSON arrays
  - Ingest resume from a **URL** (PDF or text)
- **AI screening engine (Gemini)**
  - Multi-candidate evaluation in **one request**
  - Weighted score (0–100) across skills/experience/education/context
  - Ranks candidates and stores results in MongoDB
  - Explainability: strengths, gaps, recommendation, and score breakdown
- **AI Content Authenticity Detector**
  - `ai_authenticity_score` (0–100)
  - `ai_flags` + `ai_suspicious_segments` (snippets + reasons)

## API Overview

All routes below are **public** in this build (no Bearer token required).

- **Auth**
  - `POST /api/auth/login`

- **Jobs**
  - `POST /api/jobs`
  - `GET /api/jobs`
  - `GET /api/jobs/:id`

- **Applicants**
  - `POST /api/applicants/upload` (multipart `resume`)
  - `POST /api/applicants/ingest` (JSON `{ applicants: [...] }`)
  - `POST /api/applicants/link` (JSON `{ url, name?, email? }`)
  - `GET /api/applicants`

- **Screening**
  - `POST /api/screening/run` (JSON `{ jobId, applicantIds: [] }`)
  - `GET /api/screening/job/:jobId`

## AI Output Contract (JSON)

Gemini is prompted to return strict JSON arrays like:

```json
[
  {
    "rank": 1,
    "applicantId": "string",
    "name": "Candidate Name",
    "score": 87,
    "strengths": [],
    "gaps": [],
    "recommendation": "",
    "ai_authenticity_score": 25,
    "ai_flags": [],
    "ai_suspicious_segments": [{ "text": "...", "reason": "..." }],
    "score_breakdown": {
      "skills": 0,
      "experience": 0,
      "education": 0,
      "context": 0,
      "weighting": { "skills": 40, "experience": 35, "education": 10, "context": 15 }
    }
  }
]
```

## Local Setup

### Prerequisites

- Node.js 20+
- MongoDB running locally **or** MongoDB Atlas connection string
- A Google Gemini API key

### Backend (server)

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Backend runs at `http://localhost:5001`.

### Frontend (client)

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### (Optional) Demo Login

The project still includes `POST /api/auth/login`, but **auth is not required** for the core app flows in this build.

## Deployment (Vercel + Railway/Render + Atlas)

### Frontend (Vercel)

- Set env: `NEXT_PUBLIC_API_URL` → your deployed API URL + `/api`

### Backend (Railway/Render)

- Set env:
  - `MONGODB_URI` (Atlas)
  - `GEMINI_API_KEY`
  - `JWT_SECRET`
  - `CORS_ORIGIN` (your Vercel domain)

## AI Decision Flow (How ranking works)

1. Recruiter creates a job (requirements/skills/experience + weights).
2. Recruiter ingests applicants (PDF/CSV/XLSX/JSON/link).
3. Recruiter triggers screening for a set of applicant IDs.
4. API sends a **single Gemini request** containing job + all candidate resumes.
5. Gemini returns structured JSON per candidate (score, breakdown, flags).
6. API stores results in `ScreeningResults`, sorts by `score`, assigns ranks.

## Assumptions & Limitations

- Resume parsing is text-based (PDF extraction + file-to-text); it doesn’t yet do perfect sectioning or entity extraction.
- Authenticity detection is heuristic/LLM-based and should be treated as a **signal**, not proof.
- For hackathon speed, auth is a **single recruiter account via env**, not full multi-tenant org accounts.

