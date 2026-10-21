"use client";

import { useId, useState } from "react";
import type { ChatMessage } from "@/lib/ai/provider";
import { askTutor, type TutorContext } from "@/lib/ai/tasks";
import { useAIRequest } from "@/lib/ai/use-ai";
import { AIBlockerNote, AIErrorNote, AIMarkdown, AIModelTag } from "./AIKit";
import { buttonClass, ghostButtonClass } from "./ui";

const STARTERS = ["Explain this like I'm new to it", "Give me a real-world example", "Why does this matter in a job?", "Ask me one question to check I understand"];

/** A short chat with the AI tutor, grounded in this topic's or module's notes. Not saved. */
export function TutorPanel({ context, compact = false, starters = STARTERS }: { context: TutorContext; compact?: boolean; starters?: string[] }) {
  const ai = useAIRequest();
  const uid = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [needsKey, setNeedsKey] = useState(false);

  async function send(text: string) {
    const q = text.trim();
    if (ai.loading) return;
    if (!q) return document.getElementById(`${uid}-q`)?.focus();
    // Stay usable without a key: explain how to turn the tutor on instead of hiding or greying it out.
    setNeedsKey(!ai.configured);
    if (!ai.configured) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(history);
    setDraft("");
    const reply = await ai.run((p, signal) => askTutor(p, context, history, signal));
    if (reply) setMessages([...history, { role: "assistant", content: reply }]);
  }

  return (
    <div className={`space-y-3 ${compact ? "" : "text-sm"}`}>
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5">
          {starters.map((s) => (
            <button key={s} type="button" className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:border-strong-line hover:text-ink" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      {messages.length > 0 && (
        <ol className="max-h-[28rem] space-y-3 overflow-y-auto" aria-live="polite" aria-label="Conversation with the tutor">
          {messages.map((m, i) => (
            <li key={i} className={m.role === "user" ? "ml-6 rounded-md bg-surface-2 px-3 py-2 text-sm" : "rounded-md border border-line px-3 py-2"}>
              <p className="sr-only">{m.role === "user" ? "You:" : "Tutor:"}</p>
              {m.role === "user" ? m.content : <AIMarkdown text={m.content} />}
            </li>
          ))}
          {ai.loading && <li className="text-xs text-muted">Tutor is thinking…</li>}
        </ol>
      )}
      <AIBlockerNote blocker={needsKey ? "no-key" : null} />
      <AIErrorNote error={needsKey ? null : ai.error} />
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <label htmlFor={`${uid}-q`} className="sr-only">
          Ask the tutor about {context.title}
        </label>
        <textarea
          id={`${uid}-q`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          rows={2}
          placeholder="Ask anything about this…"
          className="min-w-0 flex-1 resize-y rounded-md border border-line bg-surface-2 p-2 text-sm text-ink placeholder:text-muted"
        />
        <div className="flex flex-col gap-1">
          <button type="submit" className={buttonClass} disabled={ai.loading}>
            Ask
          </button>
          {messages.length > 0 && (
            <button type="button" className={ghostButtonClass} onClick={() => { ai.cancel(); setMessages([]); }}>
              Clear
            </button>
          )}
        </div>
      </form>
      <p className="text-[11px] text-muted">
        {ai.configured ? (
          <>
            Answering with <AIModelTag />.{" "}
          </>
        ) : null}
        The tutor can make mistakes, so check important details against the notes and resources.
      </p>
    </div>
  );
}

/** A "Ask AI about this question" button that opens a tutor chat about one practice item. */
export function AskAIAbout({ context, starters, className = "" }: { context: TutorContext; starters?: string[]; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <button type="button" className={ghostButtonClass} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Ask AI about this question
      </button>
      {open && (
        <div className="mt-3 rounded-md border border-line bg-bg p-3">
          <TutorPanel compact context={context} starters={starters} />
        </div>
      )}
    </div>
  );
}
