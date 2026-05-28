"use client";

import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import ResumeDropZone from "./ResumeDropZone";
import Dashboard from "./Dashboard";
import CandidateSkeleton from "./CandidateSkeleton";
import { analyzeResumes, downloadBlob, exportResults } from "@/lib/api";
import { filterCandidates } from "@/lib/filters";
import { JOB_ROLES, type CandidateResult } from "@/lib/types";

export default function HomeClient() {
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [jobRole, setJobRole] = useState("SDE");
  const [jobDescription, setJobDescription] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [allResults, setAllResults] = useState<CandidateResult[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minScore, setMinScore] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  const startProgress = () => {
    setProgress(10);
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress((prev) => (prev < 92 ? prev + 6 : prev));
    }, 400);
  };

  const stopProgress = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    setProgress(100);
    setTimeout(() => {
      setProgress(0);
      setStatus("");
    }, 450);
  };

  const handleAnalyze = async () => {
    if (!resumeFiles.length) {
      alert("Please upload at least one resume.");
      return;
    }
    if (jobRole === "custom" && !jobDescription.trim() && !jdFile) {
      alert("Provide custom JD text or upload a JD file.");
      return;
    }

    const form = new FormData();
    resumeFiles.forEach((file) => form.append("resumes", file, file.name));
    form.append("jobRole", jobRole);
    form.append("jobDescription", jobDescription);
    if (jdFile) form.append("jobDescriptionFile", jdFile, jdFile.name);

    setAnalyzing(true);
    setShowDashboard(true);
    setStatus(`Processing ${resumeFiles.length} resume(s)...`);
    startProgress();

    try {
      const payload = await analyzeResumes(form);
      setAllResults(payload.results || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error.");
    } finally {
      stopProgress();
      setAnalyzing(false);
    }
  };

  const handleExport = async (kind: "csv" | "xlsx") => {
    if (!allResults.length) {
      alert("No results to export.");
      return;
    }
    try {
      const rows = filterCandidates(allResults, search, minScore, sortOrder);
      const blob = await exportResults(kind, rows);
      downloadBlob(
        blob,
        kind === "csv" ? "candidate_rankings.csv" : "candidate_rankings.xlsx"
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Export failed.");
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
      <Header />

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">
                Upload Resumes (PDF/DOC/DOCX)
              </label>
              <ResumeDropZone files={resumeFiles} onFilesChange={setResumeFiles} />
            </div>
            <div>
              <label className="block font-semibold mb-2">Select Job Role</label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
              >
                {JOB_ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Paste Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg min-h-[120px]"
                placeholder="Paste JD text here. Required if role = custom and no JD file is uploaded."
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">
                Or Upload JD File (PDF/DOC/DOCX/TXT)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing}
          className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-black font-bold py-3 rounded-xl transition"
        >
          {analyzing ? "Analyzing..." : "Analyze & Rank Candidates"}
        </button>

        {(analyzing || progress > 0) && (
          <div className="mt-4">
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {status && <p className="text-sm text-slate-300 mt-1">{status}</p>}
          </div>
        )}
      </section>

      {showDashboard && (
        <>
          {analyzing && !allResults.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CandidateSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Dashboard
              results={allResults}
              search={search}
              sortOrder={sortOrder}
              minScore={minScore}
              onSearchChange={setSearch}
              onSortChange={setSortOrder}
              onMinScoreChange={setMinScore}
              onExportCsv={() => handleExport("csv")}
              onExportXlsx={() => handleExport("xlsx")}
            />
          )}
        </>
      )}
    </main>
  );
}
