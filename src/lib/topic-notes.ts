// "Explain simply" notes: one beginner-level note per topic, authored in content/topic-notes/.
import { TOPIC_NOTE_SOURCES } from "../../content/topic-notes";
import { getTopicDepth, type TopicDepth } from "./topic-depth";
import { getTopicLevels, type TopicLevels } from "./topic-levels";

export interface TopicNote {
  simple: string;
  analogy: string;
  example: string;
  mistake: string;
  /** Developer and interview wording and the full topic page sections, when written. */
  depth?: TopicDepth;
  /** Code, gotchas, follow-up questions and the rest of the Developer and Interview material, when written. */
  levels?: TopicLevels;
}

export const topicNotes: Record<string, TopicNote> = Object.fromEntries(
  TOPIC_NOTE_SOURCES.map(([id, simple, analogy, example, mistake]) => [id, { simple, analogy, example, mistake }]),
);

const withDepth = (id: string): TopicNote | undefined => {
  const note = topicNotes[id];
  if (!note) return undefined;
  const depth = getTopicDepth(id);
  const levels = getTopicLevels(id);
  return { ...note, ...(depth && { depth }), ...(levels && { levels }) };
};

export const getTopicNote = (topicId: string): TopicNote | undefined => withDepth(topicId);

/** The notes for a set of topics, for passing from a server page to client components. */
export function topicNotesFor(topicIds: string[]): Record<string, TopicNote> {
  return Object.fromEntries(topicIds.flatMap((id) => (topicNotes[id] ? [[id, withDepth(id)!]] : [])));
}

/** Problems with the topic notes, given every topic id grouped by level. Empty means valid. */
export function validateTopicNotes(topicIdsByLevel: Record<number, string[]>): string[] {
  const errors: string[] = [];
  const known = new Set(Object.values(topicIdsByLevel).flat());
  const seen = new Set<string>();
  const ticks = (s: string) => (s.match(/`/g)?.length ?? 0) % 2 === 0;
  for (const [id, simple, analogy, example, mistake] of TOPIC_NOTE_SOURCES) {
    if (seen.has(id)) errors.push(`${id}: duplicate`);
    seen.add(id);
    if (!known.has(id)) errors.push(`${id}: no such topic`);
    if ([simple, example, mistake].some((s) => s.trim().length < 15)) errors.push(`${id}: a section is too short`);
    if (![simple, analogy, example, mistake].every(ticks)) errors.push(`${id}: unbalanced backticks`);
  }
  // A level is either not started or fully covered, so a half-written level can't ship.
  for (const [level, ids] of Object.entries(topicIdsByLevel)) {
    const missing = ids.filter((id) => !seen.has(id));
    if (missing.length > 0 && missing.length < ids.length) errors.push(`L${level}: missing ${missing.join(", ")}`);
  }
  return errors;
}
