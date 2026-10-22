"use client";

import Link from "next/link";
import { EXPLAIN_LEVELS, setExplainLevel, useExplainLevel, type ExplainLevel } from "@/lib/explain-level";
import { linkTerms } from "@/lib/glossary";
import type { TopicNote } from "@/lib/topic-notes";
import { Segments } from "./GlossaryText";

const LEVEL_LABEL: Record<ExplainLevel, string> = { beginner: "Beginner", developer: "Developer", interview: "Interview" };

/** Rows of [label, text] for one wording level. Beginner is the original "Explain simply" note; no row repeats across levels. */
export function explainRows(note: TopicNote, level: ExplainLevel): [string, string][] {
  const d = note.depth;
  const l = note.levels;
  if (level === "developer" && d)
    return [
      ["In technical terms", d.developer],
      l ? ["Watch out for", l.gotchas[0]] : ["How it works", d.steps.join(". ")],
    ];
  if (level === "interview" && d)
    return [
      ["Say it like this", d.interview],
      ...(l ? ([[`They may ask: ${l.followUps[0][0]}`, l.followUps[0][1]]] as [string, string][]) : []),
      ["Key takeaway", d.takeaway],
    ];
  return (
    [
      ["In plain words", note.simple],
      ["Think of it like", note.analogy],
      ["Example", note.example],
      ["Watch out for", note.mistake],
    ] as [string, string][]
  ).filter(([, text]) => text);
}

/** Beginner / Developer / Interview switch. The choice is shared by every panel and remembered. */
export function LevelSwitch({ id }: { id: string }) {
  const level = useExplainLevel();
  return (
    <div role="radiogroup" aria-label="Explanation level" className="inline-flex rounded-md border border-line bg-surface p-0.5 text-xs">
      {EXPLAIN_LEVELS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={level === l}
          id={`${id}-${l}`}
          onClick={() => setExplainLevel(l)}
          className="rounded px-2 py-1 text-muted hover:text-ink aria-checked:bg-ink aria-checked:text-bg"
        >
          {LEVEL_LABEL[l]}
        </button>
      ))}
    </div>
  );
}

/** The body of a topic's "Explain" panel, in the chosen wording. */
export function ExplainBody({ note, id, topicHref }: { note: TopicNote; id: string; topicHref?: string }) {
  const level = useExplainLevel();
  const rows = explainRows(note, note.depth ? level : "beginner");
  const linked = linkTerms(rows.map(([, text]) => text));
  return (
    <div className="mt-2 rounded-md border border-line bg-bg p-3">
      {note.depth && (
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <LevelSwitch id={id} />
          {topicHref && (
            <Link href={topicHref} className="text-xs text-muted underline underline-offset-2 hover:text-ink">
              Full topic page →
            </Link>
          )}
        </div>
      )}
      <dl className="space-y-2 text-sm leading-relaxed" aria-live="polite">
        {rows.map(([label], i) => (
          <div key={label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
            <dd>
              <Segments segments={linked[i]} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
