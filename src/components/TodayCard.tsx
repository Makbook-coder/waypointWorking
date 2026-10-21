"use client";

import Link from "next/link";
import { levels } from "@/lib/data";
import { toDay } from "@/lib/dates";
import { dailyGoal, nextBestStep } from "@/lib/daily";
import { MAX_DAILY_GOAL, store } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import { Card, ProgressBar, buttonClass } from "./ui";

/** Today's goal and the one thing to do next. */
export function TodayCard() {
  const s = useUserState();
  const hydrated = useHydrated();
  if (!hydrated) return <Card><p className="text-sm text-muted">Loading today…</p></Card>;
  const today = toDay(new Date());
  const g = dailyGoal(s, today);
  const step = nextBestStep(levels, s, today);
  const setGoal = (n: number) => store.setDailyGoal(n);

  return (
    <Card>
      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="goal-h">
          <h2 id="goal-h" className="text-xs font-medium uppercase tracking-wider text-muted">
            Today&apos;s goal
          </h2>
          {g.goal === 0 ? (
            <p className="mt-2 text-sm">No daily goal set.</p>
          ) : (
            <>
              <p className="num mt-1 text-2xl font-bold">
                {g.done} <span className="text-base font-semibold text-muted">of {g.goal} topics</span>
              </p>
              <div className="mt-2">
                <ProgressBar pct={Math.min(100, Math.round((g.done / g.goal) * 100))} label={`${g.done} of ${g.goal} topics today`} size="sm" />
              </div>
              <p className="mt-1 text-xs text-muted" aria-live="polite">
                {g.met ? "Goal met for today. Anything more is a bonus." : `${g.goal - g.done} to go. Tick a topic done to count it.`}
              </p>
            </>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-muted">Daily goal</span>
            <button type="button" className="rounded border border-line px-2 py-0.5 hover:bg-surface-2 disabled:opacity-40" onClick={() => setGoal(g.goal - 1)} disabled={g.goal <= 0} aria-label="Lower daily goal">
              −
            </button>
            <span className="num w-14 text-center">{g.goal === 0 ? "off" : `${g.goal}/day`}</span>
            <button
              type="button"
              className="rounded border border-line px-2 py-0.5 hover:bg-surface-2 disabled:opacity-40"
              onClick={() => setGoal(g.goal + 1)}
              disabled={g.goal >= MAX_DAILY_GOAL}
              aria-label="Raise daily goal"
            >
              +
            </button>
          </div>
        </section>

        <section aria-labelledby="next-h" className="md:border-l md:border-line md:pl-5">
          <h2 id="next-h" className="text-xs font-medium uppercase tracking-wider text-muted">
            Next best step
          </h2>
          <p className="mt-1 text-lg font-semibold">{step.title}</p>
          <p className="text-sm text-muted">{step.why}</p>
          <Link href={step.href} className={`${buttonClass} mt-3 inline-block`}>
            {step.cta}
          </Link>
        </section>
      </div>
    </Card>
  );
}
