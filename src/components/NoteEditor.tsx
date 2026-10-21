"use client";

import { useEffect, useId, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { store } from "@/lib/store";
import { useHydrated, useUserState } from "@/lib/use-store";

/** Markdown note with debounced autosave. */
export function NoteEditor({ itemKey, label, rows = 8 }: { itemKey: string; label: string; rows?: number }) {
  const saved = useUserState().notes[itemKey];
  const hydrated = useHydrated();
  const [text, setText] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [preview, setPreview] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  const value = text ?? saved?.text ?? "";

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function onChange(next: string) {
    setText(next);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      store.setNote(itemKey, next);
      setStatus("saved");
    }, 400);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span aria-live="polite">{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : saved ? "Saved" : ""}</span>
          <button type="button" className="underline underline-offset-2 hover:text-ink" onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>
      {preview ? (
        <div className="prose-note min-h-24 rounded-md border border-line bg-surface p-3 text-sm">
          {value.trim() ? <ReactMarkdown>{value}</ReactMarkdown> : <p className="text-muted">Nothing written yet.</p>}
        </div>
      ) : (
        <textarea
          id={id}
          rows={rows}
          disabled={!hydrated}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write in Markdown. Saves automatically."
          className="w-full rounded-md border border-line bg-surface p-3 font-mono text-sm leading-relaxed text-ink placeholder:text-muted"
        />
      )}
    </div>
  );
}
