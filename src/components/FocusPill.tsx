"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatClock, remainingMs } from "@/lib/pomodoro";
import { useHydrated } from "@/lib/use-store";
import { useTimer } from "@/lib/use-timer";

/** Header link to the focus timer; shows the countdown while one is running. */
export function FocusPill() {
  const t = useTimer();
  const hydrated = useHydrated();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!t.running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [t.running]);

  const live = hydrated && t.running;
  return (
    <Link
      href="/focus"
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-line px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink"
      aria-label={live ? `Focus timer: ${t.phase === "focus" ? "focus" : "break"}, ${formatClock(remainingMs(t, now))} left` : "Focus timer"}
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${live ? (t.phase === "focus" ? "bg-bad" : "bg-good") : "bg-line"}`} />
      <span className="tabular-nums">{live ? formatClock(remainingMs(t, now)) : "Focus"}</span>
    </Link>
  );
}
