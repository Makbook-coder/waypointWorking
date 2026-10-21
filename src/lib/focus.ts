// "Recommended focus": ranks unfinished levels by how much they matter for a target role.
import type { Level } from "./types";
import type { TargetRole, UserState } from "./store";
import { levelProgress, prerequisitesMet } from "./progress";

/** How much each weight counts per role. */
export const ROLE_WEIGHTS: Record<TargetRole, { interview: number; job: number }> = {
  none: { interview: 0.5, job: 0.5 },
  // Builders: day-to-day job weight matters most.
  "ai-engineer": { interview: 0.35, job: 0.65 },
  // GenAI data scientists are screened harder on concepts, evals and modelling.
  "genai-ds": { interview: 0.7, job: 0.3 },
};

/** Small role-specific nudges for levels whose relevance the two weights don't capture. */
export const ROLE_BOOST: Record<TargetRole, Partial<Record<number, number>>> = {
  none: {},
  "ai-engineer": { 0: 1.1, 10: 1.15, 11: 1.1 },
  "genai-ds": { 1: 1.15, 3: 1.1, 7: 1.2, 12: 1.1, 13: 1.25, 0: 0.8, 11: 0.8 },
};

export interface FocusItem {
  level: Level;
  score: number;
  remainingPct: number;
  ready: boolean;
}

export function recommendedFocus(levels: Level[], s: UserState, role: TargetRole, limit = 5): FocusItem[] {
  const byId = new Map(levels.map((l) => [l.id, l]));
  const w = ROLE_WEIGHTS[role];
  return levels
    .map((level) => {
      const remainingPct = 100 - levelProgress(level, s).pct;
      const ready = prerequisitesMet(level, byId, s);
      const importance = (level.interviewWeight * w.interview + level.jobWeight * w.job) * (ROLE_BOOST[role][level.id] ?? 1);
      // Unfinished, important, and ready levels first. Not-ready levels are still listed, just lower.
      const score = importance * (remainingPct / 100) * (ready ? 1 : 0.6);
      return { level, score, remainingPct, ready };
    })
    .filter((f) => f.remainingPct > 0)
    .sort((a, b) => b.score - a.score || a.level.id - b.level.id)
    .slice(0, limit);
}
