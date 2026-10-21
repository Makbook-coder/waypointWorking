"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { CodingItem, ExerciseItem, InterviewItem, MiniProjectItem, Module, PracticeItem, ProjectItem, QuizItem, Resource, ScenarioItem } from "@/lib/types";
import type { SourcedInterviewItem } from "@/lib/sourced";
import { getNote, type ModuleNote } from "@/lib/notes";
import { linkTerms } from "@/lib/glossary";
import type { Lab } from "@/lib/lab-steps";
import type { TopicNote } from "@/lib/topic-notes";
import { useUserState } from "@/lib/use-store";
import { verifiedVideos } from "@/lib/youtube";
import { AppliedPanel } from "./AppliedPanel";
import { BookmarkButton } from "./BookmarkButton";
import { CapstoneGuide } from "./CapstoneGuide";
import { CodingCard } from "./CodingCard";
import { ExerciseCard } from "./ExerciseCard";
import { Segments } from "./GlossaryText";
import { InterviewCard } from "./InterviewCard";
import { LabCard } from "./LabCard";
import { MiniProjectCard } from "./MiniProjectCard";
import { NoteEditor } from "./NoteEditor";
import { ProjectChecklist } from "./ProjectChecklist";
import { QuizRunner } from "./QuizRunner";
import { ScenarioCard } from "./ScenarioCard";
import { TopicRow } from "./TopicRow";
import { GeneratedPractice } from "./GeneratedPractice";
import { TutorPanel } from "./TutorPanel";
import { Badge, EmptyState, SectionTitle } from "./ui";

const TABS = ["learn", "applied", "resources", "practice", "notes"] as const;
type Tab = (typeof TABS)[number];
const LABEL: Record<Tab, string> = { learn: "Learn", applied: "In practice", resources: "Resources", practice: "Practice", notes: "Notes" };

export function ModuleTabs({
  module: mod,
  resources,
  practice,
  sourced = [],
  color,
  topicNotes = {},
  labs = [],
}: {
  module: Module;
  resources: Resource[];
  practice: PracticeItem[];
  sourced?: SourcedInterviewItem[];
  color: string;
  topicNotes?: Record<string, TopicNote>;
  labs?: Lab[];
}) {
  const [tab, setTab] = useState<Tab>("learn");
  const refs = useRef<Record<Tab, HTMLButtonElement | null>>({ learn: null, applied: null, resources: null, practice: null, notes: null });
  const hasNote = Boolean(useUserState().notes[`module:${mod.id}`]);

  // Deep links like /module/m4-6#practice
  useEffect(() => {
    const h = window.location.hash.slice(1) as Tab;
    if (TABS.includes(h)) setTab(h);
  }, []);

  function select(t: Tab, focus = false) {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    if (focus) refs.current[t]?.focus();
  }

  function onKey(e: KeyboardEvent) {
    const i = TABS.indexOf(tab);
    if (e.key === "ArrowRight") select(TABS[(i + 1) % TABS.length], true);
    else if (e.key === "ArrowLeft") select(TABS[(i - 1 + TABS.length) % TABS.length], true);
    else if (e.key === "Home") select(TABS[0], true);
    else if (e.key === "End") select(TABS[TABS.length - 1], true);
    else return;
    e.preventDefault();
  }

  const quizzes = practice.filter((p): p is QuizItem => p.type === "quiz");
  const counts: Record<Tab, number | null> = { learn: mod.topics.length, applied: null, resources: resources.length, practice: practice.length + labs.length, notes: null };

  return (
    <div>
      <div role="tablist" aria-label="Module sections" className="flex gap-1 overflow-x-auto border-b border-line" onKeyDown={onKey}>
        {TABS.map((t) => (
          <button
            key={t}
            ref={(el) => {
              refs.current[t] = el;
            }}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => select(t)}
            className="-mb-px shrink-0 border-b-[3px] border-transparent px-4 py-2.5 text-sm font-medium text-muted hover:text-ink aria-selected:text-ink"
            style={tab === t ? { borderBottomColor: color } : undefined}
          >
            {LABEL[t]}
            {counts[t] !== null && <span className="num ml-1.5 text-xs text-muted">{counts[t]}</span>}
            {t === "notes" && hasNote && <span className="ml-1.5 text-xs" aria-label="has notes">✎</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="pt-6 focus-visible:outline-offset-4">
        {tab === "learn" && <LearnPanel mod={mod} color={color} videos={verifiedVideos(resources)} topicNotes={topicNotes} />}
        {tab === "applied" && <AppliedPanel mod={mod} color={color} />}
        {tab === "resources" && <ResourcesPanel mod={mod} resources={resources} />}
        {tab === "practice" && <PracticePanel mod={mod} practice={practice} sourced={sourced} quizzes={quizzes} color={color} labs={labs} />}
        {tab === "notes" && (
          <div className="max-w-3xl">
            <NoteEditor itemKey={`module:${mod.id}`} label={`Notes for ${mod.id}`} rows={16} />
          </div>
        )}
      </div>
    </div>
  );
}

function LearnPanel({ mod, color, videos, topicNotes }: { mod: Module; color: string; videos: Resource[]; topicNotes: Record<string, TopicNote> }) {
  const note = getNote(mod.id);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        {note && <UnderstandIt note={note} color={color} />}
        <section aria-labelledby="topics-h">
          <SectionTitle id="topics-h">Topics</SectionTitle>
          <ul className="rounded-lg border border-line bg-surface px-4">
            {mod.topics.map((t) => (
              <TopicRow key={t.id} topic={t} moduleTitle={mod.title} simple={topicNotes[t.id]} />
            ))}
          </ul>
        </section>
      </div>
      <aside className="space-y-3">
        {videos.length > 0 && (
          <div className="rounded-lg border border-line bg-surface p-4" style={{ borderLeft: "4px solid #ff0033" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Watch first</p>
            <ul className="mt-1 space-y-1 text-sm">
              {videos.map((v) => (
                <li key={v.url}>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                    {v.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-lg border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${color}` }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Ask a tutor</p>
          <TutorPanel compact context={moduleTutorContext(mod, note)} />
        </div>
        {mod.mentalModel && <Callout title="Mental model" color={color} text={mod.mentalModel} />}
        {mod.outcome && <Callout title="Outcome" color={color} text={mod.outcome} />}
        {mod.tryIt && <Callout title="Try it" color={color} text={mod.tryIt} />}
      </aside>
    </div>
  );
}

function moduleTutorContext(mod: Module, note: ModuleNote | undefined) {
  const facts = [
    ...(note ? [`What it is: ${note.what}`, `Why it matters: ${note.why}`, `Example: ${note.example}`, `Common mistakes: ${note.mistakes.join("; ")}`] : []),
    mod.mentalModel ? `Mental model: ${mod.mentalModel}` : "",
    mod.outcome ? `Outcome: ${mod.outcome}` : "",
    `Topics: ${mod.topics.map((t) => t.title).join("; ")}`,
  ];
  return { title: `module ${mod.id} ${mod.title}`, facts: facts.filter(Boolean) };
}

function UnderstandIt({ note, color }: { note: ModuleNote; color: string }) {
  const labels = ["What it is", "Why it matters", "Example"];
  // Linked together so each glossary term is underlined once per note.
  const [what, why, example, ...mistakes] = linkTerms([note.what, note.why, note.example, ...note.mistakes]);
  return (
    <section aria-labelledby="understand-h" className="rounded-lg border border-line bg-surface p-4" style={{ borderTop: `4px solid ${color}` }}>
      <h2 id="understand-h" className="text-base font-semibold">Understand it</h2>
      <dl className="mt-3 space-y-3 text-sm leading-relaxed">
        {[what, why, example].map((segments, i) => (
          <div key={labels[i]}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{labels[i]}</dt>
            <dd className="mt-0.5"><Segments segments={segments} /></dd>
          </div>
        ))}
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Common mistakes</dt>
          <dd className="mt-0.5">
            <ul className="list-disc space-y-0.5 pl-5">
              {mistakes.map((segments, i) => (
                <li key={note.mistakes[i]}><Segments segments={segments} /></li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">Dotted words have a plain-word definition: hover or tap them, or browse the <Link href="/glossary" className="underline underline-offset-2 hover:text-ink">glossary</Link>.</p>
    </section>
  );
}

function Callout({ title, text, color }: { title: string; text: string; color: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${color}` }}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function ResourcesPanel({ mod, resources }: { mod: Module; resources: Resource[] }) {
  if (resources.length === 0) return <EmptyState>No resources for this module yet.</EmptyState>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {resources.map((r) => (
        <li key={r.url} className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface p-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap gap-1.5">
              <Badge>{r.type}</Badge>
              <Badge>{r.free ? "free" : "paid"}</Badge>
              {r.searchLink && <Badge title="This opens a search, not a specific page">search</Badge>}
            </div>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium underline-offset-2 hover:underline">
              {r.title}
              <span className="sr-only"> (opens in a new tab)</span>
              <span aria-hidden="true"> ↗</span>
            </a>
            <p className="mt-0.5 truncate text-xs text-muted">{new URL(r.url).hostname.replace(/^www\./, "")}</p>
          </div>
          <BookmarkButton itemKey={`resource:${mod.id}|${r.url}`} label={r.title} compact />
        </li>
      ))}
    </ul>
  );
}

function PracticePanel({ mod, practice, sourced, quizzes, color, labs }: { mod: Module; practice: PracticeItem[]; sourced: SourcedInterviewItem[]; quizzes: QuizItem[]; color: string; labs: Lab[] }) {
  const exercises = practice.filter((p): p is ExerciseItem => p.type === "exercise");
  const scenarios = practice.filter((p): p is ScenarioItem => p.type === "scenario");
  const projects = practice.filter((p): p is ProjectItem => p.type === "project");
  const coding = practice.filter((p): p is CodingItem => p.type === "coding");
  const minis = practice.filter((p): p is MiniProjectItem => p.type === "mini");
  const interview = practice.filter((p): p is InterviewItem => p.type === "interview");
  if (practice.length === 0 && sourced.length === 0 && labs.length === 0) return <EmptyState>No practice items for {mod.id}.</EmptyState>;
  return (
    <div className="space-y-8">
      {labs.map((l) => (
        <section key={l.id} aria-labelledby={`lab-${l.id}`} className="max-w-4xl">
          <SectionTitle id={`lab-${l.id}`}>Guided lab · build it step by step</SectionTitle>
          <LabCard lab={l} color={color} />
        </section>
      ))}
      {quizzes.length > 0 && (
        <section aria-labelledby="quiz-h" className="max-w-3xl">
          <SectionTitle id="quiz-h">Quiz · {quizzes.length} questions</SectionTitle>
          <QuizRunner items={quizzes} title={`${mod.id} quiz`} />
        </section>
      )}
      {coding.length > 0 && (
        <section aria-labelledby="code-h" className="max-w-4xl">
          <SectionTitle id="code-h">Coding · runs in your browser</SectionTitle>
          <div className="space-y-4">
            {coding.map((c) => (
              <CodingCard key={c.id} item={c} />
            ))}
          </div>
        </section>
      )}
      {minis.map((m) => (
        <section key={m.id} aria-labelledby={`mini-${m.id}`} className="max-w-3xl">
          <SectionTitle id={`mini-${m.id}`}>Mini project</SectionTitle>
          <MiniProjectCard item={m} color={color} />
        </section>
      ))}
      {exercises.length > 0 && (
        <section aria-labelledby="ex-h">
          <SectionTitle id="ex-h">Exercises</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-2">
            {exercises.map((e) => (
              <ExerciseCard key={e.id} item={e} />
            ))}
          </div>
        </section>
      )}
      {interview.length > 0 && (
        <section aria-labelledby="iv-h" className="max-w-3xl">
          <SectionTitle id="iv-h">Interview question</SectionTitle>
          <div className="space-y-4">
            {interview.map((q) => (
              <InterviewCard key={q.id} item={q} />
            ))}
          </div>
        </section>
      )}
      {sourced.length > 0 && (
        <section aria-labelledby="rq-h" className="max-w-3xl">
          <SectionTitle id="rq-h">Asked in real interviews · {sourced.length}</SectionTitle>
          <div className="space-y-4">
            {sourced.map((q) => (
              <InterviewCard key={q.id} item={q} />
            ))}
          </div>
        </section>
      )}
      {scenarios.length > 0 && (
        <section aria-labelledby="sc-h">
          <SectionTitle id="sc-h">Scenarios</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-2">
            {scenarios.map((s) => (
              <ScenarioCard key={s.id} item={s} />
            ))}
          </div>
        </section>
      )}
      {projects.map((p) => (
        <section key={p.id} aria-labelledby={`pr-${p.id}`} className="max-w-3xl rounded-lg border border-line bg-surface p-5">
          <SectionTitle id={`pr-${p.id}`}>Level project</SectionTitle>
          <h3 className="mb-3 text-lg font-semibold">{p.title}</h3>
          <ProjectChecklist project={p} color={color} />
          <div className="mt-6 border-t border-line pt-5">
            <CapstoneGuide levelId={p.levelId} projectId={p.id} color={color} />
          </div>
        </section>
      ))}
      <GeneratedPractice mod={mod} existing={[...quizzes.map((q) => q.question), ...scenarios.map((x) => x.title)]} />
    </div>
  );
}
