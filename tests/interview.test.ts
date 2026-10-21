import { describe, expect, it } from "vitest";
import practiceJson from "../data/practice.json";
import { interviewSummary, mockAverage, pickMockQuestions, suggestScore } from "@/lib/interview";
import { emptyState, type UserState } from "@/lib/store";
import type { InterviewItem, PracticeMap, Roadmap } from "@/lib/types";
import roadmapJson from "../data/roadmap.json";

const bank = Object.values(practiceJson as unknown as PracticeMap)
  .flat()
  .filter((p): p is InterviewItem => p.type === "interview");
const modules = (roadmapJson as unknown as Roadmap).phases.flatMap((p) => p.levels).flatMap((l) => l.modules);

const q = (id: string): InterviewItem => ({ id, type: "interview", moduleId: "M1.1", levelId: 1, difficulty: "easy", question: id, answer: "", keyPoints: [] });
const withScores = (scores: Record<string, number>): UserState => ({
  ...emptyState(),
  interview: Object.fromEntries(Object.entries(scores).map(([id, score]) => [id, [{ score, at: "" }]])),
});

describe("interview bank", () => {
  it("has a question for every non-capstone module and none for capstones", () => {
    for (const m of modules) {
      const n = bank.filter((b) => b.moduleId === m.id).length;
      if (m.isCapstone) expect(n, m.id).toBe(0);
      else expect(n, m.id).toBeGreaterThan(0);
    }
  });

  it("every question has a full model answer and 3 to 5 key points", () => {
    for (const b of bank) {
      expect(b.question.endsWith("?") || b.question.endsWith("."), b.id).toBe(true);
      expect(b.answer.length, b.id).toBeGreaterThan(150);
      expect(b.keyPoints.length, b.id).toBeGreaterThanOrEqual(3);
      expect(b.keyPoints.length, b.id).toBeLessThanOrEqual(5);
    }
    expect(new Set(bank.map((b) => b.question)).size).toBe(bank.length);
  });
});

describe("pickMockQuestions", () => {
  const items = ["strong", "weak", "new1", "okay", "new2", "awful"].map(q);
  const s = withScores({ strong: 5, weak: 2, okay: 3, awful: 1 });

  it("puts weak answers first, then unseen, then the rest by score", () => {
    const order = pickMockQuestions(items, s, 6, () => 0).map((x) => x.id);
    expect(order.slice(0, 2)).toEqual(["awful", "weak"]);
    expect(new Set(order.slice(2, 4))).toEqual(new Set(["new1", "new2"]));
    expect(order.slice(4)).toEqual(["okay", "strong"]);
  });

  it("respects the count and never repeats", () => {
    const picked = pickMockQuestions(bank, emptyState(), 10);
    expect(picked.length).toBe(10);
    expect(new Set(picked.map((p) => p.id)).size).toBe(10);
    expect(pickMockQuestions(items, s, 0)).toEqual([]);
  });

  it("varies ties with the random source", () => {
    let i = 0;
    const seq = [0.9, 0.1];
    const a = pickMockQuestions([q("x"), q("y")], emptyState(), 2, () => seq[i++ % 2]).map((x) => x.id);
    expect(a).toEqual(["y", "x"]);
  });
});

describe("scoring helpers", () => {
  it("averages answered questions and ignores skips", () => {
    expect(mockAverage({ scores: [4, 0, 2] })).toBe(3);
    expect(mockAverage({ scores: [0, 0] })).toBeNull();
  });

  it("suggests a score from covered key points", () => {
    expect(suggestScore(0, 4)).toBe(1);
    expect(suggestScore(2, 4)).toBe(3);
    expect(suggestScore(4, 4)).toBe(5);
    expect(suggestScore(0, 0)).toBe(3);
  });

  it("summarises the bank from each question's latest score", () => {
    const items = ["a", "b", "c"].map(q);
    const s = withScores({ a: 5, b: 1 });
    const sum = interviewSummary(items, s);
    expect(sum).toMatchObject({ answered: 2, total: 3, average: 3, strong: 1 });
    expect(sum.weak.map((x) => x.id)).toEqual(["b"]);
  });
});
