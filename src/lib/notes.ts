// Built-in "Understand it" study notes, one per non-capstone module.
import { NOTE_SOURCES } from "../../content/notes";

export interface ModuleNote {
  moduleId: string;
  what: string;
  why: string;
  example: string;
  mistakes: string[];
}

export const notes: Record<string, ModuleNote> = Object.fromEntries(
  NOTE_SOURCES.map(([moduleId, what, why, example, mistakes]) => [
    moduleId,
    { moduleId, what, why, example, mistakes },
  ]),
);

export const getNote = (moduleId: string): ModuleNote | undefined =>
  notes[moduleId];

/** Problems with the note set, given the module ids that should have one. Empty means valid. */
export function validateNotes(moduleIds: string[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const expected = new Set(moduleIds);
  for (const [id, what, why, example, mistakes] of NOTE_SOURCES) {
    if (seen.has(id)) errors.push(`${id}: duplicate note`);
    seen.add(id);
    if (!expected.has(id)) errors.push(`${id}: no such non-capstone module`);
    if (![what, why, example].every((s) => s.trim().length >= 20))
      errors.push(`${id}: a section is too short`);
    if (mistakes.length < 2 || mistakes.some((m) => !m.trim()))
      errors.push(`${id}: needs at least two mistakes`);
    if (
      [what, why, example, ...mistakes].some(
        (s) => (s.match(/`/g)?.length ?? 0) % 2 !== 0,
      )
    )
      errors.push(`${id}: unbalanced backticks`);
  }
  for (const id of expected)
    if (!seen.has(id)) errors.push(`${id}: missing note`);
  return errors;
}
