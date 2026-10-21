import { describe, expect, it } from "vitest";
import { getLevel, levels, roadmap } from "@/lib/data";
import { computeBadges } from "@/lib/badges";
import { dailyMinutes, overallAccuracy, quizAccuracy, shakyTopicIds, timeSummary, weakModules } from "@/lib/insights";
import { HOURS_PER_SESSION, MIN_MODULE_HOURS, buildPlan, moduleHours, weekStart } from "@/lib/plan";
import { levelTopicIds } from "@/lib/progress";
import { SCHEMA_VERSION, createStore, emptyState, loadState, memoryStorage, type UserState } from "@/lib/store";

const totalHours = levels.flatMap((l) => l.modules).reduce((n, m) => n + moduleHours(m), 0);

describe("weekly plan", () => {
  it("weeks start on Monday", () => {
    expect(weekStart("2026-10-21")).toBe("2026-10-19"); // Wednesday
    expect(weekStart("2026-10-19")).toBe("2026-10-19"); // Monday
    expect(weekStart("2026-10-25")).toBe("2026-10-19"); // Sunday
  });

  it("schedules every remaining hour at the chosen pace", () => {
    const plan = buildPlan(levels, emptyState(), 10, "2026-10-21");
    expect(plan.remainingHours).toBeCloseTo(totalHours, 0);
    expect(plan.weeks.length).toBe(Math.ceil(totalHours / 10 - 1e-9));
    for (const w of plan.weeks.slice(0, -1)) expect(w.hours).toBeCloseTo(10, 5);
    expect(plan.weeks[0].start).toBe("2026-10-19");
    expect(plan.weeks[1].start).toBe("2026-10-26");
    expect(plan.finish).toBe(plan.weeks[plan.weeks.length - 1].end);
    expect(plan.weeks[0].items[0].module.id).toBe("M0.1");
  });

  it("estimates hours from sessions with a floor", () => {
    const m = getLevel(4)!.modules[0];
    expect(moduleHours(m)).toBe(Math.max(MIN_MODULE_HOURS, m.sessionCount * HOURS_PER_SESSION));
    expect(moduleHours({ ...m, sessionCount: 0 })).toBe(MIN_MODULE_HOURS);
  });

  it("skips finished work and halves faster with double the hours", () => {
    const s: UserState = { ...emptyState(), topics: Object.fromEntries(levelTopicIds(getLevel(0)!).map((id) => [id, { done: true }])) };
    const plan = buildPlan(levels, s, 10, "2026-10-21");
    expect(plan.weeks[0].items[0].module.levelId).toBe(1);
    const fast = buildPlan(levels, s, 20, "2026-10-21");
    expect(fast.weeks.length).toBe(Math.ceil(plan.remainingHours / 20 - 1e-9));
  });

  it("is empty when everything is done", () => {
    const all = levels.flatMap(levelTopicIds);
    const s: UserState = { ...emptyState(), topics: Object.fromEntries(all.map((id) => [id, { done: true }])) };
    expect(buildPlan(levels, s, 6)).toEqual({ weeks: [], remainingHours: 0, finish: null });
  });
});

describe("insights", () => {
  const s: UserState = {
    ...emptyState(),
    quiz: {
      "m4-6-q1": { attempts: 2, correct: 0, lastCorrect: false, lastAt: "" },
      "m4-6-q2": { attempts: 1, correct: 0, lastCorrect: false, lastAt: "" },
      "m4-6-q3": { attempts: 1, correct: 1, lastCorrect: true, lastAt: "" },
      "m1-1-q1": { attempts: 1, correct: 1, lastCorrect: true, lastAt: "" },
      "m1-1-q2": { attempts: 3, correct: 2, lastCorrect: true, lastAt: "" },
    },
    topics: { a: { done: true, confidence: 1 }, b: { done: false, confidence: 3 } },
    studyMinutes: { "2026-10-19": 30, "2026-10-21": 15, "2026-10-10": 45 },
  };

  it("computes accuracy from the latest answer per question", () => {
    expect(overallAccuracy(s)).toEqual({ attempted: 5, correct: 3, pct: 60 });
    const m46 = quizAccuracy(levels, s).find((a) => a.module.id === "M4.6")!;
    expect(m46).toMatchObject({ attempted: 3, correct: 1, pct: 33 });
  });

  it("flags weak modules below 60% with at least two questions tried", () => {
    expect(weakModules(levels, s).map((w) => w.module.id)).toEqual(["M4.6"]);
  });

  it("lists shaky topics", () => {
    expect(shakyTopicIds(s)).toEqual(["a"]);
  });

  it("sums time by day, week and in total", () => {
    expect(timeSummary(s, "2026-10-21")).toEqual({ today: 15, thisWeek: 45, total: 90 });
    const days = dailyMinutes(s, "2026-10-21", 3);
    expect(days).toEqual([
      { day: "2026-10-19", minutes: 30 },
      { day: "2026-10-20", minutes: 0 },
      { day: "2026-10-21", minutes: 15 },
    ]);
  });
});

describe("badges", () => {
  it("nothing is earned on an empty state", () => {
    expect(computeBadges(roadmap, emptyState(), "2026-10-21").filter((b) => b.earned)).toEqual([]);
  });

  it("earns streak badges from the longest run, even if it has ended", () => {
    const s = { ...emptyState(), activity: ["2026-01-01", "2026-01-02", "2026-01-03", "2026-02-01"] };
    const b = computeBadges(roadmap, s, "2026-10-21");
    expect(b.find((x) => x.id === "streak-3")!.earned).toBe(true);
    expect(b.find((x) => x.id === "streak-7")!.progress).toBeCloseTo(3 / 7);
  });

  it("earns level and phase badges", () => {
    const ids = levelTopicIds(getLevel(4)!);
    const s: UserState = { ...emptyState(), topics: Object.fromEntries(ids.map((id) => [id, { done: true }])) };
    const b = computeBadges(roadmap, s, "2026-10-21");
    expect(b.find((x) => x.id === "level-1")!.earned).toBe(true);
    expect(b.find((x) => x.id === "phase-retrieval")!.earned).toBe(true); // L4 is the whole Retrieval phase
    expect(b.find((x) => x.id === "phase-foundations")!.earned).toBe(false);
  });
});

describe("store v3 fields", () => {
  it("migrates v2 data, keeping progress and adding defaults", () => {
    const v2 = { version: 2, topics: { t: { done: true } }, settings: { theme: "dark", targetRole: "none" } };
    const s = loadState(JSON.stringify(v2));
    expect(s.version).toBe(SCHEMA_VERSION);
    expect(s.topics.t.done).toBe(true);
    expect(s.settings).toEqual({ theme: "dark", targetRole: "none", weeklyHours: 6, dailyGoal: 2 });
    expect(s.studyMinutes).toEqual({});
    expect(s.log).toEqual({});
  });

  it("sanitizes minutes, log and weekly hours", () => {
    const s = loadState(
      JSON.stringify({
        version: 3,
        studyMinutes: { "2026-10-21": 12.4, bad: 5, "2026-10-20": -3, "2026-10-19": 99999 },
        log: { "2026-10-21": { text: "hi" }, "2026-10-20": { text: 5 } },
        settings: { weeklyHours: 500 },
      }),
    );
    expect(s.studyMinutes).toEqual({ "2026-10-21": 12, "2026-10-19": 1440 });
    expect(Object.keys(s.log)).toEqual(["2026-10-21"]);
    expect(s.settings.weeklyHours).toBe(6);
  });

  it("adds study minutes and log entries to today", () => {
    const store = createStore({ storage: memoryStorage(), now: () => new Date("2026-10-21T10:00:00") });
    store.addStudyMinutes(1);
    store.addStudyMinutes(2);
    store.addStudyMinutes(-5);
    expect(store.getState().studyMinutes).toEqual({ "2026-10-21": 3 });
    expect(store.getState().activity).toEqual([]); // minutes alone are not activity
    store.setLog("Built a BM25 index");
    expect(store.getState().log["2026-10-21"].text).toBe("Built a BM25 index");
    expect(store.getState().activity).toEqual(["2026-10-21"]);
    store.setLog("  ");
    expect(store.getState().log).toEqual({});
    store.setWeeklyHours(200);
    expect(store.getState().settings.weeklyHours).toBe(80);
  });
});
