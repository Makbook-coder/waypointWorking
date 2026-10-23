"use client";

import { useState } from "react";
import { aiBlocker, type AIBlocker } from "@/lib/ai/tasks";
import { useAIRequest } from "@/lib/ai/use-ai";
import { explainWrongOptions } from "@/lib/ai/wrong-why";
import { MISS_REASONS } from "@/lib/mistake-log";
import { store } from "@/lib/store";
import type { QuizItem } from "@/lib/types";
import { useUserState } from "@/lib/use-store";
import { AIBadge, AIBlockerNote, AIErrorNote, AIModelTag } from "./AIKit";
import { ghostButtonClass } from "./ui";

const LETTERS = ["A", "B", "C", "D"];

/** After a miss: note why it happened, and ask the AI tutor why each wrong option is wrong. */
export function WrongAnswerHelp({ item, picked }: { item: QuizItem; picked?: number }) {
  const s = useUserState();
  const ai = useAIRequest();
  const [blocker, setBlocker] = useState<AIBlocker>(null);
  const m = s.mistakes[item.id];
  const why = m?.why;

  const explain = async () => {
    const b = aiBlocker(ai.configured);
    setBlocker(b);
    if (b) return;
    const r = await ai.run((p, signal) => explainWrongOptions(p, item, picked ?? m?.picked, signal));
    if (r) store.setMistakeWhy(item.id, r);
  };

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      {m && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">What went wrong? (optional)</p>
          <div className="mt-1 flex flex-wrap gap-1.5" role="group" aria-label="Why you missed it">
            {MISS_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={m.reason === r.id}
                onClick={() => store.setMistakeReason(item.id, m.reason === r.id ? null : r.id)}
                className={`rounded-md border px-2.5 py-1 text-xs ${m.reason === r.id ? "border-ink bg-ink text-bg" : "border-line hover:border-strong-line"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {why ? (
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Why not the others? <AIBadge />
          </p>
          <ul className="mt-1 space-y-1.5">
            {item.options.map((o, i) =>
              i === item.answer || !why[i] ? null : (
                <li key={i} className="text-sm">
                  <span className="font-mono text-xs font-semibold text-muted">{LETTERS[i]}</span> <span className="text-muted">{o}</span>
                  <br />
                  {why[i]}
                </li>
              ),
            )}
          </ul>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={ghostButtonClass} onClick={explain} disabled={ai.loading}>
            {ai.loading ? "Thinking…" : "Why not the others?"}
          </button>
          {ai.configured && <AIModelTag />}
        </div>
      )}
      <AIBlockerNote blocker={blocker} />
      <AIErrorNote error={ai.error} />
    </div>
  );
}
