// Client-side fuzzy search across topics, modules, notes and resources.
import Fuse from "fuse.js";
import { getModule, getTopic, levels, modules, moduleHref, levelHref, getLevel } from "./data";
import { resources } from "./content-data";
import type { UserState } from "./store";

export type SearchKind = "topic" | "module" | "note" | "resource";

export interface SearchDoc {
  kind: SearchKind;
  key: string;
  title: string;
  body: string;
  context: string;
  href: string;
  external?: boolean;
}

export function staticDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const l of levels)
    for (const m of l.modules) {
      docs.push({
        kind: "module",
        key: `module:${m.id}`,
        title: `${m.id} ${m.title}`,
        body: [m.outcome, m.tryIt, m.mentalModel].filter(Boolean).join(" "),
        context: `Level ${l.id} · ${l.title}`,
        href: moduleHref(m.id),
      });
      for (const t of m.topics)
        docs.push({ kind: "topic", key: `topic:${t.id}`, title: t.title, body: t.description, context: `${m.id} ${m.title}`, href: moduleHref(m.id) });
    }
  for (const m of modules)
    for (const r of resources[m.id] ?? [])
      docs.push({ kind: "resource", key: `resource:${m.id}|${r.url}`, title: r.title, body: r.type, context: `${m.id} ${m.title}`, href: r.url, external: true });
  return docs;
}

/** Human label and link for a note/bookmark key. */
export function describeKey(key: string): { title: string; context: string; href: string } | null {
  const [kind, ...rest] = key.split(":");
  const id = rest.join(":");
  if (kind === "module") {
    const m = getModule(id);
    return m ? { title: `${m.id} ${m.title}`, context: `Level ${m.levelId}`, href: moduleHref(m.id) } : null;
  }
  if (kind === "topic") {
    const t = getTopic(id);
    return t ? { title: t.topic.title, context: `${t.module.id} ${t.module.title}`, href: moduleHref(t.module.id) } : null;
  }
  if (kind === "level") {
    const l = getLevel(Number(id));
    return l ? { title: `Level ${l.id} · ${l.title}`, context: "Level", href: levelHref(l.id) } : null;
  }
  return null;
}

export function noteDocs(s: UserState): SearchDoc[] {
  return Object.entries(s.notes).flatMap(([key, note]) => {
    const d = describeKey(key);
    return d ? [{ kind: "note" as const, key: `note:${key}`, title: `Note · ${d.title}`, body: note.text, context: d.context, href: d.href }] : [];
  });
}

export function createIndex(docs: SearchDoc[]) {
  return new Fuse(docs, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "body", weight: 0.3 },
      { name: "context", weight: 0.1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}
