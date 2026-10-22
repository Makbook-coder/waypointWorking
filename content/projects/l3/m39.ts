import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M39: ProjectSrc[] = [
  levelCapstone(3,
    pj("Optimise a Real Prompt", 420, "Take a real, imperfect prompt and improve it measurably using tests, versions, cost control and injection checks.",
      [
        ["Choose a real task you care about, such as triaging support emails, and write the first prompt.", "Define what good looks like in writing."],
        ["Build a test set of at least 50 labelled cases with categories and odd inputs.", "Add 10 injection attempts."],
        ["Write a runner with a cache and scorers, and record the baseline for quality, latency and cost.", "Save it as version one."],
        ["Diagnose the failures: group them by cause and rank the causes.", "Fix the biggest one only."],
        ["Try structure, examples and a reasoning step as separate versions and compare each against the baseline.", "Keep the ones that help."],
        ["Add output format enforcement and code-side checks for rules the prompt cannot hold.", "Measure the effect."],
        ["Trim the context and reorder for caching, and measure quality, latency and cost.", "Reject changes that hurt quality."],
        ["Measure variance over five runs and set a regression gate with must-pass cases.", "Test the gate with a bad change."],
        ["Run the injection cases, apply least power and confirmation where needed and measure again.", "Record what is still open."],
        ["Write a README with the version history, a results table, a cost estimate per thousand requests and the next three improvements.", "Include what you tried that did not work."],
      ],
      "An optimised prompt with a version history, a results table showing measured gains in quality and cost, a regression gate and an injection report.",
      ["Fifty-case labelled set with injection cases", "Every change measured against the baseline", "Format enforced where wording failed", "Regression gate blocks a bad change", "Injection results and open risks recorded"],
      "Level 4 starts embeddings and retrieval, where your prompt gets a knowledge base.",
      ["Everything from Level 3", LLM]),
  ),
];
