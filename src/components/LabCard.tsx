"use client";

import { useEffect, useId, useRef, useState } from "react";
import { passedAll, type RunResult } from "@/lib/coding";
import { downloadText } from "@/lib/download";
import { checkpointTests, downloadable, labKey, starterCode, stepKey, stepsPassed, type Lab, type LabMode } from "@/lib/lab-steps";
import { runPython, type RunnerStatus } from "@/lib/py-runner";
import { store } from "@/lib/store";
import { useUserState } from "@/lib/use-store";
import { CodeEditor } from "./CodeEditor";
import { InlineCode } from "./InlineCode";
import { StuckLadder } from "./StuckLadder";
import { TestResults } from "./TestResults";
import { Badge, ProgressBar, buttonClass, ghostButtonClass } from "./ui";

const SAVE_DELAY_MS = 600;

const MODE_LABEL: Record<LabMode, string> = {
  guided: "guided: fill the gaps",
  partial: "partial: signature given",
  open: "open: spec only",
};

/** Put a step's solution in the editor: replace its scaffold if it's still there, otherwise append. */
function withSolution(code: string, scaffold: string, solution: string): string {
  const s = scaffold.trim();
  if (s && code.includes(s)) return code.replace(s, solution.trim());
  return `${code.replace(/\s+$/, "")}\n\n\n${solution.trim()}\n`;
}

/** A guided lab: one evolving file, built step by step, with a checkpoint after each step. */
export function LabCard({ lab, color }: { lab: Lab; color?: string }) {
  const s = useUserState();
  const uid = useId();
  const key = labKey(lab.id);
  const saved = s.coding[key]?.code;
  const passed = stepsPassed(lab, s.coding);
  const done = passed >= lab.steps.length;
  const [code, setCode] = useState(saved ?? starterCode(lab));
  const [active, setActive] = useState(Math.min(passed, lab.steps.length - 1));
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [result, setResult] = useState<RunResult | null>(null);
  const [unlocked, setUnlocked] = useState<number | null>(null);
  const touched = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Storage loads after the first render: pick up the saved draft and progress once.
  useEffect(() => {
    if (touched.current) return;
    if (saved !== undefined) setCode(saved);
    setActive(Math.min(passed, lab.steps.length - 1));
  }, [saved, passed, lab.steps.length]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  function edit(next: string) {
    touched.current = true;
    setCode(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => store.saveCode(key, next), SAVE_DELAY_MS);
  }

  async function check() {
    const r = await runPython(code, checkpointTests(lab, active), setStatus);
    setResult(r);
    setUnlocked(null);
    if (!passedAll(r)) return;
    store.markCodingPassed(stepKey(lab.id, active));
    const next = lab.steps[active + 1];
    if (next) {
      setActive(active + 1);
      setUnlocked(active + 1);
      if (next.scaffold.trim() && !code.includes(next.scaffold.trim())) edit(`${code.replace(/\s+$/, "")}\n\n\n${next.scaffold.trim()}\n`);
    }
  }

  const step = lab.steps[active];
  const reachable = (i: number) => i <= passed;

  return (
    <article className="rounded-lg border border-line bg-surface p-4" style={color ? { borderTop: `4px solid ${color}` } : undefined}>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge>guided lab</Badge>
        <Badge>{lab.steps.length} steps</Badge>
        {done && <Badge title="Every checkpoint passed">✓ complete</Badge>}
      </div>
      <h3 className="text-lg font-semibold">{lab.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{lab.goal}</p>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar pct={Math.floor((passed / lab.steps.length) * 100)} color={color} label={`${lab.title}: checkpoints passed`} size="sm" />
        <span className="num shrink-0 text-xs text-muted">
          {passed}/{lab.steps.length} checkpoints
        </span>
      </div>

      <ol className="mt-4 flex flex-wrap gap-2" aria-label="Lab steps">
        {lab.steps.map((st, i) => (
          <li key={st.title}>
            <button
              type="button"
              onClick={() => {
                setActive(i);
                setResult(null);
                setUnlocked(null);
              }}
              disabled={!reachable(i)}
              aria-current={i === active ? "step" : undefined}
              className="rounded-md border border-line px-2.5 py-1 text-xs aria-[current=step]:border-strong-line aria-[current=step]:bg-ink aria-[current=step]:text-bg disabled:opacity-40"
              title={reachable(i) ? st.title : "Pass the earlier checkpoints first"}
            >
              <span aria-hidden="true">{i < passed ? "✓ " : ""}</span>
              {i + 1}. {st.title}
            </button>
          </li>
        ))}
      </ol>

      <section className="mt-4 rounded-md bg-surface-2 p-3" aria-labelledby={`${uid}-step`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Step {active + 1} of {lab.steps.length} · {MODE_LABEL[step.mode]}
        </p>
        <h4 id={`${uid}-step`} className="mt-0.5 font-semibold">
          {step.title}
        </h4>
        <p className="mt-1 text-sm leading-relaxed">
          <InlineCode text={step.instructions} />
        </p>
        {step.mode === "open" && <p className="mt-2 text-xs text-muted">No starter code for this one. Write it below the earlier steps, then run the checkpoint.</p>}
      </section>

      <label htmlFor={`${uid}-code`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
        Your lab file (Python)
      </label>
      <CodeEditor id={`${uid}-code`} value={code} onChange={edit} describedBy={`${uid}-hint`} minRows={12} maxRows={32} />
      <p id={`${uid}-hint`} className="mt-1 text-xs text-muted">
        One file for the whole lab. Each checkpoint also re-runs the earlier steps&apos; tests, so nothing you built breaks. Your draft saves in this browser.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={buttonClass} onClick={check} disabled={status !== "idle"}>
          {status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : `Run checkpoint ${active + 1}`}
        </button>
        <button type="button" className={ghostButtonClass} onClick={() => downloadText(`${lab.id}.py`, downloadable(lab, code, active))}>
          Download .py
        </button>
        <button
          type="button"
          className={ghostButtonClass}
          onClick={() => {
            edit(starterCode(lab));
            setResult(null);
          }}
        >
          Start over
        </button>
      </div>
      {status === "loading" && <p className="mt-2 text-xs text-muted">The first run downloads the Python runtime (about 14 MB), then it is cached.</p>}

      <TestResults result={result} />
      {unlocked !== null && (
        <p role="status" className="mt-2 text-sm font-medium">
          Checkpoint {unlocked} passed. Step {unlocked + 1} is unlocked
          {lab.steps[unlocked].scaffold.trim() ? " and its starter code is at the bottom of your file." : ". It has no starter code: write it from the spec."}
        </p>
      )}

      <StuckLadder
        resetKey={`${lab.id}-${active}`}
        rungs={[
          { label: "Hint 1", text: step.hints[0] },
          { label: "Hint 2", text: step.hints[1] },
          { label: "Solution", text: "" },
        ]}
        last={
          <>
            <span className="text-muted">Read it, close it, then type it yourself. Copying teaches far less than retyping.</span>
            <pre className="mt-1 overflow-auto rounded-md border border-line bg-surface p-3 font-mono text-[13px] leading-relaxed">{step.solution.trim()}</pre>
            <button type="button" className={`${ghostButtonClass} mt-2`} onClick={() => edit(withSolution(code, step.scaffold, step.solution))}>
              Put this step&apos;s solution in my file
            </button>
          </>
        }
      />

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted">Prefer your own editor, or Colab?</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          <li>Click Download .py. The file has your code plus this checkpoint&apos;s tests.</li>
          <li>Locally: install Python 3.10 or newer, then run <code className="font-mono">python {lab.id}.py</code> in a terminal. It prints PASS or FAIL per test.</li>
          <li>In Colab: open colab.new, paste the file into one cell and run it. No installs needed, it only uses the standard library.</li>
          <li>Paste your finished code back here and run the checkpoint to record your progress.</li>
        </ol>
      </details>

      {done && (
        <div className="mt-4 rounded-md border-l-4 border-strong-line bg-surface-2 p-3 text-sm">
          <p className="font-semibold">Lab complete. Take it further:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {lab.stretch.map((x) => (
              <li key={x}>
                <InlineCode text={x} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
