// The mistake tracker: quiz questions a learner missed, how sure they were, and whether retries have fixed them.
// Pure functions only; the store keeps the data and src/components/MistakeTracker.tsx shows it.

/** How sure the learner was before checking: 1 = guessing, 2 = think so, 3 = certain. */
export type Sureness = 1 | 2 | 3;
export const SURENESS_LABEL: Record<Sureness, string> = { 1: "Guessing", 2: "Think so", 3: "Certain" };

export type MissReason = "misread" | "gap" | "mixed" | "guess";
export const MISS_REASONS: { id: MissReason; label: string }[] = [
  { id: "misread", label: "Misread it" },
  { id: "gap", label: "Didn't know it" },
  { id: "mixed", label: "Mixed up two ideas" },
  { id: "guess", label: "Just guessed" },
];

/** Correct retries in a row that mark a missed question as fixed. */
export const FIX_STREAK = 2;
export const MAX_WHY_CHARS = 600;

export interface MistakeRecord {
  misses: number;
  firstAt: string;
  lastAt: string;
  /** the option index chosen on the latest miss */
  picked: number;
  /** how sure the learner was on the latest miss */
  sureness?: Sureness;
  reason?: MissReason;
  /** correct answers in a row since the latest miss */
  streak: number;
  /** set once the streak reaches FIX_STREAK; cleared if the question is missed again */
  fixedAt?: string;
  /** AI explanations of why each option is wrong, by option index (the correct option's slot is empty) */
  why?: string[];
}

/** Right/wrong counts per sureness level, across every answered question that carried a rating. */
export type Calibration = Record<Sureness, { right: number; wrong: number }>;

export const emptyCalibration = (): Calibration => ({ 1: { right: 0, wrong: 0 }, 2: { right: 0, wrong: 0 }, 3: { right: 0, wrong: 0 } });

export function addCalibration(c: Calibration, sureness: Sureness | undefined, correct: boolean): Calibration {
  if (!sureness) return c;
  const cell = c[sureness];
  return { ...c, [sureness]: { right: cell.right + (correct ? 1 : 0), wrong: cell.wrong + (correct ? 0 : 1) } };
}

/** Apply one answer. Returns the new record, or the old one unchanged when a correct answer needs no tracking. */
export function applyAnswer(
  prev: MistakeRecord | undefined,
  a: { correct: boolean; picked: number; sureness?: Sureness },
  at: string,
): MistakeRecord | undefined {
  if (!a.correct) {
    return {
      misses: (prev?.misses ?? 0) + 1,
      firstAt: prev?.firstAt ?? at,
      lastAt: at,
      picked: a.picked,
      ...(a.sureness ? { sureness: a.sureness } : {}),
      streak: 0,
      // keep the AI explanations: the options are the same, so they still apply
      ...(prev?.why ? { why: prev.why } : {}),
    };
  }
  if (!prev) return undefined;
  const streak = prev.streak + 1;
  const { fixedAt, ...rest } = prev;
  return { ...rest, streak, ...(fixedAt ? { fixedAt } : streak >= FIX_STREAK ? { fixedAt: at } : {}) };
}

export const isOpen = (m: MistakeRecord): boolean => !m.fixedAt;

/** A miss made with full confidence: the most valuable one to look at. */
export const isOverconfident = (m: MistakeRecord): boolean => m.sureness === 3;

/** Open mistakes first, overconfident ones before the rest, then most-missed, then newest. */
export function sortMistakes<T extends { id: string; record: MistakeRecord }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const open = Number(isOpen(b.record)) - Number(isOpen(a.record));
    if (open) return open;
    const sure = Number(isOverconfident(b.record)) - Number(isOverconfident(a.record));
    if (sure) return sure;
    if (b.record.misses !== a.record.misses) return b.record.misses - a.record.misses;
    return a.record.lastAt < b.record.lastAt ? 1 : a.record.lastAt > b.record.lastAt ? -1 : a.id.localeCompare(b.id);
  });
}

/** Share of answers that were right at each sureness level, or null with no data. */
export function calibrationRates(c: Calibration): Record<Sureness, number | null> {
  const rate = (x: { right: number; wrong: number }) => (x.right + x.wrong === 0 ? null : Math.round((x.right / (x.right + x.wrong)) * 100));
  return { 1: rate(c[1]), 2: rate(c[2]), 3: rate(c[3]) };
}

/** One plain sentence about how well sureness matched results, or null when there's too little data. */
export function calibrationNote(c: Calibration, minAnswers = 5): string | null {
  const sure = c[3];
  const guess = c[1];
  if (sure.right + sure.wrong >= minAnswers) {
    const r = sure.right / (sure.right + sure.wrong);
    if (r < 0.75) return `When you were certain you were right ${Math.round(r * 100)}% of the time. Those misses are the ones to study first.`;
  }
  if (guess.right + guess.wrong >= minAnswers) {
    const r = guess.right / (guess.right + guess.wrong);
    if (r >= 0.6) return `Your guesses were right ${Math.round(r * 100)}% of the time, so you know more than you think. Trust yourself a bit more.`;
  }
  if (sure.right + sure.wrong >= minAnswers) return "Your sureness matches your results well.";
  return null;
}
