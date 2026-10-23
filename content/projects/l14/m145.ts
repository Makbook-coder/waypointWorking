import { LLM, moduleCapstone, pj, topicProjects } from "../build";
import type { ProjectSrc } from "../types";

const AI = ["Python 3.11 or newer", LLM, "FastAPI"];

export const M145: ProjectSrc[] = [
  ...topicProjects("m14-5-operations-story", [
    pj("Add the basic signals", 45, "Add logs, latency and cost metrics to an LLM API.",
      [
        ["Take an existing LLM API route.", "Yours. Ask what changed since the last run."],
        ["Log request id, latency, tokens and model for each call.", "Structured. Print the intermediate values to see them."],
        ["Compute cost per request from tokens.", "Function. Start with a single input before using many."],
        ["Print a daily summary from the logs.", "Script. Take it one small step at a time."],
      ],
      "An LLM API that logs latency, tokens and cost per request with a summary script.",
      ["Fields logged", "Cost computed", "Summary prints"],
      "Next, add alerts and a runbook.", AI),
    pj("An on-call ready API", 90, "Add health checks, alerts, rate limits, a fallback and a runbook.",
      [
        ["Add readiness and liveness endpoints.", "Check dependencies."],
        ["Add rate limits and a per-user budget.", "Tests. Write down what you see before changing anything."],
        ["Add a timeout and a fallback model or message.", "Chaos test. Re-read the step and try the smallest version first."],
        ["Define alerts on error rate, latency and spend.", "Thresholds. Check one example by hand to be sure."],
        ["Simulate an incident and follow a runbook you wrote.", "Time it. Save your work so you can compare later."],
        ["Fix the runbook where it was unclear.", "Revise. Ask what changed since the last run."],
      ],
      "An API with health checks, limits, fallback, alerts and a runbook tested on a simulated incident.",
      ["Fallback works under failure", "Alerts defined", "Runbook tested"],
      "Next, the module capstone builds a monitored production API.", AI),
  ]),
  moduleCapstone("M14.5", ["m14-5-operations-story"], pj("Monitored production API", 480,
    "Ship an LLM API with monitoring, evaluation in production, cost controls, a deploy pipeline and an incident drill.",
    [
      ["Choose the API and define its service level targets for latency, errors and quality.", "Numbers. Print the intermediate values to see them."],
      ["Add structured logging, traces and metrics with a dashboard.", "Charts. Start with a single input before using many."],
      ["Add a sampled online quality check against a small rubric.", "Signal. Take it one small step at a time."],
      ["Add rate limits, per-user budgets and a spend alert.", "Controls. Write down what you see before changing anything."],
      ["Add a fallback path and test it by breaking the primary.", "Chaos. Re-read the step and try the smallest version first."],
      ["Build a CI pipeline that runs tests and an evaluation gate before deploy.", "Gate. Check one example by hand to be sure."],
      ["Deploy to a platform with config and secrets handled properly.", "Live. Save your work so you can compare later."],
      ["Run an incident drill, write the post-mortem and fix what it found.", "Document. Ask what changed since the last run."],
      ["Write an operations guide covering dashboards, alerts and rollback.", "Readable. Print the intermediate values to see them."],
    ],
    "A deployed LLM API with dashboards, quality sampling, budgets, a tested fallback, an evaluation gate and an incident post-mortem.",
    ["Fallback and budgets tested", "Evaluation gate blocks a bad change", "Incident drill post-mortem written"],
    "Next, a voice or multimodal build.", AI)),
];
