import { describe, expect, it } from "vitest";
import { levels, topicIdsForLevel } from "@/lib/data";
import { EXPLAIN_LEVELS } from "@/lib/explain-level";
import { levelSections, sectionTexts } from "@/lib/level-sections";
import { getTopicNote, topicNotes } from "@/lib/topic-notes";
import { MAX_OVERLAP, getTopicLevels, validateTopicLevels, wordOverlap } from "@/lib/topic-levels";

const byLevel = Object.fromEntries(levels.map((l) => [l.id, topicIdsForLevel(l)]));
const notes = Object.keys(topicNotes).map((id) => [id, getTopicNote(id)!] as const);

describe("explanation levels", () => {
  it("passes validation", () => {
    expect(validateTopicLevels(byLevel)).toEqual([]);
  });

  it("covers every topic in the levels written so far, starting with L0", () => {
    const written = levels.filter((l) => byLevel[l.id].some((id) => getTopicLevels(id)));
    expect(written.map((l) => l.id)).toContain(levels[0].id);
    expect(written.flatMap((l) => byLevel[l.id]).filter((id) => !getTopicLevels(id))).toEqual([]);
  });

  it("never shows the same text under two levels", () => {
    const repeats: string[] = [];
    for (const [id, note] of notes) {
      const owner = new Map<string, string>();
      for (const level of EXPLAIN_LEVELS)
        for (const text of levelSections(note, level).flatMap(sectionTexts)) {
          const prev = owner.get(text);
          if (prev && prev !== level) repeats.push(`${id}: "${text.slice(0, 40)}" in ${prev} and ${level}`);
          owner.set(text, level);
        }
    }
    expect(repeats).toEqual([]);
  });

  it("words each level's opening differently, not the same sentence reworded", () => {
    const tooAlike: string[] = [];
    for (const [id, note] of notes) {
      const d = note.depth;
      if (!d) continue;
      const pairs: [string, string, string][] = [
        ["beginner/developer", note.simple, d.developer],
        ["beginner/interview", note.simple, d.interview],
        ["developer/interview", d.developer, d.interview],
      ];
      for (const [name, a, b] of pairs) if (wordOverlap(a, b) > MAX_OVERLAP) tooAlike.push(`${id} ${name} ${wordOverlap(a, b).toFixed(2)}`);
    }
    expect(tooAlike).toEqual([]);
  });

  it("gives developers and interviewees material the beginner page doesn't already say", () => {
    const tooAlike: string[] = [];
    for (const [id, note] of notes) {
      const l = note.levels;
      if (!l) continue;
      for (const g of l.gotchas) if (wordOverlap(g, note.mistake) > MAX_OVERLAP) tooAlike.push(`${id}: gotcha repeats the beginner mistake`);
      if (wordOverlap(l.weakAnswer, note.mistake) > MAX_OVERLAP) tooAlike.push(`${id}: weak answer repeats the beginner mistake`);
      if (note.depth && wordOverlap(l.edgeCase, note.depth.why) > MAX_OVERLAP) tooAlike.push(`${id}: edge case repeats "why it matters"`);
    }
    expect(tooAlike).toEqual([]);
  });

  it("measures overlap by shared words", () => {
    expect(wordOverlap("Vectors store meaning as numbers", "Vectors store meaning as numbers")).toBe(1);
    expect(wordOverlap("Split text into chunks", "Rank results with BM25")).toBe(0);
  });
});
