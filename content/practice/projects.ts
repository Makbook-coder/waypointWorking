import type { ProjectSrc } from "./types";

/** Definition of done per level project. The checklist comes from the level's deliverables. */
export const PROJECTS: ProjectSrc[] = [
  [0, "The service runs from a clean clone with one command, all tests pass in CI, and the README lets a stranger call every endpoint."],
  [2, "A user can chat with streaming output, the assistant calls at least two tools correctly, failures are handled without crashing, and the app is deployed at a public URL."],
  [3, "The optimized prompt beats the original on a versioned test set, with scores, cost and variance recorded for both."],
  [4, "Hybrid retrieval beats dense-only on a labeled query set, the advanced RAG app abstains on weak evidence, and latency, tokens and cost are tracked per request in a deployed app."],
  [5, "The agent completes a defined task suite with budgets, error recovery, tracing and an approval step for consequential actions, and its success rate and cost per task are reported."],
  [6, "On the same long task, the managed agent holds the goal and matches or beats the keep-everything baseline at lower token cost, with numbers to show it."],
  [8, "Attack-success rates are measured before and after the controls, every finding is a regression test in CI, and the residual risks are documented."],
  [9, "The design document covers every required section, ties each choice to a requirement, includes a diagram and rejected alternatives, and a reviewer could build from it."],
  [10, "A deliberate regression is blocked by CI, a release reaches EC2 via the pipeline, dashboards and alerts are live, and a rollback has been performed using the runbook."],
  [11, "The app runs on a managed platform with cloud identity and a private path, evals were re-run after the move, the gateway fallback was demonstrated and a decision record exists."],
  [12, "The build handles at least two modalities on real inputs, reports latency and cost per request, documents one real failure, and someone else can run it from the README."],
  [13, "The LoRA beats a strong prompted baseline on the same held-out set at a threshold set in advance, the run is reproducible, it is served, and the decision record covers cost and regressions."],
  [14, "At least three projects are deployed or runnable, each with a write-up covering problem, architecture, results and failures, and you can present each in five minutes."],
  [15, "You complete all three rounds of the mock loop within time, self-score each round, and write down three concrete improvements for your next attempt."],
];
