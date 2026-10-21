import type { Metadata } from "next";
import { GlossaryBrowser } from "@/components/GlossaryBrowser";
import { getModule, moduleHref } from "@/lib/data";
import { glossary } from "@/lib/glossary";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  const entries = glossary.map((e) => {
    const m = getModule(e.moduleId)!;
    return { ...e, moduleLabel: `${m.id} ${m.title}`, moduleHref: moduleHref(m.id) };
  });
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Glossary</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Every term in the roadmap in plain words, with the module that teaches it. In the notes, these words have a dotted underline: hover or tap one to see its meaning without leaving the page.
        </p>
      </header>
      <GlossaryBrowser entries={entries} />
    </div>
  );
}
