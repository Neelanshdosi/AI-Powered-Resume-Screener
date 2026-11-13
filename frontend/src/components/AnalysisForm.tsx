"use client";

import { useState } from "react";
import { JOB_ROLES } from "@/lib/types";
import type { ManagedFile } from "@/lib/files";
import ResumeDropZone from "./ResumeDropZone";
import JobDescriptionInput from "./JobDescriptionInput";

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
  // Automatically collapses to a one-line summary after analysis
  const [manuallyExpanded, setManuallyExpanded] = useState(false);
  const isCollapsed = hasResults && !manuallyExpanded;

  const selectedRoleLabel =
    JOB_ROLES.find((r) => r.value === jobRole)?.label || jobRole;

  // If results exist and collapsed, show quiet one-line summary
  if (isCollapsed) {
    return (
      <div className="py-2.5 px-3 border border-[var(--line)] bg-[var(--surface)] text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--ink)]">
          <span className="text-[var(--ink-soft)]">Setup:</span>
          <span>
            {selectedRoleLabel} · {managedFiles.length > 0 ? `${managedFiles.length} resumes staged` : "7 candidates scored"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setManuallyExpanded(true)}
          className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] underline cursor-pointer"
        >
          Edit intake
        </button>
      </div>
    );
  }

  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--ink)] uppercase tracking-wider">
          Intake setup
        </h2>
        {hasResults && (
          <button
            type="button"
            onClick={() => setManuallyExpanded(false)}
            className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] underline cursor-pointer"
          >
            Collapse
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Role & Resumes */}
        <div className="space-y-3">
          <div>
            <label htmlFor="role-select" className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
              Target role
            </label>
            <select
              id="role-select"
              value={jobRole}
              onChange={(e) => onJobRoleChange(e.target.value)}
              className="w-full p-2 bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              {JOB_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink-soft)] mb-1">
              Resumes
            </label>
            <ResumeDropZone
              files={managedFiles}
              onFilesChange={onFilesChange}
              onRejected={onRejectedFiles}
            />
          </div>
        </div>

        {/* Right Column: Job Description */}
        <div>
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

      {/* Error or validation feedback */}
      {error && (
        <div className="text-xs text-[var(--gap)] flex items-baseline justify-between pt-1">
          <span>{error}</span>
          <button
            type="button"
            onClick={onDismissError}
            className="underline ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!isValid && validationReason && !error && (
        <p className="text-xs text-[var(--ink-soft)] pt-1">
          {validationReason}
        </p>
      )}

      {/* Button Row: Exactly ONE primary button */}
      <div className="pt-2 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onLoadSample}
          disabled={analyzing}
          className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] underline cursor-pointer"
        >
          Try sample data
        </button>

        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={!isValid || analyzing}
          className="bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 disabled:opacity-40 text-xs font-medium py-2 px-4 transition cursor-pointer"
        >
          {analyzing ? "Scoring resumes..." : managedFiles.length > 0 ? `Rank ${managedFiles.length} candidates` : "Rank candidates"}
        </button>
      </div>

      {/* Honest Indeterminate Feedback */}
      {analyzing && (
        <div className="space-y-1 pt-1" aria-live="polite">
          <div className="text-xs text-[var(--ink-soft)]">
            {statusMessage || `Scoring ${managedFiles.length} resumes...`}
          </div>
          <div className="w-full h-0.5 bg-[var(--line)] overflow-hidden">
            <div className="h-full bg-[var(--ink)] w-1/3 animate-indeterminate" />
          </div>
        </div>
      )}
    </section>
  );
}
