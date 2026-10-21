import type { Module } from "@/lib/types";
import { APPLIED_SOURCES_CHECKED, getApplied, type AppliedSource } from "@/lib/applied";
import { InlineCode } from "./InlineCode";
import { Badge, EmptyState, SectionTitle } from "./ui";

function SourceLink({ source }: { source: AppliedSource }) {
  return (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
      {source.label}
      <span className="sr-only"> (opens in a new tab)</span>
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

/** "In practice": where a module's idea is used, how a real project applies it, and what goes wrong. */
export function AppliedPanel({ mod, color }: { mod: Module; color: string }) {
  const a = getApplied(mod.id);
  if (!a)
    return (
      <EmptyState>
        {mod.isCapstone
          ? "This capstone is the real-world application. See the Practice tab for its guide and rubric."
          : `Real-world notes for ${mod.id} are on the way. Earlier levels already have them.`}
      </EmptyState>
    );
  const { scenario: sc, example: ex } = a;
  return (
    <div className="max-w-4xl space-y-8 text-sm leading-relaxed">
      <section aria-labelledby="ap-how" className="rounded-lg border border-line bg-surface p-4" style={{ borderTop: `4px solid ${color}` }}>
        <h2 id="ap-how" className="text-base font-semibold">How it works in practice</h2>
        <p className="mt-2"><InlineCode text={a.howItWorks} /></p>
      </section>

      <section aria-labelledby="ap-uses">
        <SectionTitle id="ap-uses">Where it is used</SectionTitle>
        <ul className="grid gap-3 sm:grid-cols-2">
          {a.uses.map((u) => (
            <li key={u.who + u.source.url} className="rounded-lg border border-line bg-surface p-4">
              <p className="font-semibold">{u.who}</p>
              <p className="mt-1"><InlineCode text={u.what} /></p>
              <p className="mt-2 text-xs text-muted">
                Source: <SourceLink source={u.source} />
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ap-project">
        <SectionTitle id="ap-project">A real project, step by step</SectionTitle>
        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="font-semibold">{sc.title}</h3>
          <dl className="mt-3 space-y-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">The situation</dt>
              <dd className="mt-0.5"><InlineCode text={sc.context} /></dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Architecture</dt>
              <dd className="mt-0.5"><InlineCode text={sc.architecture} /></dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Tools</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {sc.tools.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Order of work</dt>
              <dd className="mt-1">
                <ol className="list-decimal space-y-1.5 pl-5">
                  {sc.steps.map((s) => (
                    <li key={s}><InlineCode text={s} /></li>
                  ))}
                </ol>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="ap-example">
        <SectionTitle id="ap-example">Worked example · {ex.title}</SectionTitle>
        <pre className="overflow-x-auto rounded-md border border-line bg-surface-2 p-3 font-mono text-[13px] leading-relaxed" aria-label={`${ex.lang} example`}>
          <code>{ex.code.trim()}</code>
        </pre>
        <p className="mt-2"><InlineCode text={ex.notes} /></p>
      </section>

      <section aria-labelledby="ap-tradeoffs">
        <SectionTitle id="ap-tradeoffs">Trade-offs and failure modes</SectionTitle>
        <ul className="space-y-2">
          {a.tradeoffs.map((t) => (
            <li key={t.issue} className="rounded-lg border border-line bg-surface p-3">
              <p className="font-medium"><InlineCode text={t.issue} /></p>
              <p className="mt-0.5 text-muted"><span className="font-semibold text-ink">What teams do: </span><InlineCode text={t.response} /></p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ap-levels">
        <SectionTitle id="ap-levels">Junior vs senior</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">A junior engineer</p>
            <p className="mt-1"><InlineCode text={a.junior} /></p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-4" style={{ borderLeft: `4px solid ${color}` }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">A senior engineer</p>
            <p className="mt-1"><InlineCode text={a.senior} /></p>
          </div>
        </div>
      </section>

      <section aria-labelledby="ap-reading">
        <SectionTitle id="ap-reading">Further reading</SectionTitle>
        <ul className="space-y-1.5">
          {a.reading.map((r) => (
            <li key={r.url} className="flex flex-wrap items-center gap-2">
              <Badge>{r.kind}</Badge>
              <SourceLink source={r} />
              <span className="text-xs text-muted">{new URL(r.url).hostname.replace(/^www\./, "")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Company examples are paraphrased from the linked public pages, which were read on {APPLIED_SOURCES_CHECKED}. Follow the links for the original wording and the latest numbers.
        </p>
      </section>
    </div>
  );
}
