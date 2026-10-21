"use client";

import { useState } from "react";
import { store, type Confidence } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import type { Topic } from "@/lib/types";
import { BookmarkButton } from "./BookmarkButton";
import { NoteEditor } from "./NoteEditor";

const CONF_LABEL: Record<Confidence, string> = { 1: "Shaky", 2: "Okay", 3: "Solid" };

export function TopicRow({ topic, showDescription = true }: { topic: Topic; showDescription?: boolean }) {
  const s = useUserState();
  const p = s.topics[topic.id];
  const done = Boolean(p?.done);
  const hasNote = Boolean(s.notes[`topic:${topic.id}`]);
  const [noteOpen, setNoteOpen] = useState(false);
  const checkId = `t-${topic.id}`;

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
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
            <BookmarkButton itemKey={`topic:${topic.id}`} label={topic.title} compact />
          </div>
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
