import { describe, expect, it } from "vitest";
import { levels, topicIdsForLevel } from "@/lib/data";
import { getTopicDepth, validateTopicDepth } from "@/lib/topic-depth";
import { topicNotes } from "@/lib/topic-notes";

const byLevel = Object.fromEntries(levels.map((l) => [l.id, topicIdsForLevel(l)]));
const withAnalogy = new Set(Object.entries(topicNotes).filter(([, n]) => n.analogy.trim()).map(([id]) => id));

describe("topic depth", () => {
  it("passes validation", () => {
    expect(validateTopicDepth(byLevel, withAnalogy)).toEqual([]);
  });

  // Levels are written one batch at a time; validation already rejects a half-written level.
  it("covers every topic in the levels written so far", () => {
    const written = levels.filter((l) => byLevel[l.id].some((id) => getTopicDepth(id)));
    expect(written.map((l) => l.id)).toContain(levels[0].id);
    const missing = written.flatMap((l) => byLevel[l.id]).filter((id) => !getTopicDepth(id));
    expect(missing).toEqual([]);
  });
});
