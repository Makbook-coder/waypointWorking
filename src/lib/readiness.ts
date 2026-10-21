// Readiness per target role: how much practice you've done, how well, and what's missing.
// It measures practice, not ability. A high number means a strong practice record, never a promise.
import { getCapstone, rubricResult } from "./capstones";
import { ROLE_BOOST, ROLE_WEIGHTS } from "./focus";
import { bestExam } from "./exam";
import type { TargetRole, UserState } from "./store";

/** What a level offers to practise, by id. Built on the server from practice.json and the labs. */
export interface LevelPractice {
  id: number;
  title: string;
  interviewWeight: number;
  jobWeight: number;
  topicIds: string[];
  quizIds: string[];
  codingIds: string[];
  scenarioIds: string[];
  labs: { id: string; steps: number }[];
  projectId: string | null;
  hasExam: boolean;
}

export type Component = "topics" | "quiz" | "coding" | "labs" | "scenarios" | "exam" | "project" | "mocks";

/** How much each kind of evidence counts towards a level's readiness. Missing kinds are left out and the rest re-weighted. */
export const COMPONENT_WEIGHTS: Record<Component, number> = { exam: 30, quiz: 15, coding: 15, labs: 15, scenarios: 10, project: 10, topics: 5, mocks: 20 };

export const COMPONENT_LABEL: Record<Component, string> = {
  topics: "Topics done",
  quiz: "Quiz questions right",
  coding: "Coding tasks passed",
  labs: "Lab checkpoints",
  scenarios: "Scenarios scored 3+",
  exam: "Best exam score",
  project: "Capstone self-review",
  mocks: "Mock interview average",
};

export interface LevelReadiness {
  level: LevelPractice;
  importance: number;
  parts: Partial<Record<Component, number>>; // 0..100 each
  score: number; // 0..100
  examPassed: boolean;
  next: string | null; // the single most useful thing to do next
}

const pct = (n: number, d: number) => (d ? Math.round((Math.min(n, d) / d) * 100) : 0);
const SCENARIO_TARGET = 3;

export function levelReadiness(l: LevelPractice, s: UserState, role: TargetRole): LevelReadiness {
  const w = ROLE_WEIGHTS[role];
  const importance = (l.interviewWeight * w.interview + l.jobWeight * w.job) * (ROLE_BOOST[role][l.id] ?? 1);
  const parts: Partial<Record<Component, number>> = {};
  if (l.topicIds.length) parts.topics = pct(l.topicIds.filter((t) => s.topics[t]?.done).length, l.topicIds.length);
  if (l.quizIds.length) parts.quiz = pct(l.quizIds.filter((q) => s.quiz[q]?.lastCorrect).length, l.quizIds.length);
  if (l.codingIds.length) parts.coding = pct(l.codingIds.filter((c) => s.coding[c]?.passedAt).length, l.codingIds.length);
  const labSteps = l.labs.reduce((n, x) => n + x.steps, 0);
  if (labSteps) parts.labs = pct(l.labs.reduce((n, x) => n + Array.from({ length: x.steps }, (_, i) => s.coding[`lab:${x.id}#${i}`]?.passedAt).filter(Boolean).length, 0), labSteps);
  if (l.scenarioIds.length) {
    const good = l.scenarioIds.filter((id) => (s.scenarios[id] ?? []).some((r) => r.score >= 3)).length;
    parts.scenarios = pct(good, Math.min(SCENARIO_TARGET, l.scenarioIds.length));
  }
  const best = l.hasExam ? bestExam(s, l.id) : null;
  if (l.hasExam) parts.exam = best?.score ?? 0;
  const cap = l.projectId ? getCapstone(l.id) : undefined;
  if (l.projectId && cap) {
    // Unscored criteria count as zero, so a half-reviewed project can't look finished.
    const r = rubricResult(cap, l.projectId, s);
    parts.project = Math.round((r.pct * r.scored) / r.total);
  }
  if (l.id === 15) {
    const recent = s.mocks.slice(-3).flatMap((m) => m.scores.filter((x) => x > 0));
    parts.mocks = recent.length ? Math.round((recent.reduce((a, b) => a + b, 0) / recent.length / 5) * 100) : 0;
  }

  const entries = Object.entries(parts) as [Component, number][];
  const totalW = entries.reduce((n, [k]) => n + COMPONENT_WEIGHTS[k], 0);
  const score = totalW ? Math.round(entries.reduce((n, [k, v]) => n + v * COMPONENT_WEIGHTS[k], 0) / totalW) : 0;

  return { level: l, importance, parts, score, examPassed: Boolean(best?.passed), next: nextStep(l, parts, Boolean(best?.passed)) };
}

function nextStep(l: LevelPractice, p: Partial<Record<Component, number>>, examPassed: boolean): string | null {
  const L = `L${l.id}`;
  if (p.labs !== undefined && p.labs < 100) return `Finish the ${L} guided lab${l.labs.length > 1 ? "s" : ""}`;
  if (p.coding !== undefined && p.coding < 100) return `Pass the remaining ${L} coding tasks`;
  if (p.quiz !== undefined && p.quiz < 80) return `Get more ${L} quiz questions right (now ${p.quiz}%)`;
  if (p.scenarios !== undefined && p.scenarios < 100) return `Answer and self-score ${L} scenarios`;
  if (l.hasExam && !examPassed) return `Pass the ${L} level exam`;
  if (p.project !== undefined && p.project < 75) return `Build the ${L} capstone and score it on the rubric`;
  if (p.mocks !== undefined && p.mocks < 80) return "Run more mock interviews";
  return null;
}

export interface Readiness {
  overall: number;
  levels: LevelReadiness[];
  gaps: LevelReadiness[]; // most important unfinished levels first
  examsPassed: number;
  examsTotal: number;
}

export function readiness(levels: LevelPractice[], s: UserState, role: TargetRole): Readiness {
  const rows = levels.map((l) => levelReadiness(l, s, role));
  const totalImportance = rows.reduce((n, r) => n + r.importance, 0);
  const overall = totalImportance ? Math.round(rows.reduce((n, r) => n + r.score * r.importance, 0) / totalImportance) : 0;
  const gaps = rows
    .filter((r) => r.next)
    .sort((a, b) => b.importance * (100 - b.score) - a.importance * (100 - a.score) || a.level.id - b.level.id)
    .slice(0, 5);
  return { overall, levels: rows, gaps, examsPassed: rows.filter((r) => r.examPassed).length, examsTotal: levels.filter((l) => l.hasExam).length };
}

export function band(score: number): string {
  if (score < 20) return "Just starting";
  if (score < 45) return "Building foundations";
  if (score < 70) return "Practising steadily";
  if (score < 85) return "Strong practice record";
  return "Very strong practice record";
}
