import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/BookmarkButton";
import { InlineCode } from "@/components/InlineCode";
import { PrereqCheck, TopicSections, TopicStatus } from "@/components/TopicPageParts";
import { TutorPanel } from "@/components/TutorPanel";
import { ProjectGuide } from "@/components/ProjectGuide";
import { VisitTracker } from "@/components/VisitTracker";
import { Card, PhaseTag } from "@/components/ui";
import { allTopics, getLevel, getPhase, getTopic, levelHref, moduleHref, topicHref } from "@/lib/data";
import { termsMentioned } from "@/lib/glossary";
import { PHASE_STYLE } from "@/lib/phase";
import { prereqsFor } from "@/lib/prereqs";
import { TeachBack } from "@/components/TeachBack";
import { getTopicNote } from "@/lib/topic-notes";
import { topicVideo } from "@/lib/youtube";
import { projectsForTopic } from "@/lib/projects";

type Props = { params: Promise<{ id: string }> };

// Rendered on first visit and then cached, instead of at build time. Prerendering them all put ~120 MB of HTML
// into every deployment, and Vercel keeps every deployment, so the Hobby 10 GB storage cap was hit.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
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

  const l = note?.levels;
  const allText = note
    ? [
        note.simple, note.analogy, note.example, note.mistake,
        ...(d ? [d.why, ...d.steps, d.usedIn, d.breaks, d.before, d.after, d.developer, d.interview] : []),
        ...(l ? [...l.gotchas, l.tradeoff, ...l.followUps.flat(), l.edgeCase, l.weakAnswer] : []),
      ]
    : [topic.description];
  const terms = termsMentioned(allText);

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
            {note ? <TopicSections note={note} id={`lvl-${topic.id}`} accent={style.var} /> : <p>{topic.description}</p>}
          </Card>

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

          <TeachBack topicId={topic.id} topic={`${topic.title} (part of "${mod.title}")`} facts={[topic.description, ...allText].filter(Boolean)} />

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
