import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M74: ProjectSrc[] = [
  practice("m7-4-core-llm-capabilities", "review",
    pj("Review a model claim", 30, "Review a claim that a model is good at reasoning and decide what the evidence supports.",
      [
        ["Read the claim and the evidence below and list what was tested.", "Say which capability each test covers."],
        ["Find at least three gaps, such as only one task type or only easy questions.", "Quote the evidence."],
        ["Say which capabilities the claim says nothing about.", "Name at least three."],
        ["Write the claim again so it says only what the evidence supports.", "Keep it to two sentences."],
      ],
      "A review of a model capability claim with three evidence gaps and a corrected claim.",
      ["Tests listed by capability", "Three gaps found", "Claim rewritten"],
      "Look at the anatomy of a benchmark next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Claim: 'Model X is excellent at reasoning.'",
      "Evidence: scored 91 on a maths word-problem set (grade-school level), 40 questions, one run.",
      "Compared against: nothing else. Prompt: not recorded.") }),
  practice("m7-4-anatomy-of-a-benchmark", "reimplement",
    pj("Rebuild a benchmark runner", 45, "Rebuild a small benchmark runner and scorer from a benchmark's published description.",
      [
        ["Read the description and write the data format, the prompt template and the scoring rule.", "Keep them in one config."],
        ["Write the loader and the prompt builder.", "Test with three hand-made items."],
        ["Write the scorer and test it on correct, wrong and badly formatted answers.", "Decide how to handle bad formats."],
        ["Run a model on ten items and compare your score by hand on three of them.", "Report any difference."],
      ],
      "A small benchmark runner and scorer that follows the published description, checked by hand on three items.",
      ["Config written", "Scorer tested on edge cases", "Hand check passes"],
      "Look at public leaderboards next.", ["Python 3.11 or newer", LLM]),
    {}),
  practice("m7-4-public-leaderboards", "extend",
    pj("Add uncertainty to a ranking", 40, "Extend a leaderboard table with confidence ranges so close ranks are not over-read.",
      [
        ["Run the starter and read the table of model scores.", "Note which ranks are very close."],
        ["Add a bootstrap or Wilson interval for each score using the number of items.", "Print it beside the score."],
        ["Mark pairs of models whose intervals overlap as tied.", "Print the groups so you can read which models are too close to separate."],
        ["Test your interval code on a case with a known answer.", "Use 50 items with 25 correct."],
      ],
      "A leaderboard table with confidence intervals and tied groups, with the interval code tested.",
      ["Close ranks noted", "Intervals added", "Interval test passes"],
      "Look at benchmark pitfalls next.", ["Python 3.11 or newer"]),
    { starter: code(
      "scores = {'model_a': (212, 300), 'model_b': (208, 300), 'model_c': (190, 300)}   # correct, total",
      "for name, (c, n) in sorted(scores.items(), key=lambda kv: -kv[1][0]/kv[1][1]):",
      "    print(name, round(c/n*100, 1))") }),
  practice("m7-4-benchmark-pitfalls", "challenge",
    pj("Catch the contaminated item", 50, "Build a detector that finds benchmark items a model has probably memorised, with no steps given.",
      [],
      "A contamination check that separates seen from unseen items on a test you build.",
      ["At least 30 original items and 30 fresh items of similar difficulty", "A detection method with a stated threshold", "Results showing how well it separates the two groups", "A note on false alarms and what the check cannot prove"],
      "Move on to the knowledge benchmarks module.", ["Python 3.11 or newer", LLM]),
    { hints: ["Compare the model's score on original items with its score on lightly rewritten versions of them.", "You can also test whether the model can complete the start of an item word for word.", "Write down what a positive result does and does not prove before you look at your numbers."] }),
];
