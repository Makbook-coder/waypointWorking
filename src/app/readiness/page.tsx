import type { Metadata } from "next";
import { ReadinessView } from "@/components/ReadinessView";
import { levelPractice } from "@/lib/readiness-data";

export const metadata: Metadata = { title: "Readiness" };

export default function ReadinessPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Readiness</h1>
        <p className="mt-2 max-w-2xl text-muted">
          How much hands-on practice you&apos;ve done for your target role, how well it went, and what to do next. Levels that matter more for the role count more.
        </p>
      </header>
      <ReadinessView levels={levelPractice()} />
    </div>
  );
}
