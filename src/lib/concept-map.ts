// Layout and status for the concept map: levels as nodes, prerequisite hints as edges.
// Pure functions, so the layout is the same on the server and in tests.
import { levelProgress, moduleProgress, prerequisitesMet } from "./progress";
import type { Level } from "./types";
import type { UserState } from "./store";

export const NODE_W = 168;
export const NODE_H = 52;
const COL_GAP = 28;
const ROW_GAP = 40;
const PAD = 12;

export interface MapNode {
  level: Level;
  row: number;
  col: number;
  x: number;
  y: number;
}

export interface MapEdge {
  from: number;
  to: number;
}

export interface MapLayout {
  nodes: MapNode[];
  edges: MapEdge[];
  width: number;
  height: number;
}

/** Row = length of the longest prerequisite chain before the level, so every edge points down. */
export function levelDepths(levels: Level[]): Map<number, number> {
  const byId = new Map(levels.map((l) => [l.id, l]));
  const depth = new Map<number, number>();
  const visit = (id: number, path: Set<number>): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (path.has(id)) throw new Error(`Prerequisite cycle at L${id}`);
    path.add(id);
    const pre = (byId.get(id)?.prerequisites ?? []).filter((p) => byId.has(p));
    const d = pre.length === 0 ? 0 : 1 + Math.max(...pre.map((p) => visit(p, path)));
    path.delete(id);
    depth.set(id, d);
    return d;
  };
  for (const l of levels) visit(l.id, new Set());
  return depth;
}

/** Top-to-bottom layout. Within a row, levels sit under the average position of their prerequisites. */
export function layoutMap(levels: Level[]): MapLayout {
  const depth = levelDepths(levels);
  const rows: Level[][] = [];
  for (const l of [...levels].sort((a, b) => a.id - b.id)) (rows[depth.get(l.id)!] ??= []).push(l);
  const cols = Math.max(...rows.map((r) => r.length));
  const width = PAD * 2 + cols * NODE_W + (cols - 1) * COL_GAP;
  const xOf = new Map<number, number>();
  const nodes: MapNode[] = [];
  rows.forEach((row, r) => {
    const mean = (l: Level) => {
      const xs = l.prerequisites.map((p) => xOf.get(p)).filter((x): x is number => x !== undefined);
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : l.id;
    };
    const sorted = r === 0 ? row : [...row].sort((a, b) => mean(a) - mean(b) || a.id - b.id);
    const rowW = sorted.length * NODE_W + (sorted.length - 1) * COL_GAP;
    const x0 = (width - rowW) / 2;
    sorted.forEach((l, c) => {
      const x = x0 + c * (NODE_W + COL_GAP);
      xOf.set(l.id, x);
      nodes.push({ level: l, row: r, col: c, x, y: PAD + r * (NODE_H + ROW_GAP) });
    });
  });
  const ids = new Set(levels.map((l) => l.id));
  const edges = levels.flatMap((l) => l.prerequisites.filter((p) => ids.has(p)).map((p) => ({ from: p, to: l.id })));
  return { nodes, edges, width, height: PAD * 2 + rows.length * NODE_H + (rows.length - 1) * ROW_GAP };
}

/** Every level that leads into `id`, directly or through other levels. */
export function ancestors(levels: Level[], id: number): Set<number> {
  const byId = new Map(levels.map((l) => [l.id, l]));
  const out = new Set<number>();
  const stack = [...(byId.get(id)?.prerequisites ?? [])];
  while (stack.length) {
    const p = stack.pop()!;
    if (out.has(p) || !byId.has(p)) continue;
    out.add(p);
    stack.push(...byId.get(p)!.prerequisites);
  }
  return out;
}

/** Levels that list `id` as a direct prerequisite. */
export const unlocks = (levels: Level[], id: number) => levels.filter((l) => l.prerequisites.includes(id)).map((l) => l.id);

export type NodeStatus = "done" | "started" | "ready" | "later";

export const STATUS_LABEL: Record<NodeStatus, string> = {
  done: "Done",
  started: "In progress",
  ready: "Ready to start",
  later: "Prerequisites first",
};

/** Hints only: "later" never blocks a level, it just says the suggested levels are under 80% done. */
export function levelStatus(level: Level, levelsById: Map<number, Level>, s: UserState): NodeStatus {
  const p = levelProgress(level, s);
  if (p.total > 0 && p.done === p.total) return "done";
  if (p.done > 0) return "started";
  return prerequisitesMet(level, levelsById, s) ? "ready" : "later";
}

export function moduleStatus(m: Level["modules"][number], s: UserState): "done" | "started" | "todo" {
  const p = moduleProgress(m, s);
  return p.total > 0 && p.done === p.total ? "done" : p.done > 0 ? "started" : "todo";
}
