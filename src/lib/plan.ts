// Weekly plan: spreads the remaining work across weeks at the learner's chosen pace.
import { addDays, parseDay, toDay, type DayString } from "./dates";
import type { Level, Module } from "./types";
import type { UserState } from "./store";
import { moduleProgress } from "./progress";

/** Assumed study time per roadmap session (lecture + practice). */
export const HOURS_PER_SESSION = 1.5;
/** Modules listed with 0 sessions (e.g. a wrap-up) still take some time. */
export const MIN_MODULE_HOURS = 1;
const MAX_WEEKS = 520;

export interface PlanItem {
  module: Module;
  hours: number; // hours of this module scheduled in this week
}

export interface PlanWeek {
  index: number; // 0 = this week
  start: DayString; // Monday
  end: DayString; // Sunday
  hours: number;
  items: PlanItem[];
}

export interface Plan {
  weeks: PlanWeek[];
  remainingHours: number;
  finish: DayString | null; // Sunday of the last week, null when nothing is left
}

export function moduleHours(m: Module): number {
  return Math.max(MIN_MODULE_HOURS, m.sessionCount * HOURS_PER_SESSION);
}

/** Monday of the week containing `day`. */
export function weekStart(day: DayString): DayString {
  const dow = (parseDay(day).getDay() + 6) % 7; // Mon=0 … Sun=6
  return addDays(day, -dow);
}

const round = (h: number) => Math.round(h * 10) / 10;

export function buildPlan(levels: Level[], s: UserState, weeklyHours: number, today: DayString = toDay(new Date())): Plan {
  const queue = [...levels]
    .sort((a, b) => a.id - b.id)
    .flatMap((l) => l.modules)
    .map((module) => ({ module, left: moduleHours(module) * (1 - moduleProgress(module, s).done / Math.max(1, module.topics.length)) }))
    .filter((q) => q.left > 0.05);

  const remainingHours = round(queue.reduce((n, q) => n + q.left, 0));
  const pace = Math.max(1, weeklyHours);
  const weeks: PlanWeek[] = [];
  let start = weekStart(today);
  let i = 0;

  while (i < queue.length && weeks.length < MAX_WEEKS) {
    let room = pace;
    const items: PlanItem[] = [];
    while (room > 0.05 && i < queue.length) {
      const take = Math.min(room, queue[i].left);
      items.push({ module: queue[i].module, hours: round(take) });
      queue[i].left -= take;
      room -= take;
      if (queue[i].left <= 0.05) i++;
    }
    weeks.push({ index: weeks.length, start, end: addDays(start, 6), hours: round(pace - room), items });
    start = addDays(start, 7);
  }

  return { weeks, remainingHours, finish: weeks.length ? weeks[weeks.length - 1].end : null };
}
