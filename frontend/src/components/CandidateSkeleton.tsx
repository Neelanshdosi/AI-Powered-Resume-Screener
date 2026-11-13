"use client";

export default function CandidateSkeleton() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-hover)]" />
          <div className="space-y-1.5">
            <div className="h-4 bg-[var(--surface-hover)] rounded w-32" />
            <div className="h-3 bg-[var(--surface-hover)] rounded w-20" />
          </div>
        </div>
        <div className="h-6 bg-[var(--surface-hover)] rounded w-12" />
      </div>

      <div className="space-y-2">
        <div className="h-8 bg-[var(--surface-hover)] rounded w-24" />
        <div className="h-3 bg-[var(--surface-hover)] rounded-full w-full" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="h-10 bg-[var(--surface-hover)] rounded" />
        <div className="h-10 bg-[var(--surface-hover)] rounded" />
        <div className="h-10 bg-[var(--surface-hover)] rounded" />
        <div className="h-10 bg-[var(--surface-hover)] rounded" />
      </div>

      <div className="space-y-2 pt-2">
        <div className="h-5 bg-[var(--surface-hover)] rounded w-full" />
        <div className="h-5 bg-[var(--surface-hover)] rounded w-3/4" />
      </div>
    </div>
  );
}
