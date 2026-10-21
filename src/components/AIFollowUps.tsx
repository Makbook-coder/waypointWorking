"use client";

import { useId, useState } from "react";
import { askFollowUp, MAX_FOLLOW_UPS } from "@/lib/ai/tasks";
import { useAIRequest } from "@/lib/ai/use-ai";
import { MAX_ANSWER_LENGTH } from "@/lib/store";
import type { InterviewItem } from "@/lib/types";
import { AIBadge, AIErrorNote } from "./AIKit";
import { buttonClass, ghostButtonClass } from "./ui";

export interface FollowUp {
  question: string;
  answer: string;
}

/**
 * The AI plays interviewer: after your first answer it asks up to three follow-up questions that dig
 * into gaps. The exchange is passed back up so grading can take it into account.
 */
export function AIFollowUps({ item, answer, followUps, onChange }: { item: InterviewItem; answer: string; followUps: FollowUp[]; onChange: (f: FollowUp[]) => void }) {
  const ai = useAIRequest();
  const uid = useId();
  const [pending, setPending] = useState<string | null>(null); // question waiting for a reply
  const [reply, setReply] = useState("");
  const [done, setDone] = useState(false);

  /** The next question, null when the interviewer is satisfied, undefined if the request failed. */
  async function next(previous: FollowUp[]): Promise<string | null | undefined> {
    const r = await ai.run(async (p, signal) => ({
      q: await askFollowUp(p, { question: item.question, modelAnswer: item.answer, keyPoints: item.keyPoints, answer, previous }, signal),
    }));
    return r ? r.q : undefined;
  }

  async function start() {
    const q = await next(followUps);
    if (q) setPending(q);
    else if (q === null) setDone(true);
  }

  async function send() {
    if (!pending || !reply.trim()) return;
    const list = [...followUps, { question: pending, answer: reply.trim() }];
    onChange(list);
    setPending(null);
    setReply("");
    if (list.length >= MAX_FOLLOW_UPS) return setDone(true);
    const q = await next(list);
    if (q) setPending(q);
    else if (q === null) setDone(true);
  }

  async function retry() {
    const q = await next(followUps);
    if (q) setPending(q);
    else if (q === null) setDone(true);
  }

  const canStart = !pending && !done && followUps.length === 0;

  return (
    <div className="mt-3 rounded-md border border-line p-3">
      <div className="flex items-center gap-2">
        <AIBadge />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">AI interviewer</p>
      </div>
      {followUps.length > 0 && (
        <ol className="mt-2 space-y-2 text-sm">
          {followUps.map((f, i) => (
            <li key={i}>
              <p className="font-medium">{f.question}</p>
              <p className="mt-0.5 whitespace-pre-wrap text-muted">{f.answer}</p>
            </li>
          ))}
        </ol>
      )}
      {canStart && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" className={ghostButtonClass} disabled={ai.loading || answer.trim().length < 20} onClick={start}>
            {ai.loading ? "Interviewer is reading…" : "Send my answer to the interviewer"}
          </button>
          <span className="text-xs text-muted">They&apos;ll ask up to {MAX_FOLLOW_UPS} follow-ups, like a real interview.</span>
        </div>
      )}
      {pending && (
        <div className="mt-2 space-y-2">
          <p className="text-sm font-medium" aria-live="polite">
            {pending}
          </p>
          <label htmlFor={`${uid}-r`} className="sr-only">
            Your reply to the follow-up
          </label>
          <textarea
            id={`${uid}-r`}
            value={reply}
            onChange={(e) => setReply(e.target.value.slice(0, MAX_ANSWER_LENGTH))}
            rows={3}
            className="w-full resize-y rounded-md border border-line bg-surface-2 p-2 text-sm text-ink"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} disabled={ai.loading || !reply.trim()} onClick={send}>
              Reply
            </button>
            <button type="button" className={ghostButtonClass} onClick={() => { setPending(null); setDone(true); }}>
              End follow-ups
            </button>
          </div>
        </div>
      )}
      {!pending && !canStart && !done && (
        <div className="mt-2">
          {ai.loading ? (
            <p className="text-xs text-muted">Interviewer is thinking…</p>
          ) : (
            <button type="button" className={ghostButtonClass} onClick={retry}>
              Ask the next follow-up
            </button>
          )}
        </div>
      )}
      {done && <p className="mt-2 text-sm text-muted">That&apos;s all from the interviewer. Grade your answer or reveal the model answer.</p>}
      <AIErrorNote error={ai.error} />
    </div>
  );
}
