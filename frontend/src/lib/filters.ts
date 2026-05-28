import type { CandidateResult } from "./types";

export function filterCandidates(
  results: CandidateResult[],
  search: string,
  minScore: number,
  sortOrder: "asc" | "desc"
): CandidateResult[] {
  const query = search.trim().toLowerCase();
  let rows = results.filter(
    (row) =>
      (row.candidate_name || "").toLowerCase().includes(query) ||
      (row.filename || "").toLowerCase().includes(query)
  );
  rows = rows.filter((row) => Number(row.match_score || 0) >= minScore);
  rows.sort((a, b) =>
    sortOrder === "asc"
      ? Number(a.match_score) - Number(b.match_score)
      : Number(b.match_score) - Number(a.match_score)
  );
  return rows;
}
