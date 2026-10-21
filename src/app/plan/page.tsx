import type { Metadata } from "next";
import { PlanView } from "@/components/PlanView";

export const metadata: Metadata = { title: "Weekly plan" };

export default function PlanPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Weekly plan</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Your remaining modules, in roadmap order, spread over weeks at the pace you choose. It updates as you tick topics off.
        </p>
      </header>
      <PlanView />
    </div>
  );
}
