import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M69: ProjectSrc[] = [
  levelCapstone(6,
    pj("Context-Managed Long-Horizon Agent", 600, "Build a long-horizon agent with an explicit context budget, compaction, offloading, retrieval and a harness, and prove with measurements that it beats keeping everything in the window.",
      [
        ["Choose a long task such as researching and writing a report from 30 sources, and write 30 questions plus an acceptance check.", "Make it fail when the agent loses the goal."],
        ["Build a naive agent that keeps everything and run it to see where it degrades.", "Record tokens, cost, success and where quality falls."],
        ["Add a context budget with a limit for each part and an X-ray viewer of each turn's window.", "Log budget triggers."],
        ["Add compaction: summaries that keep the goal, structured exact facts and compacted tool outputs.", "Test with questions about early turns."],
        ["Add offloading: notes, a plan file, a progress log and a result store with ids.", "Add a forgetting policy with pinned items."],
        ["Add retrieval and selection: only the relevant sources and tools enter the window, in a good order.", "Measure selection accuracy."],
        ["Restructure the prompt for caching and measure the hit rate.", "Fix what breaks the cache."],
        ["Wrap the agent in a harness with hooks, policies, a start-up routine, handover and feedback loops.", "Add a sub-agent for noisy research."],
        ["Run the full task three times against the naive agent and compare success, tokens, cost and goal drift.", "Put everything in one table."],
        ["Kill the run at random points and check it resumes from files without repeating work.", "Count the repeated steps after each kill and write the number down."],
        ["Analyse remaining failures and label each by cause: missing, buried, stale, noisy or harness.", "Fix the most common cause first and rerun to see if the failures fall."],
        ["Write a README with the architecture, the results, a decision log of context choices you rejected and a runbook.", "Include the X-ray of a failing and a fixed run."],
      ],
      "A long-horizon agent with a context budget, compaction, offloading, retrieval and a harness that beats the naive agent on success and cost, with the evidence shown.",
      ["Naive baseline failure recorded", "Budget, compaction and offloading work", "Harness resumes after kills", "Comparison table across three runs", "Failures labelled by cause"],
      "Level 7 starts retrieval and RAG, where you will make the sources this agent depends on far better.",
      ["Everything from Level 6", LLM]),
  ),
];
