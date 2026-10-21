"use client";

import Link from "next/link";
import { store, type Confidence } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import type { Prereq } from "@/lib/prereqs";
import type { TopicNote } from "@/lib/topic-notes";
import { linkTerms } from "@/lib/glossary";
import { useExplainLevel } from "@/lib/explain-level";
import { LevelSwitch } from "./ExplainPanel";
import { Segments } from "./GlossaryText";

const CONF_LABEL: Record<Confidence, string> = { 1: "Shaky", 2: "Okay", 3: "Solid" };

/** Done checkbox and confidence for one topic, as on the module page. */
export function TopicStatus({ topicId, title }: { topicId: string; title: string }) {
  const p = useUserState().topics[topicId];
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={Boolean(p?.done)} onChange={(e) => store.setTopicDone(topicId, e.target.checked)} className="h-5 w-5 accent-[var(--ink)]" />
        I understand this
      </label>
      <fieldset className="flex items-center gap-1">
        <legend className="sr-only">Confidence for {title}</legend>
        {([1, 2, 3] as Confidence[]).map((c) => {
          const on = p?.confidence === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => store.setConfidence(topicId, on ? null : c)}
              className={`rounded border px-1.5 py-0.5 text-[11px] ${on ? "border-strong-line bg-ink text-bg" : "border-line text-muted hover:text-ink"}`}
            >
              {c} {CONF_LABEL[c]}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}

/** "Before this" line: each prerequisite with a tick once all its topics are done. */
export function PrereqCheck({ prereqs }: { prereqs: Prereq[] }) {
  const s = useUserState();
  const hydrated = useHydrated();
  if (prereqs.length === 0)
    return <p className="text-sm text-muted">No prerequisites: this is a starting point.</p>;
  const ready = (p: Prereq) => hydrated && p.topicIds.every((id) => s.topics[id]?.done);
  const allReady = prereqs.every(ready);
  return (
    <div className="text-sm">
      <span className="font-medium">Before this, be comfortable with: </span>
      {prereqs.map((p, i) => (
        <span key={p.href}>
          {i > 0 && ", "}
          <span aria-hidden="true" className={ready(p) ? "text-ink" : "text-muted"}>
            {ready(p) ? "✓ " : "○ "}
          </span>
          <Link href={p.href} className="underline underline-offset-2">
            {p.label}
          </Link>
          <span className="sr-only">{ready(p) ? " (done)" : " (not done yet)"}</span>
        </span>
      ))}
      {hydrated && !allReady && <span className="text-muted">. Shaky on these? A quick look first will make this easier.</span>}
    </div>
  );
}

/** "What it is", in the wording the learner picked. */
export function WhatItIs({ note, id }: { note: TopicNote; id: string }) {
  const level = useExplainLevel();
  const d = note.depth;
  const text = level === "developer" && d ? d.developer : level === "interview" && d ? d.interview : note.simple;
  const [segments] = linkTerms([text]);
  return (
    <div>
      {d && (
        <div className="mb-2">
          <LevelSwitch id={id} />
        </div>
      )}
      <p className="text-base leading-relaxed" aria-live="polite">
        <Segments segments={segments} />
      </p>
    </div>
  );
}
