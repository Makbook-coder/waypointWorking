// Project ladders: 2 or 3 builds per topic (small to bigger), a capstone per module and one per level.
// Each is a start-to-finish guide. Progress reuses UserState.projectChecks under "<projectId>#<n>",
// where n counts the build steps first and then the "done" checks, so no schema change is needed.
import { PROJECTS, PRACTICE_LEVELS } from "../../content/projects";
import type { ProjectKind, ProjectSize, ProjectSrc } from "../../content/projects/types";
import { levels } from "./data";
import type { UserState } from "./store";

export type { ProjectSrc, ProjectSize, ProjectKind } from "../../content/projects/types";
export { PROJECTS, PROJECT_LEVELS, PRACTICE_LEVELS } from "../../content/projects";

export const SIZE_LABEL: Record<ProjectSize, string> = { small: "Small", medium: "Medium", bigger: "Bigger", capstone: "Capstone", practice: "Practice" };

export const KIND_LABEL: Record<ProjectKind, string> = { build: "Build", extend: "Extend", debug: "Debug", reimplement: "Reimplement", optimise: "Optimise", review: "Review", challenge: "Challenge" };
/** What each kind asks of the learner, shown above its steps. */
export const KIND_BLURB: Record<ProjectKind, string> = {
  build: "Build it from nothing, step by step.",
  extend: "Start from the code above and add to it without breaking what works.",
  debug: "The code above is broken. Find out why and fix it.",
  reimplement: "Rebuild a small version of a real tool to see how it works inside.",
  optimise: "The code above works but is slow or wasteful. Measure it, then make it better.",
  review: "Review the code above like a teammate would, then harden it.",
  challenge: "No steps. Meet the rules and pass every check on your own.",
};
const NEEDS_STARTER: ProjectKind[] = ["extend", "debug", "optimise", "review"];

const byRef = new Map<string, ProjectSrc[]>();
for (const p of PROJECTS) byRef.set(`${p.scope}:${p.refId}`, [...(byRef.get(`${p.scope}:${p.refId}`) ?? []), p]);

export const projectsForTopic = (topicId: string): ProjectSrc[] => byRef.get(`topic:${topicId}`) ?? [];
export const isPractice = (p: ProjectSrc) => p.size === "practice";
export const capstoneForModule = (moduleId: string): ProjectSrc | undefined => byRef.get(`module:${moduleId}`)?.[0];
export const capstoneForLevel = (levelId: number): ProjectSrc | undefined => byRef.get(`level:L${levelId}`)?.[0];

/** The module page that shows a level's capstone: its capstone module, or the last module when it has none. */
export function levelCapstoneHome(levelId: number): string | undefined {
  const mods = levels.find((l) => l.id === levelId)?.modules ?? [];
  return (mods.find((m) => m.isCapstone) ?? mods.at(-1))?.id;
}

/** Everything a module page shows: its topics' ladders, its capstone, and (for a level's capstone module) the level capstone. */
export function projectsForModule(mod: { id: string; levelId: number; isCapstone: boolean; topics: { id: string }[] }): ProjectSrc[] {
  const out: ProjectSrc[] = [];
  for (const t of mod.topics) out.push(...projectsForTopic(t.id));
  const cap = capstoneForModule(mod.id);
  if (cap) out.push(cap);
  if (levelCapstoneHome(mod.levelId) === mod.id) {
    const lvl = capstoneForLevel(mod.levelId);
    if (lvl) out.push(lvl);
  }
  return out;
}

/** Total checkable items: build steps plus "done" checks. */
export const projectTotal = (p: ProjectSrc) => p.steps.length + p.done.length;

export function projectProgress(p: ProjectSrc, s: Pick<UserState, "projectChecks">): { done: number; total: number; started: boolean; finished: boolean } {
  const total = projectTotal(p);
  let done = 0;
  for (let i = 0; i < total; i++) if (s.projectChecks[`${p.id}#${i}`]) done++;
  return { done, total, started: done > 0, finished: done === total };
}

const MIN = { goal: 30, step: 25, stuck: 18, expected: 30, done: 2, next: 20, topicSteps: 4, practiceSteps: 3, starter: 40, capstoneSteps: 7, capstoneDone: 3 } as const;
const PLACEHOLDER = /\b(todo|tbd|lorem|fixme|xxx)\b/i;

function textErrors(p: ProjectSrc): string[] {
  const e: string[] = [];
  const id = p.id;
  if (p.title.trim().length < 6) e.push(`${id}: title too short`);
  if (p.goal.trim().length < MIN.goal) e.push(`${id}: goal too thin`);
  if (p.expected.trim().length < MIN.expected) e.push(`${id}: expected output too thin`);
  if (p.next.trim().length < MIN.next) e.push(`${id}: "what comes next" too thin`);
  if (!Number.isInteger(p.minutes) || p.minutes < 10) e.push(`${id}: minutes must be a whole number of at least 10`);
  const practice = p.size === "practice";
  const kind = p.kind ?? "build";
  if (practice && kind === "build") e.push(`${id}: a practice project must not be a plain build`);
  if (!practice && kind !== "build") e.push(`${id}: only practice projects can have a kind other than build`);
  if (practice && p.scope !== "topic") e.push(`${id}: practice projects belong to a topic`);
  if (kind === "challenge") {
    if (p.steps.length) e.push(`${id}: a challenge has no steps, only rules and checks`);
    if ((p.hints?.length ?? 0) < 2) e.push(`${id}: a challenge needs at least 2 hints`);
    if (p.hints?.some((h) => h.trim().length < MIN.stuck)) e.push(`${id}: a hint is too thin`);
    if (p.done.length < 4) e.push(`${id}: a challenge needs at least 4 pass checks`);
  } else {
    const minSteps = practice ? MIN.practiceSteps : p.scope === "topic" ? MIN.topicSteps : MIN.capstoneSteps;
    if (p.steps.length < minSteps) e.push(`${id}: needs at least ${minSteps} steps`);
  }
  if (NEEDS_STARTER.includes(kind) && (p.starter?.trim().length ?? 0) < MIN.starter) e.push(`${id}: a ${kind} project needs starter code or text`);
  p.steps.forEach((s, i) => {
    if (s.do.trim().length < MIN.step) e.push(`${id}: step ${i + 1} is too thin`);
    if (s.stuck.trim().length < MIN.stuck) e.push(`${id}: step ${i + 1} has no "if you are stuck" help`);
  });
  const minDone = p.scope === "topic" ? MIN.done : MIN.capstoneDone;
  if (p.done.length < minDone) e.push(`${id}: needs at least ${minDone} done checks`);
  if (p.done.some((d) => d.trim().length < 12)) e.push(`${id}: a done check is too thin`);
  const prose = [p.title, p.goal, p.expected, p.next, ...p.needs, ...p.done, ...(p.hints ?? []), ...p.steps.flatMap((s) => [s.do, s.stuck])];
  if (prose.some((s) => PLACEHOLDER.test(s))) e.push(`${id}: contains placeholder text`);
  if (prose.some((s) => (s.match(/`/g)?.length ?? 0) % 2 !== 0)) e.push(`${id}: unbalanced backticks`);
  return e;
}

/**
 * Problems with the project set. Every non-capstone topic of the given modules needs 2 or 3 projects that
 * get longer, every non-capstone module needs a capstone covering all its topics, and every level a capstone.
 * Empty means valid.
 */
export function validateProjects(
  levels: { id: number; modules: { id: string; isCapstone: boolean; topics: { id: string }[] }[] }[],
  entries: ProjectSrc[] = PROJECTS,
  practiceLevels: number[] = PRACTICE_LEVELS,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const p of entries) {
    if (ids.has(p.id)) errors.push(`${p.id}: duplicate id`);
    ids.add(p.id);
    errors.push(...textErrors(p));
  }
  const topicIds = new Set<string>();
  const moduleIds = new Set<string>();
  const levelIds = new Set<string>();
  for (const l of levels) {
    levelIds.add(`L${l.id}`);
    for (const m of l.modules) {
      if (m.isCapstone) continue;
      moduleIds.add(m.id);
      for (const t of m.topics) topicIds.add(t.id);
    }
  }
  const scope = (s: ProjectSrc["scope"], ref: string) => entries.filter((p) => p.scope === s && p.refId === ref);
  for (const l of levels) {
    for (const m of l.modules) {
      if (m.isCapstone) {
        for (const t of m.topics) if (scope("topic", t.id).length) errors.push(`${t.id}: capstone-module topics get no per-topic projects`);
        continue;
      }
      for (const t of m.topics) {
        const ps = scope("topic", t.id).filter((p) => !isPractice(p));
        if (ps.length < 2 || ps.length > 3) errors.push(`${t.id}: needs 2 or 3 projects, has ${ps.length}`);
        for (let i = 1; i < ps.length; i++) if (ps[i].minutes <= ps[i - 1].minutes) errors.push(`${t.id}: projects must go small to bigger`);
        const want: ProjectSize[] = ps.length === 2 ? ["small", "medium"] : ["small", "medium", "bigger"];
        if (ps.length >= 2 && ps.length <= 3 && ps.some((p, i) => p.size !== want[i])) errors.push(`${t.id}: sizes must be ${want.join(", ")}`);
      }
      if (practiceLevels.includes(l.id)) {
        let prev: string | undefined;
        const kinds = new Set<string>();
        for (const t of m.topics) {
          const pr = scope("topic", t.id).filter(isPractice);
          if (pr.length !== 1) { errors.push(`${t.id}: needs exactly one practice project, has ${pr.length}`); continue; }
          const k = pr[0].kind ?? "build";
          if (k === prev) errors.push(`${t.id}: practice kind "${k}" repeats the previous topic's, so vary it`);
          prev = k;
          kinds.add(k);
        }
        if (m.topics.length >= 4 && kinds.size < 3) errors.push(`${m.id}: practice projects use only ${kinds.size} kinds, so use at least 3`);
      }
      const caps = scope("module", m.id);
      if (caps.length !== 1) errors.push(`${m.id}: needs exactly one module capstone, has ${caps.length}`);
      else {
        const covers = new Set(caps[0].covers ?? []);
        for (const t of m.topics) if (!covers.has(t.id)) errors.push(`${m.id}: capstone does not cover ${t.id}`);
        for (const c of covers) if (!m.topics.some((t) => t.id === c)) errors.push(`${m.id}: capstone covers unknown topic ${c}`);
        if (caps[0].size !== "capstone") errors.push(`${m.id}: capstone must have size capstone`);
      }
    }
    if (scope("level", `L${l.id}`).length !== 1) errors.push(`L${l.id}: needs exactly one level capstone`);
  }
  for (const p of entries) {
    if (p.scope === "topic" && !topicIds.has(p.refId)) errors.push(`${p.id}: unknown or non-covered topic`);
    if (p.scope === "module" && !moduleIds.has(p.refId)) errors.push(`${p.id}: unknown or capstone module`);
    if (p.scope === "level" && !levelIds.has(p.refId)) errors.push(`${p.id}: unknown level`);
  }
  return errors;
}
