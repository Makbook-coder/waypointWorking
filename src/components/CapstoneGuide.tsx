"use client";

import { useId } from "react";
import { RUBRIC_SCALE, getCapstone, milestoneKey, milestoneProgress, rubricFor, rubricResult } from "@/lib/capstones";
import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import { ProgressBar } from "./ui";

/** Milestones with tasks, then a 1–4 self-review rubric, for one level project. */
export function CapstoneGuide({ levelId, projectId, color }: { levelId: number; projectId: string; color?: string }) {
  const s = useUserState();
  const uid = useId();
  const c = getCapstone(levelId);
  if (!c) return null;
  const prog = milestoneProgress(c, projectId, s);
  const review = rubricResult(c, projectId, s);
  const criteria = rubricFor(c);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-semibold">Milestone plan</h4>
          <span className="text-xs text-muted">about {c.days} focused days</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <ProgressBar pct={prog.total ? Math.floor((prog.done / prog.total) * 100) : 0} color={color} label="Milestone tasks done" size="sm" />
          <span className="num shrink-0 text-xs text-muted">
            {prog.done}/{prog.total}
          </span>
        </div>
        <ol className="mt-3 space-y-3">
          {c.milestones.map((m, i) => (
            <li key={m.title} className="rounded-md border border-line p-3">
              <p className="text-sm font-semibold">
                <span className="num text-muted">{i + 1}.</span> {m.title}
              </p>
              <ul className="mt-2 space-y-1.5">
                {m.tasks.map((t, j) => {
                  const id = `${uid}-m${i}-${j}`;
                  const key = milestoneKey(projectId, i);
                  const checked = Boolean(s.projectChecks[`${key}#${j}`]);
                  return (
                    <li key={t} className="flex items-start gap-2">
                      <input id={id} type="checkbox" checked={checked} onChange={(e) => store.setProjectCheck(key, j, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]" />
                      <label htmlFor={id} className={`cursor-pointer text-sm ${checked ? "text-muted line-through" : ""}`}>
                        {t}
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-muted">
                <span className="font-semibold">Checkpoint:</span> {m.checkpoint}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-semibold">Self-review rubric</h4>
          {review.scored > 0 && (
            <span className="num text-xs text-muted">
              {review.pct}% · {review.scored}/{review.total} scored
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">Score honestly when you think you&apos;re done. Anything below Solid is your next task. Better still, ask someone else to score it too.</p>
        <ul className="mt-3 space-y-3">
          {criteria.map((cr, i) => {
            const cur = s.rubrics[`${projectId}#${i}`];
            return (
              <li key={cr.name} className="text-sm">
                <fieldset>
                  <legend className="font-medium">{cr.name}</legend>
                  <p className="text-xs text-muted">Strong: {cr.strong}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {RUBRIC_SCALE.map((label, k) => (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={cur === k + 1}
                        onClick={() => store.setRubric(projectId, i, cur === k + 1 ? null : k + 1)}
                        className={`rounded-md border px-2 py-0.5 text-xs ${cur === k + 1 ? "border-strong-line bg-ink text-bg" : "border-line hover:border-strong-line"}`}
                      >
                        {k + 1} {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
