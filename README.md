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
- **Frontend:** HTML + Vanilla JS + Tailwind (CDN)
- **AI/Scoring:** Google Gemini API + TF-IDF semantic similarity
- **Data Export:** Pandas + OpenPyXL
- **Document Parsing:** PyMuPDF, python-docx, textract (for `.doc`)

## Project Structure

- `resume_app/app.py` - Flask routes, parsing, scoring, ranking, export APIs
- `resume_app/templates/index.html` - Responsive dashboard UI
- `resume_app/requirements.txt` - App dependencies
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

5. Run locally

```bash
python resume_app/app.py
```

Open: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Deployment Guide

### Render/Railway (Recommended)

1. Set build command:

```bash
pip install -r resume_app/requirements.txt
```

2. Set start command:

```bash
gunicorn resume_app.app:app
```

3. Configure environment variable:
   - `GEMINI_API_KEY`

4. Ensure persistent disk (optional) if you want to keep uploaded files.

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
