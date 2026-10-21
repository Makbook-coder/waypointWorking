"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getModule, levels, moduleHref, moduleIdFromParam } from "@/lib/data";
import { toDay } from "@/lib/dates";
import { focusSummary } from "@/lib/insights";
import { PRESETS, formatClock, pause, remainingMs, reset, setPreset, skipBreak, start, type PresetId } from "@/lib/pomodoro";
import { useHydrated, useUserState } from "@/lib/use-store";
import { checkTimer, setTimer, useTimer } from "@/lib/use-timer";
import { Card, ProgressBar, SectionTitle, buttonClass, ghostButtonClass, inputClass } from "./ui";

const noop = () => () => {};
const notificationPermission = () => ("Notification" in window ? Notification.permission : "unsupported");

export function FocusView() {
  const t = useTimer();
  const s = useUserState();
  const hydrated = useHydrated();
  const permission = useSyncExternalStore(noop, notificationPermission, () => "unsupported");
  const [askedPermission, setAskedPermission] = useState<NotificationPermission | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!t.running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [t.running]);

  // Default the module to the one last opened, before the first block starts.
  useEffect(() => {
    if (!hydrated || t.moduleId || t.running) return;
    const href = s.lastVisited?.href ?? "";
    const id = href.startsWith("/module/") ? moduleIdFromParam(href.slice("/module/".length)) : null;
    if (id) setTimer({ ...t, moduleId: id });
  }, [hydrated, t, s.lastVisited]);

  if (!hydrated) return null;

  const left = remainingMs(t, now);
  const total = (t.phase === "focus" ? PRESETS[t.preset].focus : PRESETS[t.preset].rest) * 60_000;
  const fresh = !t.running && t.remainingMs === total;
  const mod = t.moduleId ? getModule(t.moduleId) : undefined;
  const sum = focusSummary(s, toDay(new Date()));
  const recent = [...s.focus].reverse().slice(0, 8);
  const perm = askedPermission ?? permission;

  const act = (fn: (now: number) => void) => () => {
    const n = Date.now();
    checkTimer(n);
    fn(n);
    setNow(n);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="min-w-0 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t.phase === "focus" ? "Focus" : "Break"} · {t.running ? "running" : fresh ? "ready" : "paused"}
          </p>
          <div role="radiogroup" aria-label="Block length" className="flex gap-1">
            {(Object.keys(PRESETS) as PresetId[]).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={t.preset === p}
                disabled={!fresh || t.phase !== "focus"}
                onClick={() => setTimer(setPreset(t, p))}
                className="rounded-md border border-line px-2.5 py-1 text-sm aria-checked:bg-ink aria-checked:text-bg disabled:opacity-50"
              >
                {PRESETS[p].label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-6xl font-semibold tabular-nums sm:text-7xl" aria-live="off">
          {formatClock(left)}
        </p>
        <div className="mx-auto mt-4 max-w-md">
          <ProgressBar
            pct={Math.round(((total - left) / total) * 100)}
            color={t.phase === "focus" ? "var(--bad)" : "var(--good)"}
            label={`${t.phase === "focus" ? "Focus" : "Break"} progress`}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {t.running ? (
            <button type="button" className={buttonClass} onClick={act((n) => setTimer(pause(t, n)))}>Pause</button>
          ) : (
            <button type="button" className={buttonClass} onClick={act((n) => setTimer(start(t, n)))}>
              {fresh ? (t.phase === "focus" ? "Start focus" : "Start break") : "Resume"}
            </button>
          )}
          {t.phase === "break" ? (
            <button type="button" className={ghostButtonClass} onClick={act(() => setTimer(skipBreak(t)))}>Skip break</button>
          ) : (
            <button type="button" className={ghostButtonClass} disabled={fresh} onClick={act(() => setTimer(reset(t)))}>Reset</button>
          )}
        </div>
        <p className="sr-only" role="status">
          {t.phase === "focus" ? "Focus block" : "Break"} {t.running ? "running" : "stopped"}
        </p>

        <div className="mt-8 border-t border-line pt-4">
          <label htmlFor="focus-module" className="text-sm font-medium">Working on</label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <select
              id="focus-module"
              className={`${inputClass} w-full min-w-0 flex-1 sm:w-auto`}
              value={t.moduleId ?? ""}
              disabled={t.running && t.phase === "focus"}
              onChange={(e) => setTimer({ ...t, moduleId: e.target.value || null })}
            >
              <option value="">Nothing in particular</option>
              {levels.map((l) => (
                <optgroup key={l.id} label={`L${l.id} ${l.title}`}>
                  {l.modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.id} {m.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {mod && <Link href={moduleHref(mod.id)} className="text-sm underline-offset-2 hover:underline">Open module</Link>}
          </div>
          <p className="mt-2 text-xs text-muted">
            A block is logged when it runs to the end. Pausing is fine; resetting drops the block.
          </p>
        </div>
      </Card>

      <aside className="space-y-4">
        <Card className="p-4">
          <SectionTitle>Focus blocks</SectionTitle>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Today", sum.today],
              ["This week", sum.thisWeek],
              ["Total", sum.total],
            ].map(([label, b]) => {
              const v = b as { blocks: number; minutes: number };
              return (
                <div key={label as string} className="rounded-md bg-surface-2 p-2">
                  <dt className="text-xs text-muted">{label as string}</dt>
                  <dd className="text-xl font-semibold tabular-nums">{v.blocks}</dd>
                  <dd className="text-xs text-muted">{v.minutes} min</dd>
                </div>
              );
            })}
          </dl>
        </Card>

        <Card className="p-4">
          <SectionTitle>Recent blocks</SectionTitle>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Finished blocks show up here.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {recent.map((f) => {
                const m = f.moduleId ? getModule(f.moduleId) : undefined;
                return (
                  <li key={f.at} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">
                      {m ? <Link href={moduleHref(m.id)} className="underline-offset-2 hover:underline">{m.id} {m.title}</Link> : "General study"}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {new Date(f.at).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })} · {f.minutes}m
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {perm === "default" && (
          <Card className="p-4">
            <p className="text-sm">Get a notification when a block ends while this tab is in the background.</p>
            <button
              type="button"
              className={`${ghostButtonClass} mt-2`}
              onClick={() => void Notification.requestPermission().then(setAskedPermission)}
            >
              Turn on notifications
            </button>
          </Card>
        )}
        {perm === "denied" && <p className="text-xs text-muted">Notifications are blocked for this site, so you&apos;ll only hear the chime.</p>}
      </aside>
    </div>
  );
}
