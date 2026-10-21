// Capstone guides (content/capstones.ts): milestones and a self-review rubric per level project.
// Milestone tasks are ticked in UserState.projectChecks under "<projectId>:m<n>#<task>";
// rubric scores live in UserState.rubrics under "<projectId>#<criterion>".
import { CAPSTONES, RUBRIC_SCALE, SHARED_RUBRIC, type CapstoneSrc, type RubricCriterion } from "../../content/capstones";
import type { UserState } from "./store";

export type { CapstoneSrc as Capstone, RubricCriterion };
export { RUBRIC_SCALE };

const byLevel = new Map(CAPSTONES.map((c) => [c.levelId, c]));
export const getCapstone = (levelId: number): CapstoneSrc | undefined => byLevel.get(levelId);
export const capstones = CAPSTONES;

export const rubricFor = (c: CapstoneSrc): RubricCriterion[] => [...SHARED_RUBRIC, ...c.rubric];
export const milestoneKey = (projectId: string, milestone: number) => `${projectId}:m${milestone}`;

/** Ticked milestone tasks, out of all tasks. */
export function milestoneProgress(c: CapstoneSrc, projectId: string, s: Pick<UserState, "projectChecks">) {
  let done = 0;
  let total = 0;
  c.milestones.forEach((m, i) =>
    m.tasks.forEach((_, j) => {
      total++;
      if (s.projectChecks[`${milestoneKey(projectId, i)}#${j}`]) done++;
    }),
  );
  return { done, total };
}

/** Self-review: how many criteria are scored and the average as a percentage of the top score. */
export function rubricResult(c: CapstoneSrc, projectId: string, s: Pick<UserState, "rubrics">) {
  const scores = rubricFor(c)
    .map((_, i) => s.rubrics[`${projectId}#${i}`])
    .filter((x): x is number => typeof x === "number");
  const total = rubricFor(c).length;
  const pct = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length * 4)) * 100) : 0;
  return { scored: scores.length, total, pct, complete: scores.length === total };
}

export function validateCapstones(levelsWithProjects: number[]): string[] {
  const errors: string[] = [];
  for (const id of levelsWithProjects) if (!byLevel.has(id)) errors.push(`L${id}: no capstone guide`);
  for (const c of CAPSTONES) {
    if (!levelsWithProjects.includes(c.levelId)) errors.push(`L${c.levelId}: guide for a level without a project`);
    if (c.milestones.length < 3) errors.push(`L${c.levelId}: needs 3+ milestones`);
    for (const m of c.milestones) if (m.tasks.length < 2 || !m.checkpoint) errors.push(`L${c.levelId} ${m.title}: needs 2+ tasks and a checkpoint`);
    if (c.rubric.length < 2) errors.push(`L${c.levelId}: needs 2+ project-specific rubric criteria`);
  }
  return errors;
}
