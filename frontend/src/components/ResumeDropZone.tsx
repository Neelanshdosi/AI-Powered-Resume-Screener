"use client";

import { useRef, useState } from "react";
import { mergeResumeFiles, type ManagedFile } from "@/lib/files";

interface ResumeDropZoneProps {
  files: ManagedFile[];
  onFilesChange: (files: ManagedFile[]) => void;
  onRejected?: (rejected: string[]) => void;
}

export default function ResumeDropZone({
  files,
  onFilesChange,
  onRejected,
}: ResumeDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (incoming: FileList | File[]) => {
    const { merged, rejected } = mergeResumeFiles(files, incoming);
    if (rejected.length > 0 && onRejected) {
      onRejected(rejected);
    }
    onFilesChange(merged);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume files. Drag and drop PDF, DOC, or DOCX files here, or press enter to browse."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.length) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`p-4 border border-dashed text-left cursor-pointer transition text-xs select-none ${
          isDragOver
            ? "border-[var(--match)] bg-[var(--surface)]"
            : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--ink-soft)]"
        }`}
      >
        <span className="font-medium text-[var(--ink)]">Select or drop resumes</span>
        <span className="text-[var(--ink-soft)] ml-1.5">(PDF, DOC, DOCX)</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {files.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)]">
            <span>{files.length} staged ({files.reduce((acc, f) => acc + f.size, 0) > 1024 * 1024 ? `${(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(files.reduce((acc, f) => acc + f.size, 0) / 1024)} KB`})</span>
            <button
              type="button"
              onClick={() => onFilesChange([])}
              className="text-[var(--gap)] hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <ul className="max-h-36 overflow-y-auto divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--surface)] text-xs">
            {files.map((item) => (
              <li
                key={item.id}
                className="py-1.5 px-3 flex items-center justify-between gap-2"
              >
                <span className="truncate text-[var(--ink)]" title={item.name}>
                  {item.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-[var(--ink-soft)] tabular-nums">
                    {item.formattedSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-[var(--ink-soft)] hover:text-[var(--gap)] cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
