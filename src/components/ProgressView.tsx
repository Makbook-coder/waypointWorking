"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getTopic, levels, moduleHref, roadmap } from "@/lib/data";
import { parseDay, toDay } from "@/lib/dates";
import { computeBadges } from "@/lib/badges";
import { recommendedFocus } from "@/lib/focus";
import { dailyMinutes, overallAccuracy, shakyTopicIds, timeSummary, weakModules } from "@/lib/insights";
import { dueReviews, nextModule } from "@/lib/progress";
import { store } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import { Card, EmptyState, SectionTitle, buttonClass } from "./ui";

const hm = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`);

export function ProgressView() {
  const s = useUserState();
  const hydrated = useHydrated();
  const today = toDay(new Date());
  const time = timeSummary(s, today);
  const days = dailyMinutes(s, today, 14);
  const maxDay = Math.max(30, ...days.map((d) => d.minutes));
  const acc = overallAccuracy(s);
  const weak = weakModules(levels, s).slice(0, 6);
  const shaky = shakyTopicIds(s);
  const due = dueReviews(s, today);
  const next = nextModule(roadmap, s);
  const focus = recommendedFocus(levels, s, s.settings.targetRole, 1)[0];
  const badges = useMemo(() => computeBadges(roadmap, s, today), [s, today]);
  if (!hydrated) return null;

  const todo: { text: string; href: string; cta: string }[] = [];
  if (due.length) todo.push({ text: `${due.length} topic${due.length > 1 ? "s" : ""} due for review`, href: "/flashcards", cta: "Review" });
  for (const w of weak.slice(0, 2)) todo.push({ text: `Retry the ${w.module.id} quiz (${w.pct}% right)`, href: `${moduleHref(w.module.id)}#practice`, cta: "Retry" });
  if (shaky.length) todo.push({ text: `${shaky.length} shaky topic${shaky.length > 1 ? "s" : ""} to firm up`, href: "/flashcards", cta: "Drill" });
  if (next) todo.push({ text: `Continue ${next.id} ${next.title}`, href: moduleHref(next.id), cta: "Open" });
  if (focus && focus.level.id !== next?.levelId) todo.push({ text: `High-value level: L${focus.level.id} ${focus.level.title}`, href: `/level/${focus.level.id}`, cta: "Open" });

  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Tile label="Today" value={hm(time.today)} />
        <Tile label="This week" value={hm(time.thisWeek)} />
        <Tile label="All time" value={hm(time.total)} />
        <Tile label="Quiz accuracy" value={acc.attempted ? `${acc.pct}%` : "–"} hint={`${acc.correct}/${acc.attempted} questions right`} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Focused minutes, last 14 days</SectionTitle>
          <div className="flex h-36 items-end gap-1.5" role="img" aria-label={`Study minutes per day: ${days.map((d) => `${d.day} ${d.minutes}`).join(", ")}`}>
            {days.map((d) => (
              <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  className={`w-full rounded-t ${d.day === today ? "bg-ink" : "bg-muted/50"}`}
                  style={{ height: `${Math.max(2, (d.minutes / maxDay) * 100)}%` }}
                  title={`${d.day}: ${d.minutes} min`}
                />
                <span className="text-[10px] text-muted">{parseDay(d.day).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Counted while the app is open in front of you and you&apos;ve interacted with it in the last 3 minutes.</p>
        </Card>

        <Card>
          <SectionTitle>What to study next</SectionTitle>
          {todo.length === 0 ? (
            <EmptyState>All caught up.</EmptyState>
          ) : (
            <ol className="divide-y divide-line">
              {todo.map((t) => (
                <li key={t.text} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">{t.text}</span>
                  <Link href={t.href} className="shrink-0 text-sm underline underline-offset-2">
                    {t.cta}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Weak spots</SectionTitle>
          {weak.length === 0 && shaky.length === 0 ? (
            <EmptyState>No weak spots yet. Modules where under 60% of tried questions are right will show here, along with topics you rate Shaky.</EmptyState>
          ) : (
            <div className="space-y-4">
              {weak.length > 0 && (
                <ul className="space-y-2">
                  {weak.map((w) => (
                    <li key={w.module.id} className="flex items-center gap-3 text-sm">
                      <Link href={`${moduleHref(w.module.id)}#practice`} className="min-w-0 flex-1 truncate hover:underline">
                        <span className="font-mono text-xs text-muted">{w.module.id}</span> {w.module.title}
                      </Link>
                      <span className="num text-bad">
                        {w.correct}/{w.attempted}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {shaky.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Rated shaky</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {shaky.slice(0, 20).map((id) => {
                      const t = getTopic(id);
                      return t ? (
                        <li key={id}>
                          <Link href={moduleHref(t.module.id)} className="inline-block rounded border border-line px-2 py-0.5 text-xs hover:border-strong-line">
                            {t.topic.title}
                          </Link>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
        <StudyLog />
      </div>

      <section aria-labelledby="badges-h">
        <SectionTitle id="badges-h">
          Badges · {earned}/{badges.length}
        </SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <li key={b.id} className={`rounded-lg border p-3 ${b.earned ? "border-strong-line bg-surface" : "border-dashed border-line"}`}>
              <p className={`font-semibold ${b.earned ? "" : "text-muted"}`}>
                <span aria-hidden="true">{b.earned ? "◆ " : "◇ "}</span>
                {b.title}
                <span className="sr-only">{b.earned ? " (earned)" : " (not yet earned)"}</span>
              </p>
              <p className="text-xs text-muted">{b.description}</p>
              {!b.earned && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <div className="h-full bg-muted" style={{ width: `${Math.round(b.progress * 100)}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StudyLog() {
  const s = useUserState();
  const today = toDay(new Date());
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? s.log[today]?.text ?? "";
  const past = Object.entries(s.log)
    .filter(([d]) => d !== today)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 7);
  return (
    <Card>
      <SectionTitle>Study log</SectionTitle>
      <label htmlFor="log-today" className="text-sm font-medium">
        Today, {parseDay(today).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
      </label>
      <textarea
        id="log-today"
        rows={3}
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What did you learn or build today?"
        className="mt-1 w-full rounded-md border border-line bg-surface p-3 text-sm"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          className={buttonClass}
          disabled={draft === null}
          onClick={() => {
            store.setLog(value, today);
            setDraft(null);
          }}
        >
          Save entry
        </button>
        {draft === null && s.log[today] && <span className="text-xs text-muted">Saved</span>}
      </div>
      {past.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-line pt-3">
          {past.map(([d, n]) => (
            <li key={d} className="text-sm">
              <span className="font-mono text-xs text-muted">{d}</span>
              <p className="whitespace-pre-wrap">{n.text}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card as="div">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="num mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
