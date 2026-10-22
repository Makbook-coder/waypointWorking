import { describe, expect, it } from "vitest";
import { levels, modules } from "@/lib/data";
import { PROJECTS, PROJECT_LEVELS, capstoneForLevel, capstoneForModule, projectProgress, projectTotal, projectsForModule, projectsForTopic, validateProjects } from "@/lib/projects";
import type { ProjectSrc } from "@/lib/projects";

const covered = levels.filter((l) => PROJECT_LEVELS.includes(l.id));

describe("project ladders", () => {
  it("covers every topic, module and level in the covered levels with complete guides", () => {
    expect(validateProjects(covered)).toEqual([]);
  });

  it("orders each topic's projects small to bigger", () => {
    for (const l of covered)
      for (const m of l.modules.filter((x) => !x.isCapstone))
        for (const t of m.topics) {
          const ps = projectsForTopic(t.id);
          expect(ps.map((p) => p.minutes), t.id).toEqual([...ps.map((p) => p.minutes)].sort((a, b) => a - b));
        }
  });

  it("puts a module's topic ladders then its capstone on the module page, and the level capstone on the level's capstone module", () => {
    const m = modules.find((x) => x.id === "M0.1")!;
    const list = projectsForModule(m);
    expect(list.at(-1)).toBe(capstoneForModule("M0.1"));
    expect(list.length).toBe(m.topics.reduce((n, t) => n + projectsForTopic(t.id).length, 0) + 1);
    const cap = modules.find((x) => x.levelId === 0 && x.isCapstone)!;
    expect(projectsForModule(cap)).toEqual([capstoneForLevel(0)]);
  });

  it("counts progress from saved ticks, steps first then done checks", () => {
    const p = PROJECTS[0];
    const none = projectProgress(p, { projectChecks: {} });
    expect(none).toMatchObject({ done: 0, total: projectTotal(p), started: false, finished: false });
    const all = Object.fromEntries(Array.from({ length: projectTotal(p) }, (_, i) => [`${p.id}#${i}`, "t"]));
    expect(projectProgress(p, { projectChecks: all })).toMatchObject({ finished: true, started: true });
  });

  it("rejects half-written entries", () => {
    const good = PROJECTS.find((p) => p.scope === "topic")!;
    const check = (p: ProjectSrc) => validateProjects(covered, PROJECTS.map((x) => (x.id === good.id ? p : x))).join("\n");
    expect(check({ ...good, steps: good.steps.slice(0, 2) })).toMatch(/at least 4 steps/);
    expect(check({ ...good, steps: good.steps.map((s) => ({ ...s, stuck: "" })) })).toMatch(/no "if you are stuck"/);
    expect(check({ ...good, expected: "ok" })).toMatch(/expected output too thin/);
    expect(check({ ...good, done: ["only one check here"] })).toMatch(/at least 2 done checks/);
    expect(check({ ...good, next: "" })).toMatch(/what comes next/);
    expect(check({ ...good, goal: "TODO write the goal of this project later on" })).toMatch(/placeholder/);
  });

  it("rejects missing, extra, unordered and uncovered projects", () => {
    const withoutTopic = PROJECTS.filter((p) => p.id !== "pj:m0-1-clean-idiomatic-python:2");
    expect(validateProjects(covered, withoutTopic).join("\n")).toMatch(/m0-1-clean-idiomatic-python: needs 2 or 3 projects/);
    const noCap = PROJECTS.filter((p) => p.id !== "pj:M0.2:cap");
    expect(validateProjects(covered, noCap).join("\n")).toMatch(/M0.2: needs exactly one module capstone/);
    const noLevel = PROJECTS.filter((p) => p.id !== "pj:L0:cap");
    expect(validateProjects(covered, noLevel).join("\n")).toMatch(/L0: needs exactly one level capstone/);
    const short = PROJECTS.map((p) => (p.id === "pj:M0.3:cap" ? { ...p, covers: p.covers!.slice(1) } : p));
    expect(validateProjects(covered, short).join("\n")).toMatch(/M0.3: capstone does not cover/);
    const swapped = PROJECTS.map((p) => (p.id === "pj:m0-1-core-data-structures:1" ? { ...p, minutes: 999 } : p));
    expect(validateProjects(covered, swapped).join("\n")).toMatch(/small to bigger/);
  });
});
