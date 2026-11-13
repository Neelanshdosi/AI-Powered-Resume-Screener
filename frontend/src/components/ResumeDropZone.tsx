"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, Trash2, Plus } from "lucide-react";
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

  const clearAll = () => {
    onFilesChange([]);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const formattedTotalSize =
    totalSize > 0
      ? totalSize > 1024 * 1024
        ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
        : `${(totalSize / 1024).toFixed(0)} KB`
      : "0 KB";

  return (
    <div className="space-y-3">
      {/* Drop Target */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume files. Drag and drop PDF, DOC, or DOCX files here, or press enter or space to browse."
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
        className={`relative p-6 sm:p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200 select-none ${
          isDragOver
            ? "border-blue-500 bg-blue-500/10 scale-[0.99]"
            : "border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] hover:border-blue-500/50"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              isDragOver
                ? "bg-blue-500 text-white"
                : "bg-[var(--surface)] text-[var(--accent)] border border-[var(--border-subtle)]"
            }`}
          >
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
              Drop resumes here or <span className="text-blue-500 underline decoration-blue-500/40 underline-offset-4">browse files</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Supports PDF, DOC, and DOCX (up to 30 MB per batch)
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
            e.target.value = "";
          }}
        />
      </div>

      {/* File Queue List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span className="font-medium text-[var(--text-secondary)]">
              {files.length} {files.length === 1 ? "resume" : "resumes"} staged ({formattedTotalSize})
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add more
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>

          <ul className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-xl bg-[var(--surface)] p-2">
            {files.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 pt-1.5 pb-1 px-2 rounded-lg hover:bg-[var(--surface-hover)] transition group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] w-5 shrink-0 text-right">
                    {index + 1}.
                  </span>
                  <div className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {item.extension}
                  </div>
                  <div className="min-w-0 truncate">
                    <p
                      className="text-xs font-medium text-[var(--text-primary)] truncate"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)]">
                      {item.formattedSize}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="shrink-0 p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
