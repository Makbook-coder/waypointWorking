import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/BookmarkButton";
import { NoteEditor } from "@/components/NoteEditor";
import { ProgressFor } from "@/components/ProgressFor";
import { ProjectChecklist } from "@/components/ProjectChecklist";
import { TopicRow } from "@/components/TopicRow";
import { VisitTracker } from "@/components/VisitTracker";
import { Card, PhaseTag, SectionTitle, WeightBadges } from "@/components/ui";
import { allPractice } from "@/lib/content-data";
import { getLevel, getPhase, levelHref, levels, moduleHref } from "@/lib/data";
import { PHASE_STYLE } from "@/lib/phase";
import { levelTopicIds, moduleTopicIds } from "@/lib/progress";
import type { ProjectItem } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return levels.map((l) => ({ id: String(l.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = getLevel(Number((await params).id));
  return { title: level ? `L${level.id} ${level.title}` : "Level" };
}

export default async function LevelPage({ params }: Props) {
  const level = getLevel(Number((await params).id));
  if (!level) notFound();
  const phase = getPhase(level.phase);
  const style = PHASE_STYLE[level.phase];
  const project = allPractice.find((p): p is ProjectItem => p.type === "project" && p.levelId === level.id);
  const prev = getLevel(level.id - 1);
  const next = getLevel(level.id + 1);

  return (
    <div>
      <VisitTracker href={levelHref(level.id)} title={`L${level.id} ${level.title}`} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/roadmap" className="underline underline-offset-2 hover:text-ink">
          Roadmap
        </Link>{" "}
        / Level {level.id}
      </nav>

      <header className="mb-8 rounded-lg border border-line bg-surface p-5 sm:p-6" style={{ borderTop: `6px solid ${style.var}` }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PhaseTag phase={level.phase} title={phase.title} />
          <div className="flex items-center gap-2">
            <WeightBadges interview={level.interviewWeight} job={level.jobWeight} />
            <Link href={`/cheatsheet/${level.id}`} className="rounded-md border border-line px-2.5 py-1 text-sm hover:bg-surface-2">
              Cheat sheet
            </Link>
            <BookmarkButton itemKey={`level:${level.id}`} label={`Level ${level.id} ${level.title}`} />
          </div>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="font-mono" style={{ color: style.var }}>
            L{level.id}
          </span>{" "}
          {level.title}
        </h1>
        <p className="mt-3 max-w-3xl text-muted">{level.summary}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Sessions</dt>
            <dd className="num font-semibold">{level.sessionCount}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Modules · topics</dt>
            <dd className="num font-semibold">
              {level.modules.length} · {levelTopicIds(level).length}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Suggested before this</dt>
            <dd className="font-semibold">
              {level.prerequisites.length === 0
                ? "Nothing, start here"
                : level.prerequisites.map((id, i) => (
                    <span key={id}>
                      {i > 0 && ", "}
                      <Link href={levelHref(id)} className="underline underline-offset-2">
                        L{id}
                      </Link>
                    </span>
                  ))}
            </dd>
          </div>
        </dl>
        <div className="mt-5">
          <ProgressFor topicIds={levelTopicIds(level)} label={`Level ${level.id} progress`} color={style.var} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <SectionTitle>Modules</SectionTitle>
          {level.modules.map((m) => (
            <Card key={m.id} as="article">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted">
                    {m.id} · {m.sessionCount} session{m.sessionCount === 1 ? "" : "s"}
                    {m.isCapstone ? " · capstone" : ""}
                  </p>
                  <h2 className="text-lg font-semibold">
                    <Link href={moduleHref(m.id)} className="hover:underline hover:underline-offset-2">
                      {m.title}
                    </Link>
                  </h2>
                </div>
                <Link href={moduleHref(m.id)} className="text-sm underline underline-offset-2">
                  Open module →
                </Link>
              </div>
              <div className="mt-3">
                <ProgressFor topicIds={moduleTopicIds(m)} label={`${m.id} progress`} color={style.var} size="sm" />
              </div>
              <ul className="mt-2">
                {m.topics.map((t) => (
                  <TopicRow key={t.id} topic={t} moduleTitle={m.title} showDescription={false} />
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <Card>
            <SectionTitle>Level outcome</SectionTitle>
            <p className="text-sm leading-relaxed">{level.outcome}</p>
          </Card>
          {project && (
            <Card>
              <SectionTitle>Project</SectionTitle>
              <h3 className="mb-3 font-semibold">{project.title}</h3>
              <ProjectChecklist project={project} color={style.var} />
            </Card>
          )}
          <Card>
            <NoteEditor itemKey={`level:${level.id}`} label="Level notes" rows={5} />
          </Card>
          <nav aria-label="Level navigation" className="flex justify-between text-sm">
            {prev ? (
              <Link href={levelHref(prev.id)} className="underline underline-offset-2">
                ← L{prev.id}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={levelHref(next.id)} className="underline underline-offset-2">
                L{next.id} →
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}
