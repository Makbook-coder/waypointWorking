import { describe, expect, it } from "vitest";
import { levels } from "@/lib/data";
import { NODE_H, NODE_W, ancestors, layoutMap, levelDepths, levelStatus, unlocks } from "@/lib/concept-map";
import { emptyState } from "@/lib/store";
import type { Level } from "@/lib/types";

const byId = new Map(levels.map((l) => [l.id, l]));

describe("concept map", () => {
  it("puts every prerequisite on an earlier row", () => {
    const depth = levelDepths(levels);
    for (const l of levels) for (const p of l.prerequisites) expect(depth.get(p)!, `L${p} -> L${l.id}`).toBeLessThan(depth.get(l.id)!);
    expect(depth.get(0)).toBe(0);
    expect(depth.get(1)).toBe(0);
  });

  it("lays out every level once, inside the canvas, with no overlaps", () => {
    const { nodes, edges, width, height } = layoutMap(levels);
    expect(nodes.map((n) => n.level.id).sort((a, b) => a - b)).toEqual(levels.map((l) => l.id));
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x + NODE_W).toBeLessThanOrEqual(width);
      expect(n.y + NODE_H).toBeLessThanOrEqual(height);
    }
    for (const a of nodes)
      for (const b of nodes)
        if (a !== b) expect(a.x + NODE_W <= b.x || b.x + NODE_W <= a.x || a.y + NODE_H <= b.y || b.y + NODE_H <= a.y).toBe(true);
    expect(edges.length).toBe(levels.reduce((n, l) => n + l.prerequisites.length, 0));
  });

  it("finds the whole chain into a level and what it leads to", () => {
    expect([...ancestors(levels, 5)].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
    expect(ancestors(levels, 0).size).toBe(0);
    expect(unlocks(levels, 4).sort((a, b) => a - b)).toEqual([5, 7, 10, 12, 14]);
  });

  it("rejects a prerequisite cycle", () => {
    const a = { id: 1, prerequisites: [2] } as Level;
    const b = { id: 2, prerequisites: [1] } as Level;
    expect(() => levelDepths([a, b])).toThrow(/cycle/);
  });

  it("marks status from progress, with prerequisites as hints only", () => {
    const s = emptyState();
    expect(levelStatus(byId.get(0)!, byId, s)).toBe("ready");
    expect(levelStatus(byId.get(5)!, byId, s)).toBe("later");
    const first = byId.get(5)!.modules[0].topics[0].id;
    const started = { ...s, topics: { ...s.topics, [first]: { ...(s.topics[first] ?? {}), done: true } } } as typeof s;
    expect(levelStatus(byId.get(5)!, byId, started)).toBe("started");
    const all = Object.fromEntries(byId.get(1)!.modules.flatMap((m) => m.topics).map((t) => [t.id, { done: true }]));
    expect(levelStatus(byId.get(1)!, byId, { ...s, topics: all } as typeof s)).toBe("done");
  });
});
