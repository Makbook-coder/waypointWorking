// Developer and Interview material for each topic: a code snippet, gotchas, a trade-off, likely
// follow-up questions, an edge case and what weak answers miss. Authored in content/topic-levels/.
import { TOPIC_LEVEL_SOURCES } from "../../content/topic-levels";

export interface TopicLevels {
  code: string;
  gotchas: [string, string];
  tradeoff: string;
  followUps: [string, string][];
  edgeCase: string;
  weakAnswer: string;
}

const levels: Record<string, TopicLevels> = Object.fromEntries(
  TOPIC_LEVEL_SOURCES.map(([id, code, gotchas, tradeoff, followUps, edgeCase, weakAnswer]) => [
    id,
    { code, gotchas, tradeoff, followUps, edgeCase, weakAnswer },
  ]),
);

export const getTopicLevels = (topicId: string): TopicLevels | undefined => levels[topicId];

const STOP = new Set(
  "a an the and or of to in on for with is are it its this that by as at be you your i we from into so can than then when which what how not do does use uses using one each".split(" "),
);
const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((w) => w.length > 2 && !STOP.has(w)));

/** Share of meaningful words two texts have in common (0 = none, 1 = the same words). */
export function wordOverlap(a: string, b: string): number {
  const x = words(a);
  const y = words(b);
  const shared = [...x].filter((w) => y.has(w)).length;
  const total = x.size + y.size - shared;
  return total === 0 ? 0 : shared / total;
}

/** Above this, two levels' wording reads as the same text reworded. */
export const MAX_OVERLAP = 0.5;

/** Problems with the level material, given every topic id grouped by level. Empty means valid. */
export function validateTopicLevels(topicIdsByLevel: Record<number, string[]>): string[] {
  const errors: string[] = [];
  const known = new Set(Object.values(topicIdsByLevel).flat());
  const seen = new Set<string>();
  const ticks = (s: string) => (s.match(/`/g)?.length ?? 0) % 2 === 0;
  for (const [id, code, gotchas, tradeoff, followUps, edgeCase, weakAnswer] of TOPIC_LEVEL_SOURCES) {
    if (seen.has(id)) errors.push(`${id}: duplicate`);
    seen.add(id);
    if (!known.has(id)) errors.push(`${id}: no such topic`);
    const prose = [...gotchas, tradeoff, ...followUps.flat(), edgeCase, weakAnswer];
    if ([...gotchas, tradeoff, ...followUps.map(([, a]) => a), edgeCase, weakAnswer].some((s) => s.trim().length < 20)) errors.push(`${id}: a section is too short`);
    if (followUps.length !== 2 || followUps.some(([q]) => q.trim().length < 8 || !q.trim().endsWith("?"))) errors.push(`${id}: needs two follow-up questions ending in "?"`);
    if (code.split("\n").length > 10) errors.push(`${id}: code should be 10 lines or fewer`);
    if (code.includes("`")) errors.push(`${id}: code is shown as-is, so it should not use backticks`);
    if (!prose.every(ticks)) errors.push(`${id}: unbalanced backticks`);
    if (wordOverlap(gotchas[0], gotchas[1]) > MAX_OVERLAP) errors.push(`${id}: the two gotchas say the same thing`);
  }
  // A level ships complete or not at all.
  for (const [level, ids] of Object.entries(topicIdsByLevel)) {
    const missing = ids.filter((id) => !seen.has(id));
    if (missing.length > 0 && missing.length < ids.length) errors.push(`L${level}: missing ${missing.join(", ")}`);
  }
  return errors;
}
