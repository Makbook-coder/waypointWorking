// Runs coding-task tests in Pyodide, off the main thread. The page sends the harness
// (src/lib/coding.ts) on init, then one message per run. A run that hangs is stopped by
// the page terminating this worker.
/* global importScripts, loadPyodide */
importScripts("/pyodide/pyodide.js");

let ready = null;

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === "init") {
    ready = loadPyodide({ indexURL: "/pyodide/" }).then((py) => {
      py.runPython(msg.harness);
      return py;
    });
    ready.then(
      () => self.postMessage({ type: "ready" }),
      (err) => self.postMessage({ type: "error", error: String(err) }),
    );
    return;
  }
  if (msg.type === "run") {
    try {
      const py = await ready;
      const tests = py.toPy(msg.tests);
      const out = await py.globals.get("run_tests")(msg.code, tests);
      tests.destroy();
      self.postMessage({ type: "result", id: msg.id, result: JSON.parse(out) });
    } catch (err) {
      self.postMessage({ type: "result", id: msg.id, result: { results: [], stdout: "", fatal: String(err) } });
    }
  }
};
