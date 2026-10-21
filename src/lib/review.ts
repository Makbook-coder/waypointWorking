// Spaced review: a topic marked done is reviewed after 1, 3, 7 and 21 days.
// A failed review (or a wrong quiz answer in its module) pulls it back sooner.
import { addDays, type DayString } from "./dates";

export const REVIEW_INTERVALS = [1, 3, 7, 21] as const;

export interface ReviewEntry {
  /** index into REVIEW_INTERVALS of the review that is due next */
  step: number;
  due: DayString;
}

/** Schedule the first review when a topic is marked done. */
export function scheduleFirst(today: DayString): ReviewEntry {
  return { step: 0, due: addDays(today, REVIEW_INTERVALS[0]) };
}

/**
 * Apply the result of a review. Returns null once the final (21-day) review is passed:
 * the topic has graduated and no longer needs reviewing.
 */
export function applyReview(entry: ReviewEntry, remembered: boolean, today: DayString): ReviewEntry | null {
  if (!remembered) return { step: 0, due: addDays(today, REVIEW_INTERVALS[0]) };
  const next = entry.step + 1;
  if (next >= REVIEW_INTERVALS.length) return null;
  return { step: next, due: addDays(today, REVIEW_INTERVALS[next]) };
}

/**
 * A wrong quiz answer is a signal the module has slipped: step back one interval
 * and make the review due no later than tomorrow. Graduated topics are re-entered.
 */
export function applyLapse(entry: ReviewEntry | null | undefined, today: DayString): ReviewEntry {
  const tomorrow = addDays(today, 1);
  if (!entry) return { step: 0, due: tomorrow };
  return { step: Math.max(0, entry.step - 1), due: entry.due < tomorrow ? entry.due : tomorrow };
}

export function isDue(entry: ReviewEntry, today: DayString): boolean {
  return entry.due <= today;
}
