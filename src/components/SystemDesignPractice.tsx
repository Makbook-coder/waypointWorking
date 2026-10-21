"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getModule, moduleHref } from "@/lib/data";
import { DESIGN_CHECKLIST, systemDesignPrompts, type SystemDesignPrompt } from "@/lib/interview-prep";
import { Badge, Card, EmptyState, SectionTitle, buttonClass, ghostButtonClass, inputClass } from "./ui";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const companyOptions = [...new Set(systemDesignPrompts.flatMap((p) => p.companies))].sort();

/** Pick a design prompt, work through the shared checklist and the prompt's own must-cover points, then compare with an outline. */
export function SystemDesignPractice() {
  const [company, setCompany] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [text, setText] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const t = text.trim().toLowerCase();
    return systemDesignPrompts.filter(
      (p) =>
        (company === "all" || p.companies.includes(company)) &&
        (difficulty === "all" || p.difficulty === difficulty) &&
        (!t || p.title.toLowerCase().includes(t) || p.prompt.toLowerCase().includes(t) || p.companies.some((c) => c.toLowerCase().includes(t))),
    );
  }, [company, difficulty, text]);
  const open = systemDesignPrompts.find((p) => p.id === openId) ?? null;

  if (open) return <Session prompt={open} onClose={() => setOpenId(null)} />;

  return (
    <div className="space-y-6">
      <Card>
        <form className="grid gap-3 sm:grid-cols-3" aria-label="Filters" onSubmit={(e) => e.preventDefault()}>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
            Company
            <select className={`${inputClass} normal-case tracking-normal`} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="all">All prompts</option>
              {companyOptions.map((c) => (
                <option key={c} value={c}>
                  Asked at {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
            Difficulty
            <select className={`${inputClass} normal-case tracking-normal`} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="all">Any</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
            Search
            <input className={`${inputClass} normal-case tracking-normal`} type="search" value={text} placeholder="e.g. voice, RAG" onChange={(e) => setText(e.target.value)} />
          </label>
        </form>
        <p className="num mt-3 text-xs text-muted" aria-live="polite">
          {list.length} of {systemDesignPrompts.length} prompts
        </p>
      </Card>
      {list.length === 0 ? (
        <EmptyState>Nothing matches these filters.</EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {list.map((p) => (
            <li key={p.id} className="flex flex-col justify-between gap-3 rounded-lg border border-line bg-surface p-4">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge>{p.difficulty}</Badge>
                  {p.companies.map((c) => (
                    <Badge key={c} title={`Asked at ${c}, per the linked source`}>
                      {c}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-semibold leading-snug">{p.title}</h3>
                <p className="mt-1 text-sm text-muted">{p.prompt}</p>
              </div>
              <button type="button" className={`${buttonClass} self-start`} onClick={() => setOpenId(p.id)}>
                Practice this
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Session({ prompt: p, onClose }: { prompt: SystemDesignPrompt; onClose: () => void }) {
  const [general, setGeneral] = useState<Record<string, boolean>>({});
  const [specific, setSpecific] = useState<boolean[]>(() => p.mustCover.map(() => false));
  const [notes, setNotes] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [showOutline, setShowOutline] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const done = Object.values(general).filter(Boolean).length + specific.filter(Boolean).length;
  const total = DESIGN_CHECKLIST.length + p.mustCover.length;

  return (
    <section aria-label={p.title} className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className={ghostButtonClass} onClick={onClose}>
          All prompts
        </button>
        <div className="flex items-center gap-3">
          <p className="num text-sm font-semibold text-muted" role="timer">
            {fmt(seconds)}
          </p>
          <button type="button" className={ghostButtonClass} onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : seconds ? "Resume" : "Start timer"}
          </button>
        </div>
      </div>

      <Card>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge>{p.difficulty}</Badge>
          <Badge>{p.seniority}</Badge>
          {p.companies.map((c) => (
            <Badge key={c} title={`Asked at ${c}, per the linked source`}>
              {c}
            </Badge>
          ))}
        </div>
        <h2 className="text-xl font-bold tracking-tight">{p.title}</h2>
        <p className="mt-2">{p.prompt}</p>
        <p className="mt-2 text-xs text-muted">
          Source:{" "}
          <a href={p.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
            {p.source.title}
          </a>
          {p.role ? ` · role: ${p.role}` : ""}
        </p>
      </Card>

      <Card>
        <SectionTitle>
          Checklist · <span className="num">{done}</span>/<span className="num">{total}</span>
        </SectionTitle>
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted">Every design</legend>
          <ul className="mt-1 space-y-1.5">
            {DESIGN_CHECKLIST.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                <input
                  id={`g-${c.id}`}
                  type="checkbox"
                  checked={Boolean(general[c.id])}
                  onChange={(e) => setGeneral((g) => ({ ...g, [c.id]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]"
                />
                <label htmlFor={`g-${c.id}`} className="cursor-pointer text-sm">
                  {c.label} <span className="text-muted">· {c.hint}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <fieldset className="mt-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-muted">For this prompt</legend>
          <ul className="mt-1 space-y-1.5">
            {p.mustCover.map((m, i) => (
              <li key={m} className="flex items-start gap-2">
                <input
                  id={`s-${i}`}
                  type="checkbox"
                  checked={specific[i]}
                  onChange={(e) => setSpecific((x) => x.map((v, j) => (j === i ? e.target.checked : v)))}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]"
                />
                <label htmlFor={`s-${i}`} className="cursor-pointer text-sm">
                  {m}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </Card>

      <Card>
        <label htmlFor="sd-notes" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Your design notes (kept only on this page)
        </label>
        <textarea
          id="sd-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={8}
          placeholder="Requirements, components, data flow, trade-offs…"
          className="mt-1 w-full resize-y rounded-md border border-line bg-surface-2 p-3 text-sm text-ink placeholder:text-muted"
        />
        {!showOutline ? (
          <button type="button" className={`${buttonClass} mt-3`} onClick={() => setShowOutline(true)}>
            Show a strong-answer outline
          </button>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Outline</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                {p.outline.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Likely follow-ups</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {p.followUps.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted">
              Related modules:{" "}
              {p.moduleIds.map((id, i) => {
                const m = getModule(id);
                return (
                  <span key={id}>
                    {i > 0 && ", "}
                    <Link href={moduleHref(id)} className="underline underline-offset-2 hover:text-ink">
                      {m ? `${m.id} ${m.title}` : id}
                    </Link>
                  </span>
                );
              })}
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}
