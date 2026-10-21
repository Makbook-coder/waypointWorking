import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import practiceJson from "../data/practice.json";
import { CODING_TASKS as BASE_TASKS } from "../content/coding/tasks";
import { EXTRA_CODING_TASKS } from "../content/coding/tasks-extra";
import { PY_HARNESS, passedAll, type RunResult } from "@/lib/coding";
import type { CodingItem, PracticeMap } from "@/lib/types";

const CODING_TASKS = [...BASE_TASKS, ...EXTRA_CODING_TASKS];
const coding = Object.values(practiceJson as unknown as PracticeMap)
  .flat()
  .filter((p): p is CodingItem => p.type === "coding");

const dir = mkdtempSync(path.join(tmpdir(), "waypoint-py-"));
const runner = path.join(dir, "runner.py");
writeFileSync(runner, PY_HARNESS + "\nimport asyncio as _a, json as _j, sys as _s\n_d = _j.load(_s.stdin)\nprint(_a.run(run_tests(_d['code'], _d['tests'])))\n");

function run(code: string, tests: CodingItem["tests"]): RunResult {
  const out = execFileSync("python3", ["-I", runner], {
    input: JSON.stringify({ code, tests: tests.map((t) => [t.name, t.code]) }),
    timeout: 30_000,
  });
  return JSON.parse(out.toString());
}

let hasPython = true;
try {
  execFileSync("python3", ["--version"]);
} catch {
  hasPython = false;
}

describe("coding tasks", () => {
  it("every authored task is in practice.json with resolved topics", () => {
    expect(coding.length).toBe(CODING_TASKS.length);
    for (const c of coding) {
      expect(c.topicIds.length, c.id).toBeGreaterThan(0);
      for (const t of c.topicIds) expect(t.startsWith(c.id.split("-code-")[0] + "-"), `${c.id} → ${t}`).toBe(true);
    }
  });

  it("task ids are unique", () => {
    expect(new Set(CODING_TASKS.map((t) => t.id)).size).toBe(CODING_TASKS.length);
  });

  it.skipIf(!hasPython).each(coding.map((c) => [c.id, c] as const))("%s: solution passes, starter fails", (_id, c) => {
    const good = run(c.solution, c.tests);
    expect(good.results.filter((r) => !r.ok)).toEqual([]);
    expect(passedAll(good)).toBe(true);
    expect(passedAll(run(c.starter, c.tests))).toBe(false);
  });

  it.skipIf(!hasPython)("isolates tests and captures print output", () => {
    const r = run("x = []\nprint('hi')", [
      { name: "mutate", code: "x.append(1)\nassert len(x) == 1" },
      { name: "fresh globals", code: "y = 2" },
      { name: "fails", code: "assert False, 'nope'" },
    ]);
    expect(r.stdout).toBe("hi\n");
    expect(r.results.map((t) => t.ok)).toEqual([true, true, false]);
    expect(r.results[2].error).toBe("AssertionError: nope");
  });

  it.skipIf(!hasPython)("reports a syntax error against every test", () => {
    const r = run("def f(:\n  pass", [{ name: "a", code: "pass" }]);
    expect(r.results[0].ok).toBe(false);
    expect(r.results[0].error).toMatch(/SyntaxError/);
  });
});
