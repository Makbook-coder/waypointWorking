"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GlossaryEntry } from "@/lib/glossary";
import { InlineCode } from "./InlineCode";
import { EmptyState, inputClass } from "./ui";

type Entry = GlossaryEntry & { moduleLabel: string; moduleHref: string };

const letterOf = (term: string) => {
  const c = term.replace(/^\W+/, "").charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
};

export function GlossaryBrowser({ entries }: { entries: Entry[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((e) => [e.term, ...e.aliases, e.plain].some((s) => s.toLowerCase().includes(needle)));
  }, [entries, q]);
  const letters = [...new Set(entries.map((e) => letterOf(e.term)))];
  const groups = letters.map((l) => [l, shown.filter((e) => letterOf(e.term) === l)] as const).filter(([, list]) => list.length > 0);

  return (
    <div>
      <div className="sticky top-[57px] z-10 -mx-4 mb-4 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <label htmlFor="glossary-q" className="sr-only">
          Search the glossary
        </label>
        <input
          id="glossary-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${entries.length} terms`}
          className={`${inputClass} w-full max-w-md`}
        />
        {!q && (
          <nav aria-label="Jump to letter" className="mt-2 flex flex-wrap gap-1 text-sm">
            {letters.map((l) => (
              <a key={l} href={`#letter-${l}`} className="rounded px-1.5 py-0.5 font-mono text-muted hover:bg-surface-2 hover:text-ink">
                {l}
              </a>
            ))}
          </nav>
        )}
      </div>
      {groups.length === 0 && <EmptyState>No term matches “{q}”.</EmptyState>}
      <div className="space-y-8">
        {groups.map(([letter, list]) => (
          <section key={letter} aria-labelledby={`letter-${letter}`}>
            <h2 id={`letter-${letter}`} className="mb-2 scroll-mt-40 font-mono text-lg font-bold text-muted">
              {letter}
            </h2>
            <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
              {list.map((e) => (
                <div key={e.slug} id={e.slug} className="scroll-mt-40 p-4 target:bg-surface-2">
                  <dt className="font-semibold">{e.term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed">
                    <InlineCode text={e.plain} />
                    {e.aliases.length > 0 && <span className="mt-1 block text-xs text-muted">Also written: {e.aliases.join(", ")}</span>}
                    <Link href={e.moduleHref} className="mt-1 block w-fit text-xs text-muted underline underline-offset-2 hover:text-ink">
                      Learn it in {e.moduleLabel}
                    </Link>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
