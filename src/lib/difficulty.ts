// Difficulty tags for modules, topics and projects. Client-safe: no roadmap or project content is imported,
// so badges and filters stay out of the way of the browser bundle.
import { LEVEL_CAPSTONE_DIFFICULTY, MODULE_DIFFICULTY } from "../../content/difficulty";
import type { ProjectKind, ProjectSize } from "../../content/projects/types";

export type Difficulty3 = 1 | 2 | 3;
export const DIFFICULTY_LABEL: Record<Difficulty3, string> = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
export const DIFFICULTIES: Difficulty3[] = [1, 2, 3];

const clamp = (n: number): Difficulty3 => Math.min(3, Math.max(1, n)) as Difficulty3;

export const moduleDifficulty = (moduleId: string): Difficulty3 | undefined => MODULE_DIFFICULTY[moduleId];

/** Topic ids start with their module, e.g. "m4-6-hybrid-retrieval" belongs to M4.6. */
export function moduleIdOfTopic(topicId: string): string | null {
  const m = /^m(\d+)-(\d+)-/i.exec(topicId);
  return m ? `M${Number(m[1])}.${Number(m[2])}` : null;
}

/** A topic is as hard as its module. */
export function topicDifficulty(topicId: string): Difficulty3 | undefined {
  const id = moduleIdOfTopic(topicId);
  return id ? MODULE_DIFFICULTY[id] : undefined;
}

// Practice kinds that ask you to design or measure on your own sit a step above the module; the rest sit at it.
const KIND_STEP: Record<ProjectKind, number> = { build: 0, extend: 0, debug: 0, review: 0, reimplement: 1, optimise: 1, challenge: 1 };
const SIZE_STEP: Record<Exclude<ProjectSize, "practice">, number> = { small: -1, medium: 0, bigger: 1, capstone: 1 };

/** Projects start from their module's rating, then shift by size (small is gentler, bigger is harder) or kind. */
export function projectDifficulty(p: { scope: "topic" | "module" | "level"; refId: string; size: ProjectSize; kind?: ProjectKind }): Difficulty3 | undefined {
  const base =
    p.scope === "topic" ? topicDifficulty(p.refId) : p.scope === "module" ? MODULE_DIFFICULTY[p.refId] : LEVEL_CAPSTONE_DIFFICULTY[Number(p.refId.slice(1))];
  if (!base) return undefined;
  if (p.scope === "level") return base;
  const step = p.size === "practice" ? KIND_STEP[p.kind ?? "build"] : SIZE_STEP[p.size];
  return clamp(base + step);
}
