"use client";

import type { CandidateResult } from "@/lib/types";
import SkillChips from "./SkillChips";
import { getScoreColor } from "./CandidateTable";

interface CandidateCardProps {
  candidate: CandidateResult;
  onSelect: (candidate: CandidateResult) => void;
}

export default function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  const score = Math.round(candidate.match_score || 0);
  const { textClass, barColor } = getScoreColor(score);

  return (
    <article
      onClick={() => onSelect(candidate)}
      className="border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3 cursor-pointer hover:bg-[var(--ground)]/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-[var(--ink-soft)] tabular-nums">
              #{candidate.rank}
            </span>
            <h3 className="font-medium text-base text-[var(--ink)]">
              {candidate.candidate_name || "Unknown candidate"}
            </h3>
          </div>
          <p className="text-xs text-[var(--ink-soft)] truncate mt-0.5" title={candidate.filename}>
            {candidate.filename}
          </p>
        </div>
        <div className="text-right shrink-0 tabular-nums">
          <span className={`text-base font-semibold ${textClass}`}>{score}%</span>
        </div>
      </div>

      {candidate.ai_error && (
        <div className="text-[11px] text-[var(--flag-text)]">
          Basic parser fallback
        </div>
      )}

      {/* 4px bar */}
      <div className="w-full h-1 bg-[var(--line)]/50 overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${score}%`, backgroundColor: barColor }}
        />
      </div>

      {/* 4 Pillars tabular numbers */}
      <div className="grid grid-cols-4 gap-2 text-xs tabular-nums pt-1 border-t border-[var(--line)]">
        <div>
          <span className="block text-[11px] text-[var(--ink-soft)]">Skills (40%)</span>
          <span className="font-medium text-[var(--ink)]">
            {Math.round(candidate.skills_match ?? 0)}
          </span>
        </div>
        <div>
          <span className="block text-[11px] text-[var(--ink-soft)]">Wording (30%)</span>
          <span className="font-medium text-[var(--ink)]">
            {Math.round(candidate.semantic_similarity ?? 0)}
          </span>
        </div>
        <div>
          <span className="block text-[11px] text-[var(--ink-soft)]">Exp (20%)</span>
          <span className="font-medium text-[var(--ink)]">
            {Math.round(candidate.experience_relevance ?? 0)}
          </span>
        </div>
        <div>
          <span className="block text-[11px] text-[var(--ink-soft)]">Edu (10%)</span>
          <span className="font-medium text-[var(--ink)]">
            {Math.round(candidate.education_relevance ?? 0)}
          </span>
        </div>
      </div>

      {/* Skills breakdown */}
      <div className="space-y-2 pt-1 border-t border-[var(--line)]">
        <div>
          <span className="block text-[11px] text-[var(--ink-soft)] mb-1">Matching skills</span>
          <SkillChips skills={candidate.matching_skills || []} variant="match" initialLimit={6} />
        </div>
        <div>
          <span className="block text-[11px] text-[var(--ink-soft)] mb-1">Missing skills</span>
          <SkillChips skills={candidate.missing_skills || []} variant="missing" initialLimit={6} />
        </div>
      </div>
    </article>
  );
}
