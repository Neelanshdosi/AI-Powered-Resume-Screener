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
    isSampleData,
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
    cohortStats,
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
          ? `candidate_rankings_${jobRole.toLowerCase().replace(/\s+/g, "_")}.csv`
          : `candidate_rankings_${jobRole.toLowerCase().replace(/\s+/g, "_")}.xlsx`;

      downloadBlob(blob, filename);
      addToast(
        "success",
        `Downloaded ${filteredResults.length} candidate rankings as ${kind.toUpperCase()}.`,
        "Export successful"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      addToast("error", msg, "Export failed");
    }
  };

  const handleRejectedFiles = (rejected: string[]) => {
    addToast(
      "warning",
      `Skipped unsupported file(s): ${rejected.join(", ")}. Allowed formats: PDF, DOC, DOCX.`,
      "File format notice"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--text-primary)] transition-colors">
      <Header
        onLoadSample={loadSampleData}
        hasResults={results.length > 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Intake & Form Setup */}
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
          onLoadSample={loadSampleData}
          hasResults={results.length > 0}
          onRejectedFiles={handleRejectedFiles}
        />

        {/* Screening Results Section */}
        {analyzing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
              <span className="font-semibold text-[var(--text-secondary)]">
                {statusMessage}
              </span>
              <span>Analyzing multidimensional fit...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <CandidateSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <Dashboard
            allResults={results}
            filteredResults={filteredResults}
            jobRole={jobRole}
            isSampleData={isSampleData}
            cohortStats={cohortStats}
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

      {/* Candidate Dossier Drawer (Problem 5) */}
      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
