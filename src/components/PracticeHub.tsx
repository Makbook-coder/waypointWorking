"use client";

import { useMemo, useState } from "react";
import { allPractice } from "@/lib/content-data";
import { getModule, levels } from "@/lib/data";
import type { UserState } from "@/lib/store";
import type { Difficulty, PracticeItem, PracticeType, QuizItem, ScenarioItem } from "@/lib/types";
import { useHydrated, useUserState } from "@/lib/use-store";
import { ExerciseCard } from "./ExerciseCard";
import { ProjectChecklist } from "./ProjectChecklist";
import { QuizRunner } from "./QuizRunner";
import { ScenarioCard } from "./ScenarioCard";
import { Badge, EmptyState, buttonClass, ghostButtonClass, inputClass } from "./ui";

type Mode = "browse" | "random" | "interview";
type Status = "all" | "not-attempted" | "wrong";

export interface PracticeFilters {
  level: number | "all";
  type: PracticeType | "all";
  difficulty: Difficulty | "all";
  status: Status;
}

export function attempted(item: PracticeItem, s: UserState): boolean {
  switch (item.type) {
    case "quiz":
      return Boolean(s.quiz[item.id]);
    case "exercise":
      return Boolean(s.exercises[item.id]);
    case "scenario":
      return (s.scenarios[item.id]?.length ?? 0) > 0;
    case "project":
      return item.checklist.some((_, i) => s.projectChecks[`${item.id}#${i}`]);
  }
}

export function filterPractice(items: PracticeItem[], f: PracticeFilters, s: UserState): PracticeItem[] {
  return items.filter(
    (it) =>
      (f.level === "all" || it.levelId === f.level) &&
      (f.type === "all" || it.type === f.type) &&
      (f.difficulty === "all" || it.difficulty === f.difficulty) &&
      (f.status === "all" ||
        (f.status === "not-attempted" && !attempted(it, s)) ||
        (f.status === "wrong" && it.type === "quiz" && s.quiz[it.id]?.lastCorrect === false)),
  );
}

function sample<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const PAGE = 20;
const ctx = (moduleId: string) => {
  const m = getModule(moduleId);
  return m ? `${m.id} ${m.title}` : moduleId;
};

export function PracticeHub() {
  const s = useUserState();
  const hydrated = useHydrated();
  const [mode, setMode] = useState<Mode>("browse");
  const [f, setF] = useState<PracticeFilters>({ level: "all", type: "all", difficulty: "all", status: "all" });
  const [limit, setLimit] = useState(PAGE);
  const [quizRun, setQuizRun] = useState<QuizItem[] | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [timer, setTimer] = useState(600);
  const [scenario, setScenario] = useState<ScenarioItem | null>(null);

  const filtered = useMemo(() => filterPractice(allPractice, f, s), [f, s]);
  const quizzes = filtered.filter((i): i is QuizItem => i.type === "quiz");
  const others = filtered.filter((i) => i.type !== "quiz");
  const scenarios = useMemo(
    () => filterPractice(allPractice, { ...f, type: "scenario" }, s) as ScenarioItem[],
    [f, s],
  );

  const set = <K extends keyof PracticeFilters>(k: K, v: PracticeFilters[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setLimit(PAGE);
    setQuizRun(null);
  };

  function startRandom() {
    setQuizRun(sample(quizzes, 10));
    setRunKey((k) => k + 1);
  }
  function nextScenario() {
    const pool = scenarios.filter((x) => x.id !== scenario?.id);
    setScenario(sample(pool.length ? pool : scenarios, 1)[0] ?? null);
  }

  const modes: { id: Mode; label: string; hint: string }[] = [
    { id: "browse", label: "Browse", hint: "Everything that matches your filters" },
    { id: "random", label: "Random 10", hint: "Ten quiz questions drawn from your filters" },
    { id: "interview", label: "Interview mode", hint: "Timed scenarios with a 1 to 5 self-score" },
  ];

  return (
    <div>
      <div role="group" aria-label="Practice mode" className="mb-4 flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => {
              setMode(m.id);
              setQuizRun(null);
              setScenario(null);
            }}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-left aria-pressed:border-strong-line aria-pressed:bg-ink aria-pressed:text-bg"
          >
            <span className="block text-sm font-semibold">{m.label}</span>
            <span className="block text-xs opacity-75">{m.hint}</span>
          </button>
        ))}
      </div>

      <form className="mb-6 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()} aria-label="Filters">
        <Select label="Level" value={String(f.level)} onChange={(v) => set("level", v === "all" ? "all" : Number(v))}>
          <option value="all">All levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              L{l.id} {l.title}
            </option>
          ))}
        </Select>
        <Select label="Type" value={f.type} onChange={(v) => set("type", v as PracticeFilters["type"])} disabled={mode !== "browse"}>
          <option value="all">All types</option>
          <option value="quiz">Quiz</option>
          <option value="exercise">Exercise</option>
          <option value="scenario">Scenario</option>
          <option value="project">Project</option>
        </Select>
        <Select label="Difficulty" value={f.difficulty} onChange={(v) => set("difficulty", v as PracticeFilters["difficulty"])}>
          <option value="all">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
        <Select label="Status" value={f.status} onChange={(v) => set("status", v as Status)}>
          <option value="all">All</option>
          <option value="not-attempted">Not attempted</option>
          <option value="wrong">Wrong answers (quiz)</option>
        </Select>
      </form>

      {!hydrated ? null : mode === "browse" ? (
        <div className="space-y-6">
          <p className="num text-sm text-muted" aria-live="polite">
            {filtered.length} items · {quizzes.length} quiz questions · {others.length} exercises, scenarios and projects
          </p>
          {quizzes.length > 0 && (
            <section aria-label="Quiz questions">
              {quizRun ? (
                <QuizRunner key={runKey} items={quizRun} title="Quiz" showModule />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4">
                  <p className="text-sm">
                    <span className="num font-semibold">{quizzes.length}</span> quiz questions match.
                  </p>
                  <button type="button" className={buttonClass} onClick={() => { setQuizRun(quizzes); setRunKey((k) => k + 1); }}>
                    Run all in order
                  </button>
                </div>
              )}
            </section>
          )}
          {others.length === 0 && quizzes.length === 0 && <EmptyState>Nothing matches these filters.</EmptyState>}
          <ul className="grid gap-3 lg:grid-cols-2">
            {others.slice(0, limit).map((it) => (
              <li key={it.id}>
                {it.type === "exercise" ? (
                  <ExerciseCard item={it} context={ctx(it.moduleId)} />
                ) : it.type === "scenario" ? (
                  <ScenarioCard item={it} context={ctx(it.moduleId)} />
                ) : it.type === "project" ? (
                  <article className="rounded-lg border border-line bg-surface p-4">
                    <div className="mb-1 flex gap-2">
                      <Badge>project</Badge>
                      <span className="text-xs text-muted">Level {it.levelId}</span>
                    </div>
                    <h3 className="mb-3 font-semibold">{it.title}</h3>
                    <ProjectChecklist project={it} />
                  </article>
                ) : null}
              </li>
            ))}
          </ul>
          {others.length > limit && (
            <button type="button" className={ghostButtonClass} onClick={() => setLimit((l) => l + PAGE)}>
              Show more ({others.length - limit} left)
            </button>
          )}
        </div>
      ) : mode === "random" ? (
        <section aria-label="Random quiz" className="max-w-3xl">
          {quizRun ? (
            <QuizRunner key={runKey} items={quizRun} title="Random 10" showModule onRestart={startRandom} />
          ) : (
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="text-sm text-muted">
                <span className="num font-semibold text-ink">{quizzes.length}</span> questions match your filters. Ten will be drawn at random.
              </p>
              <button type="button" className={`${buttonClass} mt-4`} disabled={quizzes.length === 0} onClick={startRandom}>
                Draw {Math.min(10, quizzes.length)} questions
              </button>
            </div>
          )}
        </section>
      ) : (
        <section aria-label="Interview mode" className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-4">
            <Select label="Time per scenario" value={String(timer)} onChange={(v) => setTimer(Number(v))}>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
              <option value="900">15 minutes</option>
              <option value="2400">40 minutes (system design)</option>
            </Select>
            <button type="button" className={buttonClass} disabled={scenarios.length === 0} onClick={nextScenario}>
              {scenario ? "Next scenario" : "Start interview"}
            </button>
            <p className="num text-xs text-muted">{scenarios.length} scenarios in the pool</p>
          </div>
          {scenario ? (
            <ScenarioCard key={scenario.id} item={scenario} context={ctx(scenario.moduleId)} timerSeconds={timer} />
          ) : (
            <EmptyState>Pick a level (L9 and L15 have the most) or leave it on all levels, then start.</EmptyState>
          )}
        </section>
      )}
    </div>
  );
}

function Select({ label, value, onChange, children, disabled }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`${inputClass} normal-case tracking-normal disabled:opacity-50`}>
        {children}
      </select>
    </label>
  );
}
