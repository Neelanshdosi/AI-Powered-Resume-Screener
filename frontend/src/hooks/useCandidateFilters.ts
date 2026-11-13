"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { CandidateResult, ViewMode } from "@/lib/types";
import {
  filterCandidates,
  type FilterState,
  DEFAULT_FILTERS,
  type SortField,
  type SortDirection,
} from "@/lib/filters";

export function useCandidateFilters(allResults: CandidateResult[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [viewMode, setViewModeState] = useState<ViewMode>("table");
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  // Load viewMode preference from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillscan-view-mode") as ViewMode | null;
      if (saved === "table" || saved === "cards") {
        setViewModeState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem("skillscan-view-mode", mode);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const filteredResults = useMemo(() => {
    return filterCandidates(allResults, filters);
  }, [allResults, filters]);

  const cohortStats = useMemo(() => {
    const total = allResults.length;
    if (total === 0) {
      return { total: 0, average: 0, top: 0, low: 0, histogram: [] };
    }
    const scores = allResults.map((c) => Number(c.match_score) || 0);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    const average = Math.round(sum / total);
    const top = Math.max(...scores);
    const low = Math.min(...scores);

    // Build 5 score buckets for the SVG distribution histogram
    // 0-39, 40-59, 60-74, 75-89, 90-100
    const buckets = [
      { range: "0-39", label: "<40", count: 0, color: "var(--fit-gap)" },
      { range: "40-59", label: "40-59", count: 0, color: "var(--fit-gap)" },
      { range: "60-74", label: "60-74", count: 0, color: "var(--fit-mid)" },
      { range: "75-89", label: "75-89", count: 0, color: "var(--fit-high)" },
      { range: "90-100", label: "90+", count: 0, color: "var(--fit-high)" },
    ];

    scores.forEach((s) => {
      if (s < 40) buckets[0].count++;
      else if (s < 60) buckets[1].count++;
      else if (s < 75) buckets[2].count++;
      else if (s < 90) buckets[3].count++;
      else buckets[4].count++;
    });

    const maxCount = Math.max(1, ...buckets.map((b) => b.count));
    const histogram = buckets.map((b) => ({
      ...b,
      relativeHeight: Math.round((b.count / maxCount) * 100),
    }));

    return { total, average, top, low, histogram };
  }, [allResults]);

  const setSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  }, []);

  const setMinScore = useCallback((score: number) => {
    setFilters((prev) => ({ ...prev, minScore: score }));
  }, []);

  const setSort = useCallback((field: SortField, direction?: SortDirection) => {
    setFilters((prev) => {
      const nextDir =
        direction !== undefined
          ? direction
          : prev.sortField === field && prev.sortDirection === "asc"
          ? "desc"
          : "asc";
      return { ...prev, sortField: field, sortDirection: nextDir };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.minScore > 0 ||
    filters.sortField !== DEFAULT_FILTERS.sortField ||
    filters.sortDirection !== DEFAULT_FILTERS.sortDirection;

  return {
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
  };
}
