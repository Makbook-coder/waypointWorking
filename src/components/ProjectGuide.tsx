"use client";

import { useId, useState } from "react";
import { store } from "@/lib/store";
import { SIZE_LABEL, projectProgress, type ProjectSrc } from "@/lib/projects";
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
  const hours = p.minutes >= 90 ? `${Math.round(p.minutes / 60)} h` : `${p.minutes} min`;
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="rounded-lg border border-line bg-surface" style={p.size === "capstone" ? { borderLeft: `4px solid ${color ?? "var(--ink)"}` } : undefined}>
      <summary className="cursor-pointer list-none p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{SIZE_LABEL[p.size]}</Badge>
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Build it, step by step</p>
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
        <div className="rounded-md border-l-4 border-strong-line bg-surface-2 p-3">
          <span className="font-semibold">You should see: </span>
          <InlineCode text={p.expected} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Done check</p>
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
