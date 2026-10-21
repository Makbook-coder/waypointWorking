// Small presentational building blocks shared across pages (server-safe).
import type { ReactNode } from "react";
import { PHASE_STYLE } from "@/lib/phase";
import type { PhaseId } from "@/lib/types";

export function ProgressBar({ pct, color = "var(--ink)", label, size = "md" }: { pct: number; color?: string; label: string; size?: "sm" | "md" }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`w-full overflow-hidden rounded-full bg-surface-2 ${size === "sm" ? "h-1.5" : "h-2.5"}`}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function PhaseTag({ phase, title }: { phase: PhaseId; title: string }) {
  const s = PHASE_STYLE[phase];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.bg}`} aria-hidden="true" />
      Phase {s.n} · {title}
    </span>
  );
}

export function WeightBadges({ interview, job }: { interview: number; job: number }) {
  return (
    <span className="inline-flex gap-1.5">
      <Badge title={`Interview weight ${interview} out of 10`}>
        <span aria-hidden="true">INT</span> <span className="num font-semibold">{interview}</span>
      </Badge>
      <Badge title={`Job weight ${job} out of 10`}>
        <span aria-hidden="true">JOB</span> <span className="num font-semibold">{job}</span>
      </Badge>
    </span>
  );
}

export function Badge({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span title={title} aria-label={title} className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted">
      {children}
    </span>
  );
}

export function Card({ children, className = "", as: Tag = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" | "li" }) {
  return <Tag className={`rounded-lg border border-line bg-surface p-4 sm:p-5 ${className}`}>{children}</Tag>;
}

export function SectionTitle({ children, id, action }: { children: ReactNode; id?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-sm font-semibold uppercase tracking-wider text-muted">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-sm text-muted">{children}</p>;
}

export const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-strong-line bg-ink px-3 py-1.5 text-sm font-medium text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
export const ghostButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40";
export const inputClass =
  "rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-muted";
