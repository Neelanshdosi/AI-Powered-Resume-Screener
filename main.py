from utils.parser import extract_text_from_pdf
import os
import re

# Path to the resume PDF
resume_path = "sample_resume.pdf"

# Check if file exists
if not os.path.exists(resume_path):
    raise FileNotFoundError(f"{resume_path} not found!")

# Extract text
text = extract_text_from_pdf(resume_path)
print("True")
print("Extracted Resume Text:\n")
print(text)

# Optional: simple regex-based extraction
name = re.findall(r'^[A-Z][a-z]+[A-Z]?[a-z]*', text)
email = re.findall(r'\S+@\S+', text)
phone = re.findall(r'\d{4,} \d{3,} \d{3,}', text)

print("\n--- Extracted Information ---")
print(f"Name: {name[0] if name else 'Not found'}")
print(f"Email: {email[0] if email else 'Not found'}")
print(f"Phone: {phone[0] if phone else 'Not found'}")
