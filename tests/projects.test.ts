import { describe, expect, it } from "vitest";
import { levels, modules } from "@/lib/data";
import { PRACTICE } from "../content/projects/practice";
import { PRACTICE_LEVELS, PROJECTS, PROJECT_LEVELS, capstoneForLevel, capstoneForModule, levelCapstoneHome, projectProgress, projectTotal, projectsForModule, projectsForTopic, validateProjects } from "@/lib/projects";
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
          const ps = projectsForTopic(t.id).filter((p) => p.size !== "practice");
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
    // A level with no capstone module shows its level capstone on its last module.
    expect(levelCapstoneHome(0)).toBe(cap.id);
    expect(levelCapstoneHome(1)).toBe("M1.12");
  });

  it("gives an earlier capstone module its own capstone and puts the level capstone on the last one", () => {
    expect(levelCapstoneHome(4)).toBe("M4.15");
    expect(capstoneForModule("M4.7")?.size).toBe("capstone");
    expect(projectsForModule(modules.find((x) => x.id === "M4.7")!)).toEqual([capstoneForModule("M4.7")]);
    expect(projectsForModule(modules.find((x) => x.id === "M4.15")!)).toEqual([capstoneForLevel(4)]);
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

  it("gives every topic in a practice level one practice project, and varies the kinds", () => {
    const kinds = new Set<string>();
    for (const l of levels.filter((x) => PRACTICE_LEVELS.includes(x.id)))
      for (const m of l.modules.filter((x) => !x.isCapstone))
        for (const t of m.topics) {
          const pr = projectsForTopic(t.id).filter((p) => p.size === "practice");
          expect(pr.length, t.id).toBe(1);
          kinds.add(pr[0].kind!);
        }
    expect([...kinds].sort()).toEqual(["challenge", "debug", "extend", "optimise", "reimplement", "review"]);
  });

  it("rejects weak practice projects", () => {
    const good = PRACTICE.find((p) => p.kind === "debug")!;
    const chal = PRACTICE.find((p) => p.kind === "challenge")!;
    const run = (p: ProjectSrc) => validateProjects(covered, PROJECTS.map((x) => (x.id === p.id ? p : x))).join("\n");
    expect(run({ ...good, starter: "" })).toMatch(/needs starter code/);
    expect(run({ ...good, kind: "build" })).toMatch(/must not be a plain build/);
    expect(run({ ...good, steps: good.steps.slice(0, 2) })).toMatch(/at least 3 steps/);
    expect(run({ ...chal, steps: good.steps })).toMatch(/no steps/);
    expect(run({ ...chal, hints: ["only one hint here, which is long enough"] })).toMatch(/at least 2 hints/);
    expect(run({ ...chal, done: chal.done.slice(0, 2) })).toMatch(/at least 4 pass checks/);
    const ladder = PROJECTS.find((p) => p.scope === "topic" && p.size === "small")!;
    expect(run({ ...ladder, kind: "debug" })).toMatch(/only practice projects/);
  });

  it("rejects a repeated practice kind on neighbouring topics and a missing practice project", () => {
    const m = covered.find((l) => PRACTICE_LEVELS.includes(l.id))!.modules.find((x) => !x.isCapstone)!;
    const [a, b] = m.topics;
    const pa = PRACTICE.find((p) => p.refId === a.id)!;
    const same = PROJECTS.map((p) => (p.refId === b.id && p.size === "practice" ? { ...p, kind: pa.kind } : p));
    expect(validateProjects(covered, same).join("\n")).toMatch(/repeats the previous topic/);
    const none = PROJECTS.filter((p) => !(p.refId === a.id && p.size === "practice"));
    expect(validateProjects(covered, none).join("\n")).toMatch(/needs exactly one practice project/);
  });
});
