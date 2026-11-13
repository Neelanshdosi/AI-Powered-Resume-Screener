import type { CandidateResult } from "./types";

export type SortField =
  | "rank"
  | "match_score"
  | "skills_match"
  | "semantic_similarity"
  | "experience_relevance"
  | "education_relevance"
  | "candidate_name";

export type SortDirection = "asc" | "desc";

export interface FilterState {
  search: string;
  minScore: number;
  sortField: SortField;
  sortDirection: SortDirection;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  minScore: 0,
  sortField: "rank",
  sortDirection: "asc", // Rank #1 first by default
};

export function filterCandidates(
  results: CandidateResult[],
  filters: FilterState
): CandidateResult[] {
  const query = filters.search.trim().toLowerCase();

  let rows = results.filter((row) => {
    if (!query) return true;
    const name = (row.candidate_name || "").toLowerCase();
    const filename = (row.filename || "").toLowerCase();
    const matchedSkills = (row.matching_skills || []).some((s) =>
      s.toLowerCase().includes(query)
    );
    const missingSkills = (row.missing_skills || []).some((s) =>
      s.toLowerCase().includes(query)
    );
    return name.includes(query) || filename.includes(query) || matchedSkills || missingSkills;
  });

  if (filters.minScore > 0) {
    rows = rows.filter((row) => Number(row.match_score || 0) >= filters.minScore);
  }

  rows.sort((a, b) => {
    let aVal = a[filters.sortField];
    let bVal = b[filters.sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
      return filters.sortDirection === "asc"
        ? (aVal as string).localeCompare(bVal as string)
        : (bVal as string).localeCompare(aVal as string);
    }

    const numA = Number(aVal || 0);
    const numB = Number(bVal || 0);

    return filters.sortDirection === "asc" ? numA - numB : numB - numA;
  });

  return rows;
}
