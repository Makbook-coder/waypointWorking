import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allTopics } from "@/lib/data";
import { PY_HARNESS, type RunResult } from "@/lib/coding";
import { snippets, snippetsForTopic, validateSnippets } from "@/lib/snippets";

// Runs a snippet the way the browser does: through the shared harness, with one test that always passes.
const dir = mkdtempSync(path.join(tmpdir(), "waypoint-snippet-"));
const runner = path.join(dir, "runner.py");
writeFileSync(runner, PY_HARNESS + "\nimport asyncio as _a, json as _j, sys as _s\n_d = _j.load(_s.stdin)\nprint(_a.run(run_tests(_d['code'], [['run', 'pass']])))\n");

function run(code: string): RunResult {
  const out = execFileSync("python3", ["-I", runner], { input: JSON.stringify({ code }), timeout: 30_000 });
  return JSON.parse(out.toString());
}

let hasPython = true;
try {
  execFileSync("python3", ["--version"]);
} catch {
  hasPython = false;
}

describe("runnable snippets", () => {
  it("content is valid", () => {
    expect(validateSnippets(new Set(allTopics.map((t) => t.id)))).toEqual([]);
  });

  it("covers the early levels", () => {
    expect(snippets.length).toBeGreaterThanOrEqual(60);
    expect(snippetsForTopic("m0-1-core-data-structures").length).toBe(1);
    expect(snippetsForTopic("nope")).toEqual([]);
  });

  it.skipIf(!hasPython).each(snippets.map((s) => [`${s.topicId} · ${s.title}`, s] as const))("%s runs and prints what it promises", (_n, s) => {
    const r = run(s.code);
    expect(r.results[0]?.error, "the code raised").toBeUndefined();
    expect(r.stdout).toContain(s.expect);
  });
});
