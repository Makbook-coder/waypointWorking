import type { Metadata } from "next";
import { FocusView } from "@/components/FocusView";

export const metadata: Metadata = { title: "Focus timer" };

export default function FocusPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Focus timer</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Work in timed blocks with short breaks. The timer keeps running while you move around the app, and every finished block is logged.
        </p>
      </header>
      <FocusView />
    </div>
  );
}
