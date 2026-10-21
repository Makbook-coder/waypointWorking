"use client";

import { useRef, type KeyboardEvent } from "react";

const INDENT = "    ";

/** A plain textarea for Python. Tab indents; press Esc first to let Tab move focus out. */
export function CodeEditor({ id, value, onChange, describedBy, minRows = 8, maxRows = 24 }: { id: string; value: string; onChange: (next: string) => void; describedBy?: string; minRows?: number; maxRows?: number }) {
  const escaped = useRef(false);

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      escaped.current = true;
      return;
    }
    if (e.key === "Tab" && !escaped.current) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: a, selectionEnd: b, value: v } = el;
      if (e.shiftKey) {
        const lineStart = v.lastIndexOf("\n", a - 1) + 1;
        if (v.startsWith(INDENT, lineStart)) {
          onChange(v.slice(0, lineStart) + v.slice(lineStart + INDENT.length));
          requestAnimationFrame(() => el.setSelectionRange(Math.max(lineStart, a - INDENT.length), Math.max(lineStart, b - INDENT.length)));
        }
        return;
      }
      onChange(v.slice(0, a) + INDENT + v.slice(b));
      requestAnimationFrame(() => el.setSelectionRange(a + INDENT.length, a + INDENT.length));
      return;
    }
    escaped.current = false;
  }

  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKey}
      rows={Math.min(maxRows, Math.max(minRows, value.split("\n").length + 1))}
      spellCheck={false}
      wrap="off"
      autoCapitalize="off"
      autoCorrect="off"
      aria-describedby={describedBy}
      className="mt-1 w-full resize-y rounded-md border border-line bg-surface-2 p-3 font-mono text-[13px] leading-relaxed text-ink"
    />
  );
}
