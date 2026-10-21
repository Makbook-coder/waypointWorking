"use client";

import { useState } from "react";
import { generatePractice, type GenerateKind } from "@/lib/ai/tasks";
import { useAIRequest } from "@/lib/ai/use-ai";
import { store } from "@/lib/store";
import type { Module, QuizItem, ScenarioItem } from "@/lib/types";
import { useUserState } from "@/lib/use-store";
import { AIErrorNote, AIModelTag, AISetupHint } from "./AIKit";
import { QuizRunner } from "./QuizRunner";
import { ScenarioCard } from "./ScenarioCard";
import { SectionTitle, ghostButtonClass } from "./ui";

const COUNT: Record<GenerateKind, number> = { quiz: 5, scenario: 2 };

/** Extra quiz questions and scenarios written by the AI tutor on demand, saved in this browser. */
export function GeneratedPractice({ mod, existing }: { mod: Module; existing: string[] }) {
  const saved = useUserState().generated[mod.id] ?? [];
  const ai = useAIRequest();
  const [busy, setBusy] = useState<GenerateKind | null>(null);
  const [quizRound, setQuizRound] = useState(0);
  const quizzes = saved.filter((g): g is QuizItem => g.type === "quiz");
  const scenarios = saved.filter((g): g is ScenarioItem => g.type === "scenario");

  async function generate(kind: GenerateKind) {
    setBusy(kind);
    const avoid = [...existing, ...saved.map((g) => (g.type === "quiz" ? g.question : g.title))];
    const items = await ai.run((p, signal) =>
      generatePractice(
        p,
        { kind, moduleId: mod.id, levelId: mod.levelId, moduleTitle: mod.title, topics: mod.topics.map((t) => t.title), avoid, count: COUNT[kind] },
        new Date().toISOString(),
        signal,
      ),
    );
    if (items) {
      store.addGenerated(mod.id, items);
      if (kind === "quiz") setQuizRound((r) => r + 1);
    }
    setBusy(null);
  }

  return (
    <section aria-labelledby="gen-h" className="max-w-4xl space-y-4 rounded-lg border border-dashed border-line p-4">
      <SectionTitle id="gen-h">More practice from the AI tutor</SectionTitle>
      {ai.configured ? (
        <div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={ghostButtonClass} disabled={ai.loading} onClick={() => generate("quiz")}>
              {busy === "quiz" ? "Writing questions…" : `Generate ${COUNT.quiz} quiz questions`}
            </button>
            <button type="button" className={ghostButtonClass} disabled={ai.loading} onClick={() => generate("scenario")}>
              {busy === "scenario" ? "Writing scenarios…" : `Generate ${COUNT.scenario} interview scenarios`}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Written by <AIModelTag />. New items are saved in this browser and included in your export. AI-written questions can contain mistakes.</p>
          <AIErrorNote error={ai.error} />
        </div>
      ) : (
        <AISetupHint>Want fresh questions for {mod.id}? Generate them with an AI tutor</AISetupHint>
      )}

      {quizzes.length > 0 && (
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">AI quiz · {quizzes.length} questions</p>
            <button type="button" className="text-xs text-muted underline underline-offset-2 hover:text-ink" onClick={() => store.removeGenerated(mod.id, "quiz")}>
              Remove AI questions
            </button>
          </div>
          <QuizRunner key={quizRound} items={quizzes} title={`${mod.id} AI quiz`} bookmarks={false} />
        </div>
      )}
      {scenarios.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">AI scenarios · {scenarios.length}</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {scenarios.map((s) => (
              <ScenarioCard key={s.id} item={s} generated onRemove={() => store.removeGenerated(mod.id, s.id)} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
