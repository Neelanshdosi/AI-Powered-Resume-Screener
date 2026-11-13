"use client";

import type { CandidateResult } from "@/lib/types";
import type { SortField, SortDirection } from "@/lib/filters";
import ScoreBarcode from "./ScoreBarcode";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

interface CandidateTableProps {
  candidates: CandidateResult[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectCandidate: (candidate: CandidateResult) => void;
}

export default function CandidateTable({
  candidates,
  sortField,
  sortDirection,
  onSort,
  onSelectCandidate,
}: CandidateTableProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-500 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-500 font-bold" />
    );
  };

  return (
    <div className="border border-[var(--border)] rounded-2xl bg-[var(--surface)] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold">
              {/* Rank */}
              <th scope="col" className="p-3 sm:p-4 w-16 text-center">
                <button
                  type="button"
                  onClick={() => onSort("rank")}
                  className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <span>Rank</span>
                  {renderSortIcon("rank")}
                </button>
              </th>

              {/* Candidate Info */}
              <th scope="col" className="p-3 sm:p-4 min-w-[200px]">
                <button
                  type="button"
                  onClick={() => onSort("candidate_name")}
                  className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <span>Candidate</span>
                  {renderSortIcon("candidate_name")}
                </button>
              </th>

              {/* Match Score */}
              <th scope="col" className="p-3 sm:p-4 min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort("match_score")}
                  className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <span>Match Score</span>
                  {renderSortIcon("match_score")}
                </button>
              </th>

              {/* Score Barcode (4 Pillars) */}
              <th scope="col" className="p-3 sm:p-4 min-w-[170px]">
                <span>Score Composition</span>
              </th>

              {/* Skills Match 40% */}
              <th scope="col" className="p-3 sm:p-4 text-center hidden md:table-cell">
                <button
                  type="button"
                  onClick={() => onSort("skills_match")}
                  className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  title="Skills Match Component (40% weight)"
                >
                  <span>Skills (40%)</span>
                  {renderSortIcon("skills_match")}
                </button>
              </th>

              {/* Semantic 30% */}
              <th scope="col" className="p-3 sm:p-4 text-center hidden lg:table-cell">
                <button
                  type="button"
                  onClick={() => onSort("semantic_similarity")}
                  className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  title="Semantic Similarity Component (30% weight)"
                >
                  <span>Semantic (30%)</span>
                  {renderSortIcon("semantic_similarity")}
                </button>
              </th>

              {/* Experience 20% */}
              <th scope="col" className="p-3 sm:p-4 text-center hidden lg:table-cell">
                <button
                  type="button"
                  onClick={() => onSort("experience_relevance")}
                  className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  title="Experience Relevance Component (20% weight)"
                >
                  <span>Exp (20%)</span>
                  {renderSortIcon("experience_relevance")}
                </button>
              </th>

              {/* Education 10% */}
              <th scope="col" className="p-3 sm:p-4 text-center hidden xl:table-cell">
                <button
                  type="button"
                  onClick={() => onSort("education_relevance")}
                  className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] cursor-pointer"
                  title="Education Relevance Component (10% weight)"
                >
                  <span>Edu (10%)</span>
                  {renderSortIcon("education_relevance")}
                </button>
              </th>

              {/* Skills Preview */}
              <th scope="col" className="p-3 sm:p-4 hidden sm:table-cell">
                <span>Key Alignment</span>
              </th>

              {/* Action */}
              <th scope="col" className="p-3 sm:p-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-subtle)]">
            {candidates.map((candidate, idx) => {
              const score = Math.round(candidate.match_score || 0);
              const isHigh = score >= 75;
              const isMid = score >= 50 && score < 75;

              // Unique stable row key
              const stableKey = candidate.stored_file || `${candidate.filename}-${candidate.rank}-${idx}`;

              return (
                <tr
                  key={stableKey}
                  onClick={() => onSelectCandidate(candidate)}
                  className="hover:bg-[var(--surface-hover)] transition-colors cursor-pointer group"
                >
                  {/* Rank */}
                  <td className="p-3 sm:p-4 text-center">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border ${
                        candidate.rank === 1
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          : candidate.rank <= 3
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : "bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)]"
                      }`}
                    >
                      #{candidate.rank}
                    </span>
                  </td>

                  {/* Candidate Name & File */}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-blue-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {candidate.candidate_name || "Unknown Candidate"}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate" title={candidate.filename}>
                          {candidate.filename}
                        </p>
                        {candidate.ai_error && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Regex fallback
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Match Score */}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
                        {score}%
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          isHigh
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                            : isMid
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                        }`}
                      >
                        {isHigh ? "High" : isMid ? "Mid" : "Low"}
                      </span>
                    </div>
                  </td>

                  {/* Score Composition Barcode */}
                  <td className="p-3 sm:p-4">
                    <ScoreBarcode
                      skillsMatch={candidate.skills_match ?? 0}
                      semanticSimilarity={candidate.semantic_similarity ?? 0}
                      experienceRelevance={candidate.experience_relevance ?? 0}
                      educationRelevance={candidate.education_relevance ?? 0}
                      totalScore={score}
                      compact={true}
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] mt-1">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        S: {Math.round(candidate.skills_match ?? 0)}%
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        M: {Math.round(candidate.semantic_similarity ?? 0)}%
                      </span>
                      <span className="text-amber-600 dark:text-amber-400">
                        E: {Math.round(candidate.experience_relevance ?? 0)}%
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">
                        Ed: {Math.round(candidate.education_relevance ?? 0)}%
                      </span>
                    </div>
                  </td>

                  {/* Skills Sub-Score (40%) */}
                  <td className="p-3 sm:p-4 text-center font-mono font-semibold hidden md:table-cell text-emerald-600 dark:text-emerald-400">
                    {Math.round(candidate.skills_match ?? 0)}%
                  </td>

                  {/* Semantic Sub-Score (30%) */}
                  <td className="p-3 sm:p-4 text-center font-mono font-semibold hidden lg:table-cell text-blue-600 dark:text-blue-400">
                    {Math.round(candidate.semantic_similarity ?? 0)}%
                  </td>

                  {/* Experience Sub-Score (20%) */}
                  <td className="p-3 sm:p-4 text-center font-mono font-semibold hidden lg:table-cell text-amber-600 dark:text-amber-400">
                    {Math.round(candidate.experience_relevance ?? 0)}%
                  </td>

                  {/* Education Sub-Score (10%) */}
                  <td className="p-3 sm:p-4 text-center font-mono font-semibold hidden xl:table-cell text-purple-600 dark:text-purple-400">
                    {Math.round(candidate.education_relevance ?? 0)}%
                  </td>

                  {/* Skills Preview */}
                  <td className="p-3 sm:p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Check className="w-3 h-3" />
                        {candidate.matching_skills?.length || 0}
                      </span>
                      <span className="text-[var(--text-muted)]">•</span>
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                        <X className="w-3 h-3" />
                        {candidate.missing_skills?.length || 0}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 sm:p-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCandidate(candidate);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--surface-subtle)] group-hover:bg-blue-600 group-hover:text-white border border-[var(--border-subtle)] text-[var(--text-secondary)] transition cursor-pointer"
                    >
                      <span>Dossier</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
