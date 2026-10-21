import { describe, expect, it } from "vitest";
import { allPractice } from "@/lib/content-data";
import { getLevel } from "@/lib/data";
import { EXAM_LEVELS, EXAM_QUIZ_COUNT, PASS_MARK, WEIGHTS, bestExam, buildExam, scoreExam } from "@/lib/exam";
import { SCHEMA_VERSION, createStore, loadState, memoryStorage } from "@/lib/store";

const at = (iso: string) => () => new Date(iso);

describe("level exams", () => {
  it("weights add up to 100", () => {
    expect(WEIGHTS.quiz + WEIGHTS.coding + WEIGHTS.scenario).toBe(100);
  });

  it.each(EXAM_LEVELS)("L%i has a full paper spread across modules", (id) => {
    const p = buildExam(id, allPractice, 42)!;
    expect(p).not.toBeNull();
    expect(p.quizzes).toHaveLength(EXAM_QUIZ_COUNT);
    expect(new Set(p.quizzes.map((q) => q.id)).size).toBe(EXAM_QUIZ_COUNT);
    for (const q of p.quizzes) expect(q.levelId).toBe(id);
    const mods = new Set(p.quizzes.map((q) => q.moduleId)).size;
    expect(mods).toBe(Math.min(EXAM_QUIZ_COUNT, getLevel(id)!.modules.length));
    expect(p.coding.levelId).toBe(id);
    expect(p.scenario.levelId).toBe(id);
  });

  it("is the same paper for the same seed and different for another", () => {
    const a = buildExam(4, allPractice, 7)!.quizzes.map((q) => q.id);
    expect(buildExam(4, allPractice, 7)!.quizzes.map((q) => q.id)).toEqual(a);
    expect(buildExam(4, allPractice, 8)!.quizzes.map((q) => q.id)).not.toEqual(a);
  });

  it("puts questions you missed before first", () => {
    const base = buildExam(2, allPractice, 3)!;
    const pool = allPractice.filter((p) => p.type === "quiz" && p.levelId === 2 && !base.quizzes.some((q) => q.id === p.id));
    const missed = pool[0];
    const p = buildExam(2, allPractice, 3, { quiz: { [missed.id]: { attempts: 1, correct: 0, lastCorrect: false, lastAt: "" } } })!;
    expect(p.quizzes.map((q) => q.id)).toContain(missed.id);
  });

  it("scores and finds weak modules", () => {
    const p = buildExam(4, allPractice, 1)!;
    const allRight = Object.fromEntries(p.quizzes.map((q) => [q.id, q.answer]));
    const perfect = scoreExam(p, { quiz: allRight, codingPassed: 5, codingTotal: 5, scenarioScore: 5 });
    expect(perfect).toMatchObject({ score: 100, passed: true, correct: 10, wrongQuizIds: [], weakModules: [] });

    const wrong = p.quizzes[0];
    const r = scoreExam(p, { quiz: { ...allRight, [wrong.id]: (wrong.answer + 1) % 4 }, codingPassed: 0, codingTotal: 4, scenarioScore: 2 });
    expect(r.score).toBe(Math.round(54 + 0 + 6));
    expect(r.passed).toBe(false);
    expect(r.weakModules).toEqual(expect.arrayContaining([wrong.moduleId, p.coding.moduleId, p.scenario.moduleId]));
    expect(PASS_MARK).toBe(70);
  });

  it("saves attempts, keeps the best, and schedules weak topics for tomorrow", () => {
    const store = createStore({ storage: memoryStorage(), now: at("2026-10-21T10:00:00Z") });
    const base = { startedAt: "", quiz: { correct: 5, total: 10 }, coding: { itemId: "c", passed: 1, total: 2 }, scenario: { itemId: "s", score: 3 }, wrongQuizIds: [], weakModules: ["M4.2"] };
    store.recordExam({ ...base, levelId: 4, score: 55, passed: false }, ["t1", "t2"]);
    store.recordExam({ ...base, levelId: 4, score: 82, passed: true });
    const s = store.getState();
    expect(s.exams).toHaveLength(2);
    expect(bestExam(s, 4)?.score).toBe(82);
    expect(bestExam(s, 5)).toBeNull();
    expect(s.reviews.t1).toEqual({ step: 0, due: "2026-10-22" });
    expect(s.reviews.t2.due).toBe("2026-10-22");
  });

  it("stores rubric scores between 1 and 4", () => {
    const store = createStore({ storage: memoryStorage() });
    store.setRubric("l4-project", 0, 9);
    store.setRubric("l4-project", 1, 2);
    expect(store.getState().rubrics).toEqual({ "l4-project#0": 4, "l4-project#1": 2 });
    store.setRubric("l4-project", 0, null);
    expect(store.getState().rubrics).toEqual({ "l4-project#1": 2 });
  });

  it("migrates v7 data and drops bad exam entries", () => {
    expect(SCHEMA_VERSION).toBe(8);
    const s = loadState(
      JSON.stringify({
        version: 7,
        exams: [{ levelId: 2, finishedAt: "2026-10-01T00:00:00Z", score: 140, passed: true, quiz: { correct: 9, total: 10 } }, { score: 50 }, "x"],
        rubrics: { "a#0": 3, "a#1": 7, "a#2": "4" },
      }),
    );
    expect(s.version).toBe(8);
    expect(s.exams).toHaveLength(1);
    expect(s.exams[0]).toMatchObject({ levelId: 2, score: 100, passed: true, quiz: { correct: 9, total: 10 }, weakModules: [] });
    expect(s.rubrics).toEqual({ "a#0": 3 });
    expect(loadState(JSON.stringify({ version: 7 })).exams).toEqual([]);
  });
});

describe("capstone guides", async () => {
  const { validateCapstones, getCapstone, rubricFor, rubricResult, milestoneProgress, milestoneKey } = await import("@/lib/capstones");
  const { levels } = await import("@/lib/data");

  it("every level project has a guide with milestones and a rubric", () => {
    expect(validateCapstones(levels.filter((l) => l.project).map((l) => l.id))).toEqual([]);
  });

  it("tracks milestone tasks and rubric scores", () => {
    const c = getCapstone(4)!;
    const store = createStore({ storage: memoryStorage() });
    store.setProjectCheck(milestoneKey("l4-project", 0), 1, true);
    expect(milestoneProgress(c, "l4-project", store.getState()).done).toBe(1);
    rubricFor(c).forEach((_, i) => store.setRubric("l4-project", i, 3));
    expect(rubricResult(c, "l4-project", store.getState())).toMatchObject({ complete: true, pct: 75 });
  });
});
