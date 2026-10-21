import { describe, expect, it } from "vitest";
import roadmapJson from "../data/roadmap.json";
import { DESIGN_CHECKLIST, debugSnippets, filterByModule, systemDesignPrompts, validateDebugSnippets, validateSystemDesign, type SystemDesignPrompt } from "@/lib/interview-prep";
import type { Roadmap } from "@/lib/types";

const moduleIds = new Set((roadmapJson as unknown as Roadmap).phases.flatMap((p) => p.levels).flatMap((l) => l.modules).map((m) => m.id));

describe("system-design.json", () => {
  it("passes validation", () => expect(validateSystemDesign(systemDesignPrompts, moduleIds)).toEqual([]));
  it("is a varied set with sourced company tags", () => {
    expect(systemDesignPrompts.length).toBeGreaterThanOrEqual(20);
    expect(new Set(systemDesignPrompts.flatMap((p) => p.companies)).size).toBeGreaterThanOrEqual(8);
    expect(systemDesignPrompts.some((p) => p.companies.length === 0)).toBe(true);
  });
  it("does not tag a company on a prompt that comes from an engineering blog or an illustrative list", () => {
    for (const p of systemDesignPrompts.filter((x) => x.source.kind === "engineering-blog" || x.source.url.includes("openrouter"))) expect(p.companies, p.id).toEqual([]);
  });
  const good = systemDesignPrompts[0];
  const run = (patch: Partial<SystemDesignPrompt>, extra: SystemDesignPrompt[] = []) => validateSystemDesign([{ ...good, ...patch }, ...extra], moduleIds);
  it("catches bad data", () => {
    expect(run({})).toEqual([]);
    expect(run({}, [good]).join()).toMatch(/duplicate/);
    expect(run({ moduleIds: ["M99.9"] }).join()).toMatch(/module/);
    expect(run({ source: { ...good.source, url: "http://x.test" } }).join()).toMatch(/https/);
    expect(run({ mustCover: ["one"] }).join()).toMatch(/must-cover/);
    expect(run({ outline: ["a", "b"] }).join()).toMatch(/outline/);
  });
  it("has a shared checklist with unique ids", () => {
    expect(new Set(DESIGN_CHECKLIST.map((c) => c.id)).size).toBe(DESIGN_CHECKLIST.length);
  });
});

describe("debug-snippets.json", () => {
  it("passes validation", () => expect(validateDebugSnippets(debugSnippets, moduleIds)).toEqual([]));
  it("is a varied set", () => {
    expect(debugSnippets.length).toBeGreaterThanOrEqual(20);
    for (const d of ["easy", "medium", "hard"]) expect(debugSnippets.some((s) => s.difficulty === d), d).toBe(true);
  });
  it("catches bad data", () => {
    const good = debugSnippets[0];
    expect(validateDebugSnippets([good, good], moduleIds).join()).toMatch(/duplicate/);
    expect(validateDebugSnippets([{ ...good, fixedCode: good.code }], moduleIds).join()).toMatch(/equals/);
    expect(validateDebugSnippets([{ ...good, moduleId: "M99.9" }], moduleIds).join()).toMatch(/unknown module/);
    expect(validateDebugSnippets([{ ...good, bugs: [] }], moduleIds).join()).toMatch(/bug/);
  });
});

describe("filterByModule", () => {
  it("matches either a single module id or a list", () => {
    expect(filterByModule(debugSnippets, "all").length).toBe(debugSnippets.length);
    const m = debugSnippets[0].moduleId;
    expect(filterByModule(debugSnippets, m).every((s) => s.moduleId === m)).toBe(true);
    expect(filterByModule(systemDesignPrompts, "M9.4").length).toBeGreaterThan(0);
  });
});
