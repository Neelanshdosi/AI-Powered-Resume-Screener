"use client";

import { useRef } from "react";
import { FileText, AlignLeft, Upload, X } from "lucide-react";
import { formatFileSize, getFileExtension } from "@/lib/files";

interface JobDescriptionInputProps {
  mode: "paste" | "upload";
  onModeChange: (mode: "paste" | "upload") => void;
  textValue: string;
  onTextChange: (value: string) => void;
  fileValue: File | null;
  onFileChange: (file: File | null) => void;
  isCustomRole: boolean;
}

export default function JobDescriptionInput({
  mode,
  onModeChange,
  textValue,
  onTextChange,
  fileValue,
  onFileChange,
  isCustomRole,
}: JobDescriptionInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold tracking-wide uppercase text-[var(--text-secondary)]">
          Target Job Description {isCustomRole && <span className="text-amber-500">*</span>}
        </label>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded-lg border border-[var(--border-subtle)] text-xs">
          <button
            type="button"
            onClick={() => onModeChange("paste")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              mode === "paste"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Paste text</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange("upload")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              mode === "upload"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload file {fileValue && "•"}</span>
          </button>
        </div>
      </div>

      {mode === "paste" ? (
        <div>
          <textarea
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            rows={5}
            placeholder={
              isCustomRole
                ? "Paste custom job requirements, responsibilities, and must-have qualifications here..."
                : "Optionally paste a specific job description to override or refine the standard role criteria..."
            }
            className="w-full p-3.5 bg-[var(--surface-subtle)] border border-[var(--border)] focus:border-blue-500 rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition resize-y min-h-[130px]"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-1 px-1">
            <span>
              {isCustomRole
                ? "Required when Custom Role is chosen"
                : "Optional: supplements chosen role template"}
            </span>
            <span className="font-mono">{textValue.length} chars</span>
          </div>
        </div>
      ) : (
        <div>
          {fileValue ? (
            <div className="flex items-center justify-between gap-3 p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {getFileExtension(fileValue.name)}
                </div>
                <div className="min-w-0 truncate">
                  <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate">
                    {fileValue.name}
                  </p>
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">
                    {formatFileSize(fileValue.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-md border border-[var(--border-subtle)] transition cursor-pointer"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onFileChange(null)}
                  aria-label="Remove selected job description file"
                  className="p-1 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload job description document. Supports PDF, DOC, DOCX, or TXT."
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="p-6 border-2 border-dashed border-[var(--border)] rounded-xl text-center bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] hover:border-blue-500/50 cursor-pointer transition"
            >
              <div className="flex flex-col items-center gap-1.5">
                <FileText className="w-6 h-6 text-blue-500" />
                <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                  Select job description document
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  PDF, DOC, DOCX, or TXT (up to 10 MB)
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileChange(e.target.files[0]);
              }
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
