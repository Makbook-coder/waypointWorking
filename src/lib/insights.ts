// Progress insights: time spent, accuracy, weak spots and what to do next.
import { addDays, toDay, type DayString } from "./dates";
import type { Level, Module } from "./types";
import type { UserState } from "./store";
import { weekStart } from "./plan";

export function minutesBetween(s: UserState, from: DayString, to: DayString): number {
  return Object.entries(s.studyMinutes).reduce((n, [d, m]) => (d >= from && d <= to ? n + m : n), 0);
}

export function dailyMinutes(s: UserState, today: DayString, days = 14): { day: DayString; minutes: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    return { day, minutes: s.studyMinutes[day] ?? 0 };
  });
}

export function timeSummary(s: UserState, today: DayString) {
  return {
    today: s.studyMinutes[today] ?? 0,
    thisWeek: minutesBetween(s, weekStart(today), today),
    total: Object.values(s.studyMinutes).reduce((a, b) => a + b, 0),
  };
}

/** Finished Pomodoro blocks today, this week and in total (by local day of the block's end). */
export function focusSummary(s: UserState, today: DayString) {
  const from = weekStart(today);
  const out = { today: { blocks: 0, minutes: 0 }, thisWeek: { blocks: 0, minutes: 0 }, total: { blocks: 0, minutes: 0 } };
  for (const f of s.focus) {
    const day = toDay(new Date(f.at));
    const add = (b: { blocks: number; minutes: number }) => {
      b.blocks += 1;
      b.minutes += f.minutes;
    };
    add(out.total);
    if (day >= from && day <= today) add(out.thisWeek);
    if (day === today) add(out.today);
  }
  return out;
}

export interface ModuleAccuracy {
  module: Module;
  attempted: number; // distinct questions answered
  correct: number; // questions whose latest answer is right
  pct: number;
}

/** Accuracy per module, using each question's most recent answer. */
export function quizAccuracy(levels: Level[], s: UserState): ModuleAccuracy[] {
  const byModule = new Map<string, { attempted: number; correct: number }>();
  for (const [id, rec] of Object.entries(s.quiz)) {
    const m = /^(m\d+-\d+)-q\d+$/.exec(id);
    if (!m) continue;
    const e = byModule.get(m[1]) ?? { attempted: 0, correct: 0 };
    e.attempted++;
    if (rec.lastCorrect) e.correct++;
    byModule.set(m[1], e);
  }
  const out: ModuleAccuracy[] = [];
  for (const l of levels)
    for (const mod of l.modules) {
      const e = byModule.get(mod.id.toLowerCase().replace(".", "-"));
      if (e) out.push({ module: mod, ...e, pct: Math.round((e.correct / e.attempted) * 100) });
    }
  return out;
}

/** Modules where at least two questions were tried and fewer than 60% are currently right. */
export function weakModules(levels: Level[], s: UserState, threshold = 60): ModuleAccuracy[] {
  return quizAccuracy(levels, s)
    .filter((a) => a.attempted >= 2 && a.pct < threshold)
    .sort((a, b) => a.pct - b.pct || b.attempted - a.attempted);
}

export function overallAccuracy(s: UserState): { attempted: number; correct: number; pct: number } {
  const recs = Object.values(s.quiz);
  const correct = recs.filter((r) => r.lastCorrect).length;
  return { attempted: recs.length, correct, pct: recs.length ? Math.round((correct / recs.length) * 100) : 0 };
}

export function shakyTopicIds(s: UserState): string[] {
  return Object.entries(s.topics)
    .filter(([, t]) => t.confidence === 1)
    .map(([id]) => id);
}
