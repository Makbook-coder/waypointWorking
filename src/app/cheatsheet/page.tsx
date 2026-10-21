import type { Metadata } from "next";
import Link from "next/link";
import { levels } from "@/lib/data";
import { PHASE_STYLE } from "@/lib/phase";

export const metadata: Metadata = { title: "Cheat sheets" };

export default function CheatSheetIndex() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Cheat sheets</h1>
        <p className="mt-2 max-w-2xl text-muted">
          One page per level for quick revision: the gist of each module, its mental model, the traps to avoid and what an interviewer looks for. Each sheet prints cleanly or saves as a PDF.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((l) => (
          <li key={l.id}>
            <Link
              href={`/cheatsheet/${l.id}`}
              className="block h-full rounded-lg border border-line bg-surface p-4 hover:border-strong-line"
              style={{ borderLeft: `4px solid ${PHASE_STYLE[l.phase].var}` }}
            >
              <span className="font-mono text-sm" style={{ color: PHASE_STYLE[l.phase].var }}>L{l.id}</span>{" "}
              <span className="font-semibold">{l.title}</span>
              <span className="mt-1 block text-xs text-muted">{l.modules.length} modules</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
