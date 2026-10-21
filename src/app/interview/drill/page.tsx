import type { Metadata } from "next";
import { CompanyDrill } from "@/components/CompanyDrill";
import { InterviewNav } from "@/components/InterviewNav";

export const metadata: Metadata = { title: "Company drills" };

export default function Page() {
  return (
    <div>
      <header className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Company drills</h1>
        <p className="mt-2 max-w-2xl text-muted">Timed sets of questions that candidates report one company asks. Each set is scored like a mock interview and saved with your past mocks.</p>
      </header>
      <InterviewNav />
      <CompanyDrill />
    </div>
  );
}
