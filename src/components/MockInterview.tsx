"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { allPractice } from "@/lib/content-data";
import { getModule, levels, moduleHref } from "@/lib/data";
import { companyCounts, filterSourced, sourcedItems } from "@/lib/sourced";
import { interviewSummary, mockAverage, pickMockQuestions } from "@/lib/interview";
import { store } from "@/lib/store";
import type { InterviewItem } from "@/lib/types";
import { useHydrated, useUserState } from "@/lib/use-store";
import { InterviewCard } from "./InterviewCard";
import { Card, EmptyState, SectionTitle, buttonClass, ghostButtonClass, inputClass } from "./ui";

const companyList = companyCounts(sourcedItems);
const bank = allPractice.filter((p): p is InterviewItem => p.type === "interview");
const ctx = (moduleId: string) => {
  const m = getModule(moduleId);
  return m ? `${m.id} ${m.title}` : moduleId;
};
const fmtAvg = (n: number | null) => (n === null ? "–" : n.toFixed(1));
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

type Run = { items: InterviewItem[]; scores: (number | null)[]; index: number; startedAt: string; seconds: number };

export function MockInterview() {
  const s = useUserState();
  const hydrated = useHydrated();
  const [level, setLevel] = useState<number | "all">("all");
  const [company, setCompany] = useState("all");
  const [count, setCount] = useState(5);
  const [seconds, setSeconds] = useState(180);
  const [run, setRun] = useState<Run | null>(null);
  const [finished, setFinished] = useState<Run | null>(null);

  const pool = useMemo(
    () => (company === "all" ? bank.filter((q) => level === "all" || q.levelId === level) : filterSourced(sourcedItems, { company, levelId: level })),
    [level, company],
  );
  const summary = useMemo(() => interviewSummary(bank, s), [s]);

  function start() {
    setFinished(null);
    const items = pickMockQuestions(pool, s, count);
    setRun({ items, scores: items.map(() => null), index: 0, startedAt: new Date().toISOString(), seconds });
  }

  function advance(r: Run) {
    if (r.index + 1 < r.items.length) {
      setRun({ ...r, index: r.index + 1 });
      return;
    }
    store.saveMock({ startedAt: r.startedAt, secondsPerQuestion: r.seconds, itemIds: r.items.map((i) => i.id), scores: r.scores.map((x) => x ?? 0) });
    setFinished(r);
    setRun(null);
  }

  if (!hydrated) return null;

  if (run) {
    const q = run.items[run.index];
    const scored = run.scores[run.index] !== null;
    return (
      <section aria-label="Mock interview in progress" className="max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="num text-sm font-semibold">
            Question {run.index + 1} of {run.items.length}
          </p>
          <button type="button" className={ghostButtonClass} onClick={() => setRun(null)}>
            End without saving
          </button>
        </div>
        <InterviewCard
          key={`${run.startedAt}-${q.id}`}
          item={q}
          context={ctx(q.moduleId)}
          timerSeconds={run.seconds || undefined}
          onScored={(n) => setRun((r) => (r ? { ...r, scores: r.scores.map((x, i) => (i === r.index ? n : x)) } : r))}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} disabled={!scored} onClick={() => advance(run)}>
            {run.index + 1 < run.items.length ? "Next question" : "Finish"}
          </button>
          {!scored && (
            <button type="button" className={ghostButtonClass} onClick={() => advance({ ...run, scores: run.scores.map((x, i) => (i === run.index ? 0 : x)) })}>
              Skip
            </button>
          )}
        </div>
      </section>
    );
  }

  const recent = [...s.mocks].reverse().slice(0, 10);

  return (
    <div className="space-y-8">
      {finished && (
        <Card className="max-w-3xl">
          <SectionTitle>Mock finished</SectionTitle>
          <p className="text-sm">
            Average <span className="num text-lg font-semibold">{fmtAvg(mockAverage({ scores: finished.scores.map((x) => x ?? 0) }))}</span> / 5 over{" "}
            <span className="num">{finished.scores.filter((x) => (x ?? 0) > 0).length}</span> answered questions.
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

      <Card className="max-w-3xl">
        <SectionTitle id="mock-setup">{finished ? "Start another" : "Start a mock interview"}</SectionTitle>
        <p className="mb-4 text-sm text-muted">
          Questions you scored low come first, then ones you haven&apos;t tried, then the rest. Answer in writing or out loud, reveal the model answer, tick the key points you hit, and score yourself.
        </p>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="mock-setup" onSubmit={(e) => { e.preventDefault(); start(); }}>
          <Field label="Levels">
            <select className={inputClass} value={String(level)} onChange={(e) => setLevel(e.target.value === "all" ? "all" : Number(e.target.value))}>
              <option value="all">All levels</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  L{l.id} {l.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Company">
            <select className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="all">Any (study bank)</option>
              {companyList.map((c) => (
                <option key={c.company} value={c.company}>
                  Asked at {c.company} ({c.count})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Questions">
            <select className={inputClass} value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[5, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Time per question">
            <select className={inputClass} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}>
              <option value={120}>2 minutes</option>
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={0}>No timer</option>
            </select>
          </Field>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
            <button type="submit" className={buttonClass} disabled={pool.length === 0}>
              Start · {Math.min(count, pool.length)} questions
            </button>
            <span className="num text-xs text-muted">{pool.length} in the pool</span>
          </div>
        </form>
      </Card>

      <section aria-labelledby="iv-progress" className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle id="iv-progress">Your question bank</SectionTitle>
          <dl className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Answered" value={`${summary.answered}/${summary.total}`} />
            <Stat label="Average" value={fmtAvg(summary.average)} />
            <Stat label="Scored 4+" value={String(summary.strong)} />
          </dl>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Weakest answers</p>
          {summary.weak.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Nothing scored 1 or 2. Questions you struggle with will show up here.</p>
          ) : (
            <ul className="mt-1 space-y-1 text-sm">
              {summary.weak.slice(0, 6).map((q) => (
                <li key={q.id}>
                  <Link href={`${moduleHref(q.moduleId)}#practice`} className="underline-offset-2 hover:underline">
                    {q.question}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <SectionTitle>Past mocks</SectionTitle>
          {recent.length === 0 ? (
            <EmptyState>Finished mocks are saved here with their average score.</EmptyState>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="py-1 font-semibold">Date</th>
                  <th scope="col" className="py-1 font-semibold">Questions</th>
                  <th scope="col" className="py-1 text-right font-semibold">Average</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m.id} className="border-t border-line">
                    <td className="py-1.5">{fmtDate(m.finishedAt)}</td>
                    <td className="num py-1.5">{m.itemIds.length}</td>
                    <td className="num py-1.5 text-right font-semibold">{fmtAvg(mockAverage(m))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
      {label}
      <span className="flex flex-col normal-case tracking-normal">{children}</span>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="num text-xl font-semibold">{value}</dd>
    </div>
  );
}
