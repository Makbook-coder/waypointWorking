import type { Metadata } from "next";
import Link from "next/link";
import { LevelCard, type LevelCardData } from "@/components/LevelCard";
import { ProgressFor } from "@/components/ProgressFor";
import { getLevel, phases } from "@/lib/data";
import { PHASE_STYLE } from "@/lib/phase";
import { phaseTopicIds } from "@/lib/progress";

export const metadata: Metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">The map</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Sixteen levels on seven lines. Badges show how much each level counts in interviews (INT) and on the job (JOB), out of 10.
          Prerequisite hints are suggestions; every level is open.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/cheatsheet" className="underline underline-offset-2">Printable cheat sheets for every level →</Link>
        </p>
        <ol className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs" aria-label="Phase legend">
          {phases.map((p) => (
            <li key={p.id} className="inline-flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-6 rounded-full ${PHASE_STYLE[p.id].bg}`} aria-hidden="true" />
              {PHASE_STYLE[p.id].n}. {p.title}
            </li>
          ))}
        </ol>
      </header>

      <ol className="space-y-10">
        {phases.map((phase) => {
          const style = PHASE_STYLE[phase.id];
          const cards: LevelCardData[] = [...phase.levels]
            .sort((a, b) => a.id - b.id)
            .map((l) => ({
              id: l.id,
              title: l.title,
              color: style.var,
              interviewWeight: l.interviewWeight,
              jobWeight: l.jobWeight,
              moduleCount: l.modules.length,
              sessionCount: l.sessionCount,
              topicIds: l.modules.flatMap((m) => m.topics.map((t) => t.id)),
              prerequisites: l.prerequisites.map((id) => {
                const pre = getLevel(id)!;
                return { id, title: pre.title, topicIds: pre.modules.flatMap((m) => m.topics.map((t) => t.id)) };
              }),
            }));
          return (
            <li key={phase.id} aria-labelledby={`phase-${phase.id}`} className="relative pl-6 sm:pl-10">
              {/* the transit line */}
              <span className={`absolute bottom-0 left-1.5 top-1 w-1.5 rounded-full sm:left-3 ${style.bg}`} aria-hidden="true" />
              <span
                className={`absolute left-0 top-0 h-4.5 w-4.5 rounded-full border-4 border-bg sm:left-1.5 ${style.bg}`}
                aria-hidden="true"
              />
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <h2 id={`phase-${phase.id}`} className="text-xl font-bold tracking-tight">
                  <span className={`font-mono text-sm ${style.text}`}>Line {style.n}</span>
                  <span className="block">{phase.title}</span>
                </h2>
                <div className="w-full max-w-xs">
                  <ProgressFor topicIds={phaseTopicIds(phase)} label={`${phase.title} progress`} color={style.var} />
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((c) => (
                  <li key={c.id}>
                    <LevelCard level={c} />
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
