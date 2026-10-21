"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import type { ScenarioItem } from "@/lib/types";
import { BookmarkButton } from "./BookmarkButton";
import { Badge, ghostButtonClass } from "./ui";

function useCountdown(seconds: number | null) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return left;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** An open-ended scenario. In interview mode it has a timer; hints stay hidden until asked for. */
export function ScenarioCard({ item, context, timerSeconds = null }: { item: ScenarioItem; context?: string; timerSeconds?: number | null }) {
  const history = useUserState().scenarios[item.id] ?? [];
  const last = history[history.length - 1];
  const [showHints, setShowHints] = useState(false);
  const [started, setStarted] = useState(timerSeconds === null);
  const left = useCountdown(started ? timerSeconds : null);

  useEffect(() => {
    setShowHints(false);
    setStarted(timerSeconds === null);
  }, [item.id, timerSeconds]);

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge>scenario</Badge>
            <Badge>{item.difficulty}</Badge>
            {context && <span className="text-xs text-muted">{context}</span>}
          </div>
          <h3 className="font-semibold">{item.title}</h3>
        </div>
        <BookmarkButton itemKey={`practice:${item.id}`} label={item.title} compact />
      </div>

      {timerSeconds !== null && (
        <div className="mt-3 flex items-center gap-3">
          {!started ? (
            <button type="button" className={ghostButtonClass} onClick={() => setStarted(true)}>
              Start {fmt(timerSeconds)} timer
            </button>
          ) : (
            <span role="timer" aria-live="off" className={`num rounded-md border px-3 py-1 font-mono text-lg ${left === 0 ? "border-bad text-bad" : "border-line"}`}>
              {left === 0 ? "Time" : fmt(left ?? 0)}
            </span>
          )}
          <span className="text-xs text-muted">Answer out loud or in writing before revealing hints.</span>
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed">{item.prompt}</p>

      <button type="button" aria-expanded={showHints} className="mt-3 text-sm underline underline-offset-2" onClick={() => setShowHints((h) => !h)}>
        {showHints ? "Hide" : "Show"} what a strong answer covers
      </button>
      {showHints && (
        <ul className="mt-2 list-disc space-y-1 rounded-md bg-surface-2 py-3 pl-8 pr-3 text-sm">
          {item.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      <fieldset className="mt-4">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted">Self-score</legend>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => store.recordScenario(item.id, n)}
              aria-label={`Score ${n} out of 5`}
              aria-pressed={last?.score === n}
              className={`num h-8 w-8 rounded-md border text-sm ${last?.score === n ? "border-strong-line bg-ink text-bg" : "border-line hover:border-strong-line"}`}
            >
              {n}
            </button>
          ))}
          {history.length > 0 && (
            <span className="ml-2 text-xs text-muted">
              {history.length} attempt{history.length > 1 ? "s" : ""}, best {Math.max(...history.map((h) => h.score))}/5
            </span>
          )}
        </div>
      </fieldset>
    </article>
  );
}
