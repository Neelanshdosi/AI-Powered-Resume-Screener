"use client";

import type { CandidateResult, ViewMode } from "@/lib/types";
import type { SortField, SortDirection } from "@/lib/filters";
import FilterBar from "./FilterBar";
import CandidateCard from "./CandidateCard";
import CandidateTable from "./CandidateTable";

interface DashboardProps {
  allResults: CandidateResult[];
  filteredResults: CandidateResult[];
  jobRole: string;
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
    <section className="space-y-4">
      {/* Title & Score Explanation */}
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-medium text-[var(--ink)]">
            Ranked candidates ({filteredResults.length})
          </h2>
          <span className="text-xs text-[var(--ink-soft)]">
            Role: {jobRole}
          </span>
        </div>
        <p className="text-xs text-[var(--ink-soft)] mt-1">
          40% skills · 30% wording · 20% experience · 10% education
        </p>
      </div>

      {/* Filter Row */}
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

      {/* Table First (or Cards) */}
      {filteredResults.length === 0 ? (
        <div className="p-8 text-center text-xs text-[var(--ink-soft)] border border-[var(--line)] bg-[var(--surface)]">
          <p>No candidates match the filter criteria.</p>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-2 text-[var(--gap)] underline cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : viewMode === "table" ? (
        <CandidateTable
          candidates={filteredResults}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={(f) => onSort(f)}
          onSelectCandidate={onSelectCandidate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((c, idx) => (
            <CandidateCard
              key={c.stored_file || `${c.filename}-${c.rank}-${idx}`}
              candidate={c}
              onSelect={onSelectCandidate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
