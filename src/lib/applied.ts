// "In practice" sections: how each module is applied in real products.
import { APPLIED_SOURCES } from "../../content/applied";
import type { AppliedModule, AppliedSource } from "../../content/applied/types";

export type { AppliedModule, AppliedSource } from "../../content/applied/types";
export { APPLIED_LEVELS, APPLIED_SOURCES_CHECKED } from "../../content/applied";

export const applied: Record<string, AppliedModule> = Object.fromEntries(APPLIED_SOURCES.map((a) => [a.moduleId, a]));

export const getApplied = (moduleId: string): AppliedModule | undefined => applied[moduleId];

/** Every source an entry cites, uses first. */
export function appliedSources(a: AppliedModule): AppliedSource[] {
  return [...a.uses.map((u) => u.source), ...a.reading];
}

const isSearch = (url: string) => /[?&](q|query|search_query)=/.test(url) || /\/search\b/.test(url);

function sourceErrors(id: string, s: AppliedSource): string[] {
  const errors: string[] = [];
  let url: URL | null = null;
  try {
    url = new URL(s.url);
  } catch {
    errors.push(`${id}: bad url ${s.url}`);
  }
  if (url && url.protocol !== "https:") errors.push(`${id}: not https ${s.url}`);
  if (s.label.trim().length < 4) errors.push(`${id}: source label too short`);
  if (url && isSearch(s.url) !== (s.kind === "search")) errors.push(`${id}: search links must be marked search, and only those: ${s.url}`);
  return errors;
}

const MIN = { howItWorks: 250, uses: 2, tools: 2, steps: 5, codeLines: 8, tradeoffs: 3, reading: [2, 3] } as const;

/** Problems with the "In practice" set, given the module ids that must have one. Empty means valid. */
export function validateApplied(moduleIds: string[], entries: AppliedModule[] = APPLIED_SOURCES): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const known = new Set(moduleIds);
  for (const a of entries) {
    const id = a.moduleId;
    if (seen.has(id)) errors.push(`${id}: duplicate entry`);
    seen.add(id);
    if (!known.has(id)) errors.push(`${id}: not a covered non-capstone module`);
    if (a.howItWorks.trim().length < MIN.howItWorks) errors.push(`${id}: howItWorks is too thin`);
    if (a.uses.length < MIN.uses) errors.push(`${id}: needs at least ${MIN.uses} real-world uses`);
    for (const u of a.uses) {
      if (!u.who.trim() || u.what.trim().length < 60) errors.push(`${id}: a real-world use is too thin`);
      if (u.source.kind === "search") errors.push(`${id}: a real-world use must cite a page, not a search`);
    }
    const sc = a.scenario;
    if (sc.context.length < 80 || sc.architecture.length < 80) errors.push(`${id}: scenario context or architecture too thin`);
    if (sc.tools.length < MIN.tools) errors.push(`${id}: scenario needs at least ${MIN.tools} tools`);
    if (sc.steps.length < MIN.steps) errors.push(`${id}: scenario needs at least ${MIN.steps} steps`);
    if (a.example.code.trim().split("\n").length < MIN.codeLines) errors.push(`${id}: example code too short`);
    if (a.example.notes.trim().length < 60) errors.push(`${id}: example notes too thin`);
    if (a.tradeoffs.length < MIN.tradeoffs) errors.push(`${id}: needs at least ${MIN.tradeoffs} trade-offs`);
    if (a.tradeoffs.some((t) => t.issue.length < 20 || t.response.length < 40)) errors.push(`${id}: a trade-off is too thin`);
    if (a.junior.length < 60 || a.senior.length < 60) errors.push(`${id}: junior/senior note too thin`);
    if (a.reading.length < MIN.reading[0] || a.reading.length > MIN.reading[1]) errors.push(`${id}: needs 2 or 3 further-reading links`);
    const urls = a.reading.map((r) => r.url);
    if (new Set(urls).size !== urls.length) errors.push(`${id}: duplicate further-reading link`);
    for (const s of appliedSources(a)) errors.push(...sourceErrors(id, s));
    const prose = [a.howItWorks, sc.context, sc.architecture, ...sc.steps, a.example.notes, a.junior, a.senior, ...a.uses.map((u) => u.what), ...a.tradeoffs.flatMap((t) => [t.issue, t.response])];
    if (prose.some((s) => (s.match(/`/g)?.length ?? 0) % 2 !== 0)) errors.push(`${id}: unbalanced backticks`);
  }
  for (const id of moduleIds) if (!seen.has(id)) errors.push(`${id}: missing "In practice" section`);
  return errors;
}
