import type { Metadata } from "next";
import { DebugSnippets } from "@/components/DebugSnippets";
import { InterviewNav } from "@/components/InterviewNav";

export const metadata: Metadata = { title: "Debug the snippet" };

export default function Page() {
  return (
    <div>
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Debug the snippet</h1>
        <p className="mt-2 max-w-2xl text-muted">Short Python snippets with a bug that mirrors a real failure in LLM applications. Find the bug, then check your answer.</p>
      </header>
      <InterviewNav />
      <DebugSnippets />
    </div>
  );
}
