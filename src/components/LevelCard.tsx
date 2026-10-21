"use client";

import Link from "next/link";
import { ratio } from "@/lib/progress";
import { useUserState } from "@/lib/use-store";
import { ProgressBar, WeightBadges } from "./ui";

export interface LevelCardData {
  id: number;
  title: string;
  color: string;
  interviewWeight: number;
  jobWeight: number;
  moduleCount: number;
  sessionCount: number;
  topicIds: string[];
  prerequisites: { id: number; title: string; topicIds: string[] }[];
}

const READY_AT = 80;

export function LevelCard({ level }: { level: LevelCardData }) {
  const s = useUserState();
  const pct = (ids: string[]) => ratio(ids.filter((id) => s.topics[id]?.done).length, ids.length).pct;
  const progress = pct(level.topicIds);
  const pending = level.prerequisites.filter((p) => pct(p.topicIds) < READY_AT);
  const ready = pending.length === 0;

  return (
    <Link
      href={`/level/${level.id}`}
      className="group relative block h-full rounded-lg border border-line bg-surface p-4 transition-colors hover:border-strong-line"
      style={{ borderTop: `4px solid ${level.color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-2xl font-bold leading-none" style={{ color: level.color }}>
          L{level.id}
        </span>
        <WeightBadges interview={level.interviewWeight} job={level.jobWeight} />
      </div>
      <h3 className="mt-2 font-semibold leading-snug group-hover:underline group-hover:underline-offset-2">{level.title}</h3>
      <p className="num mt-1 text-xs text-muted">
        {level.moduleCount} modules · {level.topicIds.length} topics · {level.sessionCount} sessions
      </p>
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar pct={progress} color={level.color} label={`Level ${level.id} progress ${progress}%`} size="sm" />
        <span className="num w-9 shrink-0 text-right text-xs font-semibold">{progress}%</span>
      </div>
      <p className="mt-2 text-xs text-muted">
        {progress === 100 ? (
          <span className="font-semibold text-good">Complete</span>
        ) : ready ? (
          level.prerequisites.length ? "Prerequisites covered" : "No prerequisites, start any time"
        ) : (
          <>
            <span aria-hidden="true">◌ </span>
            Suggested first: {pending.map((p) => `L${p.id}`).join(", ")}
          </>
        )}
      </p>
    </Link>
  );
}
