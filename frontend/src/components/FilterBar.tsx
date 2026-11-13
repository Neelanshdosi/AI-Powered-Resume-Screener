"use client";

import { useState, useRef, useEffect } from "react";
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
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: "csv" | "xlsx") => {
    setExporting(format);
    try {
      if (format === "csv") await onExportCsv();
      else await onExportXlsx();
    } finally {
      setExporting(null);
      setExportOpen(false);
    }
  };

  return (
    <div className="py-3 border-y border-[var(--line)] flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Search & Slider */}
      <div className="flex flex-wrap items-center gap-4 flex-1">
        <input
          type="search"
          placeholder="Search name, file, skill..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search candidates"
          className="bg-[var(--surface)] border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)] w-56 focus:outline-none"
        />

        <div className="flex items-center gap-2 tabular-nums">
          <label htmlFor="min-score" className="text-[var(--ink-soft)]">
            Min score
          </label>
          <input
            id="min-score"
            type="range"
            min="0"
            max="100"
            step="5"
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            className="w-24 accent-[var(--ink)] h-1 cursor-pointer"
          />
          <span className="font-medium text-[var(--ink)] w-8">{minScore}%</span>
          <span
            aria-live="polite"
            className="text-[var(--ink-soft)] text-[11px] ml-1"
          >
            ({filteredCount} of {totalCount})
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[var(--gap)] hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Right: View toggle & Single Export menu */}
      <div className="flex items-center gap-3">
        {/* View toggle */}
        <div className="flex items-center border border-[var(--line)]">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`px-2.5 py-1 text-xs cursor-pointer ${
              viewMode === "table"
                ? "bg-[var(--surface)] text-[var(--ink)] font-medium"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("cards")}
            className={`px-2.5 py-1 text-xs border-l border-[var(--line)] cursor-pointer ${
              viewMode === "cards"
                ? "bg-[var(--surface)] text-[var(--ink)] font-medium"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            Cards
          </button>
        </div>

        {/* Single Export Menu saying how many rows it exports */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setExportOpen(!exportOpen)}
            disabled={filteredCount === 0 || exporting !== null}
            className="border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] px-3 py-1 text-xs hover:border-[var(--ink)] transition disabled:opacity-50 cursor-pointer"
          >
            {exporting ? `Exporting...` : `Export (${filteredCount}) ▾`}
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-[var(--surface)] border border-[var(--line)] z-30 py-1">
              <button
                type="button"
                onClick={() => handleExport("csv")}
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--ground)] cursor-pointer"
              >
                CSV format
              </button>
              <button
                type="button"
                onClick={() => handleExport("xlsx")}
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--ground)] cursor-pointer"
              >
                Excel (XLSX)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
