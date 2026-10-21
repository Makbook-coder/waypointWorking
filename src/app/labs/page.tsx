import type { Metadata } from "next";
import { LabsIndex, type LabSummary } from "@/components/LabsIndex";
import { getLevel, getModule, moduleHref } from "@/lib/data";
import { labs } from "@/lib/labs";
import { PHASE_STYLE } from "@/lib/phase";

export const metadata: Metadata = { title: "Guided labs" };

export default function LabsPage() {
  const list: LabSummary[] = labs.map((l) => {
    const mod = getModule(l.moduleId)!;
    const level = getLevel(mod.levelId)!;
    return {
      id: l.id,
      title: l.title,
      goal: l.goal,
      moduleId: mod.id,
      moduleTitle: mod.title,
      levelId: level.id,
      levelTitle: level.title,
      href: `${moduleHref(mod.id)}#practice`,
      steps: l.steps.length,
      color: PHASE_STYLE[level.phase].var,
    };
  });
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Guided labs</h1>
        <p className="mt-2 max-w-2xl text-muted">
          One hands-on build per level, in Python that runs in your browser. Each lab is one file you grow over four steps, with a checkpoint after each. The first steps give you most of the code; the last gives you only the spec. Stuck? Every step has two hints before the solution.
        </p>
      </header>
      <LabsIndex labs={list} />
    </div>
  );
}
