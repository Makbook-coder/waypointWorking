"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Rung } from "@/lib/hints";
import { InlineCode } from "./InlineCode";

/**
 * "Stuck? start here": reveals one rung at a time (hint 1, hint 2, then the answer).
 * `last` replaces the final rung's text when the answer needs custom rendering, like code.
 */
export function StuckLadder({ rungs, last, resetKey, onReveal }: { rungs: Rung[]; last?: ReactNode; resetKey?: string; onReveal?: (shown: number) => void }) {
  const [shown, setShown] = useState(0);
  useEffect(() => setShown(0), [resetKey]);
  if (rungs.length === 0) return null;
  const next = rungs[shown];

  function reveal() {
    const n = shown + 1;
    setShown(n);
    onReveal?.(n);
  }

  return (
    <div className="mt-3 rounded-md border border-dashed border-line p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">Stuck? Start here</p>
        <div className="flex gap-2">
          {next && (
            <button type="button" className="text-sm underline underline-offset-2" onClick={reveal}>
              Show {next.label.toLowerCase()}
            </button>
          )}
          {shown > 0 && (
            <button type="button" className="text-sm text-muted underline underline-offset-2" onClick={() => setShown(0)}>
              Hide
            </button>
          )}
        </div>
      </div>
      {shown === 0 && <p className="mt-1 text-sm text-muted">Try for a few minutes first. Each click shows a bit more, so you only take the help you need.</p>}
      <ol className="mt-1 space-y-2" aria-live="polite">
        {rungs.slice(0, shown).map((r, i) => (
          <li key={r.label} className="rounded bg-surface-2 p-3 text-base leading-7">
            <span className="font-semibold">{r.label}: </span>
            {i === rungs.length - 1 && last ? (
              last
            ) : (
              <>
                <InlineCode text={r.text} />
                {r.list && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {r.list.map((x) => (
                      <li key={x}>
                        <InlineCode text={x} />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
