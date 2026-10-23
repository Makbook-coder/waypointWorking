import { describe, expect, it } from "vitest";
import { MODULE_DIFFICULTY } from "../content/difficulty";
import { PROJECTS } from "../content/projects";
import { moduleDifficulty, moduleIdOfTopic, projectDifficulty, topicDifficulty } from "@/lib/difficulty";
import { allTopics, levels, modules } from "@/lib/data";

describe("difficulty tags", () => {
  it("rates every module and nothing else", () => {
    expect(Object.keys(MODULE_DIFFICULTY).sort()).toEqual(modules.map((m) => m.id).sort());
    for (const m of modules) expect([1, 2, 3], m.id).toContain(moduleDifficulty(m.id));
  });

  it("gives every topic its module's rating", () => {
    for (const m of modules) for (const t of m.topics) {
      expect(moduleIdOfTopic(t.id), t.id).toBe(m.id);
      expect(topicDifficulty(t.id), t.id).toBe(moduleDifficulty(m.id));
    }
    expect(allTopics.length).toBeGreaterThan(0);
  });

  it("rates every project, and small builds are never harder than bigger ones in the same topic", () => {
    for (const p of PROJECTS) expect(projectDifficulty(p), p.id).toBeDefined();
    const byTopic = new Map<string, number[]>();
    for (const p of PROJECTS) {
      if (p.scope !== "topic" || p.size === "practice") continue;
      byTopic.set(p.refId, [...(byTopic.get(p.refId) ?? []), projectDifficulty(p)!]);
    }
    for (const [id, ds] of byTopic) expect(ds, id).toEqual([...ds].sort());
  });

  it("covers every level's capstone", () => {
    for (const l of levels) expect(projectDifficulty({ scope: "level", refId: `L${l.id}`, size: "capstone" })).toBeDefined();
  });
});
