import type { Metadata } from "next";
import Link from "next/link";
import { InterviewNav } from "@/components/InterviewNav";
import { SourcedInterviews } from "@/components/SourcedInterviews";

export const metadata: Metadata = { title: "Interview questions by company" };

export default function CompanyInterviewPage() {
  return (
    <div>
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Real questions by company</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Questions and scenarios from public interview write-ups, question banks, engineering blogs and incident postmortems, rewritten in our own words with a model answer. Each one links to its source. A company badge appears only when the source says that company asked it, and the model answers are ours, so treat them as study notes.{" "}
          <Link href="/interview" className="underline underline-offset-2">
            Back to the mock interview
          </Link>
          .
        </p>
      </header>
      <InterviewNav />
      <SourcedInterviews />
    </div>
  );
}
