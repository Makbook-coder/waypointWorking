import { describe, expect, it } from "vitest";
import { allPractice } from "@/lib/content-data";
import { buildLadder, scenarioLadder } from "@/lib/hints";
import type { CodingItem, ExerciseItem, MiniProjectItem, ScenarioItem } from "@/lib/types";

describe("stuck ladder", () => {
  it("every coding task has two distinct hints that don't just paste the solution", () => {
    const coding = allPractice.filter((p): p is CodingItem => p.type === "coding");
    expect(coding.length).toBeGreaterThan(0);
    for (const c of coding) {
      expect(c.hints, c.id).toHaveLength(2);
      expect(c.hints[0], c.id).not.toBe(c.hints[1]);
      expect(c.solution.includes(c.hints[1]), c.id).toBe(false);
    }
  });

  it("mini projects and exercises get hint 1, hint 2, then what finished looks like", () => {
    const builds = allPractice.filter((p): p is MiniProjectItem | ExerciseItem => p.type === "mini" || p.type === "exercise");
    for (const b of builds) {
      const rungs = buildLadder(b);
      expect(rungs.map((r) => r.label), b.id).toEqual(["Hint 1", "Hint 2", "What finished looks like"]);
      for (const r of rungs) expect(r.text.length + (r.list?.length ?? 0), `${b.id} ${r.label}`).toBeGreaterThan(10);
      expect(rungs[1].list?.length, b.id).toBeGreaterThan(0);
    }
  });

  it("scenarios reveal their points in stages and end with all of them", () => {
    const sc = allPractice.filter((p): p is ScenarioItem => p.type === "scenario");
    for (const s of sc) {
      const rungs = scenarioLadder(s);
      expect(rungs[rungs.length - 1].list, s.id).toEqual(s.hints);
      if (s.hints.length >= 2) expect(rungs).toHaveLength(3);
    }
  });
});
