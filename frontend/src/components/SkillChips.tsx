"use client";

import { useState } from "react";

interface SkillChipsProps {
  skills: string[];
  variant: "match" | "missing";
  initialLimit?: number;
}

export default function SkillChips({
  skills = [],
  variant,
  initialLimit = 12,
}: SkillChipsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!skills || skills.length === 0) {
    return (
      <span className="text-xs text-[var(--ink-soft)] italic">
        {variant === "match" ? "None detected" : "None"}
      </span>
    );
  }

  const isMatch = variant === "match";
  const displayed = expanded ? skills : skills.slice(0, initialLimit);
  const remaining = skills.length - initialLimit;

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
      {displayed.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className={`inline-flex items-center gap-1 ${
            isMatch ? "text-[var(--match)]" : "text-[var(--gap)]"
          }`}
        >
          <span aria-hidden="true" className="font-bold text-[11px]">
            {isMatch ? "✓" : "×"}
          </span>
          <span className="text-[var(--ink)]">{skill}</span>
        </span>
      ))}

      {skills.length > initialLimit && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] text-[var(--ink-soft)] hover:text-[var(--ink)] underline underline-offset-2 cursor-pointer ml-1"
          aria-expanded={expanded}
        >
          {expanded ? "Less" : `+${remaining} more`}
        </button>
      )}
    </div>
  );
}
