"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Sparkles, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onLoadSample?: () => void;
  hasResults?: boolean;
}

export default function Header({ onLoadSample, hasResults }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-[var(--text-primary)]">
                SkillScan<span className="text-blue-500">.AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Explainable Screener
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] hidden md:block">
              Multi-dimensional resume intelligence & ATS cohort ranking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onLoadSample && !hasResults && (
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-primary)] hover:border-blue-500/50 hover:bg-blue-500/5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Try sample cohort</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] transition cursor-pointer"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
