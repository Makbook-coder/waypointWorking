import type { Metadata } from "next";
import Link from "next/link";
import { PracticeHub } from "@/components/PracticeHub";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Practice</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Quizzes for levels 0 to 13, Python coding tasks that run in your browser, mini projects, exercises, interview scenarios and level projects. Wrong answers send related topics back to your review queue.
        </p>
        <nav aria-label="More practice" className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/start" className="rounded-md border border-line bg-surface px-3 py-1.5 hover:bg-surface-2">New here? Start here</Link>
          <Link href="/labs" className="rounded-md border border-line bg-surface px-3 py-1.5 hover:bg-surface-2">Guided labs</Link>
          <Link href="/exam" className="rounded-md border border-line bg-surface px-3 py-1.5 hover:bg-surface-2">Level exams</Link>
          <Link href="/mistakes" className="rounded-md border border-line bg-surface px-3 py-1.5 hover:bg-surface-2">Mistakes</Link>
          <Link href="/readiness" className="rounded-md border border-line bg-surface px-3 py-1.5 hover:bg-surface-2">Readiness</Link>
        </nav>
      </header>
      <PracticeHub />
    </div>
  );
}
