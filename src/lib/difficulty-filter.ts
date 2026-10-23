"use client";

// The learner's difficulty filter: 0 shows everything. A per-browser convenience, so it lives in its own
// localStorage key rather than in synced progress; every open filter and list follows the same choice.
import { useSyncExternalStore } from "react";
import type { Difficulty3 } from "./difficulty";

export type DifficultyFilter = 0 | Difficulty3;

const KEY = "aet:difficulty-filter";
const listeners = new Set<() => void>();
let current: DifficultyFilter | null = null;

function read(): DifficultyFilter {
  try {
    const v = Number(window.localStorage.getItem(KEY));
    return v === 1 || v === 2 || v === 3 ? v : 0;
  } catch {
    return 0;
  }
}

export function setDifficultyFilter(value: DifficultyFilter) {
  try {
    window.localStorage.setItem(KEY, String(value));
  } catch {
    // Private mode or storage blocked: the choice just won't be remembered.
  }
  current = value;
  listeners.forEach((l) => l());
}

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

export function useDifficultyFilter(): DifficultyFilter {
  return useSyncExternalStore(subscribe, () => (current ??= read()), () => 0);
}
