# File: app.py

import os
import uuid
import re
import json
import requests
import fitz         # pip install pymupdf
import docx         # pip install python-docx
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

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

        fname = f"{uuid.uuid4().hex}_{file.filename}"
        path = os.path.join(app.config["UPLOAD_FOLDER"], fname)
        file.save(path)

        resume_text = extract_text_from_file(path)

        if role.lower() == "custom":
            if not jd_text:
                return jsonify({"error": "Please paste a Job Description for Custom role."}), 400
            job_description = jd_text
            role_label = "Custom"
        else:
            role_label = role or "Unspecified"
            job_description = jd_text or JOB_DESCRIPTIONS.get(role_label, "")

        details, tips, ai_error = get_details_and_tips_with_gemini(resume_text, role_label)
        ats = calculate_ats(resume_text, job_description)

        return jsonify({
            "details": details,
            "tips": tips,
            "ats": ats,
            "ai_error": ai_error
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
