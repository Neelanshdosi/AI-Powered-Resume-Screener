"use client";

import { useRef, useState } from "react";
import { mergeResumeFiles } from "@/lib/files";

type ResumeDropZoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export default function ResumeDropZone({ files, onFilesChange }: ResumeDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const addFiles = (incoming: FileList | File[]) => {
    const { merged, rejected } = mergeResumeFiles(files, incoming);
    if (rejected.length) {
      alert(
        `Skipped unsupported file(s): ${rejected.join(", ")}\nAllowed: PDF, DOC, DOCX`
      );
    }
    onFilesChange(merged);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`w-full p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition ${
          dragActive
            ? "border-emerald-500 bg-slate-800/80"
            : "border-slate-600 hover:bg-slate-800/80"
        }`}
      >
        <p className="text-slate-300">
          Drag & drop multiple resumes here, or click to browse
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Hold Ctrl (Windows) / Cmd (Mac) to select multiple files at once
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <p className="text-sm text-slate-400 mt-2">
        {files.length
          ? `${files.length} resume(s) ready to analyze`
          : "No resumes selected"}
      </p>

      <ul className="mt-2 space-y-1 text-sm">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.lastModified}`}
            className="flex items-center justify-between gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
          >
            <span className="truncate text-slate-200" title={file.name}>
              {index + 1}. {file.name}
            </span>
            <button
              type="button"
              onClick={() => removeFile(index)}
              className="text-rose-400 hover:text-rose-300 text-xs font-semibold shrink-0"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}