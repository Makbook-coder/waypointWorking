import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InlineCode } from "@/components/InlineCode";
import { PrintButton } from "@/components/PrintButton";
import { getLevel, levelHref, levels, moduleHref } from "@/lib/data";
import { PHASE_STYLE } from "@/lib/phase";
import { formatMinutes, printPack } from "@/lib/print-pack";

type Props = { params: Promise<{ id: string }> };

// Rendered on first visit and then cached, instead of at build time, so it adds nothing to every deployment (Vercel keeps them all).
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = getLevel(Number((await params).id));
  return { title: level ? `L${level.id} print pack` : "Print pack" };
}

const H2 = "mb-2 border-b border-line pb-1 text-lg font-bold tracking-tight print:text-base";

export default async function PackPage({ params }: Props) {
  const level = getLevel(Number((await params).id));
  if (!level) notFound();
  const color = PHASE_STYLE[level.phase].var;
  const pack = printPack(level);
  const prev = getLevel(level.id - 1);
  const next = getLevel(level.id + 1);

  return (
    <article className="text-sm">
      <nav aria-label="Breadcrumb" className="mb-4 text-muted print:hidden">
        <Link href="/pack" className="underline underline-offset-2 hover:text-ink">Print packs</Link> /{" "}
        <Link href={levelHref(level.id)} className="underline underline-offset-2 hover:text-ink">Level {level.id}</Link>
      </nav>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-4 pb-3" style={{ borderColor: color }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Print pack</p>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="font-mono" style={{ color }}>L{level.id}</span> {level.title}
          </h1>
          <p className="mt-1 max-w-3xl text-muted">{level.outcome}</p>
        </div>
        <PrintButton label="Print pack or save as PDF" />
      </header>

      <section aria-labelledby="pk-summary" className="mb-8">
        <h2 id="pk-summary" className={H2}>1. Summary by module</h2>
        <div className="space-y-3">
          {pack.sheet.map((e) => (
            <div key={e.module.id} className="break-inside-avoid">
              <h3 className="font-semibold">
                <span className="font-mono text-xs text-muted">{e.module.id}</span>{" "}
                <Link href={moduleHref(e.module.id)} className="hover:underline">{e.module.title}</Link>
              </h3>
              {e.gist && <p className="mt-0.5 leading-relaxed"><InlineCode text={e.gist} /></p>}
              {e.mentalModel && <p className="mt-1 leading-relaxed"><span className="font-semibold">Mental model: </span>{e.mentalModel}</p>}
              <p className="mt-1 text-muted"><span className="font-semibold text-ink">Topics: </span>{e.topics.join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="pk-points" className="mb-8">
        <h2 id="pk-points" className={H2}>2. Key points to remember</h2>
        <div className="space-y-3">
          {pack.sheet.filter((e) => e.interview).map((e) => (
            <div key={e.module.id} className="break-inside-avoid">
              <p className="font-semibold">
                <span className="font-mono text-xs text-muted">{e.module.id}</span>{" "}
                <span className="font-normal italic">{e.interview!.question}</span>
              </p>
              <ul className="list-disc pl-5">
                {e.interview!.keyPoints.map((k) => <li key={k}><InlineCode text={k} /></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="pk-mistakes" className="mb-8 break-inside-avoid">
        <h2 id="pk-mistakes" className={H2}>3. Mistakes to avoid</h2>
        <ol className="list-decimal space-y-2 pl-5">
          {pack.mistakes.map((m) => (
            <li key={m.mistake} className="break-inside-avoid">
              <p className="font-semibold"><InlineCode text={m.mistake} /> <span className="font-mono text-xs font-normal text-muted">{m.moduleId}</span></p>
              <p><span className="font-semibold">Spot it: </span><InlineCode text={m.spot} /></p>
              <p><span className="font-semibold">Fix: </span><InlineCode text={m.fix} /></p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pk-projects" className="mb-8 break-inside-avoid">
        <h2 id="pk-projects" className={H2}>4. Projects to build</h2>
        {pack.levelCapstone && (
          <p className="mb-2">
            <span className="font-semibold">Level capstone: </span>
            {pack.levelCapstone.title} <span className="text-muted">(~{formatMinutes(pack.levelCapstone.minutes)})</span>
          </p>
        )}
        {level.project && (
          <div className="mb-3">
            <p className="font-semibold">Level project: {level.project.title}</p>
            <ul className="list-disc pl-5">
              {level.project.deliverables.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        )}
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <th className="py-1 pr-3 font-semibold">Module</th>
              <th className="py-1 pr-3 font-semibold">Topic projects</th>
              <th className="py-1 font-semibold">Module capstone</th>
            </tr>
          </thead>
          <tbody>
            {pack.projects.map((p) => (
              <tr key={p.module.id} className="break-inside-avoid border-b border-line align-top">
                <td className="py-1 pr-3"><span className="font-mono text-xs text-muted">{p.module.id}</span> {p.module.title}</td>
                <td className="num py-1 pr-3">{p.topicProjects > 0 ? `${p.topicProjects} · ~${formatMinutes(p.minutes)}` : "None"}</td>
                <td className="py-1">{p.capstone ? <>{p.capstone.title} <span className="text-muted">(~{formatMinutes(p.capstone.minutes)})</span></> : "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted print:hidden">
          Full step-by-step guides are on each module&apos;s Projects tab.
        </p>
      </section>

      <nav aria-label="Other print packs" className="mt-8 flex justify-between gap-4 print:hidden">
        {prev ? <Link href={`/pack/${prev.id}`} className="underline underline-offset-2">← L{prev.id} {prev.title}</Link> : <span />}
        {next ? <Link href={`/pack/${next.id}`} className="underline underline-offset-2">L{next.id} {next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
