"use client";

import { useState } from "react";
import { getModule } from "@/lib/data";
import Link from "next/link";
import { SURENESS_LABEL, type Sureness } from "@/lib/mistake-log";
import { store } from "@/lib/store";
import type { QuizItem } from "@/lib/types";
import { BookmarkButton } from "./BookmarkButton";
import { buttonClass, ghostButtonClass } from "./ui";
import { WrongAnswerHelp } from "./WrongAnswerHelp";

const LETTERS = ["A", "B", "C", "D"];

function topicIdsOf(moduleId: string) {
  return getModule(moduleId)?.topics.map((t) => t.id) ?? [];
}

/** Runs a list of quiz questions one at a time and reports a score at the end. */
export function QuizRunner({
  items,
  title = "Quiz",
  showModule = false,
  onRestart,
  bookmarks = true,
}: {
  items: QuizItem[];
  title?: string;
  showModule?: boolean;
  onRestart?: () => void;
  bookmarks?: boolean; // off for AI-generated questions, which bookmarks can't resolve
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null); // picked but not checked yet
  const [sureness, setSureness] = useState<Sureness | undefined>();
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (items.length === 0) return <p className="text-sm text-muted">No questions match.</p>;

  const q = items[index];
  const answered = choice !== null;

  /** Check the selected option. The sureness rating is optional. */
  function check(rating?: Sureness) {
    if (answered || selected === null) return;
    setChoice(selected);
    setSureness(rating);
    const correct = selected === q.answer;
    if (correct) setScore((s) => s + 1);
    store.recordQuiz(q.id, correct, topicIdsOf(q.moduleId), { picked: selected, sureness: rating });
  }

  function next() {
    if (index + 1 >= items.length) setFinished(true);
    else {
      setIndex(index + 1);
      setChoice(null);
      setSelected(null);
      setSureness(undefined);
    }
  }

  function restart() {
    setIndex(0);
    setChoice(null);
    setSelected(null);
    setSureness(undefined);
    setScore(0);
    setFinished(false);
    onRestart?.();
  }

  if (finished)
    return (
      <div className="rounded-lg border border-line bg-surface p-6 text-center" role="status">
        <p className="text-sm uppercase tracking-wider text-muted">{title} complete</p>
        <p className="num mt-2 text-4xl font-bold">
          {score}/{items.length}
        </p>
        <p className="mt-2 text-sm text-muted">Wrong answers bring the related topics back into your review queue sooner.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" className={buttonClass} onClick={restart}>
            {onRestart ? "New set" : "Try again"}
          </button>
          {score < items.length && (
            <Link href="/mistakes" className={ghostButtonClass}>
              Review your mistakes
            </Link>
          )}
        </div>
      </div>
    );

  const mod = getModule(q.moduleId);
  return (
    <div className="rounded-lg border border-line bg-surface p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span className="num">
          Question {index + 1} of {items.length} · {q.difficulty}
          {showModule && mod ? ` · ${mod.id} ${mod.title}` : ""}
        </span>
        {bookmarks && <BookmarkButton itemKey={`practice:${q.id}`} label={q.question} compact />}
      </div>
      <h3 className="text-lg font-semibold leading-snug" id={`q-${q.id}`}>
        {q.question}
      </h3>
      <ul className="mt-4 space-y-2" role="list" aria-labelledby={`q-${q.id}`}>
        {q.options.map((opt, i) => {
          const isAnswer = i === q.answer;
          const isChoice = i === choice;
          let tone = "border-line hover:border-strong-line";
          if (answered && isAnswer) tone = "border-good bg-good/10";
          else if (answered && isChoice) tone = "border-bad bg-bad/10";
          else if (!answered && i === selected) tone = "border-ink bg-surface-2";
          return (
            <li key={i}>
              <button
                type="button"
                disabled={answered}
                onClick={() => setSelected(i)}
                aria-pressed={!answered ? i === selected : undefined}
                className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm disabled:cursor-default ${tone}`}
              >
                <span className="font-mono text-xs font-semibold text-muted">{LETTERS[i]}</span>
                <span className="flex-1">{opt}</span>
                {answered && isAnswer && <span className="text-xs font-semibold text-good">Correct</span>}
                {answered && isChoice && !isAnswer && <span className="text-xs font-semibold text-bad">Your answer</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {!answered && selected !== null && (
        <div className="mt-4 rounded-md bg-surface-2 p-3">
          <p className="text-sm font-medium">How sure are you? Then your answer is checked.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([1, 2, 3] as const).map((r) => (
              <button key={r} type="button" className={ghostButtonClass} onClick={() => check(r)}>
                {SURENESS_LABEL[r]}
              </button>
            ))}
            <button type="button" className="px-2 text-sm text-muted underline underline-offset-2 hover:text-ink" onClick={() => check()}>
              Just check
            </button>
          </div>
        </div>
      )}
      <div aria-live="polite">
        {answered && (
          <div className="mt-4 rounded-md bg-surface-2 p-3 text-sm">
            <p className={`font-semibold ${choice === q.answer ? "text-good" : "text-bad"}`}>{choice === q.answer ? "Right." : "Not quite."}</p>
            {choice !== q.answer && sureness === 3 && (
              <p className="mt-1 text-xs text-muted">You were certain, so this one is worth a second look. It&apos;s saved in your mistakes.</p>
            )}
            <p className="mt-1">{q.explanation}</p>
            {choice !== q.answer && <WrongAnswerHelp item={q} picked={choice ?? undefined} />}
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" className={answered ? buttonClass : ghostButtonClass} disabled={!answered} onClick={next}>
          {index + 1 >= items.length ? "See score" : "Next question"}
        </button>
      </div>
    </div>
  );
}
