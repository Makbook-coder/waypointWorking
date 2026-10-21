// One-page revision sheets per level, assembled from content that already exists:
// the module notes, mental models, topic titles and interview key points.
import { allPractice } from "./content-data";
import { getNote } from "./notes";
import type { InterviewItem, Level, Module } from "./types";

export interface CheatEntry {
  module: Module;
  /** The note's "what it is", or the module outcome for capstones. */
  gist: string;
  mentalModel: string | null;
  topics: string[];
  mistakes: string[];
  interview: { question: string; keyPoints: string[] } | null;
}

const interviewByModule = new Map(
  allPractice.filter((p): p is InterviewItem => p.type === "interview").map((p) => [p.moduleId, p]),
);

export function cheatSheet(level: Level): CheatEntry[] {
  return level.modules.map((m) => {
    const note = getNote(m.id);
    const iv = interviewByModule.get(m.id);
    return {
      module: m,
      gist: note?.what ?? m.outcome ?? "",
      mentalModel: m.mentalModel || null,
      topics: m.topics.map((t) => t.title),
      mistakes: note?.mistakes ?? [],
      interview: iv ? { question: iv.question, keyPoints: iv.keyPoints.slice(0, 4) } : null,
    };
  });
}
