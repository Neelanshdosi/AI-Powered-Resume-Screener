"use client";

import type { CandidateResult } from "@/lib/types";
import SkillChips from "./SkillChips";
import ScoreBarcode from "./ScoreBarcode";
import { User, FileText, ChevronRight, AlertTriangle } from "lucide-react";

interface CandidateCardProps {
  candidate: CandidateResult;
  onSelect: (candidate: CandidateResult) => void;
}

export default function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  const score = Math.round(candidate.match_score || 0);

  // Accessible fit tier (never color alone)
  const isHighFit = score >= 75;
  const isMidFit = score >= 50 && score < 75;
  const fitLabel = isHighFit ? "High Fit" : isMidFit ? "Moderate Fit" : "Low Alignment";

  return (
    <article className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between gap-4 group">
      <div className="space-y-3.5">
        {/* Header: Candidate Identity & Rank */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {candidate.candidate_name || "Unknown Candidate"}
              </h3>
              <p
                className="text-xs text-[var(--text-muted)] flex items-center gap-1 truncate"
                title={candidate.filename}
              >
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{candidate.filename || "No filename"}</span>
              </p>
            </div>
          </div>

          {/* Rank Badge */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Rank
            </span>
            <span
              className={`font-mono font-extrabold text-base px-2 py-0.5 rounded-lg border ${
                candidate.rank === 1
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : candidate.rank <= 3
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
              }`}
            >
              #{candidate.rank}
            </span>
          </div>
        </div>

        {/* AI Error / Fallback Notice (Problem 5) */}
        {candidate.ai_error && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">AI extraction unavailable, used basic parser fallback</span>
          </div>
        )}

        {/* Overall Score & Tier Label */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[var(--text-primary)]">
              {score}%
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                isHighFit
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : isMidFit
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
              }`}
            >
              {fitLabel}
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">Weighted fit</span>
        </div>

        {/* Score Breakdown (All 4 Sub-Scores & Weights) */}
        <ScoreBarcode
          skillsMatch={candidate.skills_match ?? 0}
          semanticSimilarity={candidate.semantic_similarity ?? 0}
          experienceRelevance={candidate.experience_relevance ?? 0}
          educationRelevance={candidate.education_relevance ?? 0}
          totalScore={score}
        />

        {/* Skills Lists */}
        <div className="space-y-2 pt-1">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1">
              <span>Matching Skills</span>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {candidate.matching_skills?.length || 0}
              </span>
            </div>
            <SkillChips skills={candidate.matching_skills || []} variant="match" initialLimit={5} />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1">
              <span>Missing Qualifications</span>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {candidate.missing_skills?.length || 0}
              </span>
            </div>
            <SkillChips skills={candidate.missing_skills || []} variant="missing" initialLimit={4} />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => onSelect(candidate)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--surface-subtle)] hover:bg-blue-600 hover:text-white border border-[var(--border)] text-[var(--text-primary)] transition group cursor-pointer"
        >
          <span>View candidate dossier</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </article>
  );
}
