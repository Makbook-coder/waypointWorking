"use client";

import { useState } from "react";
import { getModule } from "@/lib/data";
import { store } from "@/lib/store";
import type { QuizItem } from "@/lib/types";
import { BookmarkButton } from "./BookmarkButton";
import { buttonClass, ghostButtonClass } from "./ui";

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
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (items.length === 0) return <p className="text-sm text-muted">No questions match.</p>;

  const q = items[index];
  const answered = choice !== null;

  function pick(i: number) {
    if (answered) return;
    setChoice(i);
    const correct = i === q.answer;
    if (correct) setScore((s) => s + 1);
    store.recordQuiz(q.id, correct, topicIdsOf(q.moduleId));
  }

  function next() {
    if (index + 1 >= items.length) setFinished(true);
    else {
      setIndex(index + 1);
      setChoice(null);
    }
  }

  function restart() {
    setIndex(0);
    setChoice(null);
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
        <button type="button" className={`${buttonClass} mt-4`} onClick={restart}>
          {onRestart ? "New set" : "Try again"}
        </button>
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
          return (
            <li key={i}>
              <button
                type="button"
                disabled={answered}
                onClick={() => pick(i)}
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
      <div aria-live="polite">
        {answered && (
          <div className="mt-4 rounded-md bg-surface-2 p-3 text-sm">
            <p className={`font-semibold ${choice === q.answer ? "text-good" : "text-bad"}`}>{choice === q.answer ? "Right." : "Not quite."}</p>
            <p className="mt-1">{q.explanation}</p>
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
