"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getModule, levels, moduleHref } from "@/lib/data";
import { companyCounts, filterSourced, sourcedItems, sourcedStats, type SourcedFilter } from "@/lib/sourced";
import { InterviewCard } from "./InterviewCard";
import { Card, EmptyState, ghostButtonClass, inputClass } from "./ui";

const PAGE = 20;
const companies = companyCounts(sourcedItems);
const stats = sourcedStats(sourcedItems, []);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
      {label}
      <span className="flex flex-col normal-case tracking-normal">{children}</span>
    </label>
  );
}

/** Browse the sourced interview questions, filtered by company, level, difficulty and format. */
export function SourcedInterviews() {
  const [f, setF] = useState<Required<SourcedFilter>>({ company: "all", levelId: "all", difficulty: "all", format: "all", text: "" });
  const [shown, setShown] = useState(PAGE);
  const set = (patch: Partial<typeof f>) => {
    setF((x) => ({ ...x, ...patch }));
    setShown(PAGE);
  };
  const list = useMemo(() => filterSourced(sourcedItems, f), [f]);

  return (
    <div className="space-y-6">
      <p className="num text-sm text-muted">
        {stats.items} questions and scenarios from {stats.companies} companies. A company badge means the linked public source says that company asked it.
      </p>
      <Card>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Filters" onSubmit={(e) => e.preventDefault()}>
          <Field label="Company">
            <select className={inputClass} value={f.company} onChange={(e) => set({ company: e.target.value })}>
              <option value="all">All companies</option>
              {companies.map((c) => (
                <option key={c.company} value={c.company}>
                  {c.company} ({c.count})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Level">
            <select className={inputClass} value={String(f.levelId)} onChange={(e) => set({ levelId: e.target.value === "all" ? "all" : Number(e.target.value) })}>
              <option value="all">All levels</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  L{l.id} {l.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Difficulty">
            <select className={inputClass} value={f.difficulty} onChange={(e) => set({ difficulty: e.target.value as typeof f.difficulty })}>
              <option value="all">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </Field>
          <Field label="Type">
            <select className={inputClass} value={f.format} onChange={(e) => set({ format: e.target.value as typeof f.format })}>
              <option value="all">Questions and scenarios</option>
              <option value="question">Questions</option>
              <option value="scenario">Scenarios</option>
            </select>
          </Field>
          <Field label="Search">
            <input className={inputClass} type="search" value={f.text} placeholder="e.g. KV cache" onChange={(e) => set({ text: e.target.value })} />
          </Field>
        </form>
        <p className="num mt-3 text-xs text-muted" aria-live="polite">
          {list.length} match{list.length === 1 ? "" : "es"}
        </p>
      </Card>

      {list.length === 0 ? (
        <EmptyState>Nothing matches these filters.</EmptyState>
      ) : (
        <div className="max-w-3xl space-y-4">
          {list.slice(0, shown).map((q) => {
            const m = getModule(q.moduleId);
            return (
              <div key={q.id}>
                <InterviewCard item={q} context={m ? `${m.id} ${m.title}` : q.moduleId} />
                <Link href={`${moduleHref(q.moduleId)}#practice`} className="mt-1 inline-block text-xs text-muted underline underline-offset-2 hover:text-ink">
                  Open module
                </Link>
              </div>
            );
          })}
          {shown < list.length && (
            <button type="button" className={ghostButtonClass} onClick={() => setShown((n) => n + PAGE)}>
              Show more ({list.length - shown} left)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
