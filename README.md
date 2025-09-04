# AI Powered Resume Screener
AI-Powered Resume Screener

An AI-powered web app built with Flask and Google Gemini API that:

Extracts basic resume details (Name, Email, Skills, Education, Experience, Projects).

Provides resume improvement tips.

Performs ATS analysis based on selected job profile or custom role.

Includes a clean, minimal UI with dark theme, file upload, and analysis output.

Features

Drag & drop or click to upload a PDF/DOCX resume.

Extracted data shown in tabular format.

AI-generated resume tips.

ATS analysis for different job roles (SDE, Product Manager, Intern, or custom input).

Setup Instructions
1. Clone the Repository
git clone https://github.com/Neelanshdosi/AI-Powered-Resume-Screener.git
cd AI-Powered-Resume-Screener

2. Create Virtual Environment
python -m venv venv


Activate it:

Windows (Git Bash / PowerShell)

venv\Scripts\activate


Linux / Mac

source venv/bin/activate

3. Install Dependencies
pip install -r requirements.txt


If you don’t have requirements.txt, generate it with:

pip freeze > requirements.txt

4. Set Up Environment Variables

Create a .env file in the project root:

touch .env


Inside .env, add:

GEMINI_API_KEY=your_google_gemini_api_key_here


Note: Never commit .env to GitHub (it should be ignored via .gitignore).

5. Run the Application
python app.py


Then open in browser:
http://127.0.0.1:5000

Tech Stack

Backend: Flask (Python)

Frontend: HTML, CSS, JavaScript (vanilla)

AI Model: Google Gemini API

Parsing: PyMuPDF (fitz) for PDFs, python-docx for DOCX

Roadmap

Add support for multiple resumes at once.

Generate downloadable ATS report (PDF).

Enhance ATS scoring with real job description and resume matching.

Deploy on Render or Railway for live demo.

Disclaimer

This project is for educational purposes. ATS scoring is approximate and may differ from real corporate ATS systems.
