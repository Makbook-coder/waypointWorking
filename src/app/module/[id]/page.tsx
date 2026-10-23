import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ModuleTabs } from "@/components/ModuleTabs";
import { moduleVideos } from "@/lib/video-lessons";
import { topicNotesFor } from "@/lib/topic-notes";
import { ProgressFor } from "@/components/ProgressFor";
import { VisitTracker } from "@/components/VisitTracker";
import { PhaseTag } from "@/components/ui";
import { getPractice, getResources } from "@/lib/content-data";
import { getLevel, getModule, getPhase, levelHref, moduleHref, moduleIdFromParam, modules } from "@/lib/data";
import { PHASE_STYLE } from "@/lib/phase";
import { getSourcedForModule } from "@/lib/sourced";
import { labsForModule } from "@/lib/labs";
import { getExplainer } from "@/lib/explainers";
import { moduleTopicIds } from "@/lib/progress";
import { projectsForModule } from "@/lib/projects";

type Props = { params: Promise<{ id: string }> };

// Rendered on first visit and then cached, instead of at build time. Prerendering them all put ~120 MB of HTML
// into every deployment, and Vercel keeps every deployment, so the Hobby 10 GB storage cap was hit.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

async function load(params: Props["params"]) {
  const id = moduleIdFromParam((await params).id);
  return id ? getModule(id) : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await load(params);
  return { title: m ? `${m.id} ${m.title}` : "Module" };
}

export default async function ModulePage({ params }: Props) {
  const mod = await load(params);
  if (!mod) notFound();
  const level = getLevel(mod.levelId)!;
  const style = PHASE_STYLE[level.phase];
  const idx = level.modules.findIndex((m) => m.id === mod.id);
  const prev = level.modules[idx - 1];
  const next = level.modules[idx + 1];

  return (
    <div>
      <VisitTracker href={moduleHref(mod.id)} title={`${mod.id} ${mod.title}`} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/roadmap" className="underline underline-offset-2 hover:text-ink">
          Roadmap
        </Link>{" "}
        /{" "}
        <Link href={levelHref(level.id)} className="underline underline-offset-2 hover:text-ink">
          L{level.id} {level.title}
        </Link>{" "}
        / {mod.id}
      </nav>

      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PhaseTag phase={level.phase} title={getPhase(level.phase).title} />
          <BookmarkButton itemKey={`module:${mod.id}`} label={`${mod.id} ${mod.title}`} />
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="font-mono text-2xl sm:text-3xl" style={{ color: style.var }}>
            {mod.id}
          </span>{" "}
          {mod.title}
        </h1>
        <p className="num mt-1 text-sm text-muted">
          {mod.sessionCount} session{mod.sessionCount === 1 ? "" : "s"} · {mod.topics.length} topics
        </p>
        <div className="mt-4 max-w-xl">
          <ProgressFor topicIds={moduleTopicIds(mod)} label={`${mod.id} progress`} color={style.var} />
        </div>
      </header>

      <ModuleTabs
        module={mod}
        resources={getResources(mod.id)}
        practice={getPractice(mod.id)}
        sourced={getSourcedForModule(mod.id)}
        color={style.var}
        topicNotes={topicNotesFor(mod.topics.map((t) => t.id))}
        labs={labsForModule(mod.id)}
        explainer={getExplainer(mod.id)}
        videos={moduleVideos(mod.id)}
        projects={projectsForModule(mod)}
      />

      <nav aria-label="Module navigation" className="mt-8 flex justify-between gap-4 text-sm">
        {prev ? (
          <Link href={moduleHref(prev.id)} className="underline underline-offset-2">
            ← {prev.id} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={moduleHref(next.id)} className="text-right underline underline-offset-2">
            {next.id} {next.title} →
          </Link>
        ) : (
          <Link href={levelHref(level.id)} className="underline underline-offset-2">
            Back to L{level.id} →
          </Link>
        )}
      </nav>
    </div>
  );
}
