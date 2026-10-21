/**
 * Builds data/practice.json from the authored sources in content/practice.
 *   npm run build:practice
 * Quiz options are shuffled deterministically (seeded by item id) so the correct
 * answer does not always sit in the same position.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import roadmapJson from "../data/roadmap.json";
import type { CodingItem, Difficulty, MiniProjectItem, Module, PracticeItem, PracticeMap, QuizItem, Roadmap } from "../src/lib/types";
import { moduleSlug } from "../src/lib/roadmap-build";
import type { D } from "../content/practice/types";
import { QUIZZES_L0_L3 } from "../content/practice/quizzes-l0-l3";
import { QUIZZES_L4_L6 } from "../content/practice/quizzes-l4-l6";
import { QUIZZES_L7_L9 } from "../content/practice/quizzes-l7-l9";
import { QUIZZES_L10_L13 } from "../content/practice/quizzes-l10-l13";
import { EXERCISES } from "../content/practice/exercises";
import { SCENARIOS } from "../content/practice/scenarios";
import { PROJECTS } from "../content/practice/projects";
import { CODING_TASKS } from "../content/coding/tasks";

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "data", "practice.json");
const QUIZ_LEVELS = 13; // quizzes for L0..L13
const QUIZZES_PER_MODULE = 5;

const DIFF: Record<D, Difficulty> = { e: "easy", m: "medium", h: "hard" };

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleOptions(id: string, correct: string, wrong: [string, string, string]) {
  const opts = [correct, ...wrong];
  const r = rng(hash(id));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { options: opts as [string, string, string, string], answer: opts.indexOf(correct) as 0 | 1 | 2 | 3 };
}

export function buildPractice(roadmap: Roadmap): PracticeMap {
  const modules = new Map<string, Module>();
  const levels = new Map(roadmap.phases.flatMap((p) => p.levels).map((l) => [l.id, l]));
  for (const l of levels.values()) for (const m of l.modules) modules.set(m.id, m);

  const out: PracticeMap = {};
  const push = (item: PracticeItem) => (out[item.moduleId] ??= []).push(item);
  const need = (id: string) => {
    const m = modules.get(id);
    if (!m) throw new Error(`Unknown module ${id}`);
    return m;
  };

  const counters = new Map<string, number>();
  const nextId = (moduleId: string, kind: string) => {
    const key = `${moduleId}:${kind}`;
    const n = (counters.get(key) ?? 0) + 1;
    counters.set(key, n);
    return `${moduleSlug(moduleId)}-${kind}${n}`;
  };

  for (const [moduleId, d, question, correct, wrong, explanation] of [
    ...QUIZZES_L0_L3,
    ...QUIZZES_L4_L6,
    ...QUIZZES_L7_L9,
    ...QUIZZES_L10_L13,
  ]) {
    const m = need(moduleId);
    const id = nextId(moduleId, "q");
    push({ id, type: "quiz", moduleId, levelId: m.levelId, difficulty: DIFF[d], question, ...shuffleOptions(id, correct, wrong), explanation } satisfies QuizItem);
  }

  const handWritten = new Set(EXERCISES.map((e) => e[0]));
  for (const [moduleId, title, task, acceptance] of EXERCISES) {
    const m = need(moduleId);
    push({ id: nextId(moduleId, "ex"), type: "exercise", moduleId, levelId: m.levelId, difficulty: "medium", title, task, acceptance });
  }
  // Mini projects for the remaining non-capstone modules in L0..L14, built from the module's own topics.
  // They keep the "-ex1" id of the templated exercise they replaced, so earlier progress still counts.
  for (const m of modules.values()) {
    if (handWritten.has(m.id) || m.isCapstone || m.levelId > 14) continue;
    push(miniProject(m, nextId(m.id, "ex")));
  }

  for (const t of CODING_TASKS) {
    const m = need(t.moduleId);
    push({
      id: `${moduleSlug(t.moduleId)}-code-${t.id}`,
      type: "coding",
      moduleId: m.id,
      levelId: m.levelId,
      difficulty: DIFF[t.difficulty],
      title: t.title,
      topicIds: t.topics.map((needle) => {
        const hit = m.topics.find((tp) => tp.title.toLowerCase().includes(needle.toLowerCase()));
        if (!hit) throw new Error(`Coding task ${t.id}: no topic in ${m.id} matches "${needle}"`);
        return hit.id;
      }),
      prompt: t.prompt,
      starter: t.starter,
      solution: t.solution,
      tests: t.tests.map(([name, code]) => ({ name, code })),
      checklist: t.checklist,
    } satisfies CodingItem);
  }

  for (const [moduleId, d, title, prompt, hints] of SCENARIOS) {
    const m = need(moduleId);
    push({ id: nextId(moduleId, "sc"), type: "scenario", moduleId, levelId: m.levelId, difficulty: DIFF[d], title, prompt, hints });
  }

  for (const [levelId, definitionOfDone] of PROJECTS) {
    const level = levels.get(levelId);
    if (!level?.project) throw new Error(`Level ${levelId} has no project`);
    const host = level.modules.find((m) => m.isCapstone) ?? level.modules[level.modules.length - 1];
    push({
      id: `l${levelId}-project`,
      type: "project",
      moduleId: host.id,
      levelId,
      difficulty: "hard",
      title: level.project.title,
      checklist: level.project.deliverables,
      definitionOfDone,
    });
  }
  return out;
}

export function miniProject(m: Module, id: string): MiniProjectItem {
  return {
    id,
    type: "mini",
    moduleId: m.id,
    levelId: m.levelId,
    difficulty: m.levelId <= 3 ? "easy" : "medium",
    title: `Mini project: ${m.title}`,
    brief:
      m.tryIt ??
      `Build one small, runnable script or notebook that puts "${m.title}" into practice. Cover each step below in code where you can, or in a short written comparison where code doesn't fit. Keep it under a few hundred lines: the point is to see each idea work once, not to polish.`,
    steps: [
      ...m.topics.map((t) => `${t.title}: ${t.description}`),
      "Write a NOTES.md with how to run it and one thing that failed or surprised you",
    ],
    doneWhen: m.outcome ?? `You can explain and demo every step above without notes.`,
  };
}

export function validatePractice(roadmap: Roadmap, practice: PracticeMap): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const items = Object.values(practice).flat();
  for (const it of items) {
    if (ids.has(it.id)) errors.push(`duplicate id ${it.id}`);
    ids.add(it.id);
    if (it.type === "coding" && (it.tests.length === 0 || it.topicIds.length === 0)) errors.push(`${it.id}: coding task needs tests and topics`);
    if (it.type === "mini" && it.steps.length < 2) errors.push(`${it.id}: mini project has too few steps`);
    if (it.type === "quiz") {
      if (new Set(it.options).size !== 4) errors.push(`${it.id}: options not 4 distinct`);
      if (!(it.answer >= 0 && it.answer <= 3)) errors.push(`${it.id}: bad answer index`);
      if (!it.explanation) errors.push(`${it.id}: missing explanation`);
    }
  }
  for (const p of roadmap.phases)
    for (const l of p.levels) {
      if (l.id <= QUIZ_LEVELS)
        for (const m of l.modules) {
          const n = (practice[m.id] ?? []).filter((i) => i.type === "quiz").length;
          if (n !== QUIZZES_PER_MODULE) errors.push(`${m.id}: ${n} quizzes (expected ${QUIZZES_PER_MODULE})`);
        }
      if (l.project && !items.some((i) => i.type === "project" && i.levelId === l.id)) errors.push(`L${l.id}: project missing`);
    }
  return errors;
}

export function countPractice(practice: PracticeMap) {
  const items = Object.values(practice).flat();
  const by = (t: string) => items.filter((i) => i.type === t).length;
  return { total: items.length, quiz: by("quiz"), exercise: by("exercise"), mini: by("mini"), coding: by("coding"), scenario: by("scenario"), project: by("project") };
}

async function main() {
  const roadmap = roadmapJson as unknown as Roadmap;
  const practice = buildPractice(roadmap);
  const errors = validatePractice(roadmap, practice);
  if (errors.length) {
    console.error("Validation failed:\n  " + errors.join("\n  "));
    process.exit(1);
  }
  await writeFile(OUT, JSON.stringify(practice, null, 2) + "\n");
  const c = countPractice(practice);
  console.log(`OK  total=${c.total} quiz=${c.quiz} exercise=${c.exercise} mini=${c.mini} coding=${c.coding} scenario=${c.scenario} project=${c.project}`);
  const answers = [0, 0, 0, 0];
  for (const it of Object.values(practice).flat()) if (it.type === "quiz") answers[it.answer]++;
  console.log(`Answer positions A/B/C/D: ${answers.join("/")}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
