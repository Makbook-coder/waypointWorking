import { describe, expect, it } from "vitest";
import { band, levelReadiness, readiness } from "@/lib/readiness";
import { levelPractice } from "@/lib/readiness-data";
import { createStore, emptyState, memoryStorage } from "@/lib/store";

const levels = levelPractice();

describe("readiness", () => {
  it("starts at zero with every level a gap candidate", () => {
    const r = readiness(levels, emptyState(), "ai-engineer");
    expect(r.overall).toBe(0);
    expect(r.gaps).toHaveLength(5);
    expect(r.examsTotal).toBe(14);
    expect(r.gaps[0].next).toMatch(/lab/);
  });

  it("every exam level has labs, coding, quizzes and scenarios to count", () => {
    for (const l of levels.filter((x) => x.hasExam)) {
      const parts = levelReadiness(l, emptyState(), "none").parts;
      for (const k of ["exam", "labs", "coding", "quiz", "scenarios", "topics"]) expect(parts, `L${l.id} ${k}`).toHaveProperty(k);
    }
  });

  it("rises with practice and an exam pass", () => {
    const store = createStore({ storage: memoryStorage() });
    const l4 = levels.find((l) => l.id === 4)!;
    const before = levelReadiness(l4, store.getState(), "none").score;
    for (const id of l4.codingIds) store.markCodingPassed(id);
    for (const lab of l4.labs) for (let i = 0; i < lab.steps; i++) store.markCodingPassed(`lab:${lab.id}#${i}`);
    store.recordExam({ levelId: 4, startedAt: "", score: 90, passed: true, quiz: { correct: 9, total: 10 }, coding: { itemId: "", passed: 1, total: 1 }, scenario: { itemId: "", score: 4 }, wrongQuizIds: [], weakModules: [] });
    const after = levelReadiness(l4, store.getState(), "none");
    expect(after.score).toBeGreaterThan(before + 40);
    expect(after.parts).toMatchObject({ coding: 100, labs: 100, exam: 90 });
    expect(after.examPassed).toBe(true);
    expect(after.next).toMatch(/quiz/);
  });

  it("weights levels by role", () => {
    const store = createStore({ storage: memoryStorage() });
    const l13 = levels.find((l) => l.id === 13)!;
    for (const id of l13.codingIds) store.markCodingPassed(id);
    const ds = readiness(levels, store.getState(), "genai-ds").overall;
    const eng = readiness(levels, store.getState(), "ai-engineer").overall;
    expect(ds).toBeGreaterThanOrEqual(eng);
  });

  it("names bands without promising outcomes", () => {
    expect(band(0)).toBe("Just starting");
    expect(band(90)).toMatch(/practice record/);
  });
});
