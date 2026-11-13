"use client";

import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight text-[var(--ink)]">
          SkillScan.AI
        </span>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
          className="text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] transition py-1 px-2 cursor-pointer"
        >
          {resolvedTheme === "dark" ? "Light theme" : "Dark theme"}
        </button>
      </div>
    </header>
  );
}
