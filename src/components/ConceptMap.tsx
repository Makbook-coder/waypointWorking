"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { levelHref, levels, moduleHref, topicHref } from "@/lib/data";
import { NODE_H, NODE_W, STATUS_LABEL, ancestors, layoutMap, levelStatus, moduleStatus, unlocks } from "@/lib/concept-map";
import { PHASE_STYLE } from "@/lib/phase";
import { levelProgress } from "@/lib/progress";
import { useUserState } from "@/lib/use-store";
import { Card, SectionTitle } from "./ui";

const LAYOUT = layoutMap(levels);
const BY_ID = new Map(levels.map((l) => [l.id, l]));
const POS = new Map(LAYOUT.nodes.map((n) => [n.level.id, n]));

/** Clickable map of levels and their prerequisite hints, with one level's modules and topics underneath. */
export function ConceptMap() {
  const s = useUserState();
  const [selected, setSelected] = useState(4);
  const chain = useMemo(() => ancestors(levels, selected), [selected]);
  const status = (id: number) => levelStatus(BY_ID.get(id)!, BY_ID, s);
  const sel = BY_ID.get(selected)!;
  const next = unlocks(levels, selected);

  const edgePath = (from: number, to: number) => {
    const a = POS.get(from)!;
    const b = POS.get(to)!;
    const x1 = a.x + NODE_W / 2;
    const y1 = a.y + NODE_H;
    const x2 = b.x + NODE_W / 2;
    const y2 = b.y;
    const bend = Math.max(24, (y2 - y1) / 2);
    return `M${x1},${y1} C${x1},${y1 + bend} ${x2},${y2 - bend} ${x2},${y2}`;
  };
  const onChain = (e: { from: number; to: number }) => (chain.has(e.from) && (chain.has(e.to) || e.to === selected));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,460px)_1fr]">
      <Card className="min-w-0">
        <SectionTitle>Levels</SectionTitle>
        <p className="mb-3 text-xs text-muted">Pick a level to light up the path into it. Arrows are suggestions; every level is open.</p>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`} className="mx-auto block w-full min-w-[360px] max-w-[460px]" role="group" aria-label="Concept map of levels">
            <defs>
              <marker id="cm-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
              </marker>
            </defs>
            {LAYOUT.edges.map((e) => {
              const hot = onChain(e);
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(e.from, e.to)}
                  fill="none"
                  className={hot ? "text-ink" : "text-line"}
                  stroke="currentColor"
                  strokeWidth={hot ? 2 : 1.25}
                  markerEnd="url(#cm-arrow)"
                />
              );
            })}
            {LAYOUT.nodes.map((n) => {
              const st = status(n.level.id);
              const isSel = n.level.id === selected;
              const lit = isSel || chain.has(n.level.id);
              const color = PHASE_STYLE[n.level.phase].var;
              return (
                <g
                  key={n.level.id}
                  transform={`translate(${n.x},${n.y})`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-label={`L${n.level.id} ${n.level.title}, ${STATUS_LABEL[st]}`}
                  className="cursor-pointer focus:outline-none [&:focus-visible>rect]:stroke-ink"
                  onClick={() => setSelected(n.level.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setSelected(n.level.id);
                    }
                  }}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={8}
                    className="fill-surface"
                    stroke={lit ? color : "var(--line)"}
                    strokeWidth={isSel ? 3 : lit ? 2 : 1}
                    opacity={lit || chain.size === 0 ? 1 : 0.85}
                  />
                  <rect width={6} height={NODE_H} rx={3} fill={color} />
                  <text x={14} y={20} className="fill-ink font-mono text-[11px]">
                    L{n.level.id} · {st === "done" ? "done ✓" : `${levelProgress(n.level, s).pct}%`}
                  </text>
                  <text x={14} y={38} className="fill-ink text-[12px] font-semibold">
                    {n.level.title.length > 22 ? `${n.level.title.slice(0, 21)}…` : n.level.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="mt-3 text-xs text-muted">Bold outline: the level you picked and every level that leads into it. Percent is topics done.</p>
      </Card>

      <Card className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-muted">
              L{sel.id} · {STATUS_LABEL[status(sel.id)]}
            </p>
            <h2 className="text-xl font-semibold">{sel.title}</h2>
          </div>
          <Link href={levelHref(sel.id)} className="text-sm underline underline-offset-2">
            Open level →
          </Link>
        </div>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Suggested before</dt>
            <dd>{sel.prerequisites.length === 0 ? "Nothing, start here" : <LevelLinks ids={sel.prerequisites} onPick={setSelected} />}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Leads to</dt>
            <dd>{next.length === 0 ? "The end of the roadmap" : <LevelLinks ids={next} onPick={setSelected} />}</dd>
          </div>
        </dl>
        <div className="mt-5">
          <SectionTitle>Modules in order</SectionTitle>
        </div>
        <ol className="space-y-3">
          {sel.modules.map((m, i) => {
            const ms = moduleStatus(m, s);
            return (
              <li key={m.id}>
                <Link href={moduleHref(m.id)} className="font-medium hover:underline">
                  <span className="font-mono text-xs text-muted">{i + 1}.</span> {m.id} {m.title}
                </Link>
                <span className="ml-2 text-xs text-muted">{ms === "done" ? "done" : ms === "started" ? "in progress" : ""}</span>
                <ul className="mt-1 flex flex-wrap gap-1.5" aria-label={`${m.id} topics`}>
                  {m.topics.map((t) => {
                    const done = !!s.topics[t.id]?.done;
                    return (
                      <li key={t.id}>
                        <Link
                          href={topicHref(t.id)}
                          className={`inline-block rounded border px-1.5 py-0.5 text-xs hover:bg-surface-2 ${done ? "border-transparent text-ink" : "border-line text-muted"}`}
                          style={done ? { background: `color-mix(in srgb, ${PHASE_STYLE[sel.phase].var} 18%, transparent)` } : undefined}
                        >
                          {done && <span className="sr-only">Done: </span>}
                          {t.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}

function LevelLinks({ ids, onPick }: { ids: number[]; onPick: (id: number) => void }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {ids.map((id) => (
        <li key={id}>
          <button type="button" onClick={() => onPick(id)} className="text-left underline underline-offset-2">
            L{id} {BY_ID.get(id)?.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
