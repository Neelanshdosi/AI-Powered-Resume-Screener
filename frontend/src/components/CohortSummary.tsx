"use client";

import { Users, Award, TrendingUp, BarChart2 } from "lucide-react";

interface HistogramBucket {
  range: string;
  label: string;
  count: number;
  relativeHeight: number;
  color: string;
}

interface CohortSummaryProps {
  total: number;
  average: number;
  top: number;
  jobRole: string;
  isSampleData: boolean;
  histogram: HistogramBucket[];
}

export default function CohortSummary({
  total,
  average,
  top,
  jobRole,
  isSampleData,
  histogram,
}: CohortSummaryProps) {
  if (total === 0) return null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
              Cohort Intelligence Summary
            </h3>
            {isSampleData && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Sample preview
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Role benchmark: <span className="font-semibold text-[var(--text-secondary)]">{jobRole}</span>
          </p>
        </div>
      </div>

      {/* KPI Cards & Histogram Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        {/* Total Candidates */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Candidates</span>
          </div>
          <p className="text-2xl font-mono font-extrabold text-[var(--text-primary)] mt-1">
            {total}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Scored & ranked</p>
        </div>

        {/* Average Fit Score */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Cohort Average</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-extrabold text-[var(--text-primary)]">
              {average}%
            </span>
            <span className="text-xs text-[var(--text-muted)]">mean fit</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {average >= 75 ? "Strong pool" : average >= 60 ? "Moderate fit pool" : "Niche pool"}
          </p>
        </div>

        {/* Top Score */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Top Match</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {top}%
            </span>
            <span className="text-xs text-[var(--text-muted)]">Rank #1</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Highest alignment</p>
        </div>

        {/* Plain SVG Histogram */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-purple-500" />
              <span>Score Distribution</span>
            </div>
            <span className="text-[10px] font-mono">0-100</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-12 flex items-end justify-between gap-1.5 pt-1">
            {histogram.map((b) => (
              <div
                key={b.range}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface)] text-[var(--text-primary)] text-[10px] font-mono px-1.5 py-0.5 rounded shadow border border-[var(--border)] whitespace-nowrap pointer-events-none z-10">
                  {b.label}: {b.count} candidate{b.count === 1 ? "" : "s"}
                </div>

                <div
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${Math.max(12, b.relativeHeight)}%`,
                    backgroundColor: b.color,
                    opacity: b.count > 0 ? 0.9 : 0.25,
                  }}
                />
                <span className="text-[9px] font-mono text-[var(--text-muted)]">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
