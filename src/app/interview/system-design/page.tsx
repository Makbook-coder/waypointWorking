import type { Metadata } from "next";
import { SystemDesignPractice } from "@/components/SystemDesignPractice";
import { InterviewNav } from "@/components/InterviewNav";

export const metadata: Metadata = { title: "System design practice" };

export default function Page() {
  return (
    <div>
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">System design practice</h1>
        <p className="mt-2 max-w-2xl text-muted">Design prompts from public interview reports, with a checklist that covers the parts interviewers look for and an outline to compare with afterwards.</p>
      </header>
      <InterviewNav />
      <SystemDesignPractice />
    </div>
  );
}
