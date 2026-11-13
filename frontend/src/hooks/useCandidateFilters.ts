"use client";

import { useState, useMemo, useCallback } from "react";
import type { CandidateResult, ViewMode } from "@/lib/types";
import {
  filterCandidates,
  type FilterState,
  DEFAULT_FILTERS,
  type SortField,
  type SortDirection,
} from "@/lib/filters";

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "table";
  try {
    const saved = localStorage.getItem("skillscan-view-mode") as ViewMode | null;
    if (saved === "table" || saved === "cards") {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }
  return "table";
}

export function useCandidateFilters(allResults: CandidateResult[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [viewMode, setViewModeState] = useState<ViewMode>(getInitialViewMode);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

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
    setSearch,
    setMinScore,
    setSort,
    clearFilters,
    hasActiveFilters,
  };
}
