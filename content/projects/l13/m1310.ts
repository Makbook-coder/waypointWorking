import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M1310: ProjectSrc[] = [
  levelCapstone(13,
    pj("A LoRA That Beats a Prompted Baseline", 800, "Fine-tune a LoRA or QLoRA adapter for a narrow task with a measured failure, prove it beats a strong prompted baseline on a held-out set, count the cost, check regressions, serve it and let someone else reproduce your numbers.",
      [
        ["Pick a narrow task and write its measured failure as at least 30 held-out cases with expected outputs.", "Include hard ones."],
        ["Fix the metric and the pass threshold before you train anything.", "Write it down. Start with a single input before using many."],
        ["Build a strong prompted baseline with examples and format rules and record its score and cost.", "Push it hard. Take it one small step at a time."],
        ["Build a clean, leak-free, versioned dataset with a spec, masking and a matching chat template.", "Verify each. Write down what you see before changing anything."],
        ["Run a reproducible LoRA or QLoRA tune with a config, tracked runs and a written checkpoint rule.", "Log everything. Re-read the step and try the smallest version first."],
        ["Compare tune and baseline on the same held-out set with the same validated judge and report spread and cost.", "One table. Check one example by hand to be sure."],
        ["Check regressions outside the task and review the ten worst outputs.", "Gate and notes. Save your work so you can compare later."],
        ["Serve the adapter with a template check, a version pointer and a rollback drill.", "Prove it works. Ask what changed since the last run."],
        ["Have another person reproduce your numbers from the README within a stated tolerance.", "Record the differences."],
        ["Write a fine-tuning decision record covering ship or not, evidence, costs, risks and retraining triggers.", "Review it with someone."],
      ],
      "An adapter that is shown to beat a strong prompted baseline on a held-out set with costs, regression checks, a serving setup, a reproduction by another person and a decision record.",
      ["Metric and threshold were fixed before training", "Tune compared with the baseline on the same set and judge", "Regressions checked and numbers reproduced by someone else", "Decision record with retraining triggers"],
      "Level 14 builds on this by scaling the system around the model.",
      ["Everything from Level 13", "A GPU or a notebook service", LLM]),
  ),
];
