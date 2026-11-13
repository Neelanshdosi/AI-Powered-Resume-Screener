"use client";

import { useState, useCallback, useMemo } from "react";
import type { CandidateResult } from "@/lib/types";
import type { ManagedFile } from "@/lib/files";
import { analyzeResumes } from "@/lib/api";
import { SAMPLE_CANDIDATES } from "@/lib/sampleData";

export interface AnalysisState {
  managedFiles: ManagedFile[];
  jobRole: string;
  jobDescription: string;
  jdFile: File | null;
  jdInputMode: "paste" | "upload";
  analyzing: boolean;
  statusMessage: string;
  results: CandidateResult[];
  error: string | null;
  isSampleData: boolean;
}

export function useAnalysis(onToast?: (type: "success" | "error" | "info", msg: string, title?: string) => void) {
  const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);
  const [jobRole, setJobRole] = useState("SDE");
  const [jobDescription, setJobDescription] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdInputMode, setJdInputMode] = useState<"paste" | "upload">("paste");
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);

  const validationReason = useMemo(() => {
    if (managedFiles.length === 0) {
      return "Upload at least one resume file (PDF, DOC, DOCX) to begin screening.";
    }
    if (jobRole === "custom") {
      if (jdInputMode === "paste" && !jobDescription.trim()) {
        return "Custom role selected: paste a job description or switch to file upload.";
      }
      if (jdInputMode === "upload" && !jdFile) {
        return "Custom role selected: choose a job description document (.txt, .pdf, .docx).";
      }
    }
    return null;
  }, [managedFiles.length, jobRole, jdInputMode, jobDescription, jdFile]);

  const isValid = validationReason === null;

  const runAnalysis = useCallback(async () => {
    if (validationReason) {
      setError(validationReason);
      onToast?.("error", validationReason, "Validation required");
      return;
    }

    setError(null);
    setAnalyzing(true);
    setIsSampleData(false);
    const count = managedFiles.length;
    setStatusMessage(`Scoring ${count} resume${count > 1 ? "s" : ""} across 4 evaluation criteria...`);

    const form = new FormData();
    managedFiles.forEach((mf) => {
      form.append("resumes", mf.file, mf.name);
    });
    form.append("jobRole", jobRole);
    form.append("jobDescription", jobDescription);
    if (jdFile) {
      form.append("jobDescriptionFile", jdFile, jdFile.name);
    }

    try {
      const response = await analyzeResumes(form);
      setResults(response.results || []);
      setStatusMessage("");
      onToast?.(
        "success",
        `Successfully screened ${response.results?.length || count} candidates for ${response.job_role || jobRole}.`,
        "Analysis complete"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis request failed.";
      setError(message);
      onToast?.("error", message, "Analysis error");
    } finally {
      setAnalyzing(false);
    }
  }, [managedFiles, jobRole, jobDescription, jdFile, validationReason, onToast]);

  const loadSampleData = useCallback(() => {
    setError(null);
    setResults(SAMPLE_CANDIDATES);
    setIsSampleData(true);
    setJobRole("SDE");
    setJobDescription(
      "Looking for a Senior Software Development Engineer with deep expertise in Python, TypeScript, system design, distributed systems, cloud computing (AWS/GCP), containerization (Docker, Kubernetes), and modern CI/CD automation."
    );
    setStatusMessage("");
    onToast?.(
      "info",
      "Loaded 7 sample candidate profiles with full breakdown scores, skills matrix, and dossier data.",
      "Sample cohort loaded"
    );
  }, [onToast]);

  const clearResults = useCallback(() => {
    setResults([]);
    setIsSampleData(false);
    setError(null);
    setStatusMessage("");
  }, []);

  return {
    managedFiles,
    setManagedFiles,
    jobRole,
    setJobRole,
    jobDescription,
    setJobDescription,
    jdFile,
    setJdFile,
    jdInputMode,
    setJdInputMode,
    analyzing,
    statusMessage,
    results,
    error,
    setError,
    isSampleData,
    isValid,
    validationReason,
    runAnalysis,
    loadSampleData,
    clearResults,
  };
}
