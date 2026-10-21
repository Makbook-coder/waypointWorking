"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getLevel, levels, moduleHref } from "@/lib/data";
import { parseDay, toDay } from "@/lib/dates";
import { PHASE_STYLE } from "@/lib/phase";
import { HOURS_PER_SESSION, buildPlan } from "@/lib/plan";
import { moduleProgress } from "@/lib/progress";
import { store } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import { Card, EmptyState, ProgressBar, SectionTitle, ghostButtonClass } from "./ui";

const fmt = (d: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => parseDay(d).toLocaleDateString(undefined, opts);

export function PlanView() {
  const s = useUserState();
  const hydrated = useHydrated();
  const [showAll, setShowAll] = useState(false);
  const hours = s.settings.weeklyHours;
  const plan = useMemo(() => buildPlan(levels, s, hours, toDay(new Date())), [s, hours]);
  if (!hydrated) return null;
  const weeks = showAll ? plan.weeks : plan.weeks.slice(0, 8);

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="hours" className="text-sm font-medium">
              Hours per week: <span className="num text-2xl font-bold">{hours}</span>
            </label>
            <input
              id="hours"
              type="range"
              min={1}
              max={40}
              step={1}
              value={Math.min(40, hours)}
              onChange={(e) => store.setWeeklyHours(Number(e.target.value))}
              className="mt-2 block w-full accent-[var(--ink)]"
            />
            <p className="mt-1 text-xs text-muted">Each roadmap session is estimated at {HOURS_PER_SESSION} hours including practice.</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 text-center sm:text-right">
            <Stat label="Hours left" value={Math.round(plan.remainingHours)} />
            <Stat label="Weeks" value={plan.weeks.length} />
            <Stat label="Finish" value={plan.finish ? fmt(plan.finish, { month: "short", year: "numeric" }) : "Done"} />
          </dl>
        </div>
      </Card>

      {plan.weeks.length === 0 ? (
        <EmptyState>Nothing left to schedule. Every topic is done.</EmptyState>
      ) : (
        <ol className="space-y-3">
          {weeks.map((w) => (
            <li key={w.start}>
              <Card as="div" className={w.index === 0 ? "border-strong-line" : ""}>
                <SectionTitle>
                  {w.index === 0 ? "This week" : w.index === 1 ? "Next week" : `Week ${w.index + 1}`} · {fmt(w.start)} to {fmt(w.end)}
                </SectionTitle>
                <ul className="divide-y divide-line">
                  {w.items.map((it) => {
                    const level = getLevel(it.module.levelId)!;
                    const p = moduleProgress(it.module, s);
                    return (
                      <li key={it.module.id} className="flex flex-wrap items-center gap-3 py-2">
                        <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${PHASE_STYLE[level.phase].bg}`} aria-hidden="true" />
                        <Link href={moduleHref(it.module.id)} className="min-w-0 flex-1 font-medium hover:underline">
                          <span className="font-mono text-xs text-muted">{it.module.id}</span> {it.module.title}
                        </Link>
                        {w.index === 0 && (
                          <span className="w-28">
                            <ProgressBar pct={p.pct} color={PHASE_STYLE[level.phase].var} label={`${it.module.id} ${p.pct}%`} size="sm" />
                          </span>
                        )}
                        <span className="num w-14 text-right text-sm text-muted">{it.hours} h</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
      )}
      {plan.weeks.length > 8 && (
        <button type="button" className={ghostButtonClass} onClick={() => setShowAll((x) => !x)}>
          {showAll ? "Show fewer weeks" : `Show all ${plan.weeks.length} weeks`}
        </button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted">{label}</dt>
      <dd className="num text-xl font-bold">{value}</dd>
    </div>
  );
}
