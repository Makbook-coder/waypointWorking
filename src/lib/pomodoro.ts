// Pomodoro timer as pure state transitions. The timer lives outside UserState (it's
// device-local and changes every second); only finished focus blocks reach the store.

export const TIMER_KEY = "aet:pomodoro";

export const PRESETS = {
  "25-5": { focus: 25, rest: 5, label: "25 / 5" },
  "50-10": { focus: 50, rest: 10, label: "50 / 10" },
  "15-3": { focus: 15, rest: 3, label: "15 / 3" },
} as const;
export type PresetId = keyof typeof PRESETS;
export type Phase = "focus" | "break";

export interface TimerState {
  preset: PresetId;
  phase: Phase;
  running: boolean;
  /** Epoch ms when the running phase ends; null while paused or idle. */
  endsAt: number | null;
  /** Time left while paused or idle. */
  remainingMs: number;
  moduleId: string | null;
}

/** A focus block that ran to the end. */
export interface FinishedFocus {
  endedAt: number;
  minutes: number;
  moduleId: string | null;
}

const MIN = 60_000;
const phaseMs = (preset: PresetId, phase: Phase) => (phase === "focus" ? PRESETS[preset].focus : PRESETS[preset].rest) * MIN;

export function idleTimer(preset: PresetId = "25-5", moduleId: string | null = null): TimerState {
  return { preset, phase: "focus", running: false, endsAt: null, remainingMs: phaseMs(preset, "focus"), moduleId };
}

export function remainingMs(t: TimerState, now: number): number {
  return t.running && t.endsAt !== null ? Math.max(0, t.endsAt - now) : t.remainingMs;
}

export const start = (t: TimerState, now: number): TimerState =>
  t.running ? t : { ...t, running: true, endsAt: now + t.remainingMs };

export const pause = (t: TimerState, now: number): TimerState =>
  t.running ? { ...t, running: false, endsAt: null, remainingMs: remainingMs(t, now) } : t;

/** Back to a fresh focus block with the same preset and module. */
export const reset = (t: TimerState): TimerState => idleTimer(t.preset, t.moduleId);

/** Only changes the preset while nothing is in progress. */
export function setPreset(t: TimerState, preset: PresetId): TimerState {
  if (t.running || t.remainingMs !== phaseMs(t.preset, t.phase)) return t;
  return { ...idleTimer(preset, t.moduleId), phase: t.phase, remainingMs: phaseMs(preset, t.phase) };
}

/** End the break early and wait for the next focus block. */
export const skipBreak = (t: TimerState): TimerState => (t.phase === "break" ? reset(t) : t);

/**
 * Applies every phase change due by `now`. A finished focus block starts its break
 * straight away (timed from when the block ended); a finished break stops and waits.
 */
export function advance(t: TimerState, now: number): { next: TimerState; finished: FinishedFocus | null } {
  if (!t.running || t.endsAt === null || now < t.endsAt) return { next: t, finished: null };
  if (t.phase === "break") return { next: reset(t), finished: null };
  const endedAt = t.endsAt;
  const finished = { endedAt, minutes: PRESETS[t.preset].focus, moduleId: t.moduleId };
  const onBreak: TimerState = { ...t, phase: "break", running: true, endsAt: endedAt + phaseMs(t.preset, "break"), remainingMs: phaseMs(t.preset, "break") };
  return { next: advance(onBreak, now).next, finished };
}

/** Reads a stored timer; anything malformed becomes an idle timer. */
export function parseTimer(raw: string | null): TimerState {
  try {
    const v = raw ? JSON.parse(raw) : null;
    if (!v || typeof v !== "object") return idleTimer();
    const preset: PresetId = v.preset in PRESETS ? v.preset : "25-5";
    const phase: Phase = v.phase === "break" ? "break" : "focus";
    const max = phaseMs(preset, phase);
    const running = v.running === true && typeof v.endsAt === "number" && Number.isFinite(v.endsAt);
    const remaining = typeof v.remainingMs === "number" && v.remainingMs >= 0 ? Math.min(max, v.remainingMs) : max;
    return {
      preset,
      phase,
      running,
      endsAt: running ? v.endsAt : null,
      remainingMs: remaining,
      moduleId: typeof v.moduleId === "string" ? v.moduleId : null,
    };
  } catch {
    return idleTimer();
  }
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
