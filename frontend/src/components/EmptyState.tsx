"use client";

interface EmptyStateProps {
  onLoadSample: () => void;
}

export default function EmptyState({ onLoadSample }: EmptyStateProps) {
  return (
    <div className="py-16 text-center border border-[var(--line)] bg-[var(--surface)] space-y-3">
      <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
        Upload candidate resumes above, or explore the dashboard with fictional sample candidates.
      </p>
      <div>
        <button
          type="button"
          onClick={onLoadSample}
          className="border border-[var(--line)] hover:border-[var(--ink)] text-[var(--ink)] px-4 py-2 text-xs font-medium bg-[var(--surface)] transition cursor-pointer"
        >
          Try sample data
        </button>
      </div>
    </div>
  );
}
