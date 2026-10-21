"use client";

import Link from "next/link";
import { getPracticeItem, getResources } from "@/lib/content-data";
import { getModule, moduleHref } from "@/lib/data";
import { describeKey } from "@/lib/search";
import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import { Badge, EmptyState } from "./ui";

export interface ResolvedBookmark {
  key: string;
  kind: string;
  title: string;
  context: string;
  href: string;
  external: boolean;
  addedAt: string;
}

export function resolveBookmark(key: string, addedAt: string): ResolvedBookmark | null {
  const kind = key.split(":")[0];
  const rest = key.slice(kind.length + 1);
  if (kind === "practice") {
    const p = getPracticeItem(rest);
    if (!p) return null;
    const m = getModule(p.moduleId);
    const title = p.type === "quiz" || p.type === "interview" ? p.question : p.title;
    return { key, kind: p.type, title, context: m ? `${m.id} ${m.title}` : "", href: `${moduleHref(p.moduleId)}#practice`, external: false, addedAt };
  }
  if (kind === "resource") {
    const [moduleId, ...u] = rest.split("|");
    const url = u.join("|");
    const r = getResources(moduleId).find((x) => x.url === url);
    const m = getModule(moduleId);
    return r ? { key, kind: "resource", title: r.title, context: m ? `${m.id} ${m.title}` : "", href: r.url, external: true, addedAt } : null;
  }
  const d = describeKey(key);
  return d ? { key, kind, ...d, external: false, addedAt } : null;
}

export function useBookmarks(): ResolvedBookmark[] {
  const s = useUserState();
  return Object.entries(s.bookmarks)
    .map(([k, at]) => resolveBookmark(k, at))
    .filter((b): b is ResolvedBookmark => b !== null)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export function BookmarkList({ items, empty }: { items: ResolvedBookmark[]; empty: string }) {
  if (items.length === 0) return <EmptyState>{empty}</EmptyState>;
  return (
    <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
      {items.map((b) => (
        <li key={b.key} className="flex items-center gap-3 px-4 py-3">
          <Badge>{b.kind}</Badge>
          <div className="min-w-0 flex-1">
            {b.external ? (
              <a href={b.href} target="_blank" rel="noopener noreferrer" className="block truncate font-medium hover:underline">
                {b.title} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Link href={b.href} className="block truncate font-medium hover:underline">
                {b.title}
              </Link>
            )}
            <p className="truncate text-xs text-muted">{b.context}</p>
          </div>
          <button
            type="button"
            onClick={() => store.toggleBookmark(b.key)}
            className="shrink-0 rounded px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-ink"
            aria-label={`Remove bookmark: ${b.title}`}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
