import type { Metadata } from "next";
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
      </header>
      <PracticeHub />
    </div>
  );
}
