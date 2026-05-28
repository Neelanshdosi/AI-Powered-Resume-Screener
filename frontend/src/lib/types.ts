export interface CandidateResult {
  candidate_name: string;
  filename: string;
  stored_file?: string;
  match_score: number;
  rank: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_relevance: number;
  education_relevance: number;
  semantic_similarity: number;
  skills_match?: number;
  keyword_score?: number;
}

export interface AnalyzeResponse {
  job_role: string;
  total_candidates: number;
  processed_at: string;
  results: CandidateResult[];
  error?: string;
}

export const JOB_ROLES = [
  { value: "SDE", label: "Software Development Engineer" },
  { value: "Data Scientist", label: "Data Scientist" },
  { value: "Machine Learning Engineer", label: "Machine Learning Engineer" },
  { value: "Frontend Developer", label: "Frontend Developer" },
  { value: "Backend Developer", label: "Backend Developer" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Business Analyst", label: "Business Analyst" },
  { value: "Intern", label: "Intern" },
  { value: "custom", label: "Custom" },
] as const;
