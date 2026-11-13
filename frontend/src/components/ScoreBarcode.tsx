"use client";

interface ScoreBarcodeProps {
  skillsMatch: number;
  semanticSimilarity: number;
  experienceRelevance: number;
  educationRelevance: number;
  totalScore: number;
  compact?: boolean;
}

export default function ScoreBarcode({
  skillsMatch,
  semanticSimilarity,
  experienceRelevance,
  educationRelevance,
  totalScore,
  compact = false,
}: ScoreBarcodeProps) {
  // Proportional breakdown based on weights:
  // Skills: 40%, Semantic: 30%, Experience: 20%, Education: 10%
  const skillsContrib = (skillsMatch * 0.4);
  const semanticContrib = (semanticSimilarity * 0.3);
  const expContrib = (experienceRelevance * 0.2);
  const eduContrib = (educationRelevance * 0.1);

  if (compact) {
    return (
      <div className="space-y-1.5" title={`Score Breakdown: Skills ${skillsMatch}%, Semantic ${semanticSimilarity}%, Experience ${experienceRelevance}%, Education ${educationRelevance}%`}>
        {/* Segmented multi-colored bar */}
        <div
          role="img"
          aria-label={`Score composition: Skills ${Math.round(skillsMatch)}%, Semantic ${Math.round(semanticSimilarity)}%, Experience ${Math.round(experienceRelevance)}%, Education ${Math.round(educationRelevance)}%`}
          className="flex h-2 w-full rounded-full overflow-hidden bg-[var(--surface-hover)] border border-[var(--border-subtle)]"
        >
          <div
            style={{ width: `${skillsContrib}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`Skills: ${skillsMatch}% (wt 0.40)`}
          />
          <div
            style={{ width: `${semanticContrib}%` }}
            className="bg-blue-500 transition-all duration-300"
            title={`Semantic: ${semanticSimilarity}% (wt 0.30)`}
          />
          <div
            style={{ width: `${expContrib}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Experience: ${experienceRelevance}% (wt 0.20)`}
          />
          <div
            style={{ width: `${eduContrib}%` }}
            className="bg-purple-500 transition-all duration-300"
            title={`Education: ${educationRelevance}% (wt 0.10)`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-[var(--surface-subtle)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
        <span>Score Breakdown (Weighted)</span>
        <span className="font-mono text-xs text-[var(--text-primary)]">
          Total: {Math.round(totalScore)}%
        </span>
      </div>

      {/* Segmented bar */}
      <div
        role="img"
        aria-label={`Score composition: Skills ${Math.round(skillsMatch)}%, Semantic ${Math.round(semanticSimilarity)}%, Experience ${Math.round(experienceRelevance)}%, Education ${Math.round(educationRelevance)}%`}
        className="flex h-2.5 w-full rounded-full overflow-hidden bg-[var(--surface-hover)] border border-[var(--border-subtle)]"
      >
        <div
          style={{ width: `${skillsContrib}%` }}
          className="bg-emerald-500 transition-all duration-300"
          title={`Skills: ${skillsMatch}% (40% weight)`}
        />
        <div
          style={{ width: `${semanticContrib}%` }}
          className="bg-blue-500 transition-all duration-300"
          title={`Semantic: ${semanticSimilarity}% (30% weight)`}
        />
        <div
          style={{ width: `${expContrib}%` }}
          className="bg-amber-500 transition-all duration-300"
          title={`Experience: ${experienceRelevance}% (20% weight)`}
        />
        <div
          style={{ width: `${eduContrib}%` }}
          className="bg-purple-500 transition-all duration-300"
          title={`Education: ${educationRelevance}% (10% weight)`}
        />
      </div>

      {/* 4 Pillars Grid with explicit weights and numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
        <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Skills (40%)</span>
          </div>
          <p className="font-mono font-bold text-[var(--text-primary)] mt-1">
            {Math.round(skillsMatch)}%
          </p>
        </div>

        <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Semantic (30%)</span>
          </div>
          <p className="font-mono font-bold text-[var(--text-primary)] mt-1">
            {Math.round(semanticSimilarity)}%
          </p>
        </div>

        <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Experience (20%)</span>
          </div>
          <p className="font-mono font-bold text-[var(--text-primary)] mt-1">
            {Math.round(experienceRelevance)}%
          </p>
        </div>

        <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Education (10%)</span>
          </div>
          <p className="font-mono font-bold text-[var(--text-primary)] mt-1">
            {Math.round(educationRelevance)}%
          </p>
        </div>
      </div>
    </div>
  );
}
