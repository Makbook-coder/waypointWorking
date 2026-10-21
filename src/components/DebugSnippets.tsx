"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getModule, moduleHref } from "@/lib/data";
import { debugSnippets, type DebugSnippet } from "@/lib/interview-prep";
import { Badge, Card, EmptyState, buttonClass, ghostButtonClass, inputClass } from "./ui";

/** Short Python snippets with a bug that mirrors a real LLM-app failure. Diagnose it, then reveal the answer. */
export function DebugSnippets() {
  const [difficulty, setDifficulty] = useState("all");
  const [result, setResult] = useState<Record<string, "found" | "missed">>({});
  const list = useMemo(() => debugSnippets.filter((s) => difficulty === "all" || s.difficulty === difficulty), [difficulty]);
  const found = Object.values(result).filter((r) => r === "found").length;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
            Difficulty
            <select className={`${inputClass} normal-case tracking-normal`} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="all">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <p className="num text-sm text-muted" aria-live="polite">
            {list.length} snippets · found {found} this session
          </p>
        </div>
      </Card>
      {list.length === 0 ? (
        <EmptyState>Nothing matches.</EmptyState>
      ) : (
        <div className="max-w-3xl space-y-4">
          {list.map((s) => (
            <Snippet key={s.id} s={s} result={result[s.id]} onResult={(r) => setResult((x) => ({ ...x, [s.id]: r }))} />
          ))}
        </div>
      )}
    </div>
  );
}

function Snippet({ s, result, onResult }: { s: DebugSnippet; result?: "found" | "missed"; onResult: (r: "found" | "missed") => void }) {
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [guess, setGuess] = useState("");
  const m = getModule(s.moduleId);
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge>{s.difficulty}</Badge>
        <Link href={moduleHref(s.moduleId)} className="text-xs text-muted underline underline-offset-2 hover:text-ink">
          {m ? `${m.id} ${m.title}` : s.moduleId}
        </Link>
        {result && <Badge>{result === "found" ? "found it" : "missed it"}</Badge>}
      </div>
      <h3 className="font-semibold leading-snug">{s.title}</h3>
      <p className="mt-1 text-sm">
        <span className="font-semibold">Symptom:</span> {s.symptom}
      </p>
      <pre className="mt-3 overflow-x-auto rounded-md bg-surface-2 p-3 text-xs leading-relaxed">
        <code>{s.code}</code>
      </pre>
      <label htmlFor={`${s.id}-guess`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
        What is wrong? (optional)
      </label>
      <textarea
        id={`${s.id}-guess`}
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        rows={2}
        className="mt-1 w-full resize-y rounded-md border border-line bg-surface-2 p-2 text-sm text-ink"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {!hint && !revealed && (
          <button type="button" className={ghostButtonClass} onClick={() => setHint(true)}>
            Show hint
          </button>
        )}
        {!revealed && (
          <button type="button" className={buttonClass} onClick={() => setRevealed(true)}>
            Reveal the bug
          </button>
        )}
      </div>
      {hint && !revealed && <p className="mt-2 text-sm text-muted">Hint: {s.hint}</p>}
      {revealed && (
        <div className="mt-3 space-y-3">
          <div className="rounded-md border-l-4 border-strong-line bg-surface-2 p-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">The bug{s.bugs.length > 1 ? "s" : ""}</p>
            <ul className="list-disc space-y-1 pl-5">
              {s.bugs.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">A fix</p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-surface-2 p-3 text-xs leading-relaxed">
              <code>{s.fixedCode}</code>
            </pre>
          </div>
          <p className="text-sm">{s.explanation}</p>
          {s.inspiredBy && <p className="text-xs text-muted">Inspired by: {s.inspiredBy}.</p>}
          {!result && (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="How did you do?">
              <span className="text-sm text-muted">Did you find it?</span>
              <button type="button" className={ghostButtonClass} onClick={() => onResult("found")}>
                Yes
              </button>
              <button type="button" className={ghostButtonClass} onClick={() => onResult("missed")}>
                No
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
