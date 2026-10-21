"use client";

import { useId, useState } from "react";
import type { ChatMessage } from "@/lib/ai/provider";
import { askTutor, type TutorContext } from "@/lib/ai/tasks";
import { useAIRequest } from "@/lib/ai/use-ai";
import { AIErrorNote, AIMarkdown, AIModelTag, AISetupHint } from "./AIKit";
import { buttonClass, ghostButtonClass } from "./ui";

const STARTERS = ["Explain this like I'm new to it", "Give me a real-world example", "Why does this matter in a job?", "Ask me one question to check I understand"];

/** A short chat with the AI tutor, grounded in this topic's or module's notes. Not saved. */
export function TutorPanel({ context, compact = false }: { context: TutorContext; compact?: boolean }) {
  const ai = useAIRequest();
  const uid = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  if (!ai.configured) return <AISetupHint>Ask an AI tutor about this</AISetupHint>;

  async function send(text: string) {
    const q = text.trim();
    if (!q || ai.loading) return;
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
          {STARTERS.map((s) => (
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
      <AIErrorNote error={ai.error} />
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
          <button type="submit" className={buttonClass} disabled={ai.loading || !draft.trim()}>
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
        Answering with <AIModelTag />. The tutor can make mistakes, so check important details against the notes and resources.
      </p>
    </div>
  );
}
