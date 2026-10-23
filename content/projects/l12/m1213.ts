import { levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M1213: ProjectSrc[] = [
  levelCapstone(12,
    pj("Ship a Multimodal Build", 800, "Build and ship one realistic application that uses at least two modalities on real inputs, measure its latency and cost per request, document a failure for each modality and make it runnable by someone else.",
      [
        ["Pick one realistic build such as a document assistant, a voice agent or a visual search tool and write who uses it and what done means.", "Keep the scope small."],
        ["Choose the modalities and justify each against a text-only alternative.", "At least two modalities."],
        ["Collect real inputs, not samples from a docs page, and write expected results for at least 20 of them.", "Include hard ones."],
        ["Select a model with a shortlist test on your own inputs and record accuracy, latency and cost.", "Reuse your selection report."],
        ["Build the pipeline end to end with validation, streaming where it matters and a fallback for low confidence.", "Log every request."],
        ["Test modality-specific failures such as blur, noise, scanned pages or accents and record what breaks.", "Save the failing inputs."],
        ["Measure latency percentiles and cost per request on the real set and project a monthly bill.", "Show the formula. Start with a single input before using many."],
        ["Add privacy controls for the sensitive data you handle and document what is sent where.", "Redact before sending if you can."],
        ["Write up one real failure per modality with a cause, a fix attempt and the outcome.", "Be honest about what stayed broken."],
        ["Package it with a README, setup steps, sample inputs and an evaluation command that someone else can run.", "Have another person run it from scratch."],
        ["Write a short ship note with results, limits, cost and what you would do next.", "Include revisit conditions."],
      ],
      "A working application using at least two modalities on real inputs, with measured accuracy, latency and cost, documented failures per modality and a README that another person can follow.",
      ["Real inputs evaluated with measured accuracy", "Latency and cost per request reported", "A failure documented for each modality", "Another person ran it from the README"],
      "Level 13 builds on this by turning the build into a system you can operate.",
      ["Everything from Level 12", "Access to a multimodal model"]),
  ),
];
