// Practice that runs anywhere: turn code plus its tests into one plain .py file.
import type { CodingTest } from "./types";

const fnName = (name: string, i: number) => `test_${i + 1}_${name.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`;

/** The code, then each test as a function, then a runner. `python file.py` prints PASS/FAIL per test. */
export function toPythonFile(code: string, tests: CodingTest[], title = ""): string {
  const header = title ? `# ${title}\n# Run with: python this_file.py  (Python 3.10+, standard library only)\n\n` : "";
  const fns = tests.map((t, i) => `def ${fnName(t.name, i)}():\n    """${t.name.replace(/"""/g, "'")}"""\n${t.code.split("\n").map((l) => "    " + l).join("\n")}\n`).join("\n\n");
  return `${header}${code.replace(/\s+$/, "")}\n\n\n# ---- Tests ----\n\n${fns}\n\nif __name__ == "__main__":\n    import inspect, sys\n    failed = 0\n    for name, fn in list(globals().items()):\n        if name.startswith("test_") and inspect.isfunction(fn):\n            try:\n                fn()\n                print("PASS", fn.__doc__)\n            except Exception as e:\n                failed += 1\n                print("FAIL", fn.__doc__, "-", type(e).__name__, e)\n    print("All tests passed" if not failed else f"{failed} failed")\n    sys.exit(1 if failed else 0)\n`;
}

/** Save text as a file in the browser. */
export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/x-python" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
