"use client";

// Which wording the learner prefers for topic explanations. A per-browser convenience, so it lives in
// its own localStorage key rather than in synced user state; every open panel follows the same choice.
import { useSyncExternalStore } from "react";

export const EXPLAIN_LEVELS = ["beginner", "developer", "interview"] as const;
export type ExplainLevel = (typeof EXPLAIN_LEVELS)[number];

const KEY = "aet:explain-level";
const listeners = new Set<() => void>();

function read(): ExplainLevel {
  try {
    const v = window.localStorage.getItem(KEY);
    return (EXPLAIN_LEVELS as readonly string[]).includes(v ?? "") ? (v as ExplainLevel) : "beginner";
  } catch {
    return "beginner";
  }
}

export function setExplainLevel(level: ExplainLevel) {
  try {
    window.localStorage.setItem(KEY, level);
  } catch {
    // Private mode or storage blocked: the choice just won't be remembered.
  }
  current = level;
  listeners.forEach((l) => l());
}

let current: ExplainLevel | null = null;

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = read();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useExplainLevel(): ExplainLevel {
  return useSyncExternalStore(
    subscribe,
    () => (current ??= read()),
    () => "beginner",
  );
}
