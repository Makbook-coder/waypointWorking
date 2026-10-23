import type { Metadata } from "next";
import Link from "next/link";
import { levels } from "@/lib/data";
import { PHASE_STYLE } from "@/lib/phase";

export const metadata: Metadata = { title: "Print packs" };

export default function PackIndex() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Print packs</h1>
        <p className="mt-2 max-w-2xl text-muted">
          One printable pack per level: a summary of each module and its topics, the key points interviewers look for, the five mistakes to avoid and the projects to build. Print it or save it as a PDF.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((l) => (
          <li key={l.id}>
            <Link
              href={`/pack/${l.id}`}
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
