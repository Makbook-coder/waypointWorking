"use client";

// Browser side of the Pomodoro timer: keeps TimerState in localStorage so it survives
// navigation, reloads and other tabs, and hands finished focus blocks to the store.
import { useSyncExternalStore } from "react";
import { advance, idleTimer, parseTimer, TIMER_KEY, type FinishedFocus, type TimerState } from "./pomodoro";
import { store } from "./store";

const listeners = new Set<() => void>();
let cached: { raw: string | null; state: TimerState } | null = null;
const SERVER_TIMER = idleTimer();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(TIMER_KEY);
  } catch {
    return null;
  }
}

export function getTimer(): TimerState {
  const raw = readRaw();
  if (!cached || cached.raw !== raw) cached = { raw, state: parseTimer(raw) };
  return cached.state;
}

export function setTimer(next: TimerState) {
  const raw = JSON.stringify(next);
  try {
    window.localStorage.setItem(TIMER_KEY, raw);
  } catch {
    // blocked storage: the timer still works for this page view
  }
  cached = { raw: readRaw() ?? raw, state: next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === TIMER_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTimer(): TimerState {
  return useSyncExternalStore(subscribe, getTimer, () => SERVER_TIMER);
}

/**
 * Applies any due phase change. The new timer is written before the session is saved,
 * so a second tab ticking at the same moment sees the change and does nothing.
 */
export function checkTimer(now = Date.now()): FinishedFocus | null {
  const t = getTimer();
  const { next, finished } = advance(t, now);
  if (next === t) return null;
  setTimer(next);
  if (finished) {
    store.reload();
    store.recordFocus({ at: new Date(finished.endedAt).toISOString(), minutes: finished.minutes, moduleId: finished.moduleId });
  }
  return finished;
}
