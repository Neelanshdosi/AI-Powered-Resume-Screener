# AI-Powered Resume Screening & Candidate Ranking

A production-oriented Flask web application that screens multiple resumes against a job description, computes explainable candidate scores, ranks applicants, and exports final results to CSV/XLSX.

## Features

- Multi-resume upload in one run (`.pdf`, `.doc`, `.docx`)
- Manual JD input or JD file upload (`.pdf`, `.doc`, `.docx`, `.txt`)
- Asynchronous server-side resume processing
- Candidate ranking from highest to lowest score
- Candidate dashboard with:
  - Name and resume filename preview
  - Match score and rank
  - Matching and missing skills
  - Experience and education relevance
  - Search, score sorting, and min-score filtering
- Export filtered results to:
  - CSV
  - Excel (`.xlsx`)
- Gemini-assisted resume detail extraction + fallback parser

## Tech Stack

- **Backend:** Flask, Python
- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS
- **Legacy UI (optional):** `resume_app/templates/index.html`
- **AI/Scoring:** Google Gemini API + TF-IDF semantic similarity
- **Data Export:** Pandas + OpenPyXL
- **Document Parsing:** PyMuPDF, python-docx, textract (for `.doc`)

## Project Structure

- `resume_app/app.py` - Flask API routes, parsing, scoring, ranking, export
- `frontend/` - Next.js React dashboard (primary UI)
- `resume_app/templates/index.html` - Legacy Flask template UI
- `resume_app/requirements.txt` - Backend dependencies
- `uploads/` - Runtime storage for uploaded resumes and job descriptions

## Scoring Logic (Explainable Weighted Score)

Each candidate gets a final score out of **100**:

- **Skills Match (40%)**
  - Skill overlap from extracted candidate skills and JD
  - Includes keyword overlap boost
- **Semantic Similarity (30%)**
  - TF-IDF cosine similarity between resume text and JD text
- **Experience Relevance (20%)**
  - Years-of-experience matching against JD expectation
- **Education Relevance (10%)**
  - Education term overlap (degree/qualification keywords)

`Final Score = 0.40*Skills + 0.30*Semantic + 0.20*Experience + 0.10*Education`

## Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/Neelanshdosi/AI-Powered-Resume-Screener.git
cd AI-Powered-Resume-Screener
```

2. Create and activate virtual environment

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Configure environment variables

Create `.env` in project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

5. Run locally (recommended: Next.js + Flask API)

**Terminal 1 — Flask API**

```bash
python resume_app/app.py
```

API: [http://127.0.0.1:5000](http://127.0.0.1:5000)

**Terminal 2 — Next.js frontend**

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

UI: [http://localhost:3000](http://localhost:3000)

Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` if your API runs on a different host/port.

Optional legacy UI only (Flask template):

```bash
python resume_app/app.py
```

Open: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Deployment Guide

### Backend (Render/Railway)

1. Build: `pip install -r resume_app/requirements.txt`
2. Start: `gunicorn resume_app.app:app`
3. Env vars:
   - `GEMINI_API_KEY`
   - `CORS_ORIGINS=https://your-frontend-domain.com`

### Frontend (Vercel/Netlify)

1. Root directory: `frontend`
2. Build: `npm run build`
3. Start/output: Next.js default
4. Env var:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain.com`

## API Overview

- `POST /analyze`
  - Input: multiple `resumes`, `jobRole`, optional `jobDescription`, optional `jobDescriptionFile`
  - Output: ranked candidate list with explainable sub-scores
- `POST /export/csv`
  - Input: JSON `results`
  - Output: downloadable CSV file
- `POST /export/xlsx`
  - Input: JSON `results`
  - Output: downloadable XLSX file

## Screenshots (Placeholders)

- Dashboard overview: `docs/screenshots/dashboard-overview.png`
- Ranking cards: `docs/screenshots/ranking-cards.png`
- Export flow: `docs/screenshots/export-results.png`

## Architecture Overview

1. User uploads resumes + JD input/file from frontend
2. Flask stores files in `uploads/`
3. Resumes are processed concurrently with a thread pool
4. Candidate details and weighted scores are calculated
5. Results are ranked and returned to dashboard
6. Filtered results can be exported to CSV/XLSX

## Future Improvements

- Add authentication and recruiter workspaces
- Add PostgreSQL for persistent candidates/jobs
- Add background job queue (Celery/RQ) for very large batches
- Add interview recommendation and shortlisting thresholds
- Add advanced embedding-based semantic scoring

## Disclaimer

This tool provides approximate ATS-style scoring. Always combine automated screening with human review.
