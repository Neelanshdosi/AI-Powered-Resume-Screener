"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Check,
  RefreshCw,
} from "lucide-react";
import type { ViewMode } from "@/lib/types";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  minScore: number;
  onMinScoreChange: (value: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onExportCsv: () => Promise<void>;
  onExportXlsx: () => Promise<void>;
}

export default function FilterBar({
  search,
  onSearchChange,
  minScore,
  onMinScoreChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  hasActiveFilters,
  onClearFilters,
  onExportCsv,
  onExportXlsx,
}: FilterBarProps) {
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);
  const [xlsxSuccess, setXlsxSuccess] = useState(false);

  const handleExportCsv = async () => {
    if (exportingCsv) return;
    setExportingCsv(true);
    setCsvSuccess(false);
    try {
      await onExportCsv();
      setCsvSuccess(true);
      setTimeout(() => setCsvSuccess(false), 2500);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportXlsx = async () => {
    if (exportingXlsx) return;
    setExportingXlsx(true);
    setXlsxSuccess(false);
    try {
      await onExportXlsx();
      setXlsxSuccess(true);
      setTimeout(() => setXlsxSuccess(false), 2500);
    } finally {
      setExportingXlsx(false);
    }
  };

  return (
    <div className="sticky top-16 z-20 bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] rounded-2xl p-3 sm:p-4 shadow-sm space-y-3 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search & Min Score Slider */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidate name, file, or skill..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border)] focus:border-blue-500 rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none transition"
              aria-label="Search candidates"
            />
          </div>

          {/* Score Slider with live remaining counter */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
            <SlidersHorizontal className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2 text-[11px] leading-tight">
                <span className="text-[var(--text-muted)]">Min Score:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {minScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(e) => onMinScoreChange(Number(e.target.value))}
                aria-label={`Minimum score filter, currently ${minScore} percent`}
                className="w-24 sm:w-28 accent-blue-600 h-1.5 cursor-pointer"
              />
            </div>
            <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] shrink-0">
              {filteredCount} / {totalCount}
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl border border-[var(--border-subtle)] transition cursor-pointer"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* View Mode & Export Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-[var(--border-subtle)]">
          {/* View Mode Toggle: Table / Cards */}
          <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded-xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              aria-label="Switch to table view"
              aria-pressed={viewMode === "table"}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                viewMode === "table"
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("cards")}
              aria-label="Switch to card grid view"
              aria-pressed={viewMode === "cards"}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                viewMode === "cards"
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={exportingCsv || filteredCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-50 transition cursor-pointer"
              title={`Export ${filteredCount} filtered candidates to CSV`}
            >
              {exportingCsv ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
              ) : csvSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Download className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span>
                {exportingCsv
                  ? "Exporting..."
                  : csvSuccess
                  ? "Exported!"
                  : `Export (${filteredCount}) CSV`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleExportXlsx}
              disabled={exportingXlsx || filteredCount === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition shadow-sm shadow-blue-500/10 cursor-pointer"
              title={`Export ${filteredCount} filtered candidates to Excel XLSX`}
            >
              {exportingXlsx ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : xlsxSuccess ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {exportingXlsx
                  ? "Exporting..."
                  : xlsxSuccess
                  ? "Saved!"
                  : `Export (${filteredCount}) XLSX`}
              </span>
              <span className="sm:hidden">XLSX</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
