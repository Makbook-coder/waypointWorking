"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { passedAll } from "@/lib/coding";
import { runPython, type RunnerStatus } from "@/lib/py-runner";
import type { SnippetSrc } from "@/lib/snippets";
import { CodeEditor } from "./CodeEditor";
import { InlineCode } from "./InlineCode";
import { buttonClass, ghostButtonClass } from "./ui";

// The runner grades tests, so a snippet runs with one test that always passes. If it fails, the code raised.
const RUN_ONLY = [{ name: "run", code: "pass" }];

type Outcome = { out: string; error?: string };

/** One editable, runnable Python snippet. Runs in the same in-browser Python as the coding tasks. */
export function RunnableSnippet({ snippet }: { snippet: SnippetSrc }) {
  const uid = useId();
  const [code, setCode] = useState(snippet.code);
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const busy = status !== "idle";
  const edited = code !== snippet.code;

  async function run() {
    if (busy) return;
    const r = await runPython(code, RUN_ONLY, setStatus);
    setOutcome({ out: r.stdout, error: r.fatal ?? (passedAll(r) ? undefined : r.results[0]?.error ?? "error") });
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void run();
    }
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4" onKeyDown={onKey}>
      <h3 className="text-sm font-semibold">{snippet.title}</h3>
      <p className="mt-1 text-sm text-muted"><InlineCode text={snippet.intro} /></p>
      <label htmlFor={`${uid}-code`} className="sr-only">Python code for {snippet.title}</label>
      <CodeEditor id={`${uid}-code`} value={code} onChange={setCode} describedBy={`${uid}-hint`} minRows={5} maxRows={26} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void run()} disabled={busy} className={buttonClass}>
          {status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : "Run"}
        </button>
        {edited && (
          <button type="button" onClick={() => { setCode(snippet.code); setOutcome(null); }} disabled={busy} className={ghostButtonClass}>
            Reset
          </button>
        )}
        <span id={`${uid}-hint`} className="text-xs text-muted">Ctrl or ⌘ + Enter runs it. The first run downloads Python (about 14 MB), then it is instant.</span>
      </div>
      {snippet.tryThis && <p className="mt-2 text-sm"><span className="font-medium">Try this: </span><InlineCode text={snippet.tryThis} /></p>}
      <div aria-live="polite" className="mt-2">
        {outcome && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Output</p>
            <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface-2 p-3 font-mono text-[13px] leading-snug">{outcome.out || (outcome.error ? "" : "(nothing printed)")}{outcome.error && <span className="text-bad">{outcome.out && !outcome.out.endsWith("\n") ? "\n" : ""}Error: {outcome.error}</span>}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

/** The "Try it" section of a topic page. */
export function TrySnippets({ snippets }: { snippets: SnippetSrc[] }) {
  return (
    <section aria-labelledby="try-h">
      <h2 id="try-h" className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Try it · run it in your browser</h2>
      <p className="mb-2 text-sm text-muted">Edit the code and press Run. Nothing leaves your device, and you cannot break anything.</p>
      <div className="space-y-3">
        {snippets.map((s) => (
          <RunnableSnippet key={s.title} snippet={s} />
        ))}
      </div>
    </section>
  );
}
