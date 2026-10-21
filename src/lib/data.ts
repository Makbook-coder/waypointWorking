// Typed access to data/roadmap.json. Safe to import from server and client code.
// Resources and practice live in content-data.ts so pages that don't need them stay small.
import roadmapJson from "../../data/roadmap.json";
import type { Level, Module, Phase, PhaseId, Roadmap, Topic } from "./types";

export const roadmap = roadmapJson as unknown as Roadmap;

export const phases: Phase[] = roadmap.phases;
export const levels: Level[] = phases.flatMap((p) => p.levels).sort((a, b) => a.id - b.id);
export const modules: Module[] = levels.flatMap((l) => l.modules);
export const allTopics: Topic[] = modules.flatMap((m) => m.topics);

const levelById = new Map(levels.map((l) => [l.id, l]));
const moduleById = new Map(modules.map((m) => [m.id, m]));
const phaseById = new Map(phases.map((p) => [p.id, p]));
const topicIndex = new Map<string, { topic: Topic; module: Module }>();
for (const m of modules) for (const t of m.topics) topicIndex.set(t.id, { topic: t, module: m });

export const getLevel = (id: number) => levelById.get(id);
export const getModule = (id: string) => moduleById.get(id);
export const getPhase = (id: PhaseId) => phaseById.get(id)!;
export const getTopic = (id: string) => topicIndex.get(id);

/** URL segment for a module: "M4.6" -> "m4-6" */
export const moduleHref = (id: string) => `/module/${id.toLowerCase().replace(".", "-")}`;
export const levelHref = (id: number) => `/level/${id}`;
export function moduleIdFromParam(param: string): string | null {
  const m = /^m(\d+)-(\d+)$/i.exec(param);
  return m ? `M${Number(m[1])}.${Number(m[2])}` : null;
}

export function topicIdsForLevel(level: Level): string[] {
  return level.modules.flatMap((m) => m.topics.map((t) => t.id));
}
