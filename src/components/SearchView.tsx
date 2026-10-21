"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createIndex, noteDocs, staticDocs, type SearchKind } from "@/lib/search";
import { useHydrated, useUserState } from "@/lib/use-store";
import { Badge, EmptyState, inputClass } from "./ui";

const STATIC = staticDocs();
const KINDS: (SearchKind | "all")[] = ["all", "topic", "module", "note", "resource"];

export function SearchView() {
  const s = useUserState();
  const hydrated = useHydrated();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<SearchKind | "all">("all");
  const index = useMemo(() => createIndex([...STATIC, ...noteDocs(s)]), [s]);
  const results = useMemo(() => {
    const term = q.trim();
    if (term.length < 2) return [];
    return index
      .search(term, { limit: 200 })
      .map((r) => r.item)
      .filter((d) => kind === "all" || d.kind === kind)
      .slice(0, 60);
  }, [index, q, kind]);

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        type="search"
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try “rrf”, “lora”, “prompt injection”…"
        className={`${inputClass} w-full py-3 text-base`}
        disabled={!hydrated}
      />
      <div role="group" aria-label="Filter results" className="mt-3 flex flex-wrap gap-1">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className="rounded-md border border-line bg-surface px-3 py-1 text-sm capitalize aria-pressed:border-strong-line aria-pressed:bg-ink aria-pressed:text-bg"
          >
            {k === "all" ? "Everything" : `${k}s`}
          </button>
        ))}
      </div>
      <p className="num mt-4 text-sm text-muted" aria-live="polite">
        {q.trim().length < 2 ? "Type at least two characters." : `${results.length} result${results.length === 1 ? "" : "s"}`}
      </p>
      {q.trim().length >= 2 && results.length === 0 ? (
        <div className="mt-3">
          <EmptyState>No matches. Fuzzy search tolerates typos, so try a shorter word.</EmptyState>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface empty:hidden">
          {results.map((d) => (
            <li key={d.key} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <Badge>{d.kind}</Badge>
                <div className="min-w-0 flex-1">
                  {d.external ? (
                    <a href={d.href} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {d.title} <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link href={d.href} className="font-medium hover:underline">
                      {d.title}
                    </Link>
                  )}
                  <p className="text-xs text-muted">{d.context}</p>
                  {d.body && d.kind !== "resource" && <p className="mt-1 line-clamp-2 text-sm text-muted">{d.body}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
