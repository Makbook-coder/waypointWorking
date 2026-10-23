"use client";

import { useState } from "react";
import { store, type Confidence } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import type { TopicNote } from "@/lib/topic-notes";
import { topicHref } from "@/lib/data";
import type { Topic } from "@/lib/types";
import { topicVideo } from "@/lib/youtube";
import { topicDifficulty } from "@/lib/difficulty";
import { DifficultyBadge } from "./Difficulty";
import { BookmarkButton } from "./BookmarkButton";
import { ExplainBody } from "./ExplainPanel";
import { NoteEditor } from "./NoteEditor";
import { TutorPanel } from "./TutorPanel";

const CONF_LABEL: Record<Confidence, string> = { 1: "Shaky", 2: "Okay", 3: "Solid" };

export function TopicRow({
  topic,
  moduleTitle,
  showDescription = true,
  simple,
}: {
  topic: Topic;
  moduleTitle: string;
  showDescription?: boolean;
  simple?: TopicNote;
}) {
  const s = useUserState();
  const p = s.topics[topic.id];
  const done = Boolean(p?.done);
  const hasNote = Boolean(s.notes[`topic:${topic.id}`]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const checkId = `t-${topic.id}`;
  const video = topicVideo(topic, { title: moduleTitle });

  return (
    <li className="group border-b border-line py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <input
          id={checkId}
          type="checkbox"
          checked={done}
          onChange={(e) => store.setTopicDone(topic.id, e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--ink)]"
        />
        <div className="min-w-0 flex-1">
          <label htmlFor={checkId} className={`cursor-pointer font-medium ${done ? "text-muted line-through decoration-1" : ""}`}>
            {topic.title}
          </label>
          {showDescription && topic.description && topic.description !== topic.title && (
            <p className="mt-0.5 text-sm text-muted">{topic.description}</p>
          )}
          {simple && <ExplainSimply note={simple} topicId={topic.id} />}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DifficultyBadge level={topicDifficulty(topic.id)} />
            <fieldset className="flex items-center gap-1">
              <legend className="sr-only">Confidence for {topic.title}</legend>
              {([1, 2, 3] as Confidence[]).map((c) => {
                const on = p?.confidence === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => store.setConfidence(topic.id, on ? null : c)}
                    className={`rounded border px-1.5 py-0.5 text-[11px] ${on ? "border-strong-line bg-ink text-bg" : "border-line text-muted hover:text-ink"}`}
                  >
                    {c} {CONF_LABEL[c]}
                  </button>
                );
              })}
            </fieldset>
            <button
              type="button"
              aria-expanded={noteOpen}
              onClick={() => setNoteOpen((o) => !o)}
              className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:text-ink"
            >
              {hasNote ? "Note ✎" : "Add note"}
            </button>
            <button
              type="button"
              aria-expanded={tutorOpen}
              onClick={() => setTutorOpen((o) => !o)}
              className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:text-ink"
            >
              Ask tutor
              <span className="sr-only"> about {topic.title}</span>
            </button>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Opens a YouTube search for this topic"
              className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:border-[#ff0033] hover:text-ink"
            >
              <YouTubeIcon />
              YouTube
              <span className="sr-only">: search videos on {topic.title} (opens in a new tab)</span>
            </a>
            <BookmarkButton itemKey={`topic:${topic.id}`} label={topic.title} compact />
          </div>
          {tutorOpen && (
            <div className="mt-3 rounded-md border border-line bg-bg p-3">
              <TutorPanel
                compact
                context={{
                  title: `${topic.title} (part of "${moduleTitle}")`,
                  facts: [topic.description, ...(simple ? [simple.simple, `Analogy: ${simple.analogy}`, `Example: ${simple.example}`, `Common mistake: ${simple.mistake}`] : [])].filter(Boolean),
                }}
              />
            </div>
          )}
          {noteOpen && (
            <div className="mt-3">
              <NoteEditor itemKey={`topic:${topic.id}`} label={`Note on ${topic.title}`} rows={4} />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function ExplainSimply({ note, topicId }: { note: TopicNote; topicId: string }) {
  return (
    <details className="group/simple mt-1.5">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="transition-transform group-open/simple:rotate-90">▸</span>
        Explain simply
      </summary>
      <ExplainBody note={note} id={`lvl-${topicId}`} topicHref={topicHref(topicId)} />
    </details>
  );
}

function YouTubeIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 28 20" aria-hidden="true">
      <rect width="28" height="20" rx="5" fill="#ff0033" />
      <path d="M11 5.5v9l8-4.5z" fill="#fff" />
    </svg>
  );
}
