"use client";

import { useState } from "react";
import { MIN_ANSWER_CHARS, aiBlocker, checkTeachBack, confidenceFromScore, type AIBlocker, type TeachBackResult } from "@/lib/ai/tasks";
import { useAIRequest } from "@/lib/ai/use-ai";
import { SCORE_LABELS } from "@/lib/interview";
import { store, type Confidence } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import { AIBadge, AIBlockerNote, AIErrorNote, AIModelTag, AISetupHint } from "./AIKit";
import { buttonClass, ghostButtonClass, inputClass } from "./ui";

const CONF_LABEL: Record<Confidence, string> = { 1: "Shaky", 2: "Okay", 3: "Solid" };

/** Explain the topic in your own words; the AI tutor checks it against this page's notes. */
export function TeachBack({ topicId, topic, facts }: { topicId: string; topic: string; facts: string[] }) {
  const ai = useAIRequest();
  const s = useUserState();
  const [text, setText] = useState("");
  const [blocker, setBlocker] = useState<AIBlocker>(null);
  const [result, setResult] = useState<TeachBackResult | null>(null);
  const current = s.topics[topicId]?.confidence;

  const check = async () => {
    const b = aiBlocker(ai.configured, text);
    setBlocker(b);
    if (b) return;
    setResult(null);
    const r = await ai.run((p, signal) => checkTeachBack(p, { topic, facts, explanation: text }, signal));
    if (r) setResult(r);
  };

  const suggested = result ? confidenceFromScore(result.score) : null;

  return (
    <section aria-labelledby="teach-h" className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="teach-h" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Teach it back
        </h2>
        {ai.configured && <AIModelTag />}
      </div>
      <p className="mt-1 text-sm">Explain this topic as if to a friend who has never heard of it. Plain words are best. The tutor checks it against the notes on this page.</p>
      {!ai.configured && (
        <div className="mt-2">
          <AISetupHint>Teach-back needs the AI tutor</AISetupHint>
        </div>
      )}
      <label htmlFor="teach-text" className="sr-only">
        Your explanation
      </label>
      <textarea
        id="teach-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        maxLength={4000}
        placeholder={`In my own words, ${topic.replace(/\s*\(part of.*$/, "")} is…`}
        className={`${inputClass} mt-3 w-full`}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className={buttonClass} onClick={check} disabled={ai.loading}>
          {ai.loading ? "Checking…" : "Check my explanation"}
        </button>
        {ai.loading && (
          <button type="button" className={ghostButtonClass} onClick={ai.cancel}>
            Cancel
          </button>
        )}
        <span className="text-xs text-muted">{text.trim().length < MIN_ANSWER_CHARS ? `At least ${MIN_ANSWER_CHARS} characters` : `${text.trim().length} characters`}</span>
      </div>
      <AIBlockerNote blocker={blocker} />
      <AIErrorNote error={ai.error} />

      {result && (
        <div className="mt-4 space-y-3 border-t border-line pt-3 text-sm" aria-live="polite">
          <p className="flex flex-wrap items-center gap-2">
            <AIBadge />
            <span className="font-semibold">
              {result.score}/5 · {SCORE_LABELS[result.score]}
            </span>
            {result.verdict && <span className="text-muted">{result.verdict}</span>}
          </p>
          <FeedbackList title="What you got right" items={result.right} tone="good" />
          <FeedbackList title="What's missing" items={result.missing} tone="neutral" />
          <FeedbackList title="What's not quite right" items={result.wrong} tone="bad" />
          {result.question && (
            <p>
              <span className="font-semibold">Check yourself: </span>
              {result.question}
            </p>
          )}
          {suggested && (
            <div className="flex flex-wrap items-center gap-2">
              {current === suggested ? (
                <span className="text-xs text-muted">Your confidence for this topic is {CONF_LABEL[suggested]}.</span>
              ) : (
                <button type="button" className={ghostButtonClass} onClick={() => store.setConfidence(topicId, suggested)}>
                  Set my confidence to {CONF_LABEL[suggested]}
                </button>
              )}
              <span className="text-xs text-muted">The tutor can be wrong. You decide.</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function FeedbackList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "neutral" | "bad" }) {
  if (items.length === 0) return null;
  const mark = tone === "good" ? "✓" : tone === "bad" ? "✗" : "+";
  const color = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-muted";
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <ul className="mt-1 space-y-1">
        {items.map((x) => (
          <li key={x} className="flex gap-2">
            <span className={color} aria-hidden="true">
              {mark}
            </span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
