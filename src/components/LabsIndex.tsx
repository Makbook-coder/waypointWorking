"use client";

import Link from "next/link";
import { stepKey } from "@/lib/lab-steps";
import { useUserState } from "@/lib/use-store";
import { ProgressBar } from "./ui";

export interface LabSummary {
  id: string;
  title: string;
  goal: string;
  moduleId: string;
  moduleTitle: string;
  levelId: number;
  levelTitle: string;
  href: string;
  steps: number;
  color: string;
}

export function LabsIndex({ labs }: { labs: LabSummary[] }) {
  const coding = useUserState().coding;
  const passed = (l: LabSummary) => {
    let n = 0;
    while (n < l.steps && coding[stepKey(l.id, n)]?.passedAt) n++;
    return n;
  };
  const complete = labs.filter((l) => passed(l) === l.steps).length;
  return (
    <div>
      <p className="num mb-4 text-sm text-muted">
        {complete} of {labs.length} labs complete
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {labs.map((l) => {
          const n = passed(l);
          return (
            <li key={l.id} className="rounded-lg border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${l.color}` }}>
              <p className="font-mono text-xs text-muted">
                L{l.levelId} {l.levelTitle} · {l.moduleId}
              </p>
              <h2 className="mt-0.5 font-semibold">
                <Link href={l.href} className="hover:underline hover:underline-offset-2">
                  {l.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted">{l.goal}</p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar pct={Math.floor((n / l.steps) * 100)} color={l.color} label={`${l.title} progress`} size="sm" />
                <span className="num shrink-0 text-xs text-muted">
                  {n}/{l.steps}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
