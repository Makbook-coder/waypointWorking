// Client-safe pieces of the project ladders: labels and progress maths. Kept apart from lib/projects.ts
// so client components do not pull the whole project content and the roadmap into the browser bundle.
import type { ProjectKind, ProjectSize, ProjectSrc } from "../../content/projects/types";
export type { ProjectSrc, ProjectSize, ProjectKind };
import type { UserState } from "./store";

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
/** Total checkable items: build steps plus "done" checks. */
export const projectTotal = (p: ProjectSrc) => p.steps.length + p.done.length;

export function projectProgress(p: ProjectSrc, s: Pick<UserState, "projectChecks">): { done: number; total: number; started: boolean; finished: boolean } {
  const total = projectTotal(p);
  let done = 0;
  for (let i = 0; i < total; i++) if (s.projectChecks[`${p.id}#${i}`]) done++;
  return { done, total, started: done > 0, finished: done === total };
}

