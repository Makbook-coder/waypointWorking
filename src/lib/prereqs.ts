// "Before this" checks for a topic: what a learner should already be comfortable with.
import { getLevel, getTopic, levelHref, moduleHref, topicHref, topicIdsForLevel } from "./data";

export interface Prereq {
  label: string;
  href: string;
  topicIds: string[];
}

/**
 * The previous topic in the module; for a module's first topic, the previous module;
 * for a level's first module, the level's suggested prerequisite levels. Empty at the very start.
 */
export function prereqsFor(topicId: string): Prereq[] {
  const found = getTopic(topicId);
  if (!found) return [];
  const { module: mod } = found;
  const idx = mod.topics.findIndex((t) => t.id === topicId);
  if (idx > 0) {
    const prev = mod.topics[idx - 1];
    return [{ label: prev.title, href: topicHref(prev.id), topicIds: [prev.id] }];
  }
  const level = getLevel(mod.levelId)!;
  const mIdx = level.modules.findIndex((m) => m.id === mod.id);
  if (mIdx > 0) {
    const prevMod = level.modules[mIdx - 1];
    return [{ label: `${prevMod.id} ${prevMod.title}`, href: moduleHref(prevMod.id), topicIds: prevMod.topics.map((t) => t.id) }];
  }
  return level.prerequisites.flatMap((id) => {
    const l = getLevel(id);
    return l ? [{ label: `L${l.id} ${l.title}`, href: levelHref(l.id), topicIds: topicIdsForLevel(l) }] : [];
  });
}
