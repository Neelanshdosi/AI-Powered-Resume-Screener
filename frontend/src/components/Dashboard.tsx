"use client";

import type { CandidateResult, ViewMode } from "@/lib/types";
import type { SortField, SortDirection } from "@/lib/filters";
import CohortSummary from "./CohortSummary";
import FilterBar from "./FilterBar";
import CandidateCard from "./CandidateCard";
import CandidateTable from "./CandidateTable";
import { SearchX, RotateCcw } from "lucide-react";

interface HistogramBucket {
  range: string;
  label: string;
  count: number;
  relativeHeight: number;
  color: string;
}

interface DashboardProps {
  allResults: CandidateResult[];
  filteredResults: CandidateResult[];
  jobRole: string;
  isSampleData: boolean;
  cohortStats: {
    total: number;
    average: number;
    top: number;
    low: number;
    histogram: HistogramBucket[];
  };
  search: string;
  onSearchChange: (value: string) => void;
  minScore: number;
  onMinScoreChange: (value: number) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField, direction?: SortDirection) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onSelectCandidate: (candidate: CandidateResult) => void;
  onExportCsv: () => Promise<void>;
  onExportXlsx: () => Promise<void>;
}

export default function Dashboard({
  allResults,
  filteredResults,
  jobRole,
  isSampleData,
  cohortStats,
  search,
  onSearchChange,
  minScore,
  onMinScoreChange,
  sortField,
  sortDirection,
  onSort,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
  onSelectCandidate,
  onExportCsv,
  onExportXlsx,
}: DashboardProps) {
  return (
    <section className="space-y-6">
      {/* Cohort Summary & Distribution Histogram (Problem 10) */}
      <CohortSummary
        total={cohortStats.total}
        average={cohortStats.average}
        top={cohortStats.top}
        jobRole={jobRole}
        isSampleData={isSampleData}
        histogram={cohortStats.histogram}
      />

      {/* Sticky Filter & Control Bar (Problem 6, 11, 12) */}
      <FilterBar
        search={search}
        onSearchChange={onSearchChange}
        minScore={minScore}
        onMinScoreChange={onMinScoreChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        totalCount={allResults.length}
        filteredCount={filteredResults.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onExportCsv={onExportCsv}
        onExportXlsx={onExportXlsx}
      />

      {/* Results View: Table vs Cards */}
      {filteredResults.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--surface-subtle)] text-[var(--text-muted)] flex items-center justify-center mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-[var(--text-primary)]">
            No candidates match active filters
          </h4>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Try adjusting your search query or lowering the minimum score threshold to reveal more candidates.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Reset all filters</span>
            </button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        <div>
          {/* Table View (sortable by all score columns) */}
          <CandidateTable
            candidates={filteredResults}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={(field) => onSort(field)}
            onSelectCandidate={onSelectCandidate}
          />
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredResults.map((candidate, idx) => {
            const stableKey =
              candidate.stored_file || `${candidate.filename}-${candidate.rank}-${idx}`;
            return (
              <CandidateCard
                key={stableKey}
                candidate={candidate}
                onSelect={onSelectCandidate}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
