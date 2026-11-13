"use client";

import { Sparkles, Layers, ShieldCheck, FileSpreadsheet } from "lucide-react";

interface EmptyStateProps {
  onLoadSample: () => void;
}

export default function EmptyState({ onLoadSample }: EmptyStateProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-6">
      <div className="max-w-md mx-auto space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto shadow-md shadow-blue-500/10">
          <Sparkles className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
          Explore Candidate Rankings & AI Dossiers
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
          Upload resumes above to screen your applicants against target job requirements, or test drive the dashboard with our fictional cohort of 7 software engineers.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Try with sample cohort (no API required)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-left border-t border-[var(--border-subtle)]">
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <Layers className="w-4 h-4 text-blue-500 mb-2" />
          <h4 className="text-xs font-bold text-[var(--text-primary)]">Weighted Scoring</h4>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            4-pillar explainable model: 40% skills, 30% semantic, 20% experience, 10% education.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <ShieldCheck className="w-4 h-4 text-emerald-500 mb-2" />
          <h4 className="text-xs font-bold text-[var(--text-primary)]">Candidate Dossiers</h4>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Full contact intelligence, matched vs missing skills matrix, and AI growth tips.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <FileSpreadsheet className="w-4 h-4 text-purple-500 mb-2" />
          <h4 className="text-xs font-bold text-[var(--text-primary)]">Filtered Exports</h4>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Download customized CSV and XLSX spreadsheets for live applicant tracking systems.
          </p>
        </div>
      </div>
    </div>
  );
}
