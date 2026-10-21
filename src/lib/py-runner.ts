// Browser side of the coding runner: one shared Pyodide worker, loaded on first use.
import { PY_HARNESS, RUN_TIMEOUT_MS, type RunResult } from "./coding";
import type { CodingTest } from "./types";

export type RunnerStatus = "idle" | "loading" | "running";

const LOAD_TIMEOUT_MS = 90_000; // first load fetches ~14 MB

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let seq = 0;
const pending = new Map<number, (r: RunResult) => void>();

function kill() {
  worker?.terminate();
  worker = null;
  ready = null;
  for (const resolve of pending.values()) resolve({ results: [], stdout: "", fatal: "The Python runtime was restarted." });
  pending.clear();
}

function boot(): Promise<void> {
  if (ready) return ready;
  const w = new Worker("/py-worker.js");
  worker = w;
  ready = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Python took too long to load. Check your connection and try again.")), LOAD_TIMEOUT_MS);
    w.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "ready") {
        clearTimeout(timer);
        resolve();
      } else if (msg.type === "error") {
        clearTimeout(timer);
        reject(new Error(msg.error));
      } else if (msg.type === "result") {
        pending.get(msg.id)?.(msg.result);
        pending.delete(msg.id);
      }
    };
    w.onerror = (e) => {
      clearTimeout(timer);
      reject(new Error(e.message || "The Python worker failed to start."));
    };
  });
  ready.catch(() => kill());
  w.postMessage({ type: "init", harness: PY_HARNESS });
  return ready;
}

export const isRuntimeLoaded = () => worker !== null;

/** Run `code` then each test. Never rejects: problems come back as `fatal`. */
export async function runPython(code: string, tests: CodingTest[], onStatus?: (s: RunnerStatus) => void): Promise<RunResult> {
  try {
    onStatus?.("loading");
    await boot();
  } catch (err) {
    onStatus?.("idle");
    return { results: [], stdout: "", fatal: err instanceof Error ? err.message : String(err) };
  }
  onStatus?.("running");
  const id = ++seq;
  const result = await new Promise<RunResult>((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      kill();
      resolve({ results: [], stdout: "", fatal: `Stopped after ${RUN_TIMEOUT_MS / 1000} seconds. Look for an infinite loop or a wait that never ends.` });
    }, RUN_TIMEOUT_MS);
    pending.set(id, (r) => {
      clearTimeout(timer);
      resolve(r);
    });
    worker!.postMessage({ type: "run", id, code, tests: tests.map((t) => [t.name, t.code]) });
  });
  onStatus?.("idle");
  return result;
}
