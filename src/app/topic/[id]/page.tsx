import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/BookmarkButton";
import { GlossaryText } from "@/components/GlossaryText";
import { InlineCode } from "@/components/InlineCode";
import { PrereqCheck, TopicStatus, WhatItIs } from "@/components/TopicPageParts";
import { TutorPanel } from "@/components/TutorPanel";
import { ProjectGuide } from "@/components/ProjectGuide";
import { VisitTracker } from "@/components/VisitTracker";
import { Card, PhaseTag } from "@/components/ui";
import { allTopics, getLevel, getPhase, getTopic, levelHref, moduleHref, topicHref } from "@/lib/data";
import { termsMentioned } from "@/lib/glossary";
import { PHASE_STYLE } from "@/lib/phase";
import { prereqsFor } from "@/lib/prereqs";
import { getTopicNote } from "@/lib/topic-notes";
import { topicVideo } from "@/lib/youtube";
import { projectsForTopic } from "@/lib/projects";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allTopics.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = getTopic((await params).id);
  return { title: found ? `${found.topic.title} · ${found.module.id}` : "Topic" };
}

export default async function TopicPage({ params }: Props) {
  const found = getTopic((await params).id);
  if (!found) notFound();
  const { topic, module: mod } = found;
  const level = getLevel(mod.levelId)!;
  const style = PHASE_STYLE[level.phase];
  const note = getTopicNote(topic.id);
  const d = note?.depth;
  const idx = mod.topics.findIndex((t) => t.id === topic.id);
  const prev = mod.topics[idx - 1];
  const next = mod.topics[idx + 1];
  const video = topicVideo(topic, mod);
  const projects = projectsForTopic(topic.id);

  const allText = note ? [note.simple, note.analogy, note.example, note.mistake, ...(d ? [d.why, ...d.steps, d.usedIn, d.breaks, d.before, d.after, d.developer, d.interview] : [])] : [topic.description];
  const terms = termsMentioned(allText);

  const sections: [string, React.ReactNode][] = note
    ? [
        ["What it is", <WhatItIs key="w" note={note} id={`lvl-${topic.id}`} />],
        ...(d ? ([["Why it matters", <GlossaryText key="y" text={d.why} />]] as [string, React.ReactNode][]) : []),
        ...(d
          ? ([
              [
                "How it works, step by step",
                <ol key="s" className="list-decimal space-y-1 pl-5">
                  {d.steps.map((s) => (
                    <li key={s}>
                      <InlineCode text={s} />
                    </li>
                  ))}
                </ol>,
              ],
            ] as [string, React.ReactNode][])
          : []),
        ["Tiny example", <InlineCode key="e" text={note.example} />],
        ["Mistake to avoid", <InlineCode key="m" text={note.mistake} />],
        ...(d ? ([["Where it's used", <InlineCode key="u" text={d.usedIn} />]] as [string, React.ReactNode][]) : []),
      ]
    : [["What it is", <p key="w">{topic.description}</p>]];

  return (
    <div>
      <VisitTracker href={topicHref(topic.id)} title={topic.title} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/roadmap" className="underline underline-offset-2 hover:text-ink">Roadmap</Link> /{" "}
        <Link href={levelHref(level.id)} className="underline underline-offset-2 hover:text-ink">L{level.id}</Link> /{" "}
        <Link href={moduleHref(mod.id)} className="underline underline-offset-2 hover:text-ink">{mod.id} {mod.title}</Link>
      </nav>

      <header className="mb-6 rounded-lg border border-line bg-surface p-5" style={{ borderTop: `6px solid ${style.var}` }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PhaseTag phase={level.phase} title={getPhase(level.phase).title} />
          <BookmarkButton itemKey={`topic:${topic.id}`} label={topic.title} />
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{topic.title}</h1>
        {topic.description !== topic.title && <p className="mt-2 max-w-3xl text-muted">{topic.description}</p>}
        <div className="mt-4 border-t border-line pt-3">
          <PrereqCheck prereqs={prereqsFor(topic.id)} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <ol className="space-y-5">
              {sections.map(([label, body], i) => (
                <li key={label}>
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    <span className="num inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-bg" style={{ background: style.var }} aria-hidden="true">
                      {i + 1}
                    </span>
                    {label}
                  </h2>
                  <div className="mt-1.5 text-sm leading-relaxed">{body}</div>
                </li>
              ))}
            </ol>
          </Card>

          {note?.analogy && (
            <Card>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Think of it like</h2>
              <p className="mt-1 text-sm leading-relaxed"><InlineCode text={note.analogy} /></p>
              {d?.breaks && (
                <>
                  <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">Where the analogy breaks</h3>
                  <p className="mt-1 text-sm leading-relaxed"><InlineCode text={d.breaks} /></p>
                </>
              )}
            </Card>
          )}

          {d && (
            <section aria-labelledby="ba-h" className="grid gap-3 sm:grid-cols-2">
              <h2 id="ba-h" className="sr-only">Before and after</h2>
              <div className="rounded-lg border border-dashed border-line bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Before</p>
                <p className="mt-1 text-sm leading-relaxed"><InlineCode text={d.before} /></p>
              </div>
              <div className="rounded-lg border bg-surface p-4" style={{ borderColor: style.var }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">After</p>
                <p className="mt-1 text-sm leading-relaxed"><InlineCode text={d.after} /></p>
              </div>
            </section>
          )}

          {d && (
            <aside aria-label="Key takeaway" className="rounded-lg p-4 text-bg" style={{ background: style.var }}>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Key takeaway</p>
              <p className="mt-1 text-lg font-semibold leading-snug"><InlineCode text={d.takeaway} /></p>
            </aside>
          )}

          {projects.length > 0 && (
            <section aria-labelledby="proj-h">
              <h2 id="proj-h" className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Build it · small to bigger</h2>
              <p className="mb-2 text-sm text-muted">Do these in order. Each one has steps, help if you get stuck, and a check that you are done.</p>
              <div className="space-y-3">
                {projects.map((p) => (
                  <ProjectGuide key={p.id} project={p} color={style.var} />
                ))}
              </div>
            </section>
          )}

          <div className="rounded-lg border border-line bg-surface p-4">
            <TopicStatus topicId={topic.id} title={topic.title} />
          </div>
        </div>

        <aside className="space-y-4">
          {terms.length > 0 && (
            <Card>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Words on this page</h2>
              <dl className="mt-2 space-y-2.5 text-sm">
                {terms.map((t) => (
                  <div key={t.slug}>
                    <dt className="font-semibold">
                      <Link href={`/glossary#${t.slug}`} className="hover:underline hover:underline-offset-2">{t.term}</Link>
                    </dt>
                    <dd className="leading-relaxed text-muted"><InlineCode text={t.plain} /></dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}
          <Card>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Ask a tutor</h2>
            <TutorPanel
              compact
              context={{
                title: `${topic.title} (part of "${mod.title}")`,
                facts: [topic.description, ...allText].filter(Boolean),
              }}
            />
          </Card>
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-line bg-surface p-4 text-sm hover:border-strong-line">
            <span className="font-medium">Search YouTube for this topic ↗</span>
            <span className="mt-0.5 block text-xs text-muted">Opens a search, not a specific video.</span>
          </a>
          <nav aria-label="Topic navigation" className="flex flex-col gap-2 text-sm">
            {prev && <Link href={topicHref(prev.id)} className="underline underline-offset-2">← {prev.title}</Link>}
            {next ? (
              <Link href={topicHref(next.id)} className="underline underline-offset-2">{next.title} →</Link>
            ) : (
              <Link href={moduleHref(mod.id)} className="underline underline-offset-2">Back to {mod.id} →</Link>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}
