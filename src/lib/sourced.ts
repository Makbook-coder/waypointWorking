// Interview questions and scenarios collected from public sources, each tagged with the company the
// source says asked it. Kept apart from the practice bank so the two can change independently.
import sourcedJson from "../../data/interview-sourced.json";
import type { InterviewItem } from "./types";

export type SourceKind = "question-list" | "question-bank" | "interview-guide" | "interview-experience";

export interface InterviewSource {
  url: string;
  title: string;
  kind: SourceKind;
}

export interface SourcedInterviewItem extends InterviewItem {
  topicId: string;
  format: "question" | "scenario";
  /** Companies the cited source says asked this. Empty when the source does not say. */
  companies: string[];
  role?: string;
  source: InterviewSource;
}

export const sourcedItems = (sourcedJson as unknown as { items: SourcedInterviewItem[] }).items;

const byModule = new Map<string, SourcedInterviewItem[]>();
for (const it of sourcedItems) byModule.set(it.moduleId, [...(byModule.get(it.moduleId) ?? []), it]);

export const getSourcedForModule = (moduleId: string): SourcedInterviewItem[] => byModule.get(moduleId) ?? [];

/** Companies with the number of items each one has, most items first. */
export function companyCounts(items: SourcedInterviewItem[]): { company: string; count: number }[] {
  const m = new Map<string, number>();
  for (const it of items) for (const c of it.companies) m.set(c, (m.get(c) ?? 0) + 1);
  return [...m].map(([company, count]) => ({ company, count })).sort((a, b) => b.count - a.count || a.company.localeCompare(b.company));
}

export interface SourcedFilter {
  company?: string | "all";
  levelId?: number | "all";
  difficulty?: InterviewItem["difficulty"] | "all";
  format?: SourcedInterviewItem["format"] | "all";
  text?: string;
}

export function filterSourced(items: SourcedInterviewItem[], f: SourcedFilter): SourcedInterviewItem[] {
  const text = f.text?.trim().toLowerCase();
  return items.filter(
    (it) =>
      (!f.company || f.company === "all" || it.companies.includes(f.company)) &&
      (f.levelId === undefined || f.levelId === "all" || it.levelId === f.levelId) &&
      (!f.difficulty || f.difficulty === "all" || it.difficulty === f.difficulty) &&
      (!f.format || f.format === "all" || it.format === f.format) &&
      (!text || it.question.toLowerCase().includes(text) || it.companies.some((c) => c.toLowerCase().includes(text))),
  );
}

export interface SourcedStats {
  items: number;
  companies: number;
  perLevel: Record<number, number>;
  perDifficulty: Record<string, number>;
  thinModules: string[];
}

/** Counts for the summary line and for spotting modules with little coverage. */
export function sourcedStats(items: SourcedInterviewItem[], moduleIds: string[], thin = 2): SourcedStats {
  const perLevel: Record<number, number> = {};
  const perDifficulty: Record<string, number> = {};
  const perModule: Record<string, number> = {};
  for (const it of items) {
    perLevel[it.levelId] = (perLevel[it.levelId] ?? 0) + 1;
    perDifficulty[it.difficulty] = (perDifficulty[it.difficulty] ?? 0) + 1;
    perModule[it.moduleId] = (perModule[it.moduleId] ?? 0) + 1;
  }
  return {
    items: items.length,
    companies: companyCounts(items).length,
    perLevel,
    perDifficulty,
    thinModules: moduleIds.filter((id) => (perModule[id] ?? 0) < thin),
  };
}

/** Problems with the sourced data, empty when it is sound. `topicIds` maps module id to its topic ids. */
export function validateSourced(items: SourcedInterviewItem[], topicIds: Map<string, Set<string>>, levelOf: Map<string, number>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const questions = new Set<string>();
  for (const it of items) {
    const at = it.id || "(no id)";
    if (!it.id || ids.has(it.id)) errors.push(`${at}: missing or duplicate id`);
    ids.add(it.id);
    if (questions.has(it.question)) errors.push(`${at}: duplicate question`);
    questions.add(it.question);
    if (it.type !== "interview") errors.push(`${at}: type must be "interview"`);
    const topics = topicIds.get(it.moduleId);
    if (!topics) errors.push(`${at}: unknown module ${it.moduleId}`);
    else if (!topics.has(it.topicId)) errors.push(`${at}: topic ${it.topicId} is not in ${it.moduleId}`);
    if (levelOf.get(it.moduleId) !== it.levelId) errors.push(`${at}: levelId ${it.levelId} does not match ${it.moduleId}`);
    if (!["easy", "medium", "hard"].includes(it.difficulty)) errors.push(`${at}: bad difficulty`);
    if (!["question", "scenario"].includes(it.format)) errors.push(`${at}: bad format`);
    if (!it.question.trim() || it.answer.trim().length < 100) errors.push(`${at}: question or answer too short`);
    if (it.keyPoints.length < 3 || it.keyPoints.length > 5 || it.keyPoints.some((k) => !k.trim())) errors.push(`${at}: needs 3 to 5 key points`);
    if (!Array.isArray(it.companies) || it.companies.some((c) => !c.trim()) || new Set(it.companies).size !== it.companies.length) errors.push(`${at}: bad companies list`);
    try {
      const u = new URL(it.source?.url);
      if (u.protocol !== "https:") errors.push(`${at}: source must be https`);
    } catch {
      errors.push(`${at}: source url missing or invalid`);
    }
    if (!it.source?.title?.trim()) errors.push(`${at}: source title missing`);
  }
  return errors;
}
