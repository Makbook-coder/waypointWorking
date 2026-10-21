"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { type RunResult } from "@/lib/coding";
import { getModule, moduleHref } from "@/lib/data";
import { EXAM_MINUTES, EXAM_QUIZ_COUNT, PASS_MARK, WEIGHTS, bestExam, buildExam, examsFor, scoreExam, type ExamPaper } from "@/lib/exam";
import { runPython, type RunnerStatus } from "@/lib/py-runner";
import { store } from "@/lib/store";
import type { PracticeItem } from "@/lib/types";
import { useUserState } from "@/lib/use-store";
import { CodeEditor } from "./CodeEditor";
import { InlineCode } from "./InlineCode";
import { TestResults } from "./TestResults";
import { Badge, buttonClass, ghostButtonClass } from "./ui";

type Phase = "intro" | "running" | "scenario" | "done";
const LETTERS = ["A", "B", "C", "D"];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Honesty() {
  return (
    <p className="text-xs text-muted">
      This exam checks what you can do with this level today. Passing it is a good sign, not a guarantee for any real interview or exam. Real ones vary, so keep practising the weak spots it finds.
    </p>
  );
}

export function ExamRunner({ levelId, levelTitle, items }: { levelId: number; levelTitle: string; items: PracticeItem[] }) {
  const s = useUserState();
  const uid = useId();
  const [phase, setPhase] = useState<Phase>("intro");
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [startedAt, setStartedAt] = useState("");
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [quiz, setQuiz] = useState<Record<string, number | null>>({});
  const [code, setCode] = useState("");
  const [run, setRun] = useState<RunResult | null>(null);
  const [status, setStatus] = useState<RunnerStatus>("idle");
  const [answer, setAnswer] = useState("");
  const [selfScore, setSelfScore] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof scoreExam> | null>(null);
  const saved = useRef(false);

  const left = Math.max(0, Math.round((deadline - now) / 1000));

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && deadline && now >= deadline) setPhase("scenario");
  }, [phase, now, deadline]);

  function start() {
    const p = buildExam(levelId, items, Date.now() & 0x7fffffff, s);
    if (!p) return;
    const t = Date.now();
    setPaper(p);
    setQuiz({});
    setCode(p.coding.starter);
    setRun(null);
    setAnswer("");
    setSelfScore(0);
    setResult(null);
    saved.current = false;
    setStartedAt(new Date(t).toISOString());
    setDeadline(t + EXAM_MINUTES * 60_000);
    setNow(t);
    setPhase("running");
  }

  async function runCode() {
    if (!paper) return;
    setRun(await runPython(code, paper.coding.tests, setStatus));
  }

  function finish() {
    if (!paper || saved.current) return;
    const passedTests = run && !run.fatal ? run.results.filter((t) => t.ok).length : 0;
    const r = scoreExam(paper, { quiz, codingPassed: passedTests, codingTotal: paper.coding.tests.length, scenarioScore: selfScore });
    saved.current = true;
    for (const q of paper.quizzes) if (quiz[q.id] !== undefined && quiz[q.id] !== null) store.recordQuiz(q.id, quiz[q.id] === q.answer, getModule(q.moduleId)?.topics.map((t) => t.id));
    const weakTopics = r.weakModules.flatMap((m) => getModule(m)?.topics.map((t) => t.id) ?? []);
    store.recordExam(
      {
        levelId,
        startedAt,
        score: r.score,
        passed: r.passed,
        quiz: { correct: r.correct, total: paper.quizzes.length },
        coding: { itemId: paper.coding.id, passed: passedTests, total: paper.coding.tests.length },
        scenario: { itemId: paper.scenario.id, score: selfScore },
        wrongQuizIds: r.wrongQuizIds,
        weakModules: r.weakModules,
      },
      weakTopics,
    );
    if (selfScore > 0) store.recordScenario(paper.scenario.id, selfScore);
    setResult(r);
    setPhase("done");
  }

  const history = examsFor(s, levelId);
  const best = bestExam(s, levelId);
  const canBuild = buildExam(levelId, items, 1) !== null;

  if (phase === "intro")
    return (
      <div className="max-w-3xl space-y-4">
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>
              <span className="num">{EXAM_MINUTES}</span> minutes. When time runs out, the exam moves on to scoring automatically.
            </li>
            <li>
              <span className="num">{EXAM_QUIZ_COUNT}</span> quiz questions from across the level ({WEIGHTS.quiz}% of the score), one coding task that runs in your browser ({WEIGHTS.coding}%), and one scenario you answer in writing and then self-score against the key points ({WEIGHTS.scenario}%).
            </li>
            <li>No hints during the exam. Questions you got wrong in practice are more likely to come up.</li>
            <li>
              Pass mark: <span className="num font-semibold">{PASS_MARK}%</span>. Afterwards you review every mistake, and the topics of every module you slipped on come back for review tomorrow.
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className={buttonClass} onClick={start} disabled={!canBuild}>
              Start the L{levelId} exam
            </button>
            {best && (
              <span className="text-sm text-muted">
                Best so far: <span className="num font-semibold text-ink">{best.score}%</span> {best.passed ? "· passed" : ""} · {history.length} attempt{history.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {!canBuild && <p className="mt-2 text-sm text-bad">This level doesn&apos;t have enough practice for an exam yet.</p>}
        </div>
        <Honesty />
        {history.length > 0 && <History levelId={levelId} />}
      </div>
    );

  if (!paper) return null;

  if (phase === "running")
    return (
      <div className="max-w-4xl space-y-8">
        <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface/95 p-3 backdrop-blur">
          <span className="text-sm">
            L{levelId} {levelTitle} exam · <span className="num">{Object.values(quiz).filter((v) => v !== null).length}/{paper.quizzes.length}</span> answered
          </span>
          <span role="timer" aria-live="off" className={`num rounded-md border px-3 py-1 font-mono text-lg ${left < 120 ? "border-bad text-bad" : "border-line"}`}>
            {fmt(left)}
          </span>
        </div>

        <section aria-labelledby={`${uid}-q`}>
          <h2 id={`${uid}-q`} className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Part 1 · Quiz ({WEIGHTS.quiz}%)
          </h2>
          <ol className="space-y-4">
            {paper.quizzes.map((q, n) => (
              <li key={q.id} className="rounded-lg border border-line bg-surface p-4">
                <fieldset>
                  <legend className="font-medium leading-snug">
                    <span className="num mr-1 text-muted">{n + 1}.</span>
                    {q.question}
                  </legend>
                  <div className="mt-3 space-y-1.5">
                    {q.options.map((opt, i) => {
                      const id = `${uid}-${q.id}-${i}`;
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <input id={id} type="radio" name={`${uid}-${q.id}`} checked={quiz[q.id] === i} onChange={() => setQuiz((a) => ({ ...a, [q.id]: i }))} className="mt-1 h-4 w-4 cursor-pointer accent-[var(--ink)]" />
                          <label htmlFor={id} className="cursor-pointer text-sm">
                            <span className="font-mono text-muted">{LETTERS[i]}.</span> {opt}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={`${uid}-c`} className="rounded-lg border border-line bg-surface p-4">
          <h2 id={`${uid}-c`} className="text-sm font-semibold uppercase tracking-wider text-muted">
            Part 2 · Coding ({WEIGHTS.coding}%)
          </h2>
          <h3 className="mt-2 font-semibold">{paper.coding.title}</h3>
          <p className="mt-1 text-sm leading-relaxed">
            <InlineCode text={paper.coding.prompt} />
          </p>
          <label htmlFor={`${uid}-code`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
            Your code (Python)
          </label>
          <CodeEditor id={`${uid}-code`} value={code} onChange={setCode} />
          <div className="mt-2 flex items-center gap-2">
            <button type="button" className={ghostButtonClass} onClick={runCode} disabled={status !== "idle"}>
              {status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : "Run tests"}
            </button>
            <span className="text-xs text-muted">Your last run counts. Run again after every change.</span>
          </div>
          <TestResults result={run} />
        </section>

        <section aria-labelledby={`${uid}-s`} className="rounded-lg border border-line bg-surface p-4">
          <h2 id={`${uid}-s`} className="text-sm font-semibold uppercase tracking-wider text-muted">
            Part 3 · Scenario ({WEIGHTS.scenario}%)
          </h2>
          <h3 className="mt-2 font-semibold">{paper.scenario.title}</h3>
          <p className="mt-1 text-sm leading-relaxed">{paper.scenario.prompt}</p>
          <label htmlFor={`${uid}-a`} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-muted">
            Your answer
          </label>
          <textarea id={`${uid}-a`} value={answer} onChange={(e) => setAnswer(e.target.value.slice(0, 4000))} rows={6} placeholder="What would you check, decide and do, in order?" className="mt-1 w-full resize-y rounded-md border border-line bg-surface-2 p-3 text-sm text-ink placeholder:text-muted" />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={buttonClass} onClick={() => setPhase("scenario")}>
            Submit exam
          </button>
          <span className="text-xs text-muted">Next you&apos;ll score your scenario answer, then see your results.</span>
        </div>
      </div>
    );

  if (phase === "scenario")
    return (
      <div className="max-w-3xl space-y-4">
        {left === 0 && <p className="rounded-md border border-bad p-3 text-sm text-bad">Time is up. Your answers so far are kept.</p>}
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="font-semibold">Score your scenario answer honestly</h2>
          <p className="mt-1 text-sm text-muted">{paper.scenario.title}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">You wrote</p>
          <p className="mt-1 whitespace-pre-wrap rounded-md bg-surface-2 p-3 text-sm">{answer.trim() || "(nothing)"}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">A strong answer covers</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {paper.scenario.hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <fieldset className="mt-4">
            <legend className="text-sm">How many of those points did you cover, and how clearly? 1 = almost none, 5 = all of them, well explained.</legend>
            <div className="mt-2 flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-pressed={selfScore === n} onClick={() => setSelfScore(n)} className={`num h-9 w-9 rounded-md border text-sm ${selfScore === n ? "border-strong-line bg-ink text-bg" : "border-line hover:border-strong-line"}`}>
                  {n}
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" className={`${buttonClass} mt-4`} onClick={finish} disabled={!answer.trim() ? false : selfScore === 0}>
            {!answer.trim() && selfScore === 0 ? "Skip and see results" : "See results"}
          </button>
        </div>
      </div>
    );

  if (!result) return null;
  const testsPassed = run && !run.fatal ? run.results.filter((t) => t.ok).length : 0;
  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-lg border border-line bg-surface p-6 text-center" role="status">
        <p className="text-sm uppercase tracking-wider text-muted">L{levelId} exam result</p>
        <p className="num mt-2 text-5xl font-bold">{result.score}%</p>
        <p className={`mt-2 font-semibold ${result.passed ? "" : "text-bad"}`}>{result.passed ? `Passed (pass mark ${PASS_MARK}%)` : `Not yet: the pass mark is ${PASS_MARK}%`}</p>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-xs text-muted">Quiz</dt>
            <dd className="num font-semibold">
              {result.correct}/{paper.quizzes.length} · {result.parts.quiz}/{WEIGHTS.quiz}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Coding</dt>
            <dd className="num font-semibold">
              {testsPassed}/{paper.coding.tests.length} tests · {result.parts.coding}/{WEIGHTS.coding}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Scenario</dt>
            <dd className="num font-semibold">
              {selfScore || "–"}/5 · {result.parts.scenario}/{WEIGHTS.scenario}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" className={buttonClass} onClick={() => setPhase("intro")}>
            Done
          </button>
          <button type="button" className={ghostButtonClass} onClick={start}>
            Retake with new questions
          </button>
        </div>
      </div>

      {result.weakModules.length > 0 && (
        <section className="rounded-lg border border-line bg-surface p-4">
          <h2 className="font-semibold">Revisit these modules</h2>
          <p className="mt-1 text-sm text-muted">Their topics are in tomorrow&apos;s review queue (Flashcards, Due today). Redo their quiz and lab before you retake.</p>
          <ul className="mt-2 space-y-1 text-sm">
            {result.weakModules.map((m) => (
              <li key={m}>
                <Link href={`${moduleHref(m)}#practice`} className="underline underline-offset-2">
                  {m} {getModule(m)?.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Review your mistakes</h2>
        {result.wrongQuizIds.length === 0 ? (
          <p className="text-sm">Every quiz answer was right.</p>
        ) : (
          <ul className="space-y-3">
            {paper.quizzes
              .filter((q) => result.wrongQuizIds.includes(q.id))
              .map((q) => {
                const mine = quiz[q.id];
                return (
                  <li key={q.id} className="rounded-lg border border-line bg-surface p-4 text-sm">
                    <p className="font-medium">{q.question}</p>
                    <p className="mt-2">
                      <span className="text-muted">You chose: </span>
                      {mine === null || mine === undefined ? "no answer" : `${LETTERS[mine]}. ${q.options[mine]}`}
                    </p>
                    <p>
                      <span className="text-muted">Correct: </span>
                      {LETTERS[q.answer]}. {q.options[q.answer]}
                    </p>
                    <p className="mt-2 rounded bg-surface-2 p-2">{q.explanation}</p>
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-line bg-surface p-4">
        <h2 className="font-semibold">Coding: {paper.coding.title}</h2>
        <TestResults result={run} />
        {!run && <p className="mt-1 text-sm text-muted">You didn&apos;t run the tests, so this part scored 0.</p>}
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer">Reference solution</summary>
          <pre className="mt-2 overflow-auto rounded-md border border-line bg-surface-2 p-3 font-mono text-[13px]">{paper.coding.solution}</pre>
        </details>
      </section>

      <Honesty />
    </div>
  );
}

function History({ levelId }: { levelId: number }) {
  const list = examsFor(useUserState(), levelId).slice(-5).reverse();
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">Recent attempts</h2>
      <ul className="divide-y divide-line rounded-lg border border-line bg-surface text-sm">
        {list.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
            <span className="text-muted">{new Date(e.finishedAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-2">
              <span className="num font-semibold">{e.score}%</span>
              <Badge>{e.passed ? "passed" : "not yet"}</Badge>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
