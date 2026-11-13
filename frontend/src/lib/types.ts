export interface CandidateDetails {
  Name?: string | null;
  Email?: string | null;
  Phone?: string | null;
  Skills?: string[];
  Education?: string[];
  Experience?: string[];
  Projects?: string[];
}

export interface CandidateResult {
  candidate_name: string;
  filename: string;
  stored_file?: string;
  rank: number;
  match_score: number;
  skills_match: number;
  semantic_similarity: number;
  experience_relevance: number;
  education_relevance: number;
  matching_skills: string[];
  missing_skills: string[];
  keyword_score?: number;
  details?: CandidateDetails;
  tips?: string[];
  ai_error?: string;
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
  { value: "Product Manager", label: "Product Manager" },
  { value: "UI/UX Designer", label: "UI/UX Designer" },
  { value: "Business Analyst", label: "Business Analyst" },
  { value: "DevOps Engineer", label: "DevOps Engineer" },
  { value: "Intern", label: "Intern" },
  { value: "custom", label: "Custom Role (User JD)" },
] as const;

export type ViewMode = "table" | "cards";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
}
