"use client";

import { useState } from "react";
import { JOB_ROLES } from "@/lib/types";
import type { ManagedFile } from "@/lib/files";
import ResumeDropZone from "./ResumeDropZone";
import JobDescriptionInput from "./JobDescriptionInput";
import { Sparkles, AlertCircle, Play, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface AnalysisFormProps {
  managedFiles: ManagedFile[];
  onFilesChange: (files: ManagedFile[]) => void;
  jobRole: string;
  onJobRoleChange: (role: string) => void;
  jobDescription: string;
  onJobDescriptionChange: (text: string) => void;
  jdFile: File | null;
  onJdFileChange: (file: File | null) => void;
  jdInputMode: "paste" | "upload";
  onJdInputModeChange: (mode: "paste" | "upload") => void;
  analyzing: boolean;
  statusMessage: string;
  error: string | null;
  onDismissError: () => void;
  isValid: boolean;
  validationReason: string | null;
  onRunAnalysis: () => void;
  onLoadSample: () => void;
  hasResults: boolean;
  onRejectedFiles: (files: string[]) => void;
}

export default function AnalysisForm({
  managedFiles,
  onFilesChange,
  jobRole,
  onJobRoleChange,
  jobDescription,
  onJobDescriptionChange,
  jdFile,
  onJdFileChange,
  jdInputMode,
  onJdInputModeChange,
  analyzing,
  statusMessage,
  error,
  onDismissError,
  isValid,
  validationReason,
  onRunAnalysis,
  onLoadSample,
  hasResults,
  onRejectedFiles,
}: AnalysisFormProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm transition-all duration-200 overflow-hidden">
      {/* Header bar of intake form */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]/50">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-[var(--text-primary)] flex items-center gap-2">
            <span>Intake & Candidate Setup</span>
            {hasResults && (
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active Cohort
              </span>
            )}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Stage applicant resumes and specify target role or job description
          </p>
        </div>

        {hasResults && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition cursor-pointer"
          >
            <span>{isCollapsed ? "Expand setup" : "Collapse setup"}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Form grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Resume drop zone & role */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)] mb-2">
                  Upload Resumes <span className="text-blue-500">*</span>
                </label>
                <ResumeDropZone
                  files={managedFiles}
                  onFilesChange={onFilesChange}
                  onRejected={onRejectedFiles}
                />
              </div>

              <div>
                <label
                  htmlFor="job-role-select"
                  className="block text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)] mb-1.5"
                >
                  Target Role Baseline
                </label>
                <select
                  id="job-role-select"
                  value={jobRole}
                  onChange={(e) => onJobRoleChange(e.target.value)}
                  className="w-full p-3 bg-[var(--surface-subtle)] border border-[var(--border)] focus:border-blue-500 rounded-xl text-xs sm:text-sm text-[var(--text-primary)] font-medium transition cursor-pointer"
                >
                  {JOB_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Applies curated ATS criteria for the role or custom JD weighting.
                </p>
              </div>
            </div>

            {/* Right column: Tabbed Job Description */}
            <div className="space-y-4">
              <JobDescriptionInput
                mode={jdInputMode}
                onModeChange={onJdInputModeChange}
                textValue={jobDescription}
                onTextChange={onJobDescriptionChange}
                fileValue={jdFile}
                onFileChange={onJdFileChange}
                isCustomRole={jobRole === "custom"}
              />
            </div>
          </div>

          {/* Validation Notice / Error Feedback */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start justify-between gap-3 text-xs sm:text-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to process resumes</p>
                  <p className="text-xs opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onDismissError}
                className="text-xs font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {!isValid && validationReason && !error && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationReason}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLoadSample}
                disabled={analyzing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load sample cohort (7 candidates)</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onRunAnalysis}
                disabled={!isValid || analyzing}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                  !isValid || analyzing
                    ? "opacity-50 cursor-not-allowed bg-[var(--border)] text-[var(--text-muted)]"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                }`}
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Scoring cohort...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {managedFiles.length > 0
                        ? `Rank ${managedFiles.length} candidate${managedFiles.length > 1 ? "s" : ""}`
                        : "Rank candidates"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Honest Indeterminate Feedback (Problem 3) */}
          {analyzing && (
            <div
              aria-live="polite"
              className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2 animate-pulse"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {statusMessage || `Scoring ${managedFiles.length} resumes...`}
                </span>
                <span className="text-[var(--text-muted)] font-mono">
                  Evaluating Skills (40%), Semantic (30%), Experience (20%), Education (10%)
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-950/60 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-blue-500 w-1/3 rounded-full animate-indeterminate" />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
