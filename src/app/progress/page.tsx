import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Progress</h1>
        <p className="mt-2 max-w-2xl text-muted">Time spent, weak spots, what to do next, your study log and badges.</p>
      </header>
      <ProgressView />
    </div>
  );
}
