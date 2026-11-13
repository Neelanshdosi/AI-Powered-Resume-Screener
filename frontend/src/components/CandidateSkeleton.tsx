"use client";

export default function CandidateSkeleton() {
  return (
    <div className="border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-[var(--line)]/50 w-36" />
        <div className="h-4 bg-[var(--line)]/50 w-12" />
      </div>
      <div className="h-1 bg-[var(--line)]/50 w-full" />
      <div className="h-3 bg-[var(--line)]/50 w-48" />
    </div>
  );
}
