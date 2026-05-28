"use client";

import type { CandidateResult } from "@/lib/types";
import { filterCandidates } from "@/lib/filters";
import CandidateCard from "./CandidateCard";

type DashboardProps = {
  results: CandidateResult[];
  search: string;
  sortOrder: "asc" | "desc";
  minScore: number;
  onSearchChange: (value: string) => void;
  onSortChange: (value: "asc" | "desc") => void;
  onMinScoreChange: (value: number) => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
};

export default function Dashboard({
  results,
  search,
  sortOrder,
  minScore,
  onSearchChange,
  onSortChange,
  onMinScoreChange,
  onExportCsv,
  onExportXlsx,
}: DashboardProps) {
  const rows = filterCandidates(results, search, minScore, sortOrder);

  return (
    <section className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search candidate..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
          />
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as "asc" | "desc")}
            className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
          >
            <option value="desc">Sort by score: High to Low</option>
            <option value="asc">Sort by score: Low to High</option>
          </select>
          <input
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value) || 0)}
            placeholder="Minimum score"
            className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onExportCsv}
              className="flex-1 bg-sky-600 hover:bg-sky-700 py-3 rounded-lg font-semibold"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={onExportXlsx}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold"
            >
              Export XLSX
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!rows.length ? (
          <div className="col-span-full p-6 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
            No candidates match current filters.
          </div>
        ) : (
          rows.map((candidate) => (
            <CandidateCard key={`${candidate.rank}-${candidate.filename}`} candidate={candidate} />
          ))
        )}
      </div>
    </section>
  );
}
