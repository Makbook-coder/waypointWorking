import type { Metadata } from "next";
import Link from "next/link";
import { ConceptMap } from "@/components/ConceptMap";

export const metadata: Metadata = { title: "Concept map" };

export default function MapPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Concept map</h1>
        <p className="mt-2 max-w-2xl text-muted">
          How the sixteen levels build on each other. Pick a level to see what comes before it, what it leads to, and every module and topic
          inside it. Topics you have finished are filled in. For the full list view, see the <Link href="/roadmap" className="underline underline-offset-2">roadmap</Link>.
        </p>
      </header>
      <ConceptMap />
    </div>
  );
}
