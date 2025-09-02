from utils.parser import extract_text_from_pdf
import re

# Path to your test resume
resume_path = r"C:\Users\neela\Desktop\resume-screener\AI-Powered-Resume-Screener\sample_resume.pdf"
import os

print(os.path.exists(resume_path))


# Extract text
text = extract_text_from_pdf(resume_path)
print("Extracted Resume Text:\n")
print(text[:500])  # Show only first 500 characters for debugging

# ----------------------------
# Step 1: Extract Key Fields
# ----------------------------

def extract_name(text):
    # Assume name is the first line (basic heuristic for now)
    return text.split("\n")[0].strip()

def extract_email(text):
    match = re.search(r"[\w\.-]+@[\w\.-]+", text)
    return match.group(0) if match else None

def extract_phone(text):
    match = re.search(r"(\+?\d{2,3}[- ]?)?\d{3,4}[- ]?\d{3}[- ]?\d{3,4}", text)
    return match.group(0) if match else None

def extract_skills(text):
    skills = ["Python", "Java", "C++", "Excel", "SQL", "Communication", "Teamwork", "Leadership"]
    found = [skill for skill in skills if skill.lower() in text.lower()]
    return found

# Run extractors
print("\n--- Extracted Information ---")
print("Name:", extract_name(text))
print("Email:", extract_email(text))
print("Phone:", extract_phone(text))
print("Skills:", extract_skills(text))
