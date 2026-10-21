// Shared by the browser worker (Pyodide) and tests/coding.test.ts (python3), so both grade the same way.

export interface TestResult {
  name: string;
  ok: boolean;
  error?: string;
}

export interface RunResult {
  results: TestResult[];
  stdout: string;
  /** Set when the run never reached the tests: a load failure or a timeout */
  fatal?: string;
}

/**
 * Defines `async run_tests(code, tests) -> json str`. The user's code runs once; each test then runs
 * in its own copy of those globals, so one test can't leak state into the next.
 */
export const PY_HARNESS = String.raw`
import ast, contextlib, inspect, io, json, traceback

_FLAGS = ast.PyCF_ALLOW_TOP_LEVEL_AWAIT

async def _exec(src, filename, g):
    # Top-level await is allowed, so async tasks can be tested without asyncio.run (which Pyodide can't do).
    result = eval(compile(src, filename, "exec", flags=_FLAGS), g)
    if inspect.iscoroutine(result):
        await result

def _last_line():
    lines = traceback.format_exc(limit=2).strip().splitlines()
    return lines[-1] if lines else "error"

async def run_tests(code, tests):
    out = io.StringIO()
    base = {"__name__": "__main__"}
    results = []
    with contextlib.redirect_stdout(out):
        try:
            await _exec(code, "solution.py", base)
        except BaseException:
            err = _last_line()
            return json.dumps({"results": [{"name": n, "ok": False, "error": err} for n, _ in tests], "stdout": out.getvalue()[-4000:]})
        for name, src in tests:
            try:
                await _exec(src, "test", dict(base))
                results.append({"name": name, "ok": True})
            except AssertionError as e:
                results.append({"name": name, "ok": False, "error": "AssertionError" + (": " + str(e) if str(e) else "")})
            except BaseException:
                results.append({"name": name, "ok": False, "error": _last_line()})
    return json.dumps({"results": results, "stdout": out.getvalue()[-4000:]})
`;

export const RUN_TIMEOUT_MS = 10_000;

export const passedAll = (r: RunResult) => !r.fatal && r.results.length > 0 && r.results.every((t) => t.ok);
