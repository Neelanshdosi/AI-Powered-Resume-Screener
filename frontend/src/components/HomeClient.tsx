"use client";

import { useToast } from "@/context/ToastContext";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useCandidateFilters } from "@/hooks/useCandidateFilters";
import Header from "./Header";
import AnalysisForm from "./AnalysisForm";
import Dashboard from "./Dashboard";
import EmptyState from "./EmptyState";
import CandidateSkeleton from "./CandidateSkeleton";
import CandidateDrawer from "./CandidateDrawer";
import { exportResults, downloadBlob } from "@/lib/api";

export default function HomeClient() {
  const { addToast } = useToast();

  const {
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
    isValid,
    validationReason,
    runAnalysis,
    loadSampleData,
  } = useAnalysis((type, msg, title) => addToast(type, msg, title));

  const {
    filters,
    viewMode,
    setViewMode,
    selectedCandidate,
    setSelectedCandidate,
    filteredResults,
    setSearch,
    setMinScore,
    setSort,
    clearFilters,
    hasActiveFilters,
  } = useCandidateFilters(results);

  const handleExport = async (kind: "csv" | "xlsx") => {
    if (filteredResults.length === 0) {
      addToast("warning", "No candidates available to export with current filters.", "Export skipped");
      return;
    }

    try {
      const blob = await exportResults(kind, filteredResults);
      const filename =
        kind === "csv"
          ? `candidates_${jobRole.toLowerCase().replace(/\s+/g, "_")}.csv`
          : `candidates_${jobRole.toLowerCase().replace(/\s+/g, "_")}.xlsx`;

      downloadBlob(blob, filename);
      addToast(
        "success",
        `Exported ${filteredResults.length} candidates as ${kind === "csv" ? "CSV" : "Excel"}.`,
        "Export complete"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      addToast("error", msg, "Export failed");
    }
  };

  const handleRejectedFiles = (rejected: string[]) => {
    addToast(
      "warning",
      `Skipped unsupported file(s): ${rejected.join(", ")}. Use PDF, DOC, or DOCX.`,
      "File format notice"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ground)] text-[var(--ink)]">
      <Header />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Title area */}
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[var(--ink)]">
            Resume screener
          </h1>
        </div>

        {/* Intake setup */}
        <AnalysisForm
          managedFiles={managedFiles}
          onFilesChange={setManagedFiles}
          jobRole={jobRole}
          onJobRoleChange={setJobRole}
          jobDescription={jobDescription}
          onJobDescriptionChange={setJobDescription}
          jdFile={jdFile}
          onJdFileChange={setJdFile}
          jdInputMode={jdInputMode}
          onJdInputModeChange={setJdInputMode}
          analyzing={analyzing}
          statusMessage={statusMessage}
          error={error}
          onDismissError={() => setError(null)}
          isValid={isValid}
          validationReason={validationReason}
          onRunAnalysis={runAnalysis}
          hasResults={results.length > 0}
          onRejectedFiles={handleRejectedFiles}
        />

        {/* Results area */}
        {analyzing ? (
          <div className="space-y-3">
            <CandidateSkeleton />
            <CandidateSkeleton />
            <CandidateSkeleton />
          </div>
        ) : results.length > 0 ? (
          <Dashboard
            allResults={results}
            filteredResults={filteredResults}
            jobRole={jobRole}
            search={filters.search}
            onSearchChange={setSearch}
            minScore={filters.minScore}
            onMinScoreChange={setMinScore}
            sortField={filters.sortField}
            sortDirection={filters.sortDirection}
            onSort={setSort}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onSelectCandidate={setSelectedCandidate}
            onExportCsv={() => handleExport("csv")}
            onExportXlsx={() => handleExport("xlsx")}
          />
        ) : (
          <EmptyState onLoadSample={loadSampleData} />
        )}
      </main>

      {/* Candidate detail drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
