"use client";

import Link from "next/link";
import { store, type Confidence } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";
import type { Prereq } from "@/lib/prereqs";
import type { TopicNote } from "@/lib/topic-notes";
import { useExplainLevel, type ExplainLevel } from "@/lib/explain-level";
import { levelSections, type LevelSection } from "@/lib/level-sections";
import { LevelSwitch } from "./ExplainPanel";
import { GlossaryText } from "./GlossaryText";
import { InlineCode } from "./InlineCode";

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

/** The numbered sections of a topic page, for the explanation level the learner picked. */
export function TopicSections({ note, id, accent }: { note: TopicNote; id: string; accent: string }) {
  const chosen = useExplainLevel();
  const level = note.depth ? chosen : "beginner";
  const sections = levelSections(note, level);
  return (
    <div>
      {note.depth && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <LevelSwitch id={id} />
          <span className="text-sm text-muted">{LEVEL_HINT[level]}</span>
        </div>
      )}
      <ol className="space-y-7" aria-live="polite">
        {sections.map((sec, i) => (
          <li key={`${level}-${sec.label}`}>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">
              <span className="num inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-bg" style={{ background: accent }} aria-hidden="true">
                {i + 1}
              </span>
              {sec.label}
            </h2>
            <div className="mt-2 text-base leading-7 sm:text-[17px] sm:leading-8">
              <SectionBody section={sec} accent={accent} />
            </div>
          </li>
        ))}
      </ol>
      {level !== "beginner" && !note.levels && (
        <p className="mt-5 text-sm text-muted">
          {level === "developer" ? "Code, gotchas and trade-offs" : "Follow-up questions and deeper points"} for this topic are still being written.
        </p>
      )}
    </div>
  );
}

const LEVEL_HINT: Record<ExplainLevel, string> = {
  beginner: "Plain words, no jargon.",
  developer: "How to build it: code, gotchas, trade-offs.",
  interview: "How to answer it, and what they ask next.",
};

function SectionBody({ section: s, accent }: { section: LevelSection; accent: string }) {
  switch (s.kind) {
    case "text":
      return <p><GlossaryText text={s.text} /></p>;
    case "steps":
    case "list": {
      const List = s.kind === "steps" ? "ol" : "ul";
      return (
        <List className={`${s.kind === "steps" ? "list-decimal" : "list-disc"} space-y-2 pl-5`}>
          {s.items.map((x) => (
            <li key={x}><InlineCode text={x} /></li>
          ))}
        </List>
      );
    }
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md border border-line bg-surface-2 p-3 font-mono text-sm leading-relaxed">
          <code>{s.code}</code>
        </pre>
      );
    case "qa":
      return (
        <dl className="space-y-3">
          {s.pairs.map(([q, a]) => (
            <div key={q}>
              <dt className="font-semibold"><InlineCode text={q} /></dt>
              <dd className="mt-1 text-ink/80"><InlineCode text={a} /></dd>
            </div>
          ))}
        </dl>
      );
    case "beforeAfter":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-dashed border-line p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Before</p>
            <p className="mt-1"><InlineCode text={s.before} /></p>
          </div>
          <div className="rounded-md border p-3" style={{ borderColor: accent }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">After</p>
            <p className="mt-1"><InlineCode text={s.after} /></p>
          </div>
        </div>
      );
    case "analogy":
      return (
        <div>
          <p><InlineCode text={s.text} /></p>
          {s.breaks && (
            <p className="mt-2 text-ink/80">
              <span className="font-medium text-ink">Where it breaks: </span>
              <InlineCode text={s.breaks} />
            </p>
          )}
        </div>
      );
  }
}
