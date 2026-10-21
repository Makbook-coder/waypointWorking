"use client";

import { useEffect, useId, useState } from "react";
import { aiBlocker, gradeAnswer, type AIBlocker, type Grade } from "@/lib/ai/tasks";
import { useAIRequest } from "@/lib/ai/use-ai";
import { MAX_ANSWER_LENGTH, store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import type { ScenarioItem } from "@/lib/types";
import { scenarioLadder } from "@/lib/hints";
import { AIBadge, AIBlockerNote, AIErrorNote, AIGradeResult } from "./AIKit";
import { BookmarkButton } from "./BookmarkButton";
import { StuckLadder } from "./StuckLadder";
import { TutorPanel } from "./TutorPanel";
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

const SCENARIO_STARTERS = ["Explain this scenario simply", "Where should I start?", "Give me a hint, not the answer", "What trade-offs matter here?"];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * An open-ended scenario. In interview mode it has a timer; hints stay hidden until asked for.
 * With an AI provider set up, a written answer can be graded against the hints.
 */
export function ScenarioCard({
  item,
  context,
  timerSeconds = null,
  generated = false,
  onRemove,
}: {
  item: ScenarioItem;
  context?: string;
  timerSeconds?: number | null;
  generated?: boolean; // written by the AI tutor
  onRemove?: () => void;
}) {
  const history = useUserState().scenarios[item.id] ?? [];
  const last = history[history.length - 1];
  const uid = useId();
  const ai = useAIRequest();
  const [showHints, setShowHints] = useState(false);
  const [started, setStarted] = useState(timerSeconds === null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [savedAI, setSavedAI] = useState(false);
  const [blocker, setBlocker] = useState<AIBlocker>(null);
  const [askOpen, setAskOpen] = useState(false);
  const left = useCountdown(started ? timerSeconds : null);

  useEffect(() => {
    setShowHints(false);
    setStarted(timerSeconds === null);
    setAnswer("");
    setGrade(null);
    setSavedAI(false);
    setBlocker(null);
    setAskOpen(false);
  }, [item.id, timerSeconds]);

  async function gradeIt() {
    const b = aiBlocker(ai.configured, answer);
    setBlocker(b);
    if (b) return;
    const g = await ai.run((p, signal) => gradeAnswer(p, { kind: "scenario", question: `${item.title}\n${item.prompt}`, keyPoints: item.hints, answer }, signal));
    if (g) {
      setGrade(g);
      setSavedAI(false);
      setShowHints(true);
    }
  }

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge>scenario</Badge>
            <Badge>{item.difficulty}</Badge>
            {generated && <AIBadge />}
            {context && <span className="text-xs text-muted">{context}</span>}
          </div>
          <h3 className="font-semibold">{item.title}</h3>
        </div>
        {generated ? (
          onRemove && (
            <button type="button" className="shrink-0 text-xs text-muted underline underline-offset-2 hover:text-ink" onClick={onRemove}>
              Remove
            </button>
          )
        ) : (
          <BookmarkButton itemKey={`practice:${item.id}`} label={item.title} compact />
        )}
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

      <label htmlFor={`${uid}-a`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
        Your answer (optional)
      </label>
      <textarea
        id={`${uid}-a`}
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value.slice(0, MAX_ANSWER_LENGTH));
          setBlocker(null);
        }}
        rows={3}
        placeholder="Sketch your approach: what you'd ask, decide and measure."
        className="mt-1 w-full resize-y rounded-md border border-line bg-surface-2 p-3 text-sm text-ink placeholder:text-muted"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={ghostButtonClass} disabled={ai.loading} onClick={gradeIt}>
          {ai.loading ? "Grading…" : grade ? "Grade again" : "Grade my answer with AI"}
        </button>
        <button type="button" className={ghostButtonClass} aria-expanded={askOpen} onClick={() => setAskOpen((o) => !o)}>
          Ask AI about this question
        </button>
      </div>
      <AIBlockerNote blocker={blocker} />
      {askOpen && (
        <div className="mt-3 rounded-md border border-line bg-bg p-3">
          <TutorPanel
            compact
            starters={SCENARIO_STARTERS}
            context={{
              title: `this interview scenario: "${item.title}"`,
              facts: [
                "The learner is preparing for AI engineering interviews. Coach them; if they ask for hints, don't hand over a full answer unless they ask for it.",
                `Scenario: ${item.prompt}`,
                `What a strong answer covers: ${item.hints.join("; ")}`,
                ...(answer.trim() ? [`The learner's draft answer so far: ${answer.trim()}`] : []),
              ],
            }}
          />
        </div>
      )}
      <AIErrorNote error={ai.error} />
      {grade && (
        <div className="mt-3">
          <AIGradeResult
            grade={grade}
            saved={savedAI}
            onSave={(n) => {
              store.recordScenario(item.id, n, { ai: true });
              setSavedAI(true);
            }}
          />
        </div>
      )}

      {showHints ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">What a strong answer covers</p>
          <ul className="mt-1 list-disc space-y-1 rounded-md bg-surface-2 py-3 pl-8 pr-3 text-sm">
            {item.hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      ) : (
        <StuckLadder rungs={scenarioLadder(item)} resetKey={item.id} />
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
