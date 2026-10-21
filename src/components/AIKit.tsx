"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { MIN_ANSWER_CHARS, reviewCode, type AIBlocker, type CodeReviewInput, type Grade } from "@/lib/ai/tasks";
import { useAIRequest, useAISettings } from "@/lib/ai/use-ai";
import { SCORE_LABELS } from "@/lib/interview";
import { buttonClass, ghostButtonClass } from "./ui";

/** Shown in place of an AI feature when no provider is set up. The app works fully without it. */
export function AISetupHint({ children = "Get AI feedback here" }: { children?: React.ReactNode }) {
  return (
    <p className="text-xs text-muted">
      {children}:{" "}
      <Link href="/settings#ai" className="underline underline-offset-2 hover:text-ink">
        add a free Gemini key in Settings
      </Link>
      .
    </p>
  );
}

/** Why an AI button didn't run: no provider yet, or nothing written to grade. */
export function AIBlockerNote({ blocker }: { blocker: AIBlocker }) {
  return (
    <div aria-live="polite">
      {blocker === "no-key" && (
        <p className="mt-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
          The AI tutor isn&apos;t set up yet.{" "}
          <Link href="/settings#ai" className="font-medium underline underline-offset-2">
            Add a free Gemini key in Settings
          </Link>{" "}
          (it takes a minute), then come back.
        </p>
      )}
      {blocker === "short-answer" && (
        <p className="mt-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
          Write your answer in the box first (at least a sentence, {MIN_ANSWER_CHARS}+ characters). To ask about the question itself, use{" "}
          <strong>Ask AI about this question</strong>.
        </p>
      )}
    </div>
  );
}

/** Which model answers, with a link to change it. */
export function AIModelTag() {
  const { model } = useAISettings();
  return (
    <Link href="/settings#ai" title="Change the AI model in Settings" className="font-mono text-[11px] text-muted underline-offset-2 hover:text-ink hover:underline">
      {model}
    </Link>
  );
}

export function AIErrorNote({ error }: { error: string | null }) {
  return <div aria-live="polite">{error && <p className="mt-2 rounded-md border border-bad px-3 py-2 text-sm text-bad">{error}</p>}</div>;
}

export function AIBadge() {
  return (
    <span title="Written by the AI tutor. It can be wrong." className="inline-flex items-center rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted">
      AI
    </span>
  );
}

/** Model output as markdown. react-markdown doesn't render raw HTML, so replies can't inject markup. */
export function AIMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[13px] [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-surface-2 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}

/** The AI's grade for a written answer, with a button to save its score into your history. */
export function AIGradeResult({ grade, onSave, saved }: { grade: Grade; onSave?: (score: number) => void; saved: boolean }) {
  return (
    <div className="rounded-md border border-strong-line bg-surface-2 p-3 text-sm" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <AIBadge />
        <p className="font-semibold">
          AI score <span className="num">{grade.score}/5</span> · {SCORE_LABELS[grade.score]}
        </p>
        <span className="ml-auto">
          <AIModelTag />
        </span>
      </div>
      {grade.verdict && <p className="mt-1">{grade.verdict}</p>}
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {grade.strengths.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">What worked</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">{grade.strengths.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        )}
        {grade.improvements.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">To improve</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">{grade.improvements.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        )}
      </div>
      {grade.comparison && (
        <>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted">Compared with the model answer</p>
          <p className="mt-0.5">{grade.comparison}</p>
        </>
      )}
      {onSave && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className={buttonClass} disabled={saved} onClick={() => onSave(grade.score)}>
            {saved ? "Saved" : `Save AI score ${grade.score}/5`}
          </button>
          {!saved && <span className="text-xs text-muted">Or pick your own score below. AI grading can be wrong.</span>}
        </div>
      )}
    </div>
  );
}

/** "Get a hint" for a coding task: the AI reviews the draft and nudges without giving the answer. */
export function AICodeHints({ input }: { input: CodeReviewInput }) {
  const ai = useAIRequest();
  const [hints, setHints] = useState<string | null>(null);
  if (!ai.configured) return <AISetupHint>Stuck? Get hints on your code from an AI tutor</AISetupHint>;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={ghostButtonClass}
          disabled={ai.loading}
          onClick={async () => {
            const r = await ai.run((p, signal) => reviewCode(p, input, signal));
            if (r) setHints(r);
          }}
        >
          {ai.loading ? "Reading your code…" : hints ? "Get another hint" : "Get a hint from AI"}
        </button>
        {ai.loading && (
          <button type="button" className="text-xs underline underline-offset-2" onClick={ai.cancel}>
            Cancel
          </button>
        )}
      </div>
      <AIErrorNote error={ai.error} />
      {hints && (
        <div className="mt-2 rounded-md border border-line bg-surface-2 p-3">
          <div className="mb-1 flex items-center gap-2">
            <AIBadge />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Hints, not answers</span>
            <span className="ml-auto">
              <AIModelTag />
            </span>
          </div>
          <AIMarkdown text={hints} />
        </div>
      )}
    </div>
  );
}
