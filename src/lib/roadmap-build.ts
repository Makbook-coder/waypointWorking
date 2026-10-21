// Pure functions that turn per-level raw snapshots (data/raw/level-N.json)
// into data/roadmap.json, plus the validation used by the scrape script and tests.
import type { Level, Module, Phase, PhaseId, Roadmap, Topic } from "./types";

export interface RawTopic {
  t: string;
  d: string;
}

export interface RawModule {
  id: string;
  title: string;
  sessions: number | null;
  topics: RawTopic[];
  tryIt: string | null;
  outcome: string | null;
  mentalModel: string | null;
}

export interface RawLink {
  label: string;
  url: string;
  modules?: string[];
}

export interface RawLevel {
  id: number;
  title: string;
  phase: string;
  summary: string;
  interviewWeight: number;
  jobWeight: number;
  sessionCount: number;
  prerequisites: number[];
  outcome: string;
  project: { title: string; deliverables: string[] } | null;
  modules: RawModule[];
  links: RawLink[];
}

export const PHASES: { id: PhaseId; title: string; color: string; match: string }[] = [
  { id: "foundations", title: "Foundations", color: "phase-1", match: "foundations" },
  { id: "retrieval", title: "Retrieval", color: "phase-2", match: "retrieval" },
  { id: "agentic", title: "Agentic", color: "phase-3", match: "agentic" },
  { id: "evaluation-trust", title: "Evaluation & Trust", color: "phase-4", match: "evaluation" },
  { id: "production", title: "Production", color: "phase-5", match: "production" },
  { id: "frontier-proof", title: "Frontier & Proof", color: "phase-6", match: "frontier" },
  { id: "interview", title: "Interview", color: "phase-7", match: "interview" },
];

export function phaseIdFor(label: string): PhaseId {
  const lower = label.toLowerCase();
  const hit = PHASES.find((p) => lower.includes(p.match));
  if (!hit) throw new Error(`Unknown phase label: "${label}"`);
  return hit.id;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** "M4.6" -> "m4-6" */
export function moduleSlug(moduleId: string): string {
  return moduleId.toLowerCase().replace(/\./g, "-");
}

function buildTopics(moduleId: string, raw: RawTopic[], seen: Set<string>): Topic[] {
  return raw.map((t) => {
    const base = `${moduleSlug(moduleId)}-${slugify(t.t) || "topic"}`;
    let id = base;
    let n = 2;
    while (seen.has(id)) id = `${base}-${n++}`;
    seen.add(id);
    return { id, title: t.t.trim(), description: t.d.trim() };
  });
}

export function buildLevel(raw: RawLevel, seenTopicIds: Set<string>): Level {
  const modules: Module[] = raw.modules.map((m) => ({
    id: m.id,
    levelId: raw.id,
    title: m.title.trim(),
    sessionCount: m.sessions ?? 0,
    topics: buildTopics(m.id, m.topics, seenTopicIds),
    tryIt: m.tryIt,
    outcome: m.outcome,
    mentalModel: m.mentalModel,
    isCapstone: /capstone/i.test(m.title),
  }));
  return {
    id: raw.id,
    title: raw.title.trim(),
    phase: phaseIdFor(raw.phase),
    summary: raw.summary.trim(),
    interviewWeight: raw.interviewWeight,
    jobWeight: raw.jobWeight,
    sessionCount: raw.sessionCount,
    prerequisites: [...raw.prerequisites].sort((a, b) => a - b),
    outcome: raw.outcome.trim(),
    project: raw.project,
    modules,
  };
}

export function buildRoadmap(rawLevels: RawLevel[], source: string, generatedAt = new Date().toISOString()): Roadmap {
  const sorted = [...rawLevels].sort((a, b) => a.id - b.id);
  const seen = new Set<string>();
  const levels = sorted.map((r) => buildLevel(r, seen));
  const phases: Phase[] = PHASES.map((p, i) => ({
    id: p.id,
    order: i + 1,
    title: p.title,
    color: p.color,
    levels: levels.filter((l) => l.phase === p.id),
  }));
  return { source, generatedAt, phases };
}

export interface RoadmapCounts {
  phases: number;
  levels: number;
  modules: number;
  topics: number;
  sessions: number;
  projects: number;
}

export function countRoadmap(r: Roadmap): RoadmapCounts {
  const levels = r.phases.flatMap((p) => p.levels);
  const modules = levels.flatMap((l) => l.modules);
  return {
    phases: r.phases.length,
    levels: levels.length,
    modules: modules.length,
    topics: modules.reduce((n, m) => n + m.topics.length, 0),
    sessions: levels.reduce((n, l) => n + l.sessionCount, 0),
    projects: levels.filter((l) => l.project).length,
  };
}

/** Returns a list of problems; empty means valid. */
export function validateRoadmap(r: Roadmap, expectedLevels = 16): string[] {
  const errors: string[] = [];
  const levels = r.phases.flatMap((p) => p.levels);
  if (r.phases.length !== 7) errors.push(`expected 7 phases, got ${r.phases.length}`);
  if (levels.length !== expectedLevels) errors.push(`expected ${expectedLevels} levels, got ${levels.length}`);
  const levelIds = new Set(levels.map((l) => l.id));
  for (let i = 0; i < expectedLevels; i++) if (!levelIds.has(i)) errors.push(`missing level ${i}`);
  for (const p of r.phases) if (p.levels.length === 0) errors.push(`phase ${p.id} has no levels`);

  const moduleIds = new Set<string>();
  const topicIds = new Set<string>();
  for (const l of levels) {
    if (l.modules.length === 0) errors.push(`level ${l.id} has no modules`);
    for (const pre of l.prerequisites) {
      if (!levelIds.has(pre)) errors.push(`level ${l.id} has unknown prerequisite ${pre}`);
      if (pre >= l.id) errors.push(`level ${l.id} prerequisite ${pre} is not an earlier level`);
    }
    for (const w of [l.interviewWeight, l.jobWeight]) {
      if (!Number.isInteger(w) || w < 0 || w > 10) errors.push(`level ${l.id} has weight out of range: ${w}`);
    }
    for (const m of l.modules) {
      if (moduleIds.has(m.id)) errors.push(`duplicate module id ${m.id}`);
      moduleIds.add(m.id);
      if (!m.id.startsWith(`M${l.id}.`)) errors.push(`module ${m.id} does not belong to level ${l.id}`);
      if (m.topics.length === 0) errors.push(`module ${m.id} has no topics`);
      for (const t of m.topics) {
        if (topicIds.has(t.id)) errors.push(`duplicate topic id ${t.id}`);
        topicIds.add(t.id);
        if (!/^[a-z0-9-]+$/.test(t.id)) errors.push(`topic id not a slug: ${t.id}`);
        if (!t.title) errors.push(`topic ${t.id} has no title`);
      }
    }
  }
  return errors;
}
