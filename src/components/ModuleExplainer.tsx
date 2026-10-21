"use client";

import { useEffect, useState } from "react";
import { parseStep, type DiagramNode } from "@/lib/diagram";
import type { Explainer } from "@/lib/explainers";
import { InlineCode } from "./InlineCode";
import { StuckLadder } from "./StuckLadder";

/** "Picture it" diagram, a worked example stepped through one line at a time, then a similar problem to try. */
export function ModuleExplainer({ explainer, color }: { explainer: Explainer; color: string }) {
  return (
    <>
      <section aria-labelledby="picture-h" className="rounded-lg border border-line bg-surface p-4">
        <h2 id="picture-h" className="text-base font-semibold">Picture it</h2>
        <p className="mt-0.5 text-sm text-muted">How the main pieces fit together.</p>
        <div className="mt-4">
          <Diagram diagram={explainer.diagram} color={color} />
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          <InlineCode text={explainer.diagram.caption} />
        </p>
      </section>
      <WorkedExample explainer={explainer} color={color} />
    </>
  );
}

export function Diagram({ diagram, color }: { diagram: Explainer["diagram"]; color: string }) {
  const groups = diagram.steps.map(parseStep);
  const label = `Diagram: ${groups.map((g) => g.map((n) => n.label).join(" or ")).join(diagram.kind === "hub" ? ", " : " then ")}${diagram.back ? `, then ${diagram.back}` : ""}.`;

  if (diagram.kind === "hub") {
    const [centre, ...spokes] = groups;
    return (
      <figure aria-label={label} className="flex flex-col items-center">
        <div className="w-full max-w-xs">
          <Group nodes={centre} color={color} strong />
        </div>
        <div aria-hidden="true" className="h-4 border-l-2" style={{ borderColor: color }} />
        <ul className="grid w-full gap-x-3 gap-y-5 border-t-2 pt-4 sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: color }}>
          {spokes.map((g, i) => (
            <li key={i} className="relative">
              <span aria-hidden="true" className="absolute -top-4 left-1/2 h-4 border-l-2" style={{ borderColor: color }} />
              <Group nodes={g} color={color} />
            </li>
          ))}
        </ul>
      </figure>
    );
  }

  return (
    <figure aria-label={label}>
      <ol className="flex flex-col items-stretch sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-y-3">
        {groups.map((g, i) => (
          <li key={i} className="flex flex-col items-stretch sm:flex-row sm:items-center">
            <div className="sm:w-36 lg:w-32 xl:w-36">
              <Group nodes={g} color={color} step={i + 1} />
            </div>
            {i < groups.length - 1 && (
              <span aria-hidden="true" className="self-center px-1.5 py-1 text-lg leading-none text-muted">
                <span className="sm:hidden">↓</span>
                <span className="hidden sm:inline">→</span>
              </span>
            )}
          </li>
        ))}
      </ol>
      {diagram.kind === "loop" && diagram.back && (
        <p className="mt-3 flex items-center gap-2 rounded-md border-2 border-dashed px-3 py-1.5 text-xs text-muted" style={{ borderColor: color }}>
          <span aria-hidden="true" className="text-base leading-none" style={{ color }}>
            ↺
          </span>
          Back to step 1: {diagram.back}
        </p>
      )}
    </figure>
  );
}

function Group({ nodes, color, step, strong }: { nodes: DiagramNode[]; color: string; step?: number; strong?: boolean }) {
  return (
    <div className={`flex h-full flex-col gap-1.5 ${nodes.length > 1 ? "rounded-md border border-dashed border-line p-1.5" : ""}`}>
      {nodes.map((n, j) => (
        <div
          key={j}
          className="flex-1 rounded-md border bg-bg px-2.5 py-2 text-center"
          style={{ borderColor: color, borderWidth: strong ? 2 : 1 }}
        >
          <span className="block text-sm font-semibold leading-snug">
            {step !== undefined && j === 0 && nodes.length === 1 && <span className="sr-only">Step {step}: </span>}
            {n.label}
          </span>
          {n.detail && <span className="mt-0.5 block text-xs leading-snug text-muted">{n.detail}</span>}
        </div>
      ))}
    </div>
  );
}

function WorkedExample({ explainer, color }: { explainer: Explainer; color: string }) {
  const { example, yourTurn } = explainer;
  const [shown, setShown] = useState(1);
  useEffect(() => setShown(1), [explainer.id]);
  const done = shown >= example.steps.length;

  return (
    <section aria-labelledby="worked-h" className="rounded-lg border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${color}` }}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Worked example</p>
      <h2 id="worked-h" className="mt-0.5 text-base font-semibold">{example.title}</h2>
      <p className="mt-2 text-sm leading-relaxed">
        <InlineCode text={example.problem} />
      </p>
      <ol className="mt-4 space-y-3" aria-live="polite">
        {example.steps.slice(0, shown).map(([say, code], i) => (
          <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-x-2">
            <span className="num mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-bg" style={{ background: color }} aria-hidden="true">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm leading-relaxed">
                <span className="sr-only">Step {i + 1}: </span>
                <InlineCode text={say} />
              </p>
              {code && (
                <pre className="mt-1.5 overflow-x-auto rounded-md bg-surface-2 p-2.5 font-mono text-[0.8rem] leading-relaxed">
                  <code>{code}</code>
                </pre>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!done ? (
          <>
            <button type="button" onClick={() => setShown((n) => n + 1)} className="rounded-md border border-strong-line bg-ink px-3 py-1.5 text-sm font-medium text-bg hover:opacity-90">
              Next step ({shown + 1} of {example.steps.length})
            </button>
            <button type="button" onClick={() => setShown(example.steps.length)} className="text-sm text-muted underline underline-offset-2 hover:text-ink">
              Show all
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setShown(1)} className="text-sm text-muted underline underline-offset-2 hover:text-ink">
            Start again
          </button>
        )}
      </div>
      {done && (
        <p className="mt-3 rounded-md bg-surface-2 p-3 text-sm leading-relaxed">
          <span className="font-semibold">Result: </span>
          <InlineCode text={example.result} />
        </p>
      )}

      <div className="mt-5 border-t border-line pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your turn</p>
        <p className="mt-1 text-sm leading-relaxed">
          <InlineCode text={yourTurn.task} />
        </p>
        <StuckLadder
          resetKey={explainer.id}
          rungs={[
            { label: "Hint 1", text: yourTurn.hints[0] },
            { label: "Hint 2", text: yourTurn.hints[1] },
            { label: "Answer", text: yourTurn.answer },
          ]}
        />
      </div>
    </section>
  );
}
