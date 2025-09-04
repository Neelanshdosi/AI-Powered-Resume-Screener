# File: resume_extractor.py

def extract_text_from_file(filepath):
    """
    Reads PDF or DOCX file and returns plain text.
    """
    text = ''
    if filepath.lower().endswith('.pdf'):
        import PyPDF2
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + '\n'
    elif filepath.lower().endswith('.docx'):
        import docx2txt
        text = docx2txt.process(filepath)
    else:
        raise ValueError("Unsupported file type")
    return text
