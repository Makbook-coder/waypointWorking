"use client";

import type { ReactNode } from "react";
import { DIFFICULTIES, DIFFICULTY_LABEL, type Difficulty3 } from "@/lib/difficulty";
import { setDifficultyFilter, useDifficultyFilter } from "@/lib/difficulty-filter";

const DOTS = "●●●";

/** A small tag showing how hard something is, as filled dots plus the word so it never relies on colour. */
export function DifficultyBadge({ level }: { level: Difficulty3 | undefined }) {
  if (!level) return null;
  const label = DIFFICULTY_LABEL[level];
  return (
    <span title={`Difficulty: ${label}`} className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted">
      <span aria-hidden="true" className="tracking-tighter">
        <span className="text-ink">{DOTS.slice(0, level)}</span>
        <span className="opacity-30">{DOTS.slice(level)}</span>
      </span>
      {label}
    </span>
  );
}

/** Buttons that choose which difficulty to show. The choice is remembered and shared by every list. */
export function DifficultyFilterBar() {
  const value = useDifficultyFilter();
  const options: { v: 0 | Difficulty3; label: string }[] = [{ v: 0, label: "All" }, ...DIFFICULTIES.map((d) => ({ v: d, label: DIFFICULTY_LABEL[d] }))];
  return (
    <div role="group" aria-label="Filter by difficulty" className="flex flex-wrap items-center gap-1.5 text-sm print:hidden">
      <span className="text-xs uppercase tracking-wider text-muted">Difficulty</span>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => setDifficultyFilter(o.v)}
          className={`rounded-md border px-2.5 py-1 ${value === o.v ? "border-ink bg-ink text-bg" : "border-line hover:bg-surface-2"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Wraps server-rendered lists: children marked `data-difficulty="1|2|3"` are hidden by CSS (see globals.css)
 * when a different difficulty is chosen, so the list itself needs no client code.
 */
export function DifficultyScope({ children }: { children: ReactNode }) {
  const value = useDifficultyFilter();
  return (
    <div data-difficulty-filter={value || undefined}>
      <div className="mb-4">
        <DifficultyFilterBar />
      </div>
      {children}
    </div>
  );
}
