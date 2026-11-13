"use client";

import { useState } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface SkillChipsProps {
  skills: string[];
  variant: "match" | "missing";
  initialLimit?: number;
}

export default function SkillChips({
  skills = [],
  variant,
  initialLimit = 6,
}: SkillChipsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!skills || skills.length === 0) {
    return (
      <span className="text-xs text-[var(--text-muted)] italic">
        {variant === "match" ? "No matching skills detected" : "None missing"}
      </span>
    );
  }

  const isMatch = variant === "match";
  const displayed = expanded ? skills : skills.slice(0, initialLimit);
  const remaining = skills.length - initialLimit;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displayed.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
            isMatch
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25"
          }`}
        >
          {isMatch ? (
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <X className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate max-w-[140px]">{skill}</span>
        </span>
      ))}

      {skills.length > initialLimit && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition cursor-pointer"
          aria-expanded={expanded}
          aria-label={expanded ? "Show fewer skills" : `Show ${remaining} more skills`}
        >
          {expanded ? (
            <>
              <span>Less</span>
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              <span>+{remaining} more</span>
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
