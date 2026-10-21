"use client";

import Link from "next/link";
import { levelHref } from "@/lib/data";
import { COMPONENT_LABEL, band, readiness, type Component, type LevelPractice } from "@/lib/readiness";
import { useUserState } from "@/lib/use-store";
import { RoleToggle } from "./RoleToggle";
import { Card, ProgressBar, SectionTitle } from "./ui";

const ROLE_NAME = { none: "a balanced AI engineering role", "ai-engineer": "an AI Engineer role", "genai-ds": "a GenAI Data Scientist role" } as const;
const ORDER: Component[] = ["exam", "labs", "coding", "quiz", "scenarios", "project", "mocks", "topics"];

export function ReadinessView({ levels }: { levels: LevelPractice[] }) {
  const s = useUserState();
  const role = s.settings.targetRole;
  const r = readiness(levels, s, role);
  const byImportance = [...r.levels].sort((a, b) => b.importance - a.importance || a.level.id - b.level.id);
  const maxImp = Math.max(...r.levels.map((x) => x.importance));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">Target role:</span>
        <RoleToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Practice readiness for {ROLE_NAME[role]}</p>
          <p className="num mt-2 text-5xl font-bold">{r.overall}%</p>
          <p className="mt-1 font-semibold">{band(r.overall)}</p>
          <div className="mt-3">
            <ProgressBar pct={r.overall} label="Overall practice readiness" />
          </div>
          <p className="num mt-3 text-sm text-muted">
            Level exams passed: {r.examsPassed}/{r.examsTotal}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            This measures the practice you&apos;ve done in Waypoint: labs, coding, quizzes, scenarios, exams and capstones. It can&apos;t see what you know beyond that. No score here guarantees passing any interview or exam, but a high one means you&apos;ve put in the kind of hands-on work that gets people there.
          </p>
        </Card>

        <Card>
          <SectionTitle>Your biggest gaps</SectionTitle>
          {r.gaps.length === 0 ? (
            <p className="text-sm">No gaps left. Keep sharp with mock interviews and retakes.</p>
          ) : (
            <ol className="space-y-3">
              {r.gaps.map((g, i) => (
                <li key={g.level.id} className="flex gap-3 text-sm">
                  <span className="num font-semibold text-muted">{i + 1}.</span>
                  <span>
                    <span className="font-medium">{g.next}</span>
                    <span className="block text-xs text-muted">
                      <Link href={levelHref(g.level.id)} className="underline underline-offset-2">
                        L{g.level.id} {g.level.title}
                      </Link>{" "}
                      · readiness {g.score}%
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/labs" className="underline underline-offset-2">Labs</Link>
            <Link href="/exam" className="underline underline-offset-2">Exams</Link>
            <Link href="/practice" className="underline underline-offset-2">Practice</Link>
            <Link href="/interview" className="underline underline-offset-2">Mock interview</Link>
          </div>
        </Card>
      </div>

      <section aria-labelledby="levels-h">
        <SectionTitle id="levels-h">By level, most important for this role first</SectionTitle>
        <ul className="space-y-2">
          {byImportance.map((row) => (
            <li key={row.level.id} className="rounded-lg border border-line bg-surface p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={levelHref(row.level.id)} className="font-medium hover:underline hover:underline-offset-2">
                  <span className="font-mono">L{row.level.id}</span> {row.level.title}
                </Link>
                <span className="flex items-center gap-2 text-xs text-muted">
                  <span title="How much this level matters for the role">weight {"●".repeat(Math.max(1, Math.round((row.importance / maxImp) * 5)))}</span>
                  <span className="num text-sm font-semibold text-ink">{row.score}%</span>
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar pct={row.score} label={`L${row.level.id} readiness`} size="sm" />
              </div>
              <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                {ORDER.filter((k) => row.parts[k] !== undefined).map((k) => (
                  <div key={k} className="flex gap-1">
                    <dt>{COMPONENT_LABEL[k]}</dt>
                    <dd className="num font-semibold text-ink">{row.parts[k]}%</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
