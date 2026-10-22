// Which sections each explanation level shows on a topic page. Each level gets its own material,
// so switching levels changes the whole page, not just the first paragraph.
import type { ExplainLevel } from "./explain-level";
import type { TopicNote } from "./topic-notes";

export type LevelSection =
  | { label: string; kind: "text"; text: string }
  | { label: string; kind: "steps" | "list"; items: string[] }
  | { label: string; kind: "code"; code: string }
  | { label: string; kind: "qa"; pairs: [string, string][] }
  | { label: string; kind: "beforeAfter"; before: string; after: string }
  | { label: string; kind: "analogy"; text: string; breaks: string };

/**
 * Beginner: plain words, an analogy, why it matters, a tiny example, before and after, a mistake, a takeaway.
 * Developer: precise wording, how it works, code, gotchas, a trade-off, where it's used.
 * Interview: a short spoken answer, likely follow-ups, an edge case, what weak answers miss.
 * No text appears under two levels.
 */
export function levelSections(note: TopicNote, level: ExplainLevel): LevelSection[] {
  const d = note.depth;
  const l = note.levels;
  if (level === "developer" && d) {
    const out: LevelSection[] = [
      { label: "In technical terms", kind: "text", text: d.developer },
      { label: "How it works, step by step", kind: "steps", items: d.steps },
    ];
    if (l?.code) out.push({ label: "In code", kind: "code", code: l.code });
    if (l) out.push({ label: "Gotchas", kind: "list", items: l.gotchas }, { label: "Trade-off", kind: "text", text: l.tradeoff });
    out.push({ label: "Where it's used", kind: "text", text: d.usedIn });
    return out;
  }
  if (level === "interview" && d) {
    const out: LevelSection[] = [{ label: "Say it in 30 seconds", kind: "text", text: d.interview }];
    if (l)
      out.push(
        { label: "Likely follow-ups", kind: "qa", pairs: l.followUps },
        { label: "Go one level deeper", kind: "text", text: l.edgeCase },
        { label: "What weak answers miss", kind: "text", text: l.weakAnswer },
      );
    out.push({ label: "One line to remember", kind: "text", text: d.takeaway });
    return out;
  }
  const out: LevelSection[] = [{ label: "What it is", kind: "text", text: note.simple }];
  if (note.analogy) out.push({ label: "Think of it like", kind: "analogy", text: note.analogy, breaks: d?.breaks ?? "" });
  if (d) out.push({ label: "Why it matters", kind: "text", text: d.why });
  out.push({ label: "Tiny example", kind: "text", text: note.example });
  if (d) out.push({ label: "Before and after", kind: "beforeAfter", before: d.before, after: d.after });
  out.push({ label: "Mistake to avoid", kind: "text", text: note.mistake });
  return out;
}

/** Every piece of text a section shows, for checking that levels don't repeat each other. */
export function sectionTexts(s: LevelSection): string[] {
  switch (s.kind) {
    case "text":
      return [s.text];
    case "steps":
    case "list":
      return s.items;
    case "code":
      return [s.code];
    case "qa":
      return s.pairs.flat();
    case "beforeAfter":
      return [s.before, s.after];
    case "analogy":
      return [s.text, s.breaks].filter(Boolean);
  }
}
