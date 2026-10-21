import { describe, expect, it } from "vitest";
import { getLevel, levels, roadmap } from "@/lib/data";
import { recommendedFocus } from "@/lib/focus";
import {
  currentStreak,
  dueReviews,
  levelProgress,
  levelTopicIds,
  moduleProgress,
  nextModule,
  overallProgress,
  phaseProgress,
  prerequisitesMet,
  ratio,
} from "@/lib/progress";
import { emptyState, type UserState } from "@/lib/store";

const withDone = (ids: string[]): UserState => ({
  ...emptyState(),
  topics: Object.fromEntries(ids.map((id) => [id, { done: true }])),
});

describe("ratio", () => {
  it("handles empty totals and rounds down", () => {
    expect(ratio(0, 0)).toEqual({ done: 0, total: 0, pct: 0 });
    expect(ratio(2, 3).pct).toBe(66);
    expect(ratio(999, 1000).pct).toBe(99); // never shows 100 until complete
    expect(ratio(5, 5).pct).toBe(100);
  });
});

describe("progress over the real roadmap", () => {
  const l4 = getLevel(4)!;
  const m46 = l4.modules.find((m) => m.id === "M4.6")!;

  it("counts topics at every level of the hierarchy", () => {
    const s = withDone(m46.topics.map((t) => t.id));
    expect(moduleProgress(m46, s)).toMatchObject({ done: m46.topics.length, pct: 100 });
    expect(levelProgress(l4, s).done).toBe(m46.topics.length);
    const retrieval = roadmap.phases.find((p) => p.id === "retrieval")!;
    expect(phaseProgress(retrieval, s).done).toBe(m46.topics.length);
    expect(overallProgress(roadmap, s).total).toBe(levels.reduce((n, l) => n + levelTopicIds(l).length, 0));
  });

  it("ignores topics marked undone and unknown ids", () => {
    const s: UserState = { ...emptyState(), topics: { [m46.topics[0].id]: { done: false }, "not-a-topic": { done: true } } };
    expect(overallProgress(roadmap, s).done).toBe(0);
  });

  it("nextModule returns the first unfinished module in order", () => {
    expect(nextModule(roadmap, emptyState())?.id).toBe("M0.1");
    const l0 = getLevel(0)!;
    const s = withDone(levelTopicIds(l0));
    expect(nextModule(roadmap, s)?.id).toBe("M1.1");
  });

  it("prerequisites are met at 80% of each prerequisite level", () => {
    const byId = new Map(levels.map((l) => [l.id, l]));
    const l2 = getLevel(2)!; // prerequisite: L1
    const l1ids = levelTopicIds(getLevel(1)!);
    expect(prerequisitesMet(l2, byId, emptyState())).toBe(false);
    expect(prerequisitesMet(l2, byId, withDone(l1ids.slice(0, Math.ceil(l1ids.length * 0.8))))).toBe(true);
    expect(prerequisitesMet(getLevel(0)!, byId, emptyState())).toBe(true);
  });
});

describe("streak", () => {
  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-03-08", "2026-03-09", "2026-03-10"], "2026-03-10")).toBe(3);
  });
  it("keeps yesterday's streak alive until today ends", () => {
    expect(currentStreak(["2026-03-08", "2026-03-09"], "2026-03-10")).toBe(2);
  });
  it("breaks on a gap", () => {
    expect(currentStreak(["2026-03-06", "2026-03-08"], "2026-03-10")).toBe(0);
    expect(currentStreak(["2026-03-06", "2026-03-09", "2026-03-10"], "2026-03-10")).toBe(2);
  });
  it("is zero with no activity", () => {
    expect(currentStreak([], "2026-03-10")).toBe(0);
  });
});

describe("dueReviews", () => {
  it("returns reviews due today or earlier, oldest first", () => {
    const s: UserState = {
      ...emptyState(),
      reviews: { a: { step: 0, due: "2026-03-10" }, b: { step: 1, due: "2026-03-01" }, c: { step: 0, due: "2026-03-11" } },
    };
    expect(dueReviews(s, "2026-03-10")).toEqual(["b", "a"]);
  });
});

describe("recommendedFocus", () => {
  it("excludes finished levels", () => {
    const s = withDone(levelTopicIds(getLevel(4)!));
    expect(recommendedFocus(levels, s, "none", 16).some((f) => f.level.id === 4)).toBe(false);
  });

  it("reorders by role", () => {
    const ai = recommendedFocus(levels, emptyState(), "ai-engineer", 16).map((f) => f.level.id);
    const ds = recommendedFocus(levels, emptyState(), "genai-ds", 16).map((f) => f.level.id);
    expect(ai).not.toEqual(ds);
    // Fine-tuning (L13: interview 7, job 3) ranks higher for GenAI DS than for AI Engineer
    expect(ds.indexOf(13)).toBeLessThan(ai.indexOf(13));
  });

  it("returns at most the limit", () => {
    expect(recommendedFocus(levels, emptyState(), "none")).toHaveLength(5);
  });
});
