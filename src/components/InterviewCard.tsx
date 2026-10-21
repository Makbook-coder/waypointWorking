"use client";

import { useEffect, useId, useState } from "react";
import { SCORE_LABELS, suggestScore } from "@/lib/interview";
import { store } from "@/lib/store";
import type { SourcedInterviewItem } from "@/lib/sourced";
import type { InterviewItem } from "@/lib/types";
import { useUserState } from "@/lib/use-store";
import { BookmarkButton } from "./BookmarkButton";
import { Badge, buttonClass, ghostButtonClass } from "./ui";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Answer in your own words (optional), reveal the model answer, tick the key points you covered,
 * then self-score 1 to 5. With `timerSeconds` it shows a countdown; it never auto-submits.
 */
export function InterviewCard({
  item,
  context,
  timerSeconds,
  onScored,
}: {
  item: InterviewItem | SourcedInterviewItem;
  context?: string;
  timerSeconds?: number;
  onScored?: (score: number) => void;
}) {
  const history = useUserState().interview[item.id] ?? [];
  const last = history[history.length - 1];
  const uid = useId();
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [covered, setCovered] = useState<boolean[]>(() => item.keyPoints.map(() => false));
  const [scored, setScored] = useState<number | null>(null);
  const [left, setLeft] = useState(timerSeconds ?? null);

  useEffect(() => {
    setAnswer("");
    setRevealed(false);
    setCovered(item.keyPoints.map(() => false));
    setScored(null);
    setLeft(timerSeconds ?? null);
  }, [item.id, item.keyPoints, timerSeconds]);

  useEffect(() => {
    if (left === null || left <= 0 || revealed) return;
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left, revealed]);

  const sourced = "companies" in item ? item : null;
  const nCovered = covered.filter(Boolean).length;
  const suggested = suggestScore(nCovered, item.keyPoints.length);

  function score(n: number) {
    store.recordInterview(item.id, n, answer);
    setScored(n);
    onScored?.(n);
  }

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge>interview</Badge>
            <Badge>{item.difficulty}</Badge>
            {sourced?.format === "scenario" && <Badge>scenario</Badge>}
            {sourced?.companies.map((c) => (
              <Badge key={c} title={`Asked at ${c}, per the linked source`}>
                {c}
              </Badge>
            ))}
            {last && <Badge title={`Last self-score ${last.score} out of 5`}>last {last.score}/5</Badge>}
            {context && <span className="text-xs text-muted">{context}</span>}
          </div>
          <h3 className="font-semibold leading-snug">{item.question}</h3>
        </div>
        <BookmarkButton itemKey={`practice:${item.id}`} label={item.question} compact />
      </div>

      {left !== null && (
        <p className={`num mt-2 text-sm font-semibold ${left === 0 ? "text-bad" : "text-muted"}`} role="timer" aria-live={left === 0 ? "assertive" : "off"}>
          {left === 0 ? "Time's up. Wrap up your answer." : `${fmt(left)} left`}
        </p>
      )}

      <label htmlFor={`${uid}-a`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
        Your answer (optional)
      </label>
      <textarea
        id={`${uid}-a`}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        placeholder="Answer as you would out loud. It's saved with your score, only in this browser."
        className="mt-1 w-full resize-y rounded-md border border-line bg-surface-2 p-3 text-sm text-ink placeholder:text-muted"
      />

      {!revealed ? (
        <button type="button" className={`${buttonClass} mt-3`} onClick={() => setRevealed(true)}>
          Show model answer
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-md border-l-4 border-strong-line bg-surface-2 p-3 text-sm leading-relaxed">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Model answer</p>
            {item.answer}
          </div>
          {sourced && (
            <p className="text-xs text-muted">
              Source:{" "}
              <a href={sourced.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                {sourced.source.title}
              </a>
              {sourced.role ? ` · role: ${sourced.role}` : ""}
            </p>
          )}
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted">Which key points did you cover?</legend>
            <ul className="mt-1 space-y-1.5">
              {item.keyPoints.map((k, i) => (
                <li key={k} className="flex items-start gap-2">
                  <input
                    id={`${uid}-k${i}`}
                    type="checkbox"
                    checked={covered[i]}
                    onChange={(e) => setCovered((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]"
                  />
                  <label htmlFor={`${uid}-k${i}`} className="cursor-pointer text-sm">
                    {k}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <div role="group" aria-label="Self-score">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Score yourself · suggested <span className="num">{suggested}</span>
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={scored === n}
                  onClick={() => score(n)}
                  disabled={scored !== null}
                  className={`${ghostButtonClass} aria-pressed:border-strong-line aria-pressed:bg-ink aria-pressed:text-bg ${n === suggested && scored === null ? "border-strong-line" : ""}`}
                >
                  <span className="num font-semibold">{n}</span> {SCORE_LABELS[n]}
                </button>
              ))}
            </div>
            {scored !== null && <p className="mt-2 text-sm text-muted" aria-live="polite">Saved. {history.length > 1 ? `Your scores so far: ${history.map((h) => h.score).join(" → ")}` : ""}</p>}
          </div>
        </div>
      )}
    </article>
  );
}
