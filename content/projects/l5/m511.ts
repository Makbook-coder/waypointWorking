import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M511: ProjectSrc[] = [
  levelCapstone(5,
    pj("Production-Style Agent", 700, "Build, harden and ship an agent for a real task, with tools, memory, planning limits, safe execution, reliability controls, tracing and a written evaluation.",
      [
        ["Choose a substantial project with a real user and write requirements: tasks it must do, what it must never do and how success is measured.", "Write 30 test tasks including failure cases."],
        ["Decide workflow, agent or team with a measured comparison on a small slice.", "Record the baseline."],
        ["Build the core loop or graph with typed tool schemas, validation, parallel-safe tool calls and read-only versus consequential tools.", "Add a permission layer."],
        ["Add MCP servers for at least one external capability.", "Apply a client-side permission policy."],
        ["Add memory: a task scratchpad, a long-term store with user controls and a compaction policy.", "Test recall on scripted sessions."],
        ["Add planning and reflection only where measurement shows they help.", "Show the ablation."],
        ["Add a sandbox for any code execution with restrictions and a regression suite of attacks.", "Document what remains risky."],
        ["Add budgets, idempotency, persistence with safe resume, fallbacks and a human handoff.", "Test with fault injection."],
        ["Add tracing, a run viewer, live progress and cancel, pause and redirect.", "Test with an observer."],
        ["Run the full test suite and report success, cost, latency, variance and failure types.", "Fix the top two failures and rerun."],
        ["Deploy it where the intended user can reach it and write a runbook for failures.", "Include the budget table."],
        ["Write a README with the architecture diagram, the results, security limits and a decision log of choices you rejected.", "Include a demo trace."],
      ],
      "A deployed agent for a real user with tools, memory, safe execution, reliability controls, traces and an evaluation that shows measured results and failures.",
      ["Requirements and 30 tests written first", "Design chosen by measurement", "Tools permissioned and sandboxed", "Memory, budgets and safe resume work", "Fault injection and attacks kept as tests", "Deployed with a runbook"],
      "Level 6 starts context engineering, where you will make this agent's context cheaper and sharper.",
      ["Everything from Level 5", LLM]),
  ),
];
