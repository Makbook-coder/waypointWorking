"use client";

import Link from "next/link";
import { useState } from "react";
import { getTopic, levelHref, levels, moduleHref, phases, roadmap } from "@/lib/data";
import { toDay } from "@/lib/dates";
import { recommendedFocus } from "@/lib/focus";
import { PHASE_STYLE } from "@/lib/phase";
import { currentStreak, dueReviews, nextModule, overallProgress, phaseProgress } from "@/lib/progress";
import { REVIEW_INTERVALS } from "@/lib/review";
import { store } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import { BookmarkList, useBookmarks } from "./BookmarkList";
import { RoleToggle } from "./RoleToggle";
import { Card, EmptyState, ProgressBar, SectionTitle, WeightBadges, buttonClass, ghostButtonClass } from "./ui";

export function Dashboard() {
  const s = useUserState();
  const hydrated = useHydrated();
  const today = toDay(new Date());
  const overall = overallProgress(roadmap, s);
  const streak = currentStreak(s.activity, today);
  const due = dueReviews(s, today);
  const next = nextModule(roadmap, s);
  const focus = recommendedFocus(levels, s, s.settings.targetRole);
  const bookmarks = useBookmarks();
  const [showAllDue, setShowAllDue] = useState(false);
  const quizzesTried = Object.keys(s.quiz).length;
  const v = (n: number | string) => (hydrated ? n : "–");

  return (
    <div className="space-y-6">
      <header className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Card className="relative overflow-hidden">
          <p className="text-sm font-medium uppercase tracking-wider text-muted">Overall progress</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="num text-6xl font-bold leading-none tracking-tight sm:text-7xl">{v(overall.pct === 0 && overall.done > 0 ? "<1" : overall.pct)}</span>
            <span className="pb-1 text-2xl font-semibold text-muted">%</span>
          </div>
          <p className="num mt-2 text-sm text-muted">
            {v(overall.done)} of {overall.total} topics across 16 levels
          </p>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            {phases.map((p) => {
              const pp = phaseProgress(p, s);
              return <div key={p.id} style={{ width: `${(pp.done / overall.total) * 100}%`, background: PHASE_STYLE[p.id].var }} />;
            })}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Day streak" value={v(streak)} hint={streak > 0 ? "Keep it going today" : "Tick a topic to start"} />
          <Stat label="Due for review" value={v(due.length)} hint={`Intervals: ${REVIEW_INTERVALS.join(", ")} days`} />
          <Stat label="Quiz questions tried" value={v(quizzesTried)} hint="of 740" />
          <Stat label="Bookmarks" value={v(bookmarks.length)} hint="Saved for later" />
        </div>
      </header>

      <Card>
        <SectionTitle>Continue where you left off</SectionTitle>
        {hydrated && s.lastVisited ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{s.lastVisited.title}</p>
              {next && <p className="text-sm text-muted">Next unfinished module: {next.id} {next.title}</p>}
            </div>
            <div className="flex gap-2">
              <Link href={s.lastVisited.href} className={buttonClass}>
                Resume
              </Link>
              {next && (
                <Link href={moduleHref(next.id)} className={ghostButtonClass}>
                  Next module
                </Link>
              )}
            </div>
          </div>
        ) : next ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">
                {next.id} {next.title}
              </p>
              <p className="text-sm text-muted">The first module with topics still to cover.</p>
            </div>
            <Link href={moduleHref(next.id)} className={buttonClass}>
              Start
            </Link>
          </div>
        ) : (
          <p>Every topic is done. Time for the mock interview loop.</p>
        )}
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle action={<Link href="/roadmap" className="text-sm underline underline-offset-2">Map</Link>}>By phase</SectionTitle>
          <ul className="space-y-3">
            {phases.map((p) => {
              const pp = phaseProgress(p, s);
              const st = PHASE_STYLE[p.id];
              return (
                <li key={p.id}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${st.bg}`} aria-hidden="true" />
                      {p.title}
                      <span className="font-mono text-xs text-muted">L{p.levels.map((l) => l.id).join("·")}</span>
                    </span>
                    <span className="num text-xs text-muted">{v(pp.pct)}%</span>
                  </div>
                  <ProgressBar pct={pp.pct} color={st.var} label={`${p.title} ${pp.pct}%`} size="sm" />
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <SectionTitle action={<Link href="/flashcards" className="text-sm underline underline-offset-2">Flashcards</Link>}>Due for review today</SectionTitle>
          {!hydrated ? null : due.length === 0 ? (
            <EmptyState>Nothing due. Topics you mark done come back after 1, 3, 7 and 21 days.</EmptyState>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {(showAllDue ? due : due.slice(0, 6)).map((id) => {
                  const t = getTopic(id);
                  if (!t) return null;
                  const step = s.reviews[id]?.step ?? 0;
                  return (
                    <li key={id} className="flex flex-wrap items-center gap-2 py-2.5">
                      <div className="min-w-0 flex-1">
                        <Link href={moduleHref(t.module.id)} className="font-medium hover:underline">
                          {t.topic.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {t.module.id} · review {step + 1} of {REVIEW_INTERVALS.length}
                        </p>
                      </div>
                      <button type="button" className={ghostButtonClass} onClick={() => store.reviewTopic(id, false)}>
                        Forgot
                      </button>
                      <button type="button" className={buttonClass} onClick={() => store.reviewTopic(id, true)}>
                        Remembered
                      </button>
                    </li>
                  );
                })}
              </ul>
              {due.length > 6 && (
                <button type="button" className="mt-2 text-sm underline underline-offset-2" onClick={() => setShowAllDue((x) => !x)}>
                  {showAllDue ? "Show fewer" : `Show all ${due.length}`}
                </button>
              )}
            </>
          )}
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Recommended focus</SectionTitle>
          <div className="mb-3">
            <RoleToggle />
          </div>
          <ol className="space-y-2">
            {focus.map((f, i) => (
              <li key={f.level.id} className="flex items-center gap-3">
                <span className="num w-5 text-right font-mono text-xs text-muted">{i + 1}</span>
                <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${PHASE_STYLE[f.level.phase].bg}`} aria-hidden="true" />
                <Link href={levelHref(f.level.id)} className="min-w-0 flex-1 truncate font-medium hover:underline">
                  L{f.level.id} {f.level.title}
                </Link>
                {!f.ready && <span className="hidden text-xs text-muted sm:inline">prereqs first</span>}
                <WeightBadges interview={f.level.interviewWeight} job={f.level.jobWeight} />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted">Ranked by interview and job weight for the selected role, how much is left, and whether prerequisites are covered.</p>
        </Card>

        <div>
          <SectionTitle action={<Link href="/bookmarks" className="text-sm underline underline-offset-2">All</Link>}>Bookmarks</SectionTitle>
          {hydrated && <BookmarkList items={bookmarks.slice(0, 6)} empty="Nothing saved yet. Use Save on any topic, module, resource or question." />}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <Card as="div" className="flex flex-col justify-between">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="num mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}
