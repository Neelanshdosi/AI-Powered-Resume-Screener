# File: app.py

import io
import os
import re
import json
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

import requests
import fitz  # pip install pymupdf
import docx  # pip install python-docx
import pandas as pd
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                origin.strip()
                for origin in os.getenv(
                    "CORS_ORIGINS",
                    "http://localhost:3000,http://127.0.0.1:3000",
                ).split(",")
                if origin.strip()
            ]
        }
    },
)
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["MAX_CONTENT_LENGTH"] = 30 * 1024 * 1024  # 30 MB
app.config["ALLOWED_EXTENSIONS"] = {"pdf", "doc", "docx", "txt"}
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "resumes"), exist_ok=True)
os.makedirs(os.path.join(app.config["UPLOAD_FOLDER"], "jd"), exist_ok=True)

# ==== Configure Gemini ====
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# ==== Predefined JDs by role (extended) ====
JOB_DESCRIPTIONS = {
    "SDE": """Looking for a Software Development Engineer with experience in Python/Java/C++,
              data structures, algorithms, system design, databases (SQL/NoSQL), REST APIs,
              Git, cloud (AWS/GCP/Azure), CI/CD, testing.""",

    "Product Manager": """Seeking a Product Manager skilled in roadmap planning, stakeholder
              communication, Agile/Scrum, user research, metrics/analytics (A/B testing),
              PRDs, competitive analysis, and cross-functional leadership.""",

    "Intern": """Hiring interns with fundamentals in programming, problem solving, teamwork,
              communication, eagerness to learn, and basic project experience or coursework.""",

    "Data Scientist": """Looking for a Data Scientist with expertise in Python/R, machine learning,
              statistical modeling, data visualization, SQL, big data frameworks, and deep learning.""",

    "UI/UX Designer": """Seeking a UI/UX Designer skilled in wireframing, prototyping, Figma/Sketch,
              design systems, usability testing, accessibility, and collaboration with developers.""",

    "Business Analyst": """Hiring a Business Analyst with experience in requirement gathering,
              stakeholder management, data analysis, visualization (PowerBI/Tableau), and Agile workflows.""",

    "DevOps Engineer": """Looking for a DevOps Engineer experienced with CI/CD pipelines, Docker,
              Kubernetes, cloud platforms (AWS/GCP/Azure), infrastructure as code, and monitoring tools."""
}

# ------------------ File text extraction ------------------ #
def allowed_file(filename: str, allowed: set[str]) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed


def extract_text_from_file(filepath: str) -> str:
    text = ""
    lower = filepath.lower()
    if lower.endswith(".pdf"):
        with fitz.open(filepath) as doc:
            for page in doc:
                text += page.get_text()
    elif lower.endswith(".docx"):
        d = docx.Document(filepath)
        for p in d.paragraphs:
            text += p.text + "\n"
    elif lower.endswith(".doc"):
        # Best-effort .doc extraction; this path avoids changing architecture
        # and keeps dependency footprint small while still supporting uploads.
        try:
            import textract  # pip install textract
        except Exception as exc:
            raise ValueError(
                "DOC parsing requires the 'textract' package. Install it and retry."
            ) from exc
        text = textract.process(filepath).decode("utf-8", errors="ignore")
    elif lower.endswith(".txt"):
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    else:
        raise ValueError("Unsupported file format. Please upload PDF, DOC, DOCX, or TXT.")
    return text.strip()

# ------------------ Basic details fallback (regex) ------------------ #
def basic_details_from_text(text: str) -> dict:
    details = {}
    first_line = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
    details["Name"] = re.sub(r"[^A-Za-z .'-]", "", first_line)[:80] if first_line else None
    m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    details["Email"] = m.group(0) if m else None
    m = re.search(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)
    details["Phone"] = m.group(0) if m else None
    common_skills = [
        "python","java","c++","javascript","react","node","sql","nosql","aws","gcp","azure",
        "docker","kubernetes","git","machine learning","data analysis","agile","scrum"
    ]
    lower = text.lower()
    found = [s for s in common_skills if s in lower]
    details["Skills"] = sorted(set(found))
    return details

# ------------------ Keyword extraction ------------------ #
STOP = set("""
a an the and or for with of in to from on at by be is are as into via using use uses user
we you they them this that these those strong excellent good great
""".split())

def extract_keywords(text: str) -> list:
    words = re.findall(r"[a-zA-Z][a-zA-Z+\-/#&.\d]{2,}", text.lower())
    uniq, seen = [], set()
    for w in words:
        if w in STOP:
            continue
        if w not in seen:
            seen.add(w)
            uniq.append(w)
    tokens = re.findall(r"[a-zA-Z]+", text.lower())
    bigrams = [" ".join(pair) for pair in zip(tokens, tokens[1:])]
    key_ngrams, seen2 = [], set()
    for bg in bigrams:
        if bg in seen2:
            continue
        if bg in ("system design", "data structures", "machine learning", "product roadmap",
                  "user research", "a/b testing", "cloud computing"):
            seen2.add(bg)
            key_ngrams.append(bg)
    return key_ngrams + uniq


def normalize_text_tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z][a-zA-Z+\-/#&.\d]{1,}", (text or "").lower()))


def parse_years(text: str) -> float:
    # Handles patterns like "3 years", "5+ yrs", "2.5 years"
    matches = re.findall(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs|yr)", text.lower())
    if matches:
        try:
            return max(float(x) for x in matches)
        except Exception:
            return 0.0
    return 0.0


def education_keywords(text: str) -> set[str]:
    patterns = [
        "b.tech", "btech", "b.e", "be", "m.tech", "mtech", "m.e", "me",
        "b.sc", "bsc", "m.sc", "msc", "bca", "mca", "phd", "mba", "bachelor",
        "master", "university", "college", "computer science", "information technology"
    ]
    lower = text.lower()
    return {kw for kw in patterns if kw in lower}


def compute_semantic_similarity(resume_text: str, jd_text: str) -> float:
    if not resume_text.strip() or not jd_text.strip():
        return 0.0
    try:
        corpus = [resume_text, jd_text]
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(corpus)
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(max(0.0, min(1.0, sim)))
    except Exception:
        return 0.0


def compute_weighted_score(resume_text: str, jd_text: str, extracted_details: dict) -> dict:
    jd_skills = normalize_text_tokens(jd_text)
    resume_skills = normalize_text_tokens(" ".join(extracted_details.get("Skills", [])))
    resume_all_tokens = normalize_text_tokens(resume_text)

    # Skill matching (primary) + keyword overlap (secondary)
    matched_skills = sorted(skill for skill in jd_skills if skill in resume_skills)
    missing_skills = sorted(skill for skill in jd_skills if skill not in resume_skills)
    skill_ratio = (len(matched_skills) / len(jd_skills)) if jd_skills else 0.0
    keyword_ratio = (len(jd_skills & resume_all_tokens) / len(jd_skills)) if jd_skills else 0.0
    skills_component = (0.7 * skill_ratio) + (0.3 * keyword_ratio)

    semantic_component = compute_semantic_similarity(resume_text, jd_text)

    jd_years = parse_years(jd_text)
    resume_years = parse_years(resume_text)
    if jd_years <= 0:
        experience_component = 0.6 if resume_years > 0 else 0.4
    else:
        experience_component = min(1.0, resume_years / jd_years)

    jd_edu = education_keywords(jd_text)
    resume_edu = education_keywords(resume_text)
    education_component = (len(jd_edu & resume_edu) / len(jd_edu)) if jd_edu else 0.6

    # Weighted explainable scoring
    weighted = (
        (skills_component * 0.40) +
        (semantic_component * 0.30) +
        (experience_component * 0.20) +
        (education_component * 0.10)
    )
    final_score = int(round(weighted * 100))

    return {
        "score": final_score,
        "matched_skills": matched_skills[:25],
        "missing_skills": missing_skills[:25],
        "components": {
            "skills_match": round(skills_component * 100, 2),
            "semantic_similarity": round(semantic_component * 100, 2),
            "experience_relevance": round(experience_component * 100, 2),
            "education_relevance": round(education_component * 100, 2),
        },
    }

# ------------------ ATS scoring ------------------ #
def calculate_ats(resume_text: str, job_description: str) -> dict:
    if not job_description.strip():
        return {"score": 0, "matched": [], "missing": []}
    jd_keys = extract_keywords(job_description)
    if not jd_keys:
        return {"score": 0, "matched": [], "missing": []}
    resume_keys = set(extract_keywords(resume_text))
    matched = [k for k in jd_keys if k in resume_keys]
    missing = [k for k in jd_keys if k not in resume_keys]
    unique_jd = list(dict.fromkeys(jd_keys))
    unique_matched = list(dict.fromkeys(matched))
    score = int(round(100 * (len(unique_matched) / max(1, len(unique_jd)))))
    return {"score": score, "matched": unique_matched, "missing": missing}

# ------------------ Gemini helpers ------------------ #
def gemini_request(prompt: str) -> dict:
    if not GEMINI_API_KEY:
        return {"ok": False, "text": "", "error": "Gemini API key not set."}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    try:
        for attempt in range(3):
            resp = requests.post(
                GEMINI_API_URL,
                params={"key": GEMINI_API_KEY},
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=60
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"ok": True, "text": text, "error": ""}
            if resp.status_code == 503:
                continue
            return {"ok": False, "text": "", "error": f"Gemini API error: {resp.text}"}
    except Exception as e:
        return {"ok": False, "text": "", "error": str(e)}
    return {"ok": False, "text": "", "error": "Unknown error"}

def extract_json_block(text: str) -> str | None:
    m = re.search(r"\{.*\}", text, re.DOTALL)
    return m.group(0) if m else None

def get_details_and_tips_with_gemini(resume_text: str, role_label: str) -> tuple[dict, list, str]:
    prompt = f"""
You are an AI Resume Reviewer.
Return STRICT JSON ONLY. No prose.

Fields:
- Name
- Email
- Phone
- Skills
- Education
- Experience
- Projects
- Tips

Resume:
{resume_text}
"""
    r = gemini_request(prompt)
    if not r["ok"]:
        details = basic_details_from_text(resume_text)
        tips = [
            "Add measurable achievements (numbers, impact).",
            "Match keywords from the job description in your summary/skills.",
            "Keep bullets concise and start with strong verbs.",
            "Bring recent and relevant experience to the top."
        ]
        return details, tips, r["error"]

    raw = r["text"]
    js = extract_json_block(raw) or raw
    try:
        data = json.loads(js)
    except Exception:
        details = basic_details_from_text(resume_text)
        tips = [
            "Add measurable achievements (numbers, impact).",
            "Match keywords from the job description in your summary/skills.",
            "Keep bullets concise and start with strong verbs.",
            "Bring recent and relevant experience to the top."
        ]
        return details, tips, "AI returned non-JSON output."

    details = {
        "Name": data.get("Name"),
        "Email": data.get("Email"),
        "Phone": data.get("Phone"),
        "Skills": data.get("Skills") or [],
        "Education": data.get("Education") or [],
        "Experience": data.get("Experience") or [],
        "Projects": data.get("Projects") or []
    }
    tips = data.get("Tips") or []
    return details, tips, ""

# ------------------ Routes ------------------ #
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "resume-screener-api"})

def collect_resume_uploads():
    """Gather all uploaded resume files (supports multi-file field and legacy single field)."""
    allowed = {"pdf", "doc", "docx"}
    seen_names = set()
    collected = []

    for field in ("resumes", "resume"):
        for file_obj in request.files.getlist(field):
            if not file_obj or not file_obj.filename:
                continue
            filename = file_obj.filename
            if filename in seen_names:
                continue
            seen_names.add(filename)
            if not allowed_file(filename, allowed):
                raise ValueError(
                    f"Unsupported resume format: {filename}. Use PDF, DOC, or DOCX."
                )
            collected.append(file_obj)

    return collected


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        files = collect_resume_uploads()
        if not files:
            return jsonify({"error": "No resumes uploaded."}), 400

        role = request.form.get("jobRole", "").strip()
        jd_text = request.form.get("jobDescription", "").strip()
        jd_file = request.files.get("jobDescriptionFile")

        if jd_file and jd_file.filename:
            if not allowed_file(jd_file.filename, {"pdf", "doc", "docx", "txt"}):
                return jsonify({"error": "Unsupported JD file format. Use PDF, DOC, DOCX, or TXT."}), 400
            jd_name = f"{uuid.uuid4().hex}_{secure_filename(jd_file.filename)}"
            jd_path = os.path.join(app.config["UPLOAD_FOLDER"], "jd", jd_name)
            jd_file.save(jd_path)
            jd_text = extract_text_from_file(jd_path)

        if role.lower() == "custom":
            if not jd_text:
                return jsonify({"error": "Please paste a Job Description for Custom role."}), 400
            job_description = jd_text
            role_label = "Custom"
        else:
            role_label = role or "Unspecified"
            job_description = jd_text or JOB_DESCRIPTIONS.get(role_label, "")

        def process_resume(file_obj):
            fname = f"{uuid.uuid4().hex}_{secure_filename(file_obj.filename)}"
            path = os.path.join(app.config["UPLOAD_FOLDER"], "resumes", fname)
            file_obj.save(path)

            resume_text = extract_text_from_file(path)
            details, tips, ai_error = get_details_and_tips_with_gemini(resume_text, role_label)
            ats = calculate_ats(resume_text, job_description)
            weighted = compute_weighted_score(resume_text, job_description, details)

            return {
                "candidate_name": details.get("Name") or "Unknown Candidate",
                "filename": file_obj.filename,
                "stored_file": fname,
                "match_score": weighted["score"],
                "matching_skills": weighted["matched_skills"],
                "missing_skills": weighted["missing_skills"],
                "experience_relevance": weighted["components"]["experience_relevance"],
                "education_relevance": weighted["components"]["education_relevance"],
                "semantic_similarity": weighted["components"]["semantic_similarity"],
                "skills_match": weighted["components"]["skills_match"],
                "keyword_score": ats["score"],
                "details": details,
                "tips": tips,
                "ai_error": ai_error,
            }

        results = []
        with ThreadPoolExecutor(max_workers=min(4, len(files))) as executor:
            futures = [executor.submit(process_resume, f) for f in files]
            for future in as_completed(futures):
                results.append(future.result())

        ranked = sorted(results, key=lambda x: x["match_score"], reverse=True)
        for idx, row in enumerate(ranked, start=1):
            row["rank"] = idx

        return jsonify(
            {
                "job_role": role_label,
                "total_candidates": len(ranked),
                "processed_at": datetime.utcnow().isoformat() + "Z",
                "results": ranked,
            }
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/export/csv", methods=["POST"])
def export_csv():
    try:
        payload = request.get_json(force=True, silent=False) or {}
        rows = payload.get("results", [])
        if not rows:
            return jsonify({"error": "No results to export."}), 400

        df = pd.DataFrame(rows)
        for col in ["matching_skills", "missing_skills"]:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: ", ".join(x) if isinstance(x, list) else x)

        csv_bytes = df.to_csv(index=False).encode("utf-8")
        return send_file(
            io.BytesIO(csv_bytes),
            mimetype="text/csv",
            as_attachment=True,
            download_name="candidate_rankings.csv",
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/export/xlsx", methods=["POST"])
def export_xlsx():
    try:
        payload = request.get_json(force=True, silent=False) or {}
        rows = payload.get("results", [])
        if not rows:
            return jsonify({"error": "No results to export."}), 400

        df = pd.DataFrame(rows)
        for col in ["matching_skills", "missing_skills"]:
            if col in df.columns:
                df[col] = df[col].apply(lambda x: ", ".join(x) if isinstance(x, list) else x)

        out = io.BytesIO()
        with pd.ExcelWriter(out, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Rankings")
        out.seek(0)

        return send_file(
            out,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="candidate_rankings.xlsx",
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
