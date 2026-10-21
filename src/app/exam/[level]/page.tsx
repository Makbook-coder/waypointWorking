import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamRunner } from "@/components/ExamRunner";
import { allPractice } from "@/lib/content-data";
import { getLevel } from "@/lib/data";
import { EXAM_LEVELS } from "@/lib/exam";

type Props = { params: Promise<{ level: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return EXAM_LEVELS.map((l) => ({ level: String(l) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = getLevel(Number((await params).level));
  return { title: level ? `L${level.id} exam` : "Exam" };
}

export default async function ExamPage({ params }: Props) {
  const id = Number((await params).level);
  const level = getLevel(id);
  if (!level || !EXAM_LEVELS.includes(id)) notFound();
  // Only what an exam can draw from goes to the browser.
  const items = allPractice.filter((p) => p.levelId === id && (p.type === "quiz" || p.type === "coding" || p.type === "scenario"));
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link href="/exam" className="underline underline-offset-2 hover:text-ink">
          Exams
        </Link>{" "}
        / L{level.id}
      </nav>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          L{level.id} {level.title}: level exam
        </h1>
        <p className="mt-2 max-w-2xl text-muted">A timed, mixed check of the whole level. Take it when you&apos;ve done the modules, and again until you pass.</p>
      </header>
      <ExamRunner levelId={level.id} levelTitle={level.title} items={items} />
    </div>
  );
}
