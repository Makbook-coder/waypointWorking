import type { Metadata } from "next";
import { Flashcards } from "@/components/Flashcards";

export const metadata: Metadata = { title: "Flashcards" };

export default function FlashcardsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Flashcards</h1>
        <p className="mt-2 max-w-2xl text-muted">
          One card per topic. Keyboard: <kbd className="font-mono">Space</kbd> to flip, <kbd className="font-mono">1</kbd> forgot,{" "}
          <kbd className="font-mono">2</kbd> remembered.
        </p>
      </header>
      <Flashcards />
    </div>
  );
}
