import { describe, expect, it } from "vitest";
import roadmapJson from "../data/roadmap.json";
import { companyCounts, filterSourced, sourcedItems, sourcedStats, validateSourced, type SourcedInterviewItem } from "@/lib/sourced";
import type { Roadmap } from "@/lib/types";

const levelsList = (roadmapJson as unknown as Roadmap).phases.flatMap((p) => p.levels);
const modules = levelsList.flatMap((l) => l.modules);
const topicIds = new Map(modules.map((m) => [m.id, new Set(m.topics.map((t) => t.id))]));
const levelOf = new Map(modules.map((m) => [m.id, m.levelId]));

describe("interview-sourced.json", () => {
  it("passes validation", () => {
    expect(validateSourced(sourcedItems, topicIds, levelOf)).toEqual([]);
  });

  it("is a large, varied set", () => {
    expect(sourcedItems.length).toBeGreaterThanOrEqual(300);
    expect(companyCounts(sourcedItems).length).toBeGreaterThanOrEqual(30);
    for (const d of ["easy", "medium", "hard"]) expect(sourcedItems.some((i) => i.difficulty === d), d).toBe(true);
    for (const f of ["question", "scenario"]) expect(sourcedItems.some((i) => i.format === f), f).toBe(true);
  });

  it("never reuses an id from the practice bank", async () => {
    const practice = (await import("../data/practice.json")).default as unknown as Record<string, { id: string }[]>;
    const ids = new Set(Object.values(practice).flat().map((p) => p.id));
    for (const it of sourcedItems) expect(ids.has(it.id), it.id).toBe(false);
  });

  it("only cites https sources from known public hosts", () => {
    const hosts = new Set(sourcedItems.map((i) => new URL(i.source.url).hostname));
    for (const h of hosts) expect(["github.com", "www.aced.io", "www.tryexponent.com", "www.geeksforgeeks.org", "www.jointaro.com", "interviewing.io"], h).toContain(h);
  });
});

describe("validateSourced", () => {
  const good = sourcedItems[0];
  const run = (patch: Partial<SourcedInterviewItem>, extra: SourcedInterviewItem[] = []) => validateSourced([{ ...good, ...patch }, ...extra], topicIds, levelOf);

  it("accepts a good item", () => expect(run({})).toEqual([]));
  it("catches a bad module, topic and level", () => {
    expect(run({ moduleId: "M99.9" }).join()).toMatch(/unknown module/);
    expect(run({ topicId: "nope" }).join()).toMatch(/topic nope/);
    expect(run({ levelId: 99 }).join()).toMatch(/levelId/);
  });
  it("catches a missing or non-https source", () => {
    expect(run({ source: { ...good.source, url: "" } }).join()).toMatch(/source url/);
    expect(run({ source: { ...good.source, url: "http://example.com/x" } }).join()).toMatch(/https/);
  });
  it("catches duplicates and weak content", () => {
    expect(run({}, [good]).join()).toMatch(/duplicate/);
    expect(run({ keyPoints: ["a"] }).join()).toMatch(/key points/);
    expect(run({ answer: "short" }).join()).toMatch(/too short/);
    expect(run({ companies: ["A", "A"] }).join()).toMatch(/companies/);
  });
});

describe("filtering and stats", () => {
  it("filters by company, level, difficulty, format and text", () => {
    const a = filterSourced(sourcedItems, { company: "Anthropic" });
    expect(a.length).toBeGreaterThan(10);
    expect(a.every((i) => i.companies.includes("Anthropic"))).toBe(true);
    const l4 = filterSourced(sourcedItems, { levelId: 4 });
    expect(l4.length).toBeGreaterThan(5);
    expect(l4.every((i) => i.levelId === 4)).toBe(true);
    expect(filterSourced(sourcedItems, { difficulty: "hard", format: "scenario" }).every((i) => i.difficulty === "hard" && i.format === "scenario")).toBe(true);
    expect(filterSourced(sourcedItems, { text: "kv cache" }).length).toBeGreaterThan(0);
    expect(filterSourced(sourcedItems, { company: "all", levelId: "all" })).toHaveLength(sourcedItems.length);
  });

  it("counts companies and flags thin modules", () => {
    const counts = companyCounts(sourcedItems);
    expect(counts[0].count).toBeGreaterThanOrEqual(counts[counts.length - 1].count);
    const s = sourcedStats(sourcedItems, modules.map((m) => m.id));
    expect(s.items).toBe(sourcedItems.length);
    expect(Object.values(s.perLevel).reduce((a, b) => a + b, 0)).toBe(sourcedItems.length);
    expect(s.thinModules.every((id) => sourcedItems.filter((i) => i.moduleId === id).length < 2)).toBe(true);
  });
});
