// Calendar-day helpers. Days are local "YYYY-MM-DD" strings so reviews and streaks
// follow the learner's own midnight, not UTC.

export type DayString = string;

export function toDay(d: Date): DayString {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDay(day: DayString): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: DayString, n: number): DayString {
  const d = parseDay(day);
  d.setDate(d.getDate() + n);
  return toDay(d);
}

export function isDay(value: unknown): value is DayString {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDay(value).getTime());
}

export function daysBetween(a: DayString, b: DayString): number {
  return Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86_400_000);
}
