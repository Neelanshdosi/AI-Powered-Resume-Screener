# File: app.py

import os
import uuid
import re
import json
import requests
import fitz         # pip install pymupdf
import docx         # pip install python-docx
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os


app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# ==== Configure Gemini ====
# Put your key in an environment variable:  set GEMINI_API_KEY=your_key  (Windows PowerShell)
# ✅ Secure way
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# ==== Predefined JDs by role (used if user doesn't paste JD) ====
JOB_DESCRIPTIONS = {
    "SDE": """Looking for a Software Development Engineer with experience in Python/Java/C++,
              data structures, algorithms, system design, databases (SQL/NoSQL), REST APIs,
              Git, cloud (AWS/GCP/Azure), CI/CD, testing.""",
    "Product Manager": """Seeking a Product Manager skilled in roadmap planning, stakeholder
              communication, Agile/Scrum, user research, metrics/analytics (A/B testing),
              PRDs, competitive analysis, and cross-functional leadership.""",
    "Intern": """Hiring interns with fundamentals in programming, problem solving, teamwork,
              communication, eagerness to learn, and basic project experience or coursework."""
}

# ------------------ File text extraction ------------------ #
def extract_text_from_file(filepath: str) -> str:
    text = ""
    if filepath.lower().endswith(".pdf"):
        with fitz.open(filepath) as doc:
            for page in doc:
                text += page.get_text()
    elif filepath.lower().endswith(".docx"):
        d = docx.Document(filepath)
        for p in d.paragraphs:
            text += p.text + "\n"
    else:
        raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
    return text.strip()

# ------------------ Basic details fallback (regex) ------------------ #
def basic_details_from_text(text: str) -> dict:
    details = {}
    # Naive name guess: first non-empty line, strip weird chars
    first_line = next((ln.strip() for ln in text.splitlines() if ln.strip()), "")
    details["Name"] = re.sub(r"[^A-Za-z .'-]", "", first_line)[:80] if first_line else None

    # Email
    m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    details["Email"] = m.group(0) if m else None

    # Phone (many formats)
    m = re.search(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)
    details["Phone"] = m.group(0) if m else None

    # Very simple skill “guess” (optional)
    common_skills = [
        "python","java","c++","javascript","react","node","sql","nosql","aws","gcp","azure",
        "docker","kubernetes","git","machine learning","data analysis","agile","scrum"
    ]
    lower = text.lower()
    found = []
    for s in common_skills:
        if s in lower:
            found.append(s)
    details["Skills"] = sorted(set(found))
    return details

# ------------------ Keyword extraction for ATS ------------------ #
STOP = set("""
a an the and or for with of in to from on at by be is are as into via using use uses user
we you they them this that these those strong excellent good great
""".split())

def extract_keywords(text: str) -> list:
    # words >=3 chars, filter stopwords; simple de-dupe while preserving order
    words = re.findall(r"[a-zA-Z][a-zA-Z+\-/#&.\d]{2,}", text.lower())
    uniq = []
    seen = set()
    for w in words:
        if w in STOP:
            continue
        if w not in seen:
            seen.add(w)
            uniq.append(w)
    # also try to capture common 2-grams like "system design", "data structures"
    tokens = re.findall(r"[a-zA-Z]+", text.lower())
    bigrams = [" ".join(pair) for pair in zip(tokens, tokens[1:])]
    key_ngrams = []
    seen2 = set()
    for bg in bigrams:
        if bg in seen2:
            continue
        if bg in ("system design", "data structures", "machine learning", "product roadmap",
                  "user research", "a/b testing", "cloud computing"):
            seen2.add(bg)
            key_ngrams.append(bg)
    # prefer ngrams first, then words
    return key_ngrams + uniq

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

    # score = unique matches / total unique JD keywords
    unique_jd = list(dict.fromkeys(jd_keys))  # unique preserve order
    unique_matched = list(dict.fromkeys(matched))
    score = int(round(100 * (len(unique_matched) / max(1, len(unique_jd)))))

    return {"score": score, "matched": unique_matched, "missing": missing}

# ------------------ Gemini helpers ------------------ #
def gemini_request(prompt: str) -> dict:
    """
    Returns {"ok": bool, "text": str, "error": str}
    """
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
            # retry only for overload
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
    """
    Returns (details_dict, tips_list, error_string_if_any)
    """
    prompt = f"""
You are an AI Resume Reviewer.
Return STRICT JSON ONLY. No prose.

Fields:
- Name (string or null)
- Email (string or null)
- Phone (string or null)
- Skills (array of strings)
- Education (array of strings)
- Experience (array of strings)
- Projects (array of strings)
- Tips (array of 3-6 short, actionable tips tailored for role "{role_label}")

Example:
{{
  "Name": "Jane Doe",
  "Email": "jane@example.com",
  "Phone": "+1-555-0123",
  "Skills": ["Python","SQL","AWS"],
  "Education": ["B.Tech CSE - XYZ University (2022)"],
  "Experience": ["Software Engineer - ABC (2022–2024)"],
  "Projects": ["ML pipeline for churn"],
  "Tips": ["Quantify achievements","Prioritize recent work","Tailor keywords to JD"]
}}

Resume:
{resume_text}
"""
    r = gemini_request(prompt)
    if not r["ok"]:
        # fallback to regex details + basic tips
        details = basic_details_from_text(resume_text)
        tips = [
            "Add measurable achievements (numbers, impact).",
            "Match keywords from the job description in your summary/skills.",
            "Keep bullets concise (one line each) and start with strong verbs.",
            "Bring recent and relevant experience to the top.",
        ]
        return details, tips, r["error"]

    raw = r["text"]
    js = extract_json_block(raw) or raw
    try:
        data = json.loads(js)
    except Exception:
        # fallback if parsing fails
        details = basic_details_from_text(resume_text)
        tips = [
            "Add measurable achievements (numbers, impact).",
            "Match keywords from the job description in your summary/skills.",
            "Keep bullets concise (one line each) and start with strong verbs.",
            "Bring recent and relevant experience to the top.",
        ]
        return details, tips, "AI returned non-JSON output."

    # normalize
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

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No file uploaded."}), 400

        file = request.files["resume"]
        if file.filename == "":
            return jsonify({"error": "No file selected."}), 400

        role = request.form.get("jobRole", "").strip()
        jd_text = request.form.get("jobDescription", "").strip()

        # Save file
        fname = f"{uuid.uuid4().hex}_{file.filename}"
        path = os.path.join(app.config["UPLOAD_FOLDER"], fname)
        file.save(path)

        # Extract text
        resume_text = extract_text_from_file(path)

        # Choose job description
        if role.lower() == "custom":
            if not jd_text:
                return jsonify({"error": "Please paste a Job Description for Custom role."}), 400
            job_description = jd_text
            role_label = "Custom"
        else:
            role_label = role or "Unspecified"
            # If user pasted JD, prefer it; else fallback to predefined for role
            job_description = jd_text or JOB_DESCRIPTIONS.get(role_label, "")

        # Get details & tips (Gemini with fallback)
        details, tips, ai_error = get_details_and_tips_with_gemini(resume_text, role_label)

        # ATS analysis
        ats = calculate_ats(resume_text, job_description)

        return jsonify({
            "details": details,
            "tips": tips,
            "ats": ats,
            "ai_error": ai_error  # for debugging in console; you can remove
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
