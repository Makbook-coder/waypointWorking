import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const PY = ["Python 3.11 or newer"];
const AI = ["Python 3.11 or newer", LLM];

export const P_M135: ProjectSrc[] = [
  practice("m13-5-demonstrations-vs-preferences", "review",
    pj("Review a data choice", 30, "Review a choice to collect demonstrations where preferences fit better.",
      [
        ["Read the starter plan and write down the result.", "Goal and method. Ask what changed since the last run."],
        ["Judge whether the behaviour is easy to demonstrate.", "Reason. Print the intermediate values to see them."],
        ["Judge whether comparisons would be easier.", "Reason. Start with a single input before using many."],
        ["Recommend the data to collect.", "Choice. Take it one small step at a time."],
      ],
      "A review of a data collection choice with a recommendation between demonstrations and preferences.",
      ["Plan read and confirmed", "Both judged and confirmed", "Recommendation written"],
      "Look at building preference pairs next.", ["A text editor"]),
    { starter: code(
      "Goal: make replies feel warmer without being unprofessional. Plan: have writers produce 3,000 ideal replies from scratch.") }),
  practice("m13-5-building-preference-pairs", "extend",
    pj("Add a margin filter", 30, "Extend a pair builder so that near-tie pairs are dropped.",
      [
        ["Read the starter builder and sample pairs.", "Trace. Write down what you see before changing anything."],
        ["Add a score margin between chosen and rejected.", "Threshold. Re-read the step and try the smallest version first."],
        ["Drop pairs below the margin.", "Filter. Check one example by hand to be sure."],
        ["Report how many pairs remain and review five kept pairs.", "Counts. Save your work so you can compare later."],
      ],
      "A pair builder with a margin filter, counts and five pairs reviewed.",
      ["Margin added", "Pairs dropped", "Five reviewed"],
      "Look at sources and rater agreement next.", AI),
    { starter: code(
      "for prompt in prompts:",
      "    a, b = sample(prompt), sample(prompt)",
      "    chosen, rejected = (a, b) if score(a) >= score(b) else (b, a)",
      "    pairs.append({'prompt': prompt, 'chosen': chosen, 'rejected': rejected})") }),
  practice("m13-5-sources-and-rater-agreement", "debug",
    pj("Raters who never agree", 30, "Find why two raters disagree on half the pairs and improve the guide.",
      [
        ["Read the starter disagreements.", "Examples. Ask what changed since the last run."],
        ["Group them by cause and write down the result.", "Categories. Print the intermediate values to see them."],
        ["Write guide rules that settle the main causes.", "Rules. Start with a single input before using many."],
        ["Re-apply the rules to the examples and count new agreement.", "Rate. Take it one small step at a time."],
      ],
      "A grouped diagnosis of rater disagreement with new guide rules and a recomputed agreement.",
      ["Causes grouped", "Rules written", "Agreement recomputed"],
      "Look at avoiding length bias next.", PY),
    { starter: code(
      "Pair 1: rater A prefers the longer answer, rater B prefers the correct one. Pair 2: A prefers the friendlier, B prefers the shorter. Pair 3: both answers wrong, A picks the first, B picks the second. Agreement 52%.") }),
  practice("m13-5-avoiding-length-bias", "optimise",
    pj("Cut the length shortcut", 35, "Reduce the length shortcut in a pair set without losing too many pairs.",
      [
        ["Read the starter statistics.", "Numbers. Write down what you see before changing anything."],
        ["Choose a rebalancing rule.", "Rule. Re-read the step and try the smallest version first."],
        ["Apply it and recompute the correlation.", "Number. Check one example by hand to be sure."],
        ["Report pairs kept and the new correlation.", "Table. Save your work so you can compare later."],
      ],
      "A rebalanced pair set with the length correlation lowered and the number of pairs kept reported.",
      ["Rule chosen and confirmed", "Correlation recomputed", "Pairs counted"],
      "Look at DPO intuition next.", PY),
    { starter: code(
      "2,000 pairs. Chosen answer longer in 81% of pairs. Correlation between length difference and chosen: 0.62.") }),
  practice("m13-5-dpo-intuition", "reimplement",
    pj("DPO loss from scratch", 40, "Implement the DPO loss yourself and check it against hand calculations.",
      [
        ["Write a function from log probabilities of chosen and rejected under policy and reference.", "Four inputs. Ask what changed since the last run."],
        ["Compute the loss for three hand-made examples.", "Check by hand. Print the intermediate values to see them."],
        ["Show the loss falls when the policy raises the chosen probability.", "Test. Start with a single input before using many."],
        ["Show what beta does to the loss.", "Plot or table. Take it one small step at a time."],
      ],
      "A DPO loss implementation checked against hand calculations with a beta demonstration.",
      ["Function written", "Hand checks match", "Beta shown and confirmed"],
      "Look at DPO after SFT next.", ["Python 3.11 or newer", "numpy"])),
  practice("m13-5-dpo-after-sft", "debug",
    pj("A DPO run that made things worse", 35, "Find why a DPO run lowered quality and fix the setup.",
      [
        ["Read the starter run summary.", "Facts. Write down what you see before changing anything."],
        ["Find the likely causes such as beta, pairs and learning rate.", "List. Re-read the step and try the smallest version first."],
        ["Pick one and propose a change.", "Change. Check one example by hand to be sure."],
        ["State how you would verify the fix.", "Test. Save your work so you can compare later."],
      ],
      "A diagnosis of a harmful DPO run with a proposed change and a verification test.",
      ["Causes listed", "Change proposed", "Verification stated"],
      "Look at what preference tuning is for next.", AI),
    { starter: code(
      "DPO from base model (no SFT), beta=0.01, lr=5e-5, 3 epochs, 400 pairs where chosen is always longer. Result: outputs are 3x longer, repeat phrases, task score fell from 72 to 58.") }),
  practice("m13-5-what-preference-tuning-is-for", "review",
    pj("Review a use case", 30, "Review a proposed use of preference tuning and say whether it fits.",
      [
        ["Read the starter proposal.", "Aim. Ask what changed since the last run."],
        ["Decide whether it is a preference problem or a knowledge problem.", "Judge. Print the intermediate values to see them."],
        ["List risks and write down the result.", "Items. Start with a single input before using many."],
        ["Suggest a better approach if it does not fit.", "Alternative. Take it one small step at a time."],
      ],
      "A review of a preference tuning proposal with a fit judgement, risks and an alternative.",
      ["Aim read and confirmed", "Fit judged and confirmed", "Alternative suggested"],
      "Look at when SFT is enough next.", ["A text editor"]),
    { starter: code(
      "Proposal: use DPO so the model always cites the 2026 pricing table correctly. We will collect pairs where the chosen answer has the right price.") }),
  practice("m13-5-when-sft-is-enough", "challenge",
    pj("Show SFT is enough, or show it is not", 55, "Test whether more SFT data solves a problem before preference tuning, with no steps given.",
      [],
      "A test of scaling SFT data on a problem with a verdict on whether preference tuning is needed.",
      ["A problem with a measured failure rate on at least 30 cases", "SFT at three data sizes with scores", "A curve showing whether the gains flatten", "A verdict with the evidence and what preference data would add"],
      "Return to the capstone: a preference tuning plan.", AI),
    { hints: ["Use data sizes that differ by a factor of three or more so a trend is visible.", "Look at both the score and the type of remaining failures.", "If the failures are about taste rather than correctness, say so."] }),
];
