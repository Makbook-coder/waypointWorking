// Deeper topic explanations: why it matters, how it works, where it's used, the analogy's limits,
// before/after, plus developer and interview wording. Authored in content/topic-depth/, one file per level.
import { TOPIC_DEPTH_SOURCES } from "../../content/topic-depth";

export interface TopicDepth {
  why: string;
  steps: string[];
  usedIn: string;
  breaks: string;
  before: string;
  after: string;
  developer: string;
  interview: string;
  takeaway: string;
}

const depth: Record<string, TopicDepth> = Object.fromEntries(
  TOPIC_DEPTH_SOURCES.map(([id, why, steps, usedIn, breaks, before, after, developer, interview, takeaway]) => [
    id,
    { why, steps, usedIn, breaks, before, after, developer, interview, takeaway },
  ]),
);

export const getTopicDepth = (topicId: string): TopicDepth | undefined => depth[topicId];

/** Problems with the depth notes, given every topic id grouped by level and the ids that have an analogy. */
export function validateTopicDepth(topicIdsByLevel: Record<number, string[]>, withAnalogy: Set<string>): string[] {
  const errors: string[] = [];
  const known = new Set(Object.values(topicIdsByLevel).flat());
  const seen = new Set<string>();
  const ticks = (s: string) => (s.match(/`/g)?.length ?? 0) % 2 === 0;
  for (const [id, why, steps, usedIn, breaks, before, after, developer, interview, takeaway] of TOPIC_DEPTH_SOURCES) {
    if (seen.has(id)) errors.push(`${id}: duplicate`);
    seen.add(id);
    if (!known.has(id)) errors.push(`${id}: no such topic`);
    if ([why, usedIn, before, after, developer, interview].some((s) => s.trim().length < 12)) errors.push(`${id}: a section is too short`);
    if (takeaway.trim().length < 8 || takeaway.length > 90) errors.push(`${id}: takeaway should be one short line`);
    if (steps.length < 2 || steps.length > 4 || steps.some((s) => s.trim().length < 4)) errors.push(`${id}: needs 2 to 4 steps`);
    if (withAnalogy.has(id) !== Boolean(breaks.trim())) errors.push(`${id}: "where the analogy breaks" must be set exactly when there is an analogy`);
    if (![why, ...steps, usedIn, breaks, before, after, developer, interview, takeaway].every(ticks)) errors.push(`${id}: unbalanced backticks`);
  }
  // Like the beginner notes, a level ships complete or not at all.
  for (const [level, ids] of Object.entries(topicIdsByLevel)) {
    const missing = ids.filter((id) => !seen.has(id));
    if (missing.length > 0 && missing.length < ids.length) errors.push(`L${level}: missing ${missing.join(", ")}`);
  }
  return errors;
}
