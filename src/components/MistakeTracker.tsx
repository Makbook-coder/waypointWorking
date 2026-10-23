"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getPracticeItem } from "@/lib/content-data";
import { getModule, moduleHref } from "@/lib/data";
import {
  MISS_REASONS,
  SURENESS_LABEL,
  FIX_STREAK,
  calibrationNote,
  calibrationRates,
  isOpen,
  isOverconfident,
  sortMistakes,
  type MistakeRecord,
  type Sureness,
} from "@/lib/mistake-log";
import { store } from "@/lib/store";
import type { QuizItem } from "@/lib/types";
import { useHydrated, useUserState } from "@/lib/use-store";
import { QuizRunner } from "./QuizRunner";
import { Badge, EmptyState, buttonClass, ghostButtonClass, inputClass } from "./ui";
import { WrongAnswerHelp } from "./WrongAnswerHelp";

const LETTERS = ["A", "B", "C", "D"];
const RETRY_SIZE = 10;

interface Row {
  id: string;
  item: QuizItem;
  record: MistakeRecord;
}

type Status = "open" | "fixed" | "all";

export function MistakeTracker() {
  const s = useUserState();
  const hydrated = useHydrated();
  const [status, setStatus] = useState<Status>("open");
  const [level, setLevel] = useState("all");
  const [certainOnly, setCertainOnly] = useState(false);
  const [retry, setRetry] = useState<QuizItem[] | null>(null);
  const [runKey, setRunKey] = useState(0);

  const rows = useMemo<Row[]>(() => {
    const generated = new Map<string, QuizItem>();
    for (const list of Object.values(s.generated)) for (const g of list) if (g.type === "quiz") generated.set(g.id, g);
    const out: Row[] = [];
    for (const [id, record] of Object.entries(s.mistakes)) {
      const found = getPracticeItem(id) ?? generated.get(id);
      if (found && found.type === "quiz") out.push({ id, item: found, record });
    }
    return sortMistakes(out);
  }, [s.mistakes, s.generated]);

  if (!hydrated) return null;

  const open = rows.filter((r) => isOpen(r.record));
  const levelIds = [...new Set(rows.map((r) => r.item.levelId))].sort((a, b) => a - b);
  const shown = rows.filter(
    (r) =>
      (status === "all" || (status === "open") === isOpen(r.record)) &&
      (level === "all" || r.item.levelId === Number(level)) &&
      (!certainOnly || isOverconfident(r.record)),
  );
  const note = calibrationNote(s.calibration);
  const rates = calibrationRates(s.calibration);

  function startRetry() {
    const pool = shown.filter((r) => isOpen(r.record));
    setRetry((pool.length ? pool : open).slice(0, RETRY_SIZE).map((r) => r.item));
    setRunKey((k) => k + 1);
  }

  if (retry)
    return (
      <div className="max-w-3xl">
        <QuizRunner key={runKey} items={retry} title="Mistake retry" showModule />
        <button type="button" className={`${ghostButtonClass} mt-4`} onClick={() => setRetry(null)}>
          Back to the list
        </button>
      </div>
    );

  if (rows.length === 0)
    return (
      <EmptyState>
        No mistakes yet. Missed quiz questions show up here, so you can come back and fix them. <Link href="/practice" className="underline underline-offset-2">Start a quiz</Link>.
      </EmptyState>
    );

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Still open" value={open.length} />
        <Stat label="Fixed" value={rows.length - open.length} />
        <Stat label="Missed when certain" value={open.filter((r) => isOverconfident(r.record)).length} />
        <Stat label="Total misses" value={rows.reduce((n, r) => n + r.record.misses, 0)} />
      </dl>

      {(note || Object.values(rates).some((r) => r !== null)) && (
        <section aria-labelledby="calib-h" className="rounded-lg border border-line bg-surface p-4 text-sm">
          <h2 id="calib-h" className="text-xs font-semibold uppercase tracking-wider text-muted">
            How sure you were vs how right you were
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {([1, 2, 3] as Sureness[]).map((k) => (
              <li key={k}>
                {SURENESS_LABEL[k]}: <span className="num font-semibold">{rates[k] === null ? "no data" : `${rates[k]}% right`}</span>
              </li>
            ))}
          </ul>
          {note && <p className="mt-2">{note}</p>}
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Show" className="flex gap-1">
          {(["open", "fixed", "all"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={status === k}
              onClick={() => setStatus(k)}
              className="rounded-md border border-line bg-surface px-3 py-1 text-sm capitalize aria-pressed:border-strong-line aria-pressed:bg-ink aria-pressed:text-bg"
            >
              {k}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
            <option value="all">All levels</option>
            {levelIds.map((l) => (
              <option key={l} value={l}>
                Level {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={certainOnly} onChange={(e) => setCertainOnly(e.target.checked)} />
          Only ones I was certain about
        </label>
        <button type="button" className={`${buttonClass} ml-auto`} onClick={startRetry} disabled={open.length === 0}>
          {open.length === 0 ? "Nothing to retry" : `Retry ${Math.min(RETRY_SIZE, (shown.some((r) => isOpen(r.record)) ? shown.filter((r) => isOpen(r.record)) : open).length)} open`}
        </button>
      </div>

      {shown.length === 0 ? (
        <EmptyState>Nothing matches these filters.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => (
            <MistakeCard key={r.id} row={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="num mt-1 text-2xl font-bold">{value}</dd>
    </div>
  );
}

function MistakeCard({ row }: { row: Row }) {
  const { item, record } = row;
  const mod = getModule(item.moduleId);
  const fixed = !isOpen(record);
  const reason = MISS_REASONS.find((r) => r.id === record.reason)?.label;
  return (
    <li className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        {mod && (
          <Link href={moduleHref(mod.id)} className="underline underline-offset-2 hover:text-ink">
            {mod.id} {mod.title}
          </Link>
        )}
        <Badge>{fixed ? "Fixed" : `${record.streak}/${FIX_STREAK} to fix`}</Badge>
        <Badge>Missed {record.misses}×</Badge>
        {record.sureness && <Badge title="How sure you were on the latest miss">{SURENESS_LABEL[record.sureness]}</Badge>}
        {reason && <Badge>{reason}</Badge>}
      </div>
      <h3 className="mt-2 font-semibold leading-snug">{item.question}</h3>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Show the answer</summary>
        <p className="mt-2">
          <span className="text-bad">You picked {LETTERS[record.picked]}:</span> {item.options[record.picked]}
        </p>
        <p className="mt-1">
          <span className="text-good">Right answer {LETTERS[item.answer]}:</span> {item.options[item.answer]}
        </p>
        <p className="mt-1 text-muted">{item.explanation}</p>
        <WrongAnswerHelp item={item} picked={record.picked} />
      </details>
      <div className="mt-2 text-right">
        <button type="button" className="text-xs text-muted underline underline-offset-2 hover:text-ink" onClick={() => store.clearMistake(row.id)}>
          Remove from list
        </button>
      </div>
    </li>
  );
}
