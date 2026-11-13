"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { CandidateResult } from "@/lib/types";
import { getScoreColor } from "./CandidateTable";
import SkillChips from "./SkillChips";

interface CandidateDrawerProps {
  candidate: CandidateResult | null;
  onClose: () => void;
}

export default function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (candidate) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [candidate, handleKeyDown]);

  if (!candidate) return null;

  const score = Math.round(candidate.match_score || 0);
  const { textClass, barColor } = getScoreColor(score);
  const details = candidate.details || {};
  const experiences = Array.isArray(details.Experience) ? details.Experience : [];
  const educations = Array.isArray(details.Education) ? details.Education : [];
  const projects = Array.isArray(details.Projects) ? details.Projects : [];
  const tips = candidate.tips || [];

  const copyToClipboard = async (text: string, type: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch {
      // Ignore clipboard write failure
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-heading"
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/40 transition-opacity"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-xl bg-[var(--surface)] border-l border-[var(--line)] h-full overflow-y-auto z-10 flex flex-col transition-transform duration-200"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--line)] p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-[var(--ink-soft)] tabular-nums">
                Rank #{candidate.rank}
              </span>
              <h2 id="drawer-heading" className="text-xl font-medium text-[var(--ink)]">
                {candidate.candidate_name || details.Name || "Candidate details"}
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-soft)] mt-0.5 truncate max-w-sm">
              {candidate.filename}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] py-1 px-2 border border-[var(--line)] cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1 text-sm text-[var(--ink)]">
          {/* AI error notice */}
          {candidate.ai_error && (
            <div className="text-xs text-[var(--flag-text)] py-2 border-b border-[var(--line)]">
              AI extraction unavailable, used basic parser. ({candidate.ai_error})
            </div>
          )}

          {/* Contact Details */}
          {(details.Email || details.Phone) && (
            <div className="flex flex-wrap items-center gap-4 text-xs pb-4 border-b border-[var(--line)] text-[var(--ink-soft)]">
              {details.Email && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--ink)]">{details.Email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.Email!, "email")}
                    className="underline cursor-pointer"
                  >
                    {copiedEmail ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
              {details.Phone && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--ink)]">{details.Phone}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(details.Phone!, "phone")}
                    className="underline cursor-pointer"
                  >
                    {copiedPhone ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Overall Score & Thin Bar */}
          <div className="space-y-1.5 pb-5 border-b border-[var(--line)]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[var(--ink-soft)]">Match score</span>
              <span className={`text-2xl font-bold tabular-nums ${textClass}`}>
                {score}%
              </span>
            </div>
            <div className="w-full h-1 bg-[var(--line)]/50 overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${score}%`, backgroundColor: barColor }}
              />
            </div>
          </div>

          {/* 4 Score Breakdown Parts as thin bars */}
          <div className="space-y-3 pb-5 border-b border-[var(--line)]">
            <h3 className="text-xs uppercase text-[var(--ink-soft)] font-medium tracking-wider">
              Score breakdown
            </h3>

            {/* Skills */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-[var(--ink-soft)]">Skills match (40%)</span>
                <span className="font-medium text-[var(--ink)]">
                  {Math.round(candidate.skills_match ?? 0)}%
                </span>
              </div>
              <div className="w-full h-1 bg-[var(--line)]/50 overflow-hidden">
                <div
                  className="h-full bg-[var(--match)]"
                  style={{ width: `${candidate.skills_match ?? 0}%` }}
                />
              </div>
            </div>

            {/* Wording / Semantic */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-[var(--ink-soft)]">Wording match (30%)</span>
                <span className="font-medium text-[var(--ink)]">
                  {Math.round(candidate.semantic_similarity ?? 0)}%
                </span>
              </div>
              <div className="w-full h-1 bg-[var(--line)]/50 overflow-hidden">
                <div
                  className="h-full bg-[var(--ink-soft)]"
                  style={{ width: `${candidate.semantic_similarity ?? 0}%` }}
                />
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-[var(--ink-soft)]">Experience relevance (20%)</span>
                <span className="font-medium text-[var(--ink)]">
                  {Math.round(candidate.experience_relevance ?? 0)}%
                </span>
              </div>
              <div className="w-full h-1 bg-[var(--line)]/50 overflow-hidden">
                <div
                  className="h-full bg-[var(--ink-soft)]"
                  style={{ width: `${candidate.experience_relevance ?? 0}%` }}
                />
              </div>
            </div>

            {/* Education */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-[var(--ink-soft)]">Education relevance (10%)</span>
                <span className="font-medium text-[var(--ink)]">
                  {Math.round(candidate.education_relevance ?? 0)}%
                </span>
              </div>
              <div className="w-full h-1 bg-[var(--line)]/50 overflow-hidden">
                <div
                  className="h-full bg-[var(--ink-soft)]"
                  style={{ width: `${candidate.education_relevance ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="space-y-4 pb-5 border-b border-[var(--line)]">
            <div>
              <span className="block text-xs uppercase text-[var(--ink-soft)] font-medium mb-2">
                Matching skills ({candidate.matching_skills?.length || 0})
              </span>
              <SkillChips skills={candidate.matching_skills || []} variant="match" />
            </div>

            <div>
              <span className="block text-xs uppercase text-[var(--ink-soft)] font-medium mb-2">
                Missing skills ({candidate.missing_skills?.length || 0})
              </span>
              <SkillChips skills={candidate.missing_skills || []} variant="missing" />
            </div>
          </div>

          {/* AI Tips / Coaching notes */}
          {tips.length > 0 && (
            <div className="space-y-2 pb-5 border-b border-[var(--line)]">
              <h3 className="text-xs uppercase text-[var(--ink-soft)] font-medium tracking-wider">
                Review notes
              </h3>
              <ul className="space-y-1.5 text-xs text-[var(--ink-soft)] list-disc list-inside">
                {tips.map((tip, i) => (
                  <li key={i} className="text-[var(--ink)]">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <div className="space-y-2 pb-5 border-b border-[var(--line)]">
              <h3 className="text-xs uppercase text-[var(--ink-soft)] font-medium tracking-wider">
                Experience
              </h3>
              <div className="space-y-2 text-xs text-[var(--ink)]">
                {experiences.map((exp, i) => (
                  <p key={i} className="leading-relaxed">
                    {exp}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {educations.length > 0 && (
            <div className="space-y-2 pb-5 border-b border-[var(--line)]">
              <h3 className="text-xs uppercase text-[var(--ink-soft)] font-medium tracking-wider">
                Education
              </h3>
              <div className="space-y-1.5 text-xs text-[var(--ink)]">
                {educations.map((edu, i) => (
                  <p key={i}>{edu}</p>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs uppercase text-[var(--ink-soft)] font-medium tracking-wider">
                Projects
              </h3>
              <div className="space-y-1.5 text-xs text-[var(--ink)]">
                {projects.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
