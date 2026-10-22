import type { ProjectSize, ProjectSrc } from "./types";

type Draft = Omit<ProjectSrc, "id" | "scope" | "refId" | "size" | "covers">;

/** Shorthand so a project reads as one block: steps are [do, ifStuck] pairs. */
export function pj(title: string, minutes: number, goal: string, steps: [string, string][], expected: string, done: string[], next: string, needs: string[] = []): Draft {
  return { title, minutes, goal, needs, steps: steps.map(([d, s]) => ({ do: d, stuck: s })), expected, done, next };
}

const SIZES: Record<number, ProjectSize[]> = { 2: ["small", "medium"], 3: ["small", "medium", "bigger"] };

/** The projects for one topic, smallest first. */
export function topicProjects(topicId: string, drafts: Draft[]): ProjectSrc[] {
  const sizes = SIZES[drafts.length] ?? [];
  return drafts.map((d, i) => ({ ...d, id: `pj:${topicId}:${i + 1}`, scope: "topic", refId: topicId, size: sizes[i] }));
}

/** The capstone that covers every topic in a module. */
export function moduleCapstone(moduleId: string, covers: string[], d: Draft): ProjectSrc {
  return { ...d, id: `pj:${moduleId}:cap`, scope: "module", refId: moduleId, size: "capstone", covers };
}

/** The capstone at the end of a level. */
export function levelCapstone(levelId: number, d: Draft): ProjectSrc {
  return { ...d, id: `pj:L${levelId}:cap`, scope: "level", refId: `L${levelId}`, size: "capstone" };
}

/** The "need" line for projects that call a model, so the free options are named once. */
export const LLM = "Any LLM you can call: a free Gemini API key, or Ollama running a small model on your computer";
