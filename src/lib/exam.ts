// Level exams: a timed, mixed check per level (L0..L13). Pure functions here; ExamRunner does the UI.
// Practice improves readiness; passing a Waypoint exam is a signal, not a guarantee for any real exam.
import type { ExamAttempt, UserState } from "./store";
import type { CodingItem, PracticeItem, QuizItem, ScenarioItem } from "./types";

export const EXAM_LEVELS = Array.from({ length: 14 }, (_, i) => i); // L0..L13 have quizzes to draw from
export const EXAM_QUIZ_COUNT = 10;
export const EXAM_MINUTES = 30;
export const PASS_MARK = 70;
/** Share of the score per section. They add up to 100. */
export const WEIGHTS = { quiz: 60, coding: 25, scenario: 15 } as const;

export interface ExamPaper {
  levelId: number;
  quizzes: QuizItem[];
  coding: CodingItem;
  scenario: ScenarioItem;
}

/** mulberry32: small, seedable, good enough for picking questions. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], r: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Draw a paper from a level's practice: quizzes spread across modules (round-robin over a shuffled
 * module order), one coding task and one scenario. Items you got wrong before come first in each module.
 */
export function buildExam(levelId: number, practice: PracticeItem[], seed: number, s?: Pick<UserState, "quiz">): ExamPaper | null {
  const r = rng(seed);
  const level = practice.filter((p) => p.levelId === levelId);
  const quizzes = level.filter((p): p is QuizItem => p.type === "quiz");
  const coding = level.filter((p): p is CodingItem => p.type === "coding");
  const scenarios = level.filter((p): p is ScenarioItem => p.type === "scenario");
  if (quizzes.length < EXAM_QUIZ_COUNT || coding.length === 0 || scenarios.length === 0) return null;

  const missed = (q: QuizItem) => (s?.quiz[q.id] && !s.quiz[q.id].lastCorrect ? 0 : 1);
  const byModule = new Map<string, QuizItem[]>();
  for (const q of shuffle(quizzes, r)) byModule.set(q.moduleId, [...(byModule.get(q.moduleId) ?? []), q]);
  for (const [m, list] of byModule) byModule.set(m, [...list].sort((a, b) => missed(a) - missed(b)));
  const queues = shuffle([...byModule.values()], r);
  const picked: QuizItem[] = [];
  for (let i = 0; picked.length < EXAM_QUIZ_COUNT; i++) for (const qs of queues) if (qs[i] && picked.length < EXAM_QUIZ_COUNT) picked.push(qs[i]);

  return { levelId, quizzes: picked, coding: coding[Math.floor(r() * coding.length)], scenario: scenarios[Math.floor(r() * scenarios.length)] };
}

export interface ExamAnswers {
  quiz: Record<string, number | null>; // quiz id -> chosen option
  codingPassed: number; // tests passed in the last run
  codingTotal: number;
  scenarioScore: number; // self-score 1..5, 0 = skipped
}

export function scoreExam(paper: ExamPaper, a: ExamAnswers) {
  const correct = paper.quizzes.filter((q) => a.quiz[q.id] === q.answer).length;
  const quizPart = (correct / paper.quizzes.length) * WEIGHTS.quiz;
  const codingPart = a.codingTotal ? (a.codingPassed / a.codingTotal) * WEIGHTS.coding : 0;
  const scenarioPart = (Math.max(0, Math.min(5, a.scenarioScore)) / 5) * WEIGHTS.scenario;
  const score = Math.round(quizPart + codingPart + scenarioPart);
  const wrong = paper.quizzes.filter((q) => a.quiz[q.id] !== q.answer);
  const weak = new Set(wrong.map((q) => q.moduleId));
  if (a.codingTotal && a.codingPassed < a.codingTotal) weak.add(paper.coding.moduleId);
  if (a.scenarioScore > 0 && a.scenarioScore <= 2) weak.add(paper.scenario.moduleId);
  return {
    score,
    passed: score >= PASS_MARK,
    correct,
    wrongQuizIds: wrong.map((q) => q.id),
    weakModules: [...weak].sort((x, y) => x.localeCompare(y, undefined, { numeric: true })),
    parts: { quiz: Math.round(quizPart), coding: Math.round(codingPart), scenario: Math.round(scenarioPart) },
  };
}

export const examsFor = (s: Pick<UserState, "exams">, levelId: number): ExamAttempt[] => s.exams.filter((e) => e.levelId === levelId);

export function bestExam(s: Pick<UserState, "exams">, levelId: number): ExamAttempt | null {
  return examsFor(s, levelId).reduce<ExamAttempt | null>((best, e) => (!best || e.score > best.score ? e : best), null);
}
