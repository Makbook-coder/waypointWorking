"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { passedAll, type RunResult } from "@/lib/coding";
import { getTopic } from "@/lib/data";
import { runPython, type RunnerStatus } from "@/lib/py-runner";
import { store } from "@/lib/store";
import type { CodingItem } from "@/lib/types";
import { useUserState } from "@/lib/use-store";
import { AICodeHints } from "./AIKit";
import { BookmarkButton } from "./BookmarkButton";
import { InlineCode } from "./InlineCode";
import { Badge, buttonClass, ghostButtonClass } from "./ui";

const SAVE_DELAY_MS = 600;
const INDENT = "    ";

/** A Python task with an editor, in-browser tests, a hidden reference solution and a short checklist. */
export function CodingCard({ item, context }: { item: CodingItem; context?: string }) {
  const s = useUserState();
  const record = s.coding[item.id];
  const [code, setCode] = useState(record?.code ?? item.starter);
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [result, setResult] = useState<RunResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const escaped = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId();

  // Pick up the saved draft once storage has loaded (the first render uses the starter).
  const savedCode = record?.code;
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current && savedCode !== undefined) setCode(savedCode);
  }, [savedCode]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  function edit(next: string) {
    touched.current = true;
    setCode(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => store.saveCode(item.id, next === item.starter ? "" : next), SAVE_DELAY_MS);
  }

  // Tab indents. Press Esc first to let Tab move focus out of the editor.
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      escaped.current = true;
      return;
    }
    if (e.key === "Tab" && !escaped.current) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: a, selectionEnd: b, value } = el;
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf("\n", a - 1) + 1;
        if (value.startsWith(INDENT, lineStart)) {
          edit(value.slice(0, lineStart) + value.slice(lineStart + INDENT.length));
          requestAnimationFrame(() => el.setSelectionRange(Math.max(lineStart, a - INDENT.length), Math.max(lineStart, b - INDENT.length)));
        }
        return;
      }
      edit(value.slice(0, a) + INDENT + value.slice(b));
      requestAnimationFrame(() => el.setSelectionRange(a + INDENT.length, a + INDENT.length));
      return;
    }
    escaped.current = false;
  }

  async function run() {
    const r = await runPython(code, item.tests, setStatus);
    setResult(r);
    if (passedAll(r)) store.markCodingPassed(item.id);
  }

  const passed = Boolean(record?.passedAt);
  const okCount = result?.results.filter((t) => t.ok).length ?? 0;
  const topics = item.topicIds.map((id) => getTopic(id)?.topic.title).filter(Boolean);
  const lines = Math.min(24, Math.max(8, code.split("\n").length + 1));

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge>coding</Badge>
            <Badge>{item.difficulty}</Badge>
            {passed && <Badge title="All tests passed">✓ passed</Badge>}
            {context && <span className="text-xs text-muted">{context}</span>}
          </div>
          <h3 className="font-semibold">{item.title}</h3>
          {topics.length > 0 && <p className="mt-0.5 text-xs text-muted">Topics: {topics.join(" · ")}</p>}
        </div>
        <BookmarkButton itemKey={`practice:${item.id}`} label={item.title} compact />
      </div>

      <p className="mt-2 text-sm leading-relaxed">
        <InlineCode text={item.prompt} />
      </p>

      <label htmlFor={`${uid}-code`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
        Your code (Python)
      </label>
      <textarea
        id={`${uid}-code`}
        value={code}
        onChange={(e) => edit(e.target.value)}
        onKeyDown={onKey}
        rows={lines}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-describedby={`${uid}-hint`}
        className="mt-1 w-full resize-y rounded-md border border-line bg-surface-2 p-3 font-mono text-[13px] leading-relaxed text-ink"
      />
      <p id={`${uid}-hint`} className="mt-1 text-xs text-muted">
        Tab indents. Press Esc, then Tab, to leave the editor. Your draft saves in this browser.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={buttonClass} onClick={run} disabled={status !== "idle"}>
          {status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : "Run tests"}
        </button>
        <button
          type="button"
          className={ghostButtonClass}
          onClick={() => {
            edit(item.starter);
            setResult(null);
          }}
          disabled={code === item.starter}
        >
          Reset to starter
        </button>
        <button type="button" className={ghostButtonClass} aria-expanded={showSolution} onClick={() => setShowSolution((v) => !v)}>
          {showSolution ? "Hide solution" : "Show solution"}
        </button>
      </div>
      <div className="mt-3">
        <AICodeHints input={{ title: item.title, prompt: item.prompt, tests: item.tests, code, results: result ? summarize(result) : undefined }} />
      </div>
      {status === "loading" && <p className="mt-2 text-xs text-muted">The first run downloads the Python runtime (about 14 MB), then it is cached.</p>}

      <div aria-live="polite">
        {result && (
          <div className="mt-3 rounded-md border border-line p-3 text-sm">
            {result.fatal ? (
              <p className="text-bad">{result.fatal}</p>
            ) : (
              <>
                <p className="num font-semibold">
                  {okCount}/{result.results.length} tests passed{passedAll(result) ? " ✓" : ""}
                </p>
                <ul className="mt-2 space-y-1">
                  {result.results.map((t) => (
                    <li key={t.name} className="flex gap-2">
                      <span aria-hidden="true">{t.ok ? "✓" : "✗"}</span>
                      <span>
                        <span className="sr-only">{t.ok ? "Passed: " : "Failed: "}</span>
                        {t.name}
                        {t.error && <code className="mt-0.5 block break-words font-mono text-xs text-muted">{t.error}</code>}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {result.stdout && (
              <>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">Printed output</p>
                <pre className="mt-1 max-h-48 overflow-auto rounded bg-surface-2 p-2 font-mono text-xs">{result.stdout}</pre>
              </>
            )}
          </div>
        )}
      </div>

      {showSolution && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Reference solution</p>
          <pre className="mt-1 overflow-auto rounded-md border border-line bg-surface-2 p-3 font-mono text-[13px] leading-relaxed">{item.solution}</pre>
          <button type="button" className={`${ghostButtonClass} mt-2`} onClick={() => edit(item.solution)}>
            Copy into editor
          </button>
        </div>
      )}

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Before you call it done</p>
      <ul className="mt-1 space-y-1.5">
        {item.checklist.map((c, i) => {
          const id = `${uid}-c${i}`;
          const checked = Boolean(s.projectChecks[`${item.id}#${i}`]);
          return (
            <li key={c} className="flex items-start gap-2">
              <input id={id} type="checkbox" checked={checked} onChange={(e) => store.setProjectCheck(item.id, i, e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--ink)]" />
              <label htmlFor={id} className="cursor-pointer text-sm">
                {c}
              </label>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

/** One line about the last run, for the AI hint request. */
function summarize(r: RunResult): string {
  if (r.fatal) return `It didn't run: ${r.fatal}`;
  const failed = r.results.filter((t) => !t.ok).map((t) => `${t.name}${t.error ? `: ${t.error}` : ""}`);
  return `${r.results.length - failed.length}/${r.results.length} tests passed.${failed.length ? ` Failed: ${failed.join("; ")}` : ""}`;
}
