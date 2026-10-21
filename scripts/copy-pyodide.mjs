// Copies the Pyodide runtime from node_modules into public/pyodide so coding tasks run without a CDN.
// Runs before dev and build; public/pyodide is git-ignored.
import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = path.join(root, "node_modules", "pyodide");
const to = path.join(root, "public", "pyodide");
const FILES = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

await mkdir(to, { recursive: true });
for (const f of FILES) {
  const src = path.join(from, f);
  const dst = path.join(to, f);
  const [a, b] = await Promise.all([stat(src), stat(dst).catch(() => null)]);
  if (b && b.size === a.size && b.mtimeMs >= a.mtimeMs) continue;
  await copyFile(src, dst);
}
console.log(`pyodide → ${path.relative(root, to)}`);
