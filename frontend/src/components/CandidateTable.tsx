"use client";

import type { CandidateResult } from "@/lib/types";
import type { SortField, SortDirection } from "@/lib/filters";

interface CandidateTableProps {
  candidates: CandidateResult[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectCandidate: (candidate: CandidateResult) => void;
}

export function getScoreColor(score: number): { textClass: string; barColor: string } {
  if (score >= 75) {
    return { textClass: "text-[var(--match)]", barColor: "var(--match)" };
  }
  if (score >= 50) {
    return { textClass: "text-[var(--flag-text)]", barColor: "var(--flag)" };
  }
  return { textClass: "text-[var(--gap)]", barColor: "var(--gap)" };
}

export default function CandidateTable({
  candidates,
  sortField,
  sortDirection,
  onSort,
  onSelectCandidate,
}: CandidateTableProps) {
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-[var(--line)] ml-1 select-none">↕</span>;
    }
    return (
      <span className="text-[var(--ink)] ml-1 select-none font-bold">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="w-full border border-[var(--line)] bg-[var(--surface)]">
      {/* Desktop & Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm tabular-nums border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] text-xs text-[var(--ink-soft)] uppercase tracking-wider sticky top-0 bg-[var(--surface)] z-10">
              <th scope="col" className="py-3 px-4 w-14 font-medium">
                <button
                  type="button"
                  onClick={() => onSort("rank")}
                  className="flex items-center hover:text-[var(--ink)] cursor-pointer"
                >
                  <span>Rank</span>
                  {renderSortIndicator("rank")}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-medium min-w-[220px]">
                <button
                  type="button"
                  onClick={() => onSort("candidate_name")}
                  className="flex items-center hover:text-[var(--ink)] cursor-pointer"
                >
                  <span>Candidate</span>
                  {renderSortIndicator("candidate_name")}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-medium w-36">
                <button
                  type="button"
                  onClick={() => onSort("match_score")}
                  className="flex items-center hover:text-[var(--ink)] cursor-pointer"
                >
                  <span>Score</span>
                  {renderSortIndicator("match_score")}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-medium text-right w-20">
                <button
                  type="button"
                  onClick={() => onSort("skills_match")}
                  className="inline-flex items-center justify-end hover:text-[var(--ink)] cursor-pointer w-full"
                  title="Skills match (40% weight)"
                >
                  <span>Skills</span>
                  {renderSortIndicator("skills_match")}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-medium text-right w-24">
                <button
                  type="button"
                  onClick={() => onSort("semantic_similarity")}
                  className="inline-flex items-center justify-end hover:text-[var(--ink)] cursor-pointer w-full"
                  title="Wording / semantic similarity (30% weight)"
                >
                  <span>Wording</span>
                  {renderSortIndicator("semantic_similarity")}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-medium text-right w-24">
                <button
                  type="button"
                  onClick={() => onSort("experience_relevance")}
                  className="inline-flex items-center justify-end hover:text-[var(--ink)] cursor-pointer w-full"
                  title="Experience relevance (20% weight)"
                >
                  <span>Experience</span>
                  {renderSortIndicator("experience_relevance")}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 font-medium text-right w-24">
                <button
                  type="button"
                  onClick={() => onSort("education_relevance")}
                  className="inline-flex items-center justify-end hover:text-[var(--ink)] cursor-pointer w-full"
                  title="Education relevance (10% weight)"
                >
                  <span>Education</span>
                  {renderSortIndicator("education_relevance")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {candidates.map((c, idx) => {
              const score = Math.round(c.match_score || 0);
              const { textClass, barColor } = getScoreColor(score);
              const stableKey = c.stored_file || `${c.filename}-${c.rank}-${idx}`;

              return (
                <tr
                  key={stableKey}
                  onClick={() => onSelectCandidate(c)}
                  className="hover:bg-[var(--ground)]/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 text-xs font-medium text-[var(--ink-soft)]">
                    #{c.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[var(--ink)] group-hover:underline">
                      {c.candidate_name || "Unknown candidate"}
                    </div>
                    <div className="text-xs text-[var(--ink-soft)] truncate max-w-[260px]">
                      {c.filename}
                    </div>
                    {c.ai_error && (
                      <div className="text-[11px] text-[var(--flag-text)] mt-0.5">
                        Basic parser fallback
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${textClass}`}>{score}%</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--line)]/50 rounded-none overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${score}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--ink)] font-normal">
                    {Math.round(c.skills_match ?? 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--ink)] font-normal">
                    {Math.round(c.semantic_similarity ?? 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--ink)] font-normal">
                    {Math.round(c.experience_relevance ?? 0)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[var(--ink)] font-normal">
                    {Math.round(c.education_relevance ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked List (<640px) */}
      <div className="sm:hidden divide-y divide-[var(--line)] tabular-nums">
        {candidates.map((c, idx) => {
          const score = Math.round(c.match_score || 0);
          const { textClass, barColor } = getScoreColor(score);
          const stableKey = c.stored_file || `${c.filename}-${c.rank}-${idx}`;

          return (
            <div
              key={stableKey}
              onClick={() => onSelectCandidate(c)}
              className="p-4 hover:bg-[var(--ground)]/70 transition-colors cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-[var(--ink-soft)] font-medium">
                      #{c.rank}
                    </span>
                    <span className="font-medium text-sm text-[var(--ink)]">
                      {c.candidate_name || "Unknown candidate"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-soft)] truncate max-w-[240px] mt-0.5">
                    {c.filename}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-semibold ${textClass}`}>{score}%</span>
                </div>
              </div>

              {/* 4px Score bar */}
              <div className="w-full h-1 bg-[var(--line)]/50 overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: `${score}%`, backgroundColor: barColor }}
                />
              </div>

              {/* Sub-scores 4 columns */}
              <div className="grid grid-cols-4 gap-1 text-[11px] text-[var(--ink-soft)] pt-1 border-t border-[var(--line)]/40">
                <div>
                  <span className="block text-[10px] uppercase">Skills</span>
                  <span className="text-[var(--ink)] font-medium">
                    {Math.round(c.skills_match ?? 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase">Wording</span>
                  <span className="text-[var(--ink)] font-medium">
                    {Math.round(c.semantic_similarity ?? 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase">Exp</span>
                  <span className="text-[var(--ink)] font-medium">
                    {Math.round(c.experience_relevance ?? 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase">Edu</span>
                  <span className="text-[var(--ink)] font-medium">
                    {Math.round(c.education_relevance ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
