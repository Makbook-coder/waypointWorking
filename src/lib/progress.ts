// Pure progress calculations over the roadmap and a user state.
import { addDays, type DayString } from "./dates";
import type { Level, Module, Phase, Roadmap } from "./types";
import type { UserState } from "./store";

export interface Progress {
  done: number;
  total: number;
  pct: number; // 0..100, rounded down so 100 means truly complete
}

export function ratio(done: number, total: number): Progress {
  return { done, total, pct: total === 0 ? 0 : Math.floor((done / total) * 100) };
}

const countDone = (topicIds: string[], s: UserState) => topicIds.filter((id) => s.topics[id]?.done).length;

export const moduleTopicIds = (m: Module) => m.topics.map((t) => t.id);
export const levelTopicIds = (l: Level) => l.modules.flatMap(moduleTopicIds);
export const phaseTopicIds = (p: Phase) => p.levels.flatMap(levelTopicIds);

export function moduleProgress(m: Module, s: UserState): Progress {
  const ids = moduleTopicIds(m);
  return ratio(countDone(ids, s), ids.length);
}

export function levelProgress(l: Level, s: UserState): Progress {
  const ids = levelTopicIds(l);
  return ratio(countDone(ids, s), ids.length);
}

export function phaseProgress(p: Phase, s: UserState): Progress {
  const ids = phaseTopicIds(p);
  return ratio(countDone(ids, s), ids.length);
}

export function overallProgress(r: Roadmap, s: UserState): Progress {
  const ids = r.phases.flatMap(phaseTopicIds);
  return ratio(countDone(ids, s), ids.length);
}

/** Prerequisites are hints only: a level is "ready" when each prerequisite is at least `threshold`% done. */
export function prerequisitesMet(level: Level, levelsById: Map<number, Level>, s: UserState, threshold = 80): boolean {
  return level.prerequisites.every((id) => {
    const pre = levelsById.get(id);
    return !pre || levelProgress(pre, s).pct >= threshold;
  });
}

/** Consecutive active days ending today (or yesterday, so the streak survives until you study today). */
export function currentStreak(activity: DayString[], today: DayString): number {
  const days = new Set(activity);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** First module (in roadmap order) that still has unfinished topics. */
export function nextModule(r: Roadmap, s: UserState): Module | null {
  for (const p of r.phases)
    for (const l of [...p.levels].sort((a, b) => a.id - b.id))
      for (const m of l.modules) if (moduleProgress(m, s).pct < 100) return m;
  return null;
}

export function dueReviews(s: UserState, today: DayString): string[] {
  return Object.entries(s.reviews)
    .filter(([, r]) => r.due <= today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([id]) => id);
}
