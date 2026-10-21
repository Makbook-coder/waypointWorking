import type { Metadata } from "next";
import Link from "next/link";
import { MockInterview } from "@/components/MockInterview";

export const metadata: Metadata = { title: "Mock interview" };

export default function InterviewPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mock interview</h1>
        <p className="mt-2 max-w-2xl text-muted">
          A timed run through the interview question bank, one question per module. Each answer is self-scored against a model answer, and every mock is saved so you can watch your average move.{" "}
          <Link href="/interview/company" className="underline underline-offset-2">
            Browse real questions by company
          </Link>
          .
        </p>
      </header>
      <MockInterview />
    </div>
  );
}
