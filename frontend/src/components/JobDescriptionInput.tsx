"use client";

import { useRef } from "react";
import { formatFileSize } from "@/lib/files";

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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="text-[var(--ink-soft)] font-medium">
          Job description {isCustomRole && <span className="text-[var(--gap)]">*</span>}
        </label>

        {/* Tab switchers with --flag underline for active state */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onModeChange("paste")}
            className={`pb-0.5 cursor-pointer transition ${
              mode === "paste"
                ? "text-[var(--ink)] font-medium border-b-2 border-[var(--flag)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            Paste
          </button>
          <button
            type="button"
            onClick={() => onModeChange("upload")}
            className={`pb-0.5 cursor-pointer transition ${
              mode === "upload"
                ? "text-[var(--ink)] font-medium border-b-2 border-[var(--flag)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            File {fileValue && "•"}
          </button>
        </div>
      </div>

      {mode === "paste" ? (
        <textarea
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          placeholder={
            isCustomRole
              ? "Paste job requirements here..."
              : "Optional: paste custom requirements to override standard role criteria"
          }
          className="w-full p-2.5 bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:outline-none resize-y min-h-[90px]"
        />
      ) : (
        <div>
          {fileValue ? (
            <div className="flex items-center justify-between p-2.5 bg-[var(--surface)] border border-[var(--line)] text-xs">
              <span className="truncate text-[var(--ink)]">
                {fileValue.name} ({formatFileSize(fileValue.size)})
              </span>
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="text-[var(--ink-soft)] hover:text-[var(--gap)] cursor-pointer ml-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="p-4 border border-dashed border-[var(--line)] bg-[var(--surface)] text-left cursor-pointer hover:border-[var(--ink-soft)] text-xs"
            >
              <span className="font-medium text-[var(--ink)]">Select job description file</span>
              <span className="text-[var(--ink-soft)] ml-1.5">(PDF, DOC, DOCX, TXT)</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) onFileChange(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
