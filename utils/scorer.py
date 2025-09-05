from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def compute_score(resume_text, jd_text):
    """
    Returns a similarity score between resume and job description
    """
    # Combine resume and JD into a corpus
    corpus = [resume_text, jd_text]

    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Cosine similarity between resume and JD
    score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return score[0][0]  # single float value
