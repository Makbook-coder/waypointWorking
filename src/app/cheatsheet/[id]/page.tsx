import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InlineCode } from "@/components/InlineCode";
import { PrintButton } from "@/components/PrintButton";
import { cheatSheet } from "@/lib/cheatsheet";
import { getLevel, levelHref, levels, moduleHref } from "@/lib/data";
import { PHASE_STYLE } from "@/lib/phase";

type Props = { params: Promise<{ id: string }> };

// Rendered on first visit and then cached, instead of at build time, so it adds nothing to every deployment (Vercel keeps them all).
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = getLevel(Number((await params).id));
  return { title: level ? `L${level.id} cheat sheet` : "Cheat sheet" };
}

export default async function CheatSheetPage({ params }: Props) {
  const level = getLevel(Number((await params).id));
  if (!level) notFound();
  const color = PHASE_STYLE[level.phase].var;
  const prev = getLevel(level.id - 1);
  const next = getLevel(level.id + 1);

  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted print:hidden">
        <Link href="/cheatsheet" className="underline underline-offset-2 hover:text-ink">Cheat sheets</Link> /{" "}
        <Link href={levelHref(level.id)} className="underline underline-offset-2 hover:text-ink">Level {level.id}</Link>
      </nav>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-4 pb-3" style={{ borderColor: color }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Cheat sheet</p>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="font-mono" style={{ color }}>L{level.id}</span> {level.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">{level.outcome}</p>
        </div>
        <PrintButton />
      </header>

      <div className="grid gap-4 md:grid-cols-2 print:block">
        {cheatSheet(level).map((e) => (
          <section
            key={e.module.id}
            aria-labelledby={`cs-${e.module.id}`}
            className="break-inside-avoid rounded-lg border border-line bg-surface p-4 text-sm print:mb-3 print:rounded-none print:border-0 print:border-b print:p-0 print:pb-3"
          >
            <h2 id={`cs-${e.module.id}`} className="font-semibold">
              <span className="font-mono text-xs text-muted">{e.module.id}</span>{" "}
              <Link href={moduleHref(e.module.id)} className="hover:underline">{e.module.title}</Link>
              {e.module.isCapstone && <span className="ml-1 text-xs font-normal text-muted">(capstone)</span>}
            </h2>
            {e.gist && <p className="mt-1 leading-relaxed"><InlineCode text={e.gist} /></p>}
            {e.mentalModel && (
              <p className="mt-2 leading-relaxed">
                <span className="font-semibold">Mental model: </span>
                {e.mentalModel}
              </p>
            )}
            <p className="mt-2 text-muted">
              <span className="font-semibold text-ink">Topics: </span>
              {e.topics.join(" · ")}
            </p>
            {e.mistakes.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Avoid</p>
                <ul className="list-disc pl-5">
                  {e.mistakes.map((m) => <li key={m}><InlineCode text={m} /></li>)}
                </ul>
              </div>
            )}
            {e.interview && (
              <div className="mt-2">
                <p className="font-semibold">Interview: <span className="font-normal italic">{e.interview.question}</span></p>
                <ul className="list-disc pl-5">
                  {e.interview.keyPoints.map((k) => <li key={k}><InlineCode text={k} /></li>)}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      <nav aria-label="Other cheat sheets" className="mt-8 flex justify-between gap-4 text-sm print:hidden">
        {prev ? <Link href={`/cheatsheet/${prev.id}`} className="underline underline-offset-2">← L{prev.id} {prev.title}</Link> : <span />}
        {next ? <Link href={`/cheatsheet/${next.id}`} className="underline underline-offset-2">L{next.id} {next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
