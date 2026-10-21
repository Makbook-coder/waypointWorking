import Link from "next/link";
import { getModule, moduleHref } from "@/lib/data";
import type { LevelMistake } from "@/lib/mistakes";
import { InlineCode } from "./InlineCode";

/** "Common mistakes" for a level: each one opens to show how to spot it and how to fix it. */
export function LevelMistakes({ levelId, mistakes, color }: { levelId: number; mistakes: LevelMistake[]; color: string }) {
  if (mistakes.length === 0) return null;
  return (
    <section aria-labelledby="mistakes-h" className="rounded-lg border border-line bg-surface p-4 sm:p-5" style={{ borderLeft: `4px solid ${color}` }}>
      <h2 id="mistakes-h" className="text-base font-semibold">
        Common beginner mistakes in L{levelId}
      </h2>
      <p className="mt-0.5 text-sm text-muted">Open one to see how to spot it in your own work and how to fix it.</p>
      <ol className="mt-3 divide-y divide-line">
        {mistakes.map((m, i) => {
          const mod = getModule(m.moduleId);
          return (
            <li key={m.mistake}>
              <details className="group py-2.5">
                <summary className="flex cursor-pointer list-none items-start gap-2.5 [&::-webkit-details-marker]:hidden">
                  <span className="num mt-0.5 w-5 shrink-0 text-sm font-semibold text-muted">{i + 1}</span>
                  <span className="flex-1 font-medium">
                    <InlineCode text={m.mistake} />
                  </span>
                  <span aria-hidden="true" className="mt-0.5 text-muted transition-transform group-open:rotate-90">
                    ▸
                  </span>
                </summary>
                <dl className="mt-2 space-y-2 pl-7 text-sm leading-relaxed">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">How to spot it</dt>
                    <dd>
                      <InlineCode text={m.spot} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted">How to fix it</dt>
                    <dd>
                      <InlineCode text={m.fix} />
                    </dd>
                  </div>
                  {mod && (
                    <dd>
                      <Link href={moduleHref(mod.id)} className="text-xs text-muted underline underline-offset-2 hover:text-ink">
                        Learn more in {mod.id} {mod.title}
                      </Link>
                    </dd>
                  )}
                </dl>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
