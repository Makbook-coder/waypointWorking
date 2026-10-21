// Picking and summarising interview practice. Pure functions over the question bank and user state.
import type { MockSession, UserState } from "./store";
import type { InterviewItem } from "./types";

export const lastScore = (s: UserState, id: string): number | null => {
  const list = s.interview[id];
  return list?.length ? list[list.length - 1].score : null;
};

/**
 * Order for a mock: weak answers (last score 1-2) first, then questions never answered,
 * then the rest by rising score. Ties are broken by `rand`, so each mock differs.
 */
export function pickMockQuestions<T extends InterviewItem>(items: T[], s: UserState, count: number, rand: () => number = Math.random): T[] {
  const UNSEEN = 2.5;
  return items
    .map((it) => ({ it, key: lastScore(s, it.id) ?? UNSEEN, tie: rand() }))
    .sort((a, b) => a.key - b.key || a.tie - b.tie)
    .slice(0, Math.max(0, count))
    .map((x) => x.it);
}

/** Average of answered questions; skipped (0) don't count. Null when nothing was answered. */
export function mockAverage(m: Pick<MockSession, "scores">): number | null {
  const answered = m.scores.filter((x) => x > 0);
  return answered.length ? answered.reduce((a, b) => a + b, 0) / answered.length : null;
}

export interface InterviewSummary {
  answered: number;
  total: number;
  average: number | null; // of each question's latest score
  strong: number; // latest score 4 or 5
  weak: InterviewItem[]; // latest score 1 or 2, weakest first
}

export function interviewSummary(items: InterviewItem[], s: UserState): InterviewSummary {
  const scored = items.map((it) => ({ it, score: lastScore(s, it.id) })).filter((x): x is { it: InterviewItem; score: number } => x.score !== null);
  return {
    answered: scored.length,
    total: items.length,
    average: scored.length ? scored.reduce((a, x) => a + x.score, 0) / scored.length : null,
    strong: scored.filter((x) => x.score >= 4).length,
    weak: scored.filter((x) => x.score <= 2).sort((a, b) => a.score - b.score).map((x) => x.it),
  };
}

/** Suggested self-score from how many key points you ticked: none → 1, all → 5. */
export const suggestScore = (covered: number, total: number) => (total ? 1 + Math.round((4 * covered) / total) : 3);

export const SCORE_LABELS: Record<number, string> = {
  1: "Missed it",
  2: "Partial",
  3: "Okay",
  4: "Good",
  5: "Nailed it",
};
