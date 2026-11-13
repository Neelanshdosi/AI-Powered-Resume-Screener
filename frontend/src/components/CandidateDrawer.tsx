"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CandidateResult } from "@/lib/types";
import ScoreBarcode from "./ScoreBarcode";
import {
  X,
  User,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  GraduationCap,
  FolderGit2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface CandidateDrawerProps {
  candidate: CandidateResult | null;
  onClose: () => void;
}

export default function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Close on Escape & trap focus
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
  const details = candidate.details || {};
  const hasTips = candidate.tips && candidate.tips.length > 0;
  const experiences = Array.isArray(details.Experience) ? details.Experience : [];
  const educations = Array.isArray(details.Education) ? details.Education : [];
  const projects = Array.isArray(details.Projects) ? details.Projects : [];
  const allExtractedSkills = Array.isArray(details.Skills) ? details.Skills : [];

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
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-2xl bg-[var(--surface)] border-l border-[var(--border)] h-full overflow-y-auto shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[var(--surface)]/95 backdrop-blur-md p-5 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 font-bold">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="drawer-title" className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">
                  {candidate.candidate_name || details.Name || "Candidate Dossier"}
                </h2>
                <span className="shrink-0 font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Rank #{candidate.rank}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5 truncate">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{candidate.filename}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">
                Match Score
              </span>
              <span className="font-mono font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
                {score}%
              </span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close dossier"
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* AI Extraction Error / Fallback Notice (Problem 5) */}
          {candidate.ai_error && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>AI extraction unavailable, used basic parser</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 pl-6">
                {candidate.ai_error}
              </p>
            </div>
          )}

          {/* Contact Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-xs text-[var(--text-primary)] font-medium truncate">
                  {details.Email || "No email detected"}
                </span>
              </div>
              {details.Email && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(details.Email!, "email")}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition shrink-0 cursor-pointer"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs text-[var(--text-primary)] font-medium truncate">
                  {details.Phone || "No phone detected"}
                </span>
              </div>
              {details.Phone && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(details.Phone!, "phone")}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition shrink-0 cursor-pointer"
                  title="Copy phone number"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* Visual Score Breakdown Card */}
          <div>
            <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--text-secondary)] mb-2.5">
              Explainable Scoring Model
            </h3>
            <ScoreBarcode
              skillsMatch={candidate.skills_match ?? 0}
              semanticSimilarity={candidate.semantic_similarity ?? 0}
              experienceRelevance={candidate.experience_relevance ?? 0}
              educationRelevance={candidate.education_relevance ?? 0}
              totalScore={score}
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5 px-1 font-mono">
              Formula: (0.40 × Skills) + (0.30 × Semantic) + (0.20 × Experience) + (0.10 × Education)
            </p>
          </div>

          {/* AI Recruiter Review Tips (Problem 5) */}
          {hasTips && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Lightbulb className="w-4 h-4" />
                <span>AI Candidate Assessment & Growth Areas</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--text-primary)]">
                {candidate.tips!.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Breakdown: Matched vs Missing */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--text-secondary)]">
              Skills Alignment Matrix
            </h3>

            {/* Matched Skills */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matched Role Skills ({candidate.matching_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matching_skills && candidate.matching_skills.length > 0 ? (
                  candidate.matching_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--text-muted)] italic">No matching skills detected</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Role Skill Gaps ({candidate.missing_skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                  candidate.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--text-muted)] italic">No skill gaps identified</span>
                )}
              </div>
            </div>

            {/* All Extracted Skills */}
            {allExtractedSkills.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] space-y-2">
                <div className="text-xs font-semibold text-[var(--text-secondary)]">
                  <span>Additional Extracted Competencies ({allExtractedSkills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allExtractedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Work Experience */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--text-secondary)] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>Extracted Work Experience</span>
            </h3>
            {experiences.length > 0 ? (
              <div className="space-y-2">
                {experiences.map((exp, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] leading-relaxed"
                  >
                    {exp}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic px-2">
                No specific experience items parsed from document.
              </p>
            )}
          </div>

          {/* Extracted Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--text-secondary)] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span>Extracted Education Credentials</span>
            </h3>
            {educations.length > 0 ? (
              <div className="space-y-2">
                {educations.map((edu, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] leading-relaxed"
                  >
                    {edu}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic px-2">
                No educational qualifications explicitly parsed.
              </p>
            )}
          </div>

          {/* Extracted Projects */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold tracking-wide uppercase text-[var(--text-secondary)] flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-amber-500" />
                <span>Extracted Projects</span>
              </h3>
              <div className="space-y-2">
                {projects.map((proj, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] leading-relaxed"
                  >
                    {proj}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
