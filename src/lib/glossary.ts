// Glossary: plain-word definitions, authored in content/glossary/, and the matcher that
// finds those terms inside note text so the UI can show a tap-to-define popover.
import { GLOSSARY_SOURCES } from "../../content/glossary";

export interface GlossaryEntry {
  slug: string;
  term: string;
  plain: string;
  aliases: string[];
  moduleId: string;
}

export const glossarySlug = (term: string) =>
  term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const glossary: GlossaryEntry[] = GLOSSARY_SOURCES.map(([term, plain, aliases, moduleId]) => ({
  slug: glossarySlug(term),
  term,
  plain,
  aliases,
  moduleId,
})).sort((a, b) => a.term.replace(/^\W+/, "").localeCompare(b.term.replace(/^\W+/, ""), "en", { sensitivity: "base" }));

const bySlug = new Map(glossary.map((e) => [e.slug, e]));
export const getGlossaryEntry = (slug: string) => bySlug.get(slug);

/**
 * Acronyms and mixed-case names (RAG, LoRA, LangChain) only match with the same capitals,
 * so "rag" or "lora" in ordinary words never light up. Everything else ignores case.
 */
const caseSensitive = (phrase: string) => /[A-Z]/.test(phrase.slice(1));

interface Phrase {
  text: string;
  slug: string;
  exact: boolean;
}

const phrases: Phrase[] = glossary.flatMap((e) => [e.term, ...e.aliases].map((text) => ({ text, slug: e.slug, exact: caseSensitive(text) })));
const byLower = new Map<string, Phrase>();
for (const p of phrases) if (!byLower.has(p.text.toLowerCase())) byLower.set(p.text.toLowerCase(), p);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
// Longest first, so "prompt injection" wins over "injection". A plural "s" is allowed on any phrase.
// Hyphens count as part of a word, so "agent" never matches inside "multi-agent".
const MATCHER = new RegExp(
  `(?<![\\w-])(${[...byLower.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escape)
    .join("|")})(?:e?s)?(?![\\w-])`,
  "gi",
);

export type Segment = { kind: "text"; text: string } | { kind: "code"; text: string } | { kind: "term"; text: string; slug: string };

function termsIn(text: string, seen: Set<string>, skip: Set<string>): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  MATCHER.lastIndex = 0;
  for (let m = MATCHER.exec(text); m; m = MATCHER.exec(text)) {
    const p = byLower.get(m[1].toLowerCase());
    if (!p || (p.exact && m[1] !== p.text) || seen.has(p.slug) || skip.has(p.slug)) continue;
    seen.add(p.slug);
    if (m.index > last) out.push({ kind: "text", text: text.slice(last, m.index) });
    out.push({ kind: "term", text: m[0], slug: p.slug });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

/**
 * Split each text into plain, `code` and glossary-term segments. Only the first mention of a term
 * across all the texts is marked, so a note never turns into a sea of underlines. Code spans are
 * left alone. `skip` holds slugs not to mark, e.g. the term a page is already about.
 */
export function linkTerms(texts: string[], skip: string[] = []): Segment[][] {
  const seen = new Set<string>();
  const skipSet = new Set(skip);
  return texts.map((text) =>
    text.split(/(`[^`]+`)/g).flatMap((part): Segment[] => {
      if (!part) return [];
      if (part.length > 1 && part.startsWith("`") && part.endsWith("`")) return [{ kind: "code", text: part.slice(1, -1) }];
      return termsIn(part, seen, skipSet);
    }),
  );
}

/** Glossary entries mentioned anywhere in the texts, in order of first mention. */
export function termsMentioned(texts: string[]): GlossaryEntry[] {
  return linkTerms(texts)
    .flat()
    .flatMap((s) => (s.kind === "term" ? [bySlug.get(s.slug)!] : []));
}

/** Problems with the glossary, given every module id. Empty means valid. */
export function validateGlossary(moduleIds: string[]): string[] {
  const errors: string[] = [];
  const known = new Set(moduleIds);
  const slugs = new Set<string>();
  const owners = new Map<string, string>();
  for (const [term, plain, aliases, moduleId] of GLOSSARY_SOURCES) {
    const slug = glossarySlug(term);
    if (slugs.has(slug)) errors.push(`${term}: duplicate term`);
    slugs.add(slug);
    if (!known.has(moduleId)) errors.push(`${term}: no such module ${moduleId}`);
    if (plain.trim().length < 25) errors.push(`${term}: definition is too short`);
    if ((plain.match(/`/g)?.length ?? 0) % 2 !== 0) errors.push(`${term}: unbalanced backticks`);
    for (const a of [term, ...aliases]) {
      const key = a.toLowerCase();
      const owner = owners.get(key);
      if (owner && owner !== term) errors.push(`"${a}" is used by both ${owner} and ${term}`);
      owners.set(key, term);
    }
  }
  return errors;
}
