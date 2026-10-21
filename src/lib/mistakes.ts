// Top beginner mistakes per level, with how to spot and fix each. Authored in content/mistakes.ts.
import { MISTAKE_SOURCES } from "../../content/mistakes";

export interface LevelMistake {
  moduleId: string;
  mistake: string;
  spot: string;
  fix: string;
}

export const MISTAKES_PER_LEVEL = 5;

const levelOf = (moduleId: string) => Number(/^M(\d+)\./.exec(moduleId)?.[1] ?? -1);

export const levelMistakes: LevelMistake[] = MISTAKE_SOURCES.map(([moduleId, mistake, spot, fix]) => ({ moduleId, mistake, spot, fix }));

export const mistakesForLevel = (levelId: number): LevelMistake[] => levelMistakes.filter((m) => levelOf(m.moduleId) === levelId);

/** Problems with the mistake set, given every module id. Empty means valid. */
export function validateMistakes(moduleIds: string[]): string[] {
  const errors: string[] = [];
  const known = new Set(moduleIds);
  const seen = new Set<string>();
  const perLevel = new Map<number, number>();
  for (const m of levelMistakes) {
    if (!known.has(m.moduleId)) errors.push(`${m.moduleId}: no such module`);
    if (seen.has(m.mistake)) errors.push(`duplicate mistake: ${m.mistake}`);
    seen.add(m.mistake);
    if ([m.mistake, m.spot, m.fix].some((s) => s.trim().length < 15)) errors.push(`${m.moduleId}: "${m.mistake}" has a section that is too short`);
    if ([m.mistake, m.spot, m.fix].some((s) => (s.match(/`/g)?.length ?? 0) % 2 !== 0)) errors.push(`${m.moduleId}: unbalanced backticks`);
    perLevel.set(levelOf(m.moduleId), (perLevel.get(levelOf(m.moduleId)) ?? 0) + 1);
  }
  const levels = new Set([...known].map(levelOf));
  for (const l of levels) if (perLevel.get(l) !== MISTAKES_PER_LEVEL) errors.push(`L${l}: has ${perLevel.get(l) ?? 0} mistakes, needs ${MISTAKES_PER_LEVEL}`);
  return errors;
}
