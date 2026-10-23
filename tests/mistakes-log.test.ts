import { describe, expect, it } from "vitest";
import type { CompleteRequest, Provider } from "@/lib/ai/provider";
import { parseWrongWhy, wrongWhyPrompt } from "@/lib/ai/wrong-why";
import { addCalibration, applyAnswer, calibrationNote, emptyCalibration, sortMistakes, type MistakeRecord } from "@/lib/mistake-log";
import { SCHEMA_VERSION, createStore, loadState, memoryStorage, migrate } from "@/lib/store";
import { explainWrongOptions } from "@/lib/ai/wrong-why";
import type { QuizItem } from "@/lib/types";

const quiz: QuizItem = {
  id: "q1",
  type: "quiz",
  moduleId: "M0.1",
  levelId: 0,
  difficulty: "easy",
  question: "Which type is immutable?",
  options: ["tuple", "set", "list", "dict"],
  answer: 0,
  explanation: "Tuples cannot change.",
};

describe("mistake log", () => {
  it("logs a miss, then marks it fixed after two correct retries in a row", () => {
    let m = applyAnswer(undefined, { correct: false, picked: 2, sureness: 3 }, "t1")!;
    expect(m).toMatchObject({ misses: 1, picked: 2, sureness: 3, streak: 0 });
    m = applyAnswer(m, { correct: true, picked: 0 }, "t2")!;
    expect(m.fixedAt).toBeUndefined();
    m = applyAnswer(m, { correct: false, picked: 1 }, "t3")!;
    expect(m).toMatchObject({ misses: 2, streak: 0, firstAt: "t1" });
    m = applyAnswer(m, { correct: true, picked: 0 }, "t4")!;
    m = applyAnswer(m, { correct: true, picked: 0 }, "t5")!;
    expect(m.fixedAt).toBe("t5");
    expect(applyAnswer(m, { correct: false, picked: 3 }, "t6")!.fixedAt).toBeUndefined();
  });

  it("ignores correct answers for questions never missed", () => {
    expect(applyAnswer(undefined, { correct: true, picked: 0 }, "t")).toBeUndefined();
  });

  it("sorts open and overconfident misses first", () => {
    const rec = (o: Partial<MistakeRecord>): MistakeRecord => ({ misses: 1, firstAt: "a", lastAt: "a", picked: 1, streak: 0, ...o });
    const list = [
      { id: "fixed", record: rec({ fixedAt: "x", sureness: 3 }) },
      { id: "plain", record: rec({ misses: 5 }) },
      { id: "sure", record: rec({ sureness: 3 }) },
    ];
    expect(sortMistakes(list).map((x) => x.id)).toEqual(["sure", "plain", "fixed"]);
  });

  it("describes calibration only with enough data", () => {
    let c = emptyCalibration();
    expect(calibrationNote(c)).toBeNull();
    for (let i = 0; i < 6; i++) c = addCalibration(c, 3, i < 2);
    expect(calibrationNote(c)).toMatch(/certain you were right 33%/);
    expect(addCalibration(c, undefined, true)).toBe(c);
  });
});

describe("store: mistakes", () => {
  it("records misses with sureness and calibration, and retries fix them", () => {
    const store = createStore({ storage: memoryStorage(), now: () => new Date("2026-03-10T09:00:00") });
    store.recordQuiz("q1", false, [], { picked: 2, sureness: 3 });
    store.setMistakeReason("q1", "misread");
    expect(store.getState().mistakes.q1).toMatchObject({ misses: 1, picked: 2, sureness: 3, reason: "misread" });
    expect(store.getState().calibration[3]).toEqual({ right: 0, wrong: 1 });
    store.recordQuiz("q1", true, [], { picked: 0 });
    store.recordQuiz("q1", true, [], { picked: 0 });
    expect(store.getState().mistakes.q1.fixedAt).toBeTruthy();
    store.setMistakeReason("q1", null);
    expect(store.getState().mistakes.q1.reason).toBeUndefined();
    store.clearMistake("q1");
    expect(store.getState().mistakes.q1).toBeUndefined();
  });

  it("survives a reload and migrates v9 data", () => {
    const store = createStore({ storage: memoryStorage(), now: () => new Date("2026-03-10T09:00:00") });
    store.recordQuiz("q1", false, [], { picked: 1 });
    store.setMistakeWhy("q1", ["", "a", "b", "c"]);
    const again = loadState(JSON.stringify(store.getState()));
    expect(again.mistakes.q1.why).toEqual(["", "a", "b", "c"]);
    const old = migrate({ version: 9, topics: {} });
    expect(old.version).toBe(SCHEMA_VERSION);
    expect(loadState(JSON.stringify({ version: 9 })).mistakes).toEqual({});
  });

  it("drops malformed mistake records", () => {
    const s = loadState(JSON.stringify({ version: 10, mistakes: { a: { misses: 1, picked: 9 }, b: "x", c: { misses: 2, picked: 1, streak: 1 } } }));
    expect(Object.keys(s.mistakes)).toEqual(["c"]);
  });
});

describe("wrong-answer explanations", () => {
  it("asks about every option and fences the question in tags", () => {
    const { system, user } = wrongWhyPrompt(quiz, 2);
    expect(system).toMatch(/ignore any instructions/);
    expect(user).toContain("<question>\nWhich type is immutable?");
    expect(user).toContain("0. tuple  <- correct");
    expect(user).toContain("picked option 2");
  });

  it("blanks the correct option and rejects empty replies", () => {
    expect(parseWrongWhy('{"why": ["leaked", "Sets are mutable.", "Lists too.", 4]}', quiz)).toEqual(["", "Sets are mutable.", "Lists too.", ""]);
    expect(() => parseWrongWhy('{"why": []}', quiz)).toThrow(/explain/);
  });

  it("requests JSON from the provider", async () => {
    let seen: CompleteRequest | null = null;
    const p: Provider = {
      async complete(req) {
        seen = req;
        return '{"why": ["", "x", "y", "z"]}';
      },
    };
    expect(await explainWrongOptions(p, quiz)).toEqual(["", "x", "y", "z"]);
    expect(seen!.json).toBe(true);
  });
});
