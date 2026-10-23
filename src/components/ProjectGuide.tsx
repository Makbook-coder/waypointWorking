"use client";

import { useId, useState } from "react";
import { store } from "@/lib/store";
import { KIND_BLURB, KIND_LABEL, SIZE_LABEL, projectProgress, type ProjectSrc } from "@/lib/projects-ui";
import { useUserState } from "@/lib/use-store";
import { InlineCode } from "./InlineCode";
import { Badge, ProgressBar } from "./ui";

/** One project as a start-to-finish guide: numbered steps with help if stuck, expected output, done checks. */
export function ProjectGuide({ project: p, color, defaultOpen = false }: { project: ProjectSrc; color?: string; defaultOpen?: boolean }) {
  const s = useUserState();
  const uid = useId();
  const prog = projectProgress(p, s);
  // Open state is kept here so ticking a box never folds the guide shut under you.
  const [open, setOpen] = useState(defaultOpen);
  const tick = (i: number, checked: boolean) => store.setProjectCheck(p.id, i, checked);
  const kind = p.kind ?? "build";
  const hours = p.minutes >= 90 ? `${Math.round(p.minutes / 60)} h` : `${p.minutes} min`;
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="rounded-lg border border-line bg-surface" style={p.size === "capstone" ? { borderLeft: `4px solid ${color ?? "var(--ink)"}` } : undefined}>
      <summary className="cursor-pointer list-none p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{p.size === "practice" ? `Practice · ${KIND_LABEL[kind]}` : SIZE_LABEL[p.size]}</Badge>
          <Badge title="Rough focused time">~{hours}</Badge>
          {prog.finished && <Badge title="Every step and check ticked">✓ done</Badge>}
        </div>
        <h3 className="mt-1.5 font-semibold">{p.title}</h3>
        <p className="mt-1 text-sm text-muted">{p.goal}</p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar pct={Math.floor((prog.done / prog.total) * 100)} color={color} label={`${p.title} progress`} size="sm" />
          <span className="num shrink-0 text-xs text-muted">{prog.done}/{prog.total}</span>
        </div>
      </summary>
      <div className="space-y-5 border-t border-line p-4 text-sm leading-relaxed">
        {p.needs.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">You need</p>
            <p className="mt-0.5">{p.needs.join(" · ")}</p>
          </div>
        )}
        {kind !== "build" && <p className="text-muted">{KIND_BLURB[kind]}</p>}
        {p.starter && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Start from this</p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-surface-2 p-3 text-xs leading-relaxed"><code>{p.starter}</code></pre>
          </div>
        )}
        {p.steps.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{kind === "build" ? "Build it, step by step" : "Work through it"}</p>
          <ol className="mt-2 space-y-3">
            {p.steps.map((st, i) => {
              const checked = Boolean(s.projectChecks[`${p.id}#${i}`]);
              const id = `${uid}-s${i}`;
              return (
                <li key={i} className="flex items-start gap-2">
                  <input id={id} type="checkbox" checked={checked} onChange={(e) => tick(i, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]" />
                  <div className="min-w-0">
                    <label htmlFor={id} className={`cursor-pointer ${checked ? "text-muted line-through" : ""}`}>
                      <span className="num mr-1 text-muted">{i + 1}.</span>
                      <InlineCode text={st.do} />
                    </label>
                    <details className="mt-1 text-muted">
                      <summary className="cursor-pointer text-xs underline-offset-2 hover:underline">Stuck on step {i + 1}?</summary>
                      <p className="mt-1 rounded-md bg-surface-2 p-2"><InlineCode text={st.stuck} /></p>
                    </details>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        )}
        {p.hints && p.hints.length > 0 && <Hints hints={p.hints} />}
        <div className="rounded-md border-l-4 border-strong-line bg-surface-2 p-3">
          <span className="font-semibold">You should see: </span>
          <InlineCode text={p.expected} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{kind === "challenge" ? "Pass checks (tick only what you proved)" : "Done check"}</p>
          <ul className="mt-2 space-y-2">
            {p.done.map((d, j) => {
              const i = p.steps.length + j;
              const checked = Boolean(s.projectChecks[`${p.id}#${i}`]);
              const id = `${uid}-d${j}`;
              return (
                <li key={j} className="flex items-start gap-2">
                  <input id={id} type="checkbox" checked={checked} onChange={(e) => tick(i, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]" />
                  <label htmlFor={id} className={`cursor-pointer ${checked ? "text-muted line-through" : ""}`}><InlineCode text={d} /></label>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-muted"><span className="font-semibold text-ink">What comes next: </span><InlineCode text={p.next} /></p>
      </div>
    </details>
  );
}

/** Challenge hints, gentlest first, revealed one at a time so the learner tries before looking. */
function Hints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Hints, only when stuck</p>
      <ol className="mt-1 space-y-1">
        {hints.slice(0, shown).map((h, i) => (
          <li key={i} className="rounded-md bg-surface-2 p-2 text-muted"><span className="num mr-1">{i + 1}.</span><InlineCode text={h} /></li>
        ))}
      </ol>
      {shown < hints.length && (
        <button type="button" onClick={() => setShown(shown + 1)} className="mt-1 text-xs underline underline-offset-2 hover:text-ink">
          {shown === 0 ? "Show a hint" : "Show the next hint"} ({shown}/{hints.length})
        </button>
      )}
    </div>
  );
}
