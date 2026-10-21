import { describe, expect, it } from "vitest";
import { focusSummary } from "@/lib/insights";
import { advance, formatClock, idleTimer, parseTimer, pause, remainingMs, reset, setPreset, skipBreak, start } from "@/lib/pomodoro";
import { createStore, emptyState, loadState, memoryStorage } from "@/lib/store";

const MIN = 60_000;
const T0 = Date.UTC(2026, 9, 21, 9, 0);

describe("pomodoro timer", () => {
  it("counts down, pauses and resumes", () => {
    let t = start(idleTimer("25-5"), T0);
    expect(remainingMs(t, T0 + 10 * MIN)).toBe(15 * MIN);
    t = pause(t, T0 + 10 * MIN);
    expect(remainingMs(t, T0 + 60 * MIN)).toBe(15 * MIN);
    t = start(t, T0 + 60 * MIN);
    expect(t.endsAt).toBe(T0 + 75 * MIN);
  });

  it("logs a finished focus block and starts the break from when it ended", () => {
    const t = start(idleTimer("25-5", "M4.6"), T0);
    expect(advance(t, T0 + 25 * MIN - 1).finished).toBeNull();
    const { next, finished } = advance(t, T0 + 26 * MIN);
    expect(finished).toEqual({ endedAt: T0 + 25 * MIN, minutes: 25, moduleId: "M4.6" });
    expect(next).toMatchObject({ phase: "break", running: true, endsAt: T0 + 30 * MIN, moduleId: "M4.6" });
  });

  it("stops after the break, even when the tab was closed through both phases", () => {
    const { next, finished } = advance(start(idleTimer("15-3"), T0), T0 + 4 * 60 * MIN);
    expect(finished?.minutes).toBe(15);
    expect(next).toEqual(idleTimer("15-3"));
  });

  it("only changes preset before a block starts, and reset or skip returns to a fresh block", () => {
    const fresh = idleTimer("25-5");
    expect(setPreset(fresh, "50-10").remainingMs).toBe(50 * MIN);
    const running = start(fresh, T0);
    expect(setPreset(running, "50-10")).toBe(running);
    expect(reset(running)).toEqual(fresh);
    const onBreak = advance(running, T0 + 25 * MIN).next;
    expect(skipBreak(onBreak)).toEqual(fresh);
  });

  it("parses stored timers defensively", () => {
    expect(parseTimer(null)).toEqual(idleTimer());
    expect(parseTimer("{oops")).toEqual(idleTimer());
    expect(parseTimer(JSON.stringify({ preset: "99-1", running: true, endsAt: "soon", remainingMs: -5 }))).toEqual(idleTimer());
    const t = start(idleTimer("50-10", "M1.1"), T0);
    expect(parseTimer(JSON.stringify(t))).toEqual(t);
  });

  it("formats the clock", () => {
    expect(formatClock(25 * MIN)).toBe("25:00");
    expect(formatClock(61_001)).toBe("01:02");
    expect(formatClock(0)).toBe("00:00");
  });
});

describe("focus sessions in the store", () => {
  it("saves each block once and keeps them ordered", () => {
    const store = createStore({ storage: memoryStorage(), now: () => new Date(T0) });
    const a = { at: new Date(T0).toISOString(), minutes: 25, moduleId: "M4.6" };
    const b = { at: new Date(T0 - 60 * MIN).toISOString(), minutes: 15, moduleId: null };
    store.recordFocus(a);
    store.recordFocus(a);
    store.recordFocus(b);
    expect(store.getState().focus).toEqual([b, a]);
  });

  it("migrates v5 data with an empty focus list and drops bad entries", () => {
    const v5 = { ...emptyState(), version: 5 } as Record<string, unknown>;
    delete v5.focus;
    expect(loadState(JSON.stringify(v5)).focus).toEqual([]);
    const bad = { ...emptyState(), focus: [{ at: 1, minutes: 25 }, { at: "2026-10-21T09:00:00.000Z", minutes: 0 }, { at: "2026-10-21T09:00:00.000Z", minutes: 25 }] };
    expect(loadState(JSON.stringify(bad)).focus).toEqual([{ at: "2026-10-21T09:00:00.000Z", minutes: 25, moduleId: null }]);
  });

  it("summarizes blocks by day and week", () => {
    const s = { ...emptyState(), focus: [{ at: new Date(2026, 9, 21, 10).toISOString(), minutes: 25, moduleId: null }, { at: new Date(2026, 9, 1, 10).toISOString(), minutes: 50, moduleId: null }] };
    const sum = focusSummary(s, "2026-10-21");
    expect(sum.today).toEqual({ blocks: 1, minutes: 25 });
    expect(sum.thisWeek).toEqual({ blocks: 1, minutes: 25 });
    expect(sum.total).toEqual({ blocks: 2, minutes: 75 });
  });
});
