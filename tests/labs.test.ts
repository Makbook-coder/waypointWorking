import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { modules } from "@/lib/data";
import { PY_HARNESS, passedAll, type RunResult } from "@/lib/coding";
import { checkpointTests, downloadable, labs, labsForLevel, referenceCode, scaffoldedCode, starterCode, stepsPassed, stepKey, validateLabs } from "@/lib/labs";
import type { CodingTest } from "@/lib/types";

const dir = mkdtempSync(path.join(tmpdir(), "waypoint-lab-"));
const runner = path.join(dir, "runner.py");
writeFileSync(runner, PY_HARNESS + "\nimport asyncio as _a, json as _j, sys as _s\n_d = _j.load(_s.stdin)\nprint(_a.run(run_tests(_d['code'], _d['tests'])))\n");

function run(code: string, tests: CodingTest[]): RunResult {
  const out = execFileSync("python3", ["-I", runner], { input: JSON.stringify({ code, tests: tests.map((t) => [t.name, t.code]) }), timeout: 30_000 });
  return JSON.parse(out.toString());
}

let hasPython = true;
try {
  execFileSync("python3", ["--version"]);
} catch {
  hasPython = false;
}

const steps = labs.flatMap((lab) => lab.steps.map((s, i) => [`${lab.id} step ${i + 1}`, lab, i] as const));

describe("guided labs", () => {
  it("content is valid", () => {
    expect(validateLabs(new Set(modules.map((m) => m.id)))).toEqual([]);
  });

  it("there is a lab for every level from L0 to L13", () => {
    for (let l = 0; l <= 13; l++) expect(labsForLevel(l).length, `L${l}`).toBeGreaterThan(0);
  });

  it("checkpoints include earlier steps' tests", () => {
    const lab = labs[0];
    expect(checkpointTests(lab, 1).length).toBe(lab.steps[0].tests.length + lab.steps[1].tests.length);
    expect(starterCode(lab)).toContain(lab.steps[0].scaffold.trim());
  });

  it("counts passed steps in a row", () => {
    const lab = labs[0];
    expect(stepsPassed(lab, {})).toBe(0);
    expect(stepsPassed(lab, { [stepKey(lab.id, 0)]: { passedAt: "x" }, [stepKey(lab.id, 2)]: { passedAt: "x" } })).toBe(1);
  });

  it.skipIf(!hasPython).each(steps)("%s: reference passes the checkpoint, scaffold alone does not", (_n, lab, i) => {
    const good = run(referenceCode(lab, i), checkpointTests(lab, i));
    expect(good.results.filter((r) => !r.ok)).toEqual([]);
    expect(passedAll(good)).toBe(true);
    const own = lab.steps[i].tests.map(([name, code]) => ({ name, code }));
    expect(passedAll(run(scaffoldedCode(lab, i), own))).toBe(false);
  });

  it.skipIf(!hasPython)("the downloaded file runs its own checkpoint with plain python", () => {
    const lab = labs[0];
    const last = lab.steps.length - 1;
    const file = path.join(dir, "lab.py");
    writeFileSync(file, downloadable(lab, referenceCode(lab, last), last));
    const out = execFileSync("python3", ["-I", file]).toString();
    expect(out).toContain("PASS");
    expect(out).not.toContain("FAIL");
  });
});
