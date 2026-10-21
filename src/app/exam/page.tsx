import type { Metadata } from "next";
import { ExamIndex } from "@/components/ExamIndex";
import { getLevel } from "@/lib/data";
import { EXAM_LEVELS, EXAM_MINUTES, PASS_MARK } from "@/lib/exam";
import { PHASE_STYLE } from "@/lib/phase";

export const metadata: Metadata = { title: "Level exams" };

export default function ExamsPage() {
  const levels = EXAM_LEVELS.map((id) => {
    const l = getLevel(id)!;
    return { id, title: l.title, color: PHASE_STYLE[l.phase].var };
  });
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Level exams</h1>
        <p className="mt-2 max-w-2xl text-muted">
          One {EXAM_MINUTES}-minute exam per level: quiz questions from every module, a coding task and a scenario. The pass mark is {PASS_MARK}%. Mistakes send their topics back into review. Passing means you&apos;ve practised the level well. It doesn&apos;t guarantee any real exam result.
        </p>
      </header>
      <ExamIndex levels={levels} />
    </div>
  );
}
