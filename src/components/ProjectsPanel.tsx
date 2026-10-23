"use client";

import Link from "next/link";
import { projectProgress, type ProjectSrc } from "@/lib/projects-ui";
import { topicHref } from "@/lib/data";
import type { Module } from "@/lib/types";
import { useUserState } from "@/lib/use-store";
import { DifficultyFilterBar } from "./Difficulty";
import { projectDifficulty } from "@/lib/difficulty";
import { useDifficultyFilter } from "@/lib/difficulty-filter";
import { ProjectGuide } from "./ProjectGuide";
import { EmptyState, ProgressBar, SectionTitle } from "./ui";

/** A module's project ladders by topic, small to bigger, then its capstone (and the level capstone on a level's capstone module). */
export function ProjectsPanel({ mod, projects, color }: { mod: Module; projects: ProjectSrc[]; color: string }) {
  const s = useUserState();
  const filter = useDifficultyFilter();
  if (projects.length === 0) return <EmptyState>Project guides for {mod.id} are on the way. Earlier levels already have them.</EmptyState>;
  const done = projects.filter((p) => projectProgress(p, s).finished).length;
  const shown = (p: ProjectSrc) => !filter || projectDifficulty(p) === filter;
  const byTopic = mod.topics.map((t) => ({ t, list: projects.filter((p) => p.scope === "topic" && p.refId === t.id && shown(p)) })).filter((x) => x.list.length > 0);
  const caps = projects.filter((p) => p.scope !== "topic" && shown(p));
  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-lg border border-line bg-surface p-4 text-sm">
        <p>
          Build your way up: each topic has two or three guided builds from small to bigger, then one practice project of a different kind (extend, debug, reimplement, optimise, review or a no-steps challenge). A capstone then pulls the whole module together. Guided projects have numbered steps, help if you get stuck, what you should see, and a done check.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar pct={Math.floor((done / projects.length) * 100)} color={color} label={`${mod.id} projects finished`} />
          <span className="num shrink-0 text-xs text-muted">{done}/{projects.length} finished</span>
        </div>
      </div>
      <DifficultyFilterBar />
      {byTopic.length + caps.length === 0 && <EmptyState>No projects at this difficulty. Pick another above.</EmptyState>}
      {byTopic.map(({ t, list }) => (
        <section key={t.id} aria-labelledby={`pt-${t.id}`}>
          <h2 id={`pt-${t.id}`} className="mb-2 text-base font-semibold">
            <Link href={topicHref(t.id)} className="underline-offset-2 hover:underline">{t.title}</Link>
          </h2>
          <div className="space-y-3">
            {list.map((p) => (
              <ProjectGuide key={p.id} project={p} color={color} />
            ))}
          </div>
        </section>
      ))}
      {caps.map((p) => (
        <section key={p.id} aria-label={p.scope === "level" ? "Level capstone" : "Module capstone"}>
          <SectionTitle>{p.scope === "level" ? "Level capstone" : "Module capstone · after the topic projects"}</SectionTitle>
          <ProjectGuide project={p} color={color} />
        </section>
      ))}
    </div>
  );
}
