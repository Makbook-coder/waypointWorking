"use client";

import { useId } from "react";
import { store } from "@/lib/store";
import type { MiniProjectItem } from "@/lib/types";
import { useUserState } from "@/lib/use-store";
import { buildLadder } from "@/lib/hints";
import { BookmarkButton } from "./BookmarkButton";
import { StuckLadder } from "./StuckLadder";
import { Badge, ProgressBar } from "./ui";

/** A per-module build: one step per topic. Steps share projectChecks; "complete" shares exercises. */
export function MiniProjectCard({ item, context, color }: { item: MiniProjectItem; context?: string; color?: string }) {
  const s = useUserState();
  const uid = useId();
  const checked = item.steps.map((_, i) => Boolean(s.projectChecks[`${item.id}#${i}`]));
  const n = checked.filter(Boolean).length;
  const complete = Boolean(s.exercises[item.id]);
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge>mini project</Badge>
            <Badge>{item.difficulty}</Badge>
            {complete && <Badge title="Marked complete">✓ done</Badge>}
            {context && <span className="text-xs text-muted">{context}</span>}
          </div>
          <h3 className="font-semibold">{item.title}</h3>
        </div>
        <BookmarkButton itemKey={`practice:${item.id}`} label={item.title} compact />
      </div>
      <p className="mt-2 text-sm leading-relaxed">{item.brief}</p>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar pct={Math.floor((n / item.steps.length) * 100)} color={color} label={`${item.title} steps`} size="sm" />
        <span className="num shrink-0 text-xs text-muted">
          {n}/{item.steps.length}
        </span>
      </div>
      <ol className="mt-3 space-y-2">
        {item.steps.map((step, i) => {
          const id = `${uid}-s${i}`;
          return (
            <li key={step} className="flex items-start gap-2">
              <input id={id} type="checkbox" checked={checked[i]} onChange={(e) => store.setProjectCheck(item.id, i, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]" />
              <label htmlFor={id} className={`cursor-pointer text-sm ${checked[i] ? "text-muted line-through" : ""}`}>
                <span className="num mr-1 text-muted">{i + 1}.</span>
                {step}
              </label>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 rounded-md border-l-4 border-strong-line bg-surface-2 p-3 text-sm">
        <span className="font-semibold">Done when: </span>
        {item.doneWhen}
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted">How to set this up on your computer (or in Colab)</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>Make a folder for it and open a terminal there.</li>
          <li>
            Create a virtual environment: <code className="font-mono">python -m venv .venv</code>, then activate it (<code className="font-mono">source .venv/bin/activate</code>, or <code className="font-mono">.venv\Scripts\activate</code> on Windows).
          </li>
          <li>Install only what a step needs, one package at a time, and write it into requirements.txt.</li>
          <li>Start with one file, main.py, and get step 1 printing something before you touch step 2.</li>
          <li>If an API key is needed, put it in a .env file that is listed in .gitignore, never in the code.</li>
          <li>No setup at all: open colab.new and do each step in its own cell.</li>
        </ol>
      </details>
      <StuckLadder rungs={buildLadder(item)} resetKey={item.id} />
      <div className="mt-3 flex items-center gap-2">
        <input id={`${uid}-done`} type="checkbox" checked={complete} onChange={(e) => store.setExerciseDone(item.id, e.target.checked)} className="h-5 w-5 cursor-pointer accent-[var(--ink)]" />
        <label htmlFor={`${uid}-done`} className="cursor-pointer text-sm">
          Project complete
        </label>
      </div>
    </article>
  );
}
