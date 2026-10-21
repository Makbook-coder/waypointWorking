// System-design prompts and debug-the-snippet exercises for interview practice. Plain data plus validators.
import debugJson from "../../data/debug-snippets.json";
import systemJson from "../../data/system-design.json";
import type { InterviewSource } from "./sourced";

export type Difficulty = "easy" | "medium" | "hard";

export interface SystemDesignPrompt {
  id: string;
  title: string;
  prompt: string;
  /** Typical seniority, our estimate. */
  seniority: "mid" | "senior" | "staff";
  difficulty: Difficulty;
  /** Companies the cited source says asked it. Empty when the source names none. */
  companies: string[];
  source: InterviewSource;
  role: string;
  moduleIds: string[];
  mustCover: string[];
  outline: string[];
  followUps: string[];
}

export interface DebugSnippet {
  id: string;
  title: string;
  moduleId: string;
  difficulty: Difficulty;
  symptom: string;
  hint: string;
  bugs: string[];
  code: string;
  fixedCode: string;
  explanation: string;
  inspiredBy?: string;
}

export const systemDesignPrompts = (systemJson as unknown as { prompts: SystemDesignPrompt[] }).prompts;
export const debugSnippets = (debugJson as unknown as { snippets: DebugSnippet[] }).snippets;

/** The same checklist applies to every design prompt: cover these before you stop. */
export const DESIGN_CHECKLIST: { id: string; label: string; hint: string }[] = [
  { id: "clarify", label: "Clarified requirements and users", hint: "Who uses it, what must it do, what is out of scope?" },
  { id: "scale", label: "Stated scale and latency, cost and quality targets", hint: "Requests per second, p95 latency, budget per request." },
  { id: "approach", label: "Chose prompting, RAG, an agent or fine-tuning, and said why", hint: "Start with the simplest thing that could work." },
  { id: "architecture", label: "Drew the request path end to end", hint: "Client, gateway, services, model, stores." },
  { id: "knowledge", label: "Covered data and knowledge: sources, freshness, permissions", hint: "Where does the model get facts, and who may see what?" },
  { id: "models", label: "Covered model choice, routing and caching", hint: "Big and small models, fallbacks, cache keys." },
  { id: "reliability", label: "Covered failures: timeouts, retries, fallbacks, degradation", hint: "What happens when the provider is slow or down?" },
  { id: "safety", label: "Covered security and safety", hint: "Injection, data leakage, approvals, abuse." },
  { id: "evals", label: "Defined evaluation and monitoring", hint: "Offline set, online metrics, feedback loop." },
  { id: "tradeoffs", label: "Named the trade-offs and what you would change at 10x", hint: "Say what you gave up." },
];

const DIFFICULTIES = ["easy", "medium", "hard"];

export function validateSystemDesign(prompts: SystemDesignPrompt[], moduleIds: Set<string>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const p of prompts) {
    const at = p.id || "(no id)";
    if (!p.id || ids.has(p.id)) errors.push(`${at}: missing or duplicate id`);
    ids.add(p.id);
    if (!p.title?.trim() || p.prompt?.trim().length < 20) errors.push(`${at}: title or prompt too short`);
    if (!["mid", "senior", "staff"].includes(p.seniority)) errors.push(`${at}: bad seniority`);
    if (!DIFFICULTIES.includes(p.difficulty)) errors.push(`${at}: bad difficulty`);
    if (!Array.isArray(p.companies) || p.companies.some((c) => !c.trim()) || new Set(p.companies).size !== p.companies.length) errors.push(`${at}: bad companies list`);
    try {
      if (new URL(p.source?.url).protocol !== "https:") errors.push(`${at}: source must be https`);
    } catch {
      errors.push(`${at}: source url missing or invalid`);
    }
    if (!p.source?.title?.trim()) errors.push(`${at}: source title missing`);
    if (!p.moduleIds?.length || p.moduleIds.some((m) => !moduleIds.has(m))) errors.push(`${at}: unknown or missing module`);
    if (p.mustCover?.length < 3 || p.mustCover.some((x) => !x.trim())) errors.push(`${at}: needs at least 3 must-cover points`);
    if (p.outline?.length < 4 || p.outline.some((x) => !x.trim())) errors.push(`${at}: needs at least 4 outline steps`);
    if (p.followUps?.length < 2) errors.push(`${at}: needs at least 2 follow-ups`);
  }
  return errors;
}

export function validateDebugSnippets(snippets: DebugSnippet[], moduleIds: Set<string>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const s of snippets) {
    const at = s.id || "(no id)";
    if (!s.id || ids.has(s.id)) errors.push(`${at}: missing or duplicate id`);
    ids.add(s.id);
    if (!moduleIds.has(s.moduleId)) errors.push(`${at}: unknown module ${s.moduleId}`);
    if (!DIFFICULTIES.includes(s.difficulty)) errors.push(`${at}: bad difficulty`);
    if (!s.title?.trim() || !s.symptom?.trim() || !s.hint?.trim() || s.explanation?.trim().length < 60) errors.push(`${at}: missing text`);
    if (!s.bugs?.length || s.bugs.some((b) => !b.trim())) errors.push(`${at}: needs at least one bug description`);
    if (!s.code?.trim() || !s.fixedCode?.trim()) errors.push(`${at}: missing code`);
    else if (s.code.trim() === s.fixedCode.trim()) errors.push(`${at}: fixed code equals buggy code`);
  }
  return errors;
}

export function filterByModule<T extends { moduleIds?: string[]; moduleId?: string }>(items: T[], moduleId: string | "all"): T[] {
  return moduleId === "all" ? items : items.filter((x) => x.moduleId === moduleId || x.moduleIds?.includes(moduleId));
}
