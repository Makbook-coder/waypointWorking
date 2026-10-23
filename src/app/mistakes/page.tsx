import type { Metadata } from "next";
import { MistakeTracker } from "@/components/MistakeTracker";

export const metadata: Metadata = { title: "Mistakes" };

export default function MistakesPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mistakes</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Every quiz question you missed, with how sure you were. Answer a missed question right twice in a row and it counts as fixed.
        </p>
      </header>
      <MistakeTracker />
    </div>
  );
}
