"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getModule, moduleHref } from "@/lib/data";
import { mockAverage, pickMockQuestions } from "@/lib/interview";
import { drillCompanies, filterSourced, sourcedItems, type SourcedInterviewItem } from "@/lib/sourced";
import { store } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import { InterviewCard } from "./InterviewCard";
import { Card, SectionTitle, buttonClass, ghostButtonClass, inputClass } from "./ui";

const companies = drillCompanies(sourcedItems, 5);
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Run = { company: string; items: SourcedInterviewItem[]; scores: (number | null)[]; index: number; startedAt: string; totalSeconds: number };

/** A timed set of questions that one company is reported to ask. The whole set shares one clock. */
export function CompanyDrill() {
  const s = useUserState();
  const hydrated = useHydrated();
  const [count, setCount] = useState(8);
  const [minutes, setMinutes] = useState(25);
  const [run, setRun] = useState<Run | null>(null);
  const [finished, setFinished] = useState<Run | null>(null);
  const [left, setLeft] = useState(0);

  const pools = useMemo(() => new Map(companies.map((c) => [c.company, filterSourced(sourcedItems, { company: c.company })])), []);

  function start(company: string) {
    const pool = pools.get(company) ?? [];
    const items = pickMockQuestions(pool, s, count);
    setFinished(null);
    setLeft(minutes * 60);
    setRun({ company, items, scores: items.map(() => null), index: 0, startedAt: new Date().toISOString(), totalSeconds: minutes * 60 });
  }

  function finish(r: Run) {
    if (r.scores.some((x) => x !== null)) {
      store.saveMock({ startedAt: r.startedAt, secondsPerQuestion: Math.round(r.totalSeconds / r.items.length), itemIds: r.items.map((i) => i.id), scores: r.scores.map((x) => x ?? 0) });
    }
    setFinished(r);
    setRun(null);
  }

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [run?.startedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (run && left === 0) finish(run);
  }, [run, left]);

  if (!hydrated) return null;

  if (run) {
    const q = run.items[run.index];
    const m = getModule(q.moduleId);
    const scored = run.scores[run.index] !== null;
    return (
      <section aria-label={`${run.company} drill in progress`} className="max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="num text-sm font-semibold">
            {run.company} · question {run.index + 1} of {run.items.length}
          </p>
          <p className={`num text-sm font-semibold ${left < 60 ? "text-bad" : "text-muted"}`} role="timer">
            {fmt(left)} left in the drill
          </p>
          <button type="button" className={ghostButtonClass} onClick={() => finish(run)}>
            End and save
          </button>
        </div>
        <InterviewCard
          key={`${run.startedAt}-${q.id}`}
          item={q}
          context={m ? `${m.id} ${m.title}` : q.moduleId}
          onScored={(n) => setRun((r) => (r ? { ...r, scores: r.scores.map((x, i) => (i === r.index ? n : x)) } : r))}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonClass}
            disabled={!scored}
            onClick={() => (run.index + 1 < run.items.length ? setRun({ ...run, index: run.index + 1 }) : finish(run))}
          >
            {run.index + 1 < run.items.length ? "Next question" : "Finish"}
          </button>
          {!scored && (
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => {
                const next = { ...run, scores: run.scores.map((x, i) => (i === run.index ? 0 : x)) };
                if (run.index + 1 < run.items.length) setRun({ ...next, index: run.index + 1 });
                else finish(next);
              }}
            >
              Skip
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {finished && (
        <Card className="max-w-3xl">
          <SectionTitle>{finished.company} drill finished</SectionTitle>
          <p className="text-sm">
            Average <span className="num text-lg font-semibold">{mockAverage({ scores: finished.scores.map((x) => x ?? 0) })?.toFixed(1) ?? "–"}</span> / 5 over{" "}
            <span className="num">{finished.scores.filter((x) => (x ?? 0) > 0).length}</span> of <span className="num">{finished.items.length}</span> questions. Saved with your past mocks.
          </p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {finished.items.map((q, i) => (
              <li key={q.id} className="flex gap-2">
                <span className="num w-8 shrink-0 font-semibold">{finished.scores[i] ? `${finished.scores[i]}/5` : "skip"}</span>
                <Link href={`${moduleHref(q.moduleId)}#practice`} className="underline-offset-2 hover:underline">
                  {q.question}
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <Card>
        <SectionTitle id="drill-setup">Choose a drill</SectionTitle>
        <p className="mb-4 max-w-2xl text-sm text-muted">
          Pick a company to get a timed set of questions its candidates have reported, with weak and unseen ones first. One clock runs for the whole set and ends it when time is up.
        </p>
        <div className="mb-4 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
            Questions
            <select className={`${inputClass} normal-case tracking-normal`} value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[5, 8, 12].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
            Time
            <select className={`${inputClass} normal-case tracking-normal`} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
              {[15, 25, 40].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-labelledby="drill-setup">
          {companies.map((c) => (
            <li key={c.company} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3">
              <div>
                <p className="font-semibold">{c.company}</p>
                <p className="num text-xs text-muted">
                  {c.count} questions · {c.hard} hard
                </p>
              </div>
              <button type="button" className={buttonClass} onClick={() => start(c.company)}>
                Start
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
