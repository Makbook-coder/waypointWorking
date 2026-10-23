import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M72: ProjectSrc[] = [
  practice("m7-2-programmatic-human-and-llm-as-a-judge", "debug",
    pj("The judge likes everything", 40, "Find why an LLM judge passes almost every output and fix its prompt.",
      [
        ["Run the starter judge on 20 outputs and count how many it passes.", "Check ten by hand."],
        ["Find the cases you would fail that it passed and write what it missed.", "Quote the verdict."],
        ["Rewrite the judge prompt with a clear rubric, a list of failure signs and a request to give the reason first.", "Keep the prompt short and put the rubric first so the judge sees what to look for before the answer."],
        ["Rerun on the 20 outputs and compare agreement with your labels before and after.", "Report both numbers."],
      ],
      "A judge prompt that agrees with hand labels far better than the lenient starter.",
      ["Pass rate measured", "Missed failures quoted", "Agreement improved"],
      "Look at reference-based versus reference-free evaluation next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "JUDGE = 'Is this answer good? Reply PASS or FAIL.'",
      "# outputs include wrong dates, made-up facts and answers that ignore the question") }),
  practice("m7-2-reference-based-vs-reference-free", "challenge",
    pj("Judge without an answer key", 50, "Build a reference-free judge that agrees with a person, with no steps given.",
      [],
      "A reference-free judge that matches your own labels on an open-ended task.",
      ["At least 30 outputs labelled by you first", "A rubric of at least four criteria", "Agreement with your labels reported for each criterion", "A note on where the judge still disagrees with you"],
      "Look at when a golden dataset is required next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Label the outputs yourself before you write the judge so you are not influenced by it.", "Split the judgement into separate criteria and score each one on its own.", "Look at the cases where the judge and you disagree, then change the wording of the rubric, not your labels."] }),
  practice("m7-2-when-a-golden-dataset-is-required", "optimise",
    pj("Smaller golden set", 40, "Cut the size of a golden dataset while keeping its power to detect problems.",
      [
        ["Run the starter golden set of 100 cases on three prompt versions and record the scores.", "Save per-case results."],
        ["Find cases that every version passes and pairs of near-duplicate cases.", "List the near-duplicate pairs so you can decide which one to keep from each pair."],
        ["Remove those and keep the cases that separate the versions.", "Keep a few easy cases as a sanity check."],
        ["Rerun on the smaller set and check that it ranks the three versions the same way.", "Report size and ranking."],
      ],
      "A smaller golden dataset that ranks three prompt versions the same way as the full set.",
      ["Per-case results saved", "Redundant cases removed", "Ranking matches the full set"],
      "Look at matching method to behaviour next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "golden.jsonl: 100 cases, 61 of them are variations of 'where is my order',",
      "all easy, and every prompt version passes all 61") }),
  practice("m7-2-matching-method-to-behaviour", "review",
    pj("Review an eval plan", 30, "Review an evaluation plan and find behaviours that use the wrong method.",
      [
        ["Read the plan below and list each behaviour and the method chosen.", "Use a table with the behaviour, the method chosen and one column for your comment."],
        ["Find at least three mismatches, such as using an LLM judge for an exact format.", "Say what would go wrong."],
        ["Find one behaviour with no check at all.", "Explain the risk in a sentence, for example what would reach users if nobody checks it."],
        ["Rewrite the plan with a better method for each mismatch.", "Give a reason for each choice."],
      ],
      "A review of an evaluation plan with three mismatched methods, a missing check and a corrected plan.",
      ["Behaviours and methods listed", "Three mismatches found", "Corrected plan written"],
      "Move on to offline versus online evaluations.", ["Python 3.11 or newer"]),
    { starter: code(
      "valid JSON output   -> LLM judge",
      "polite tone         -> exact string match on 'please'",
      "correct refund sum  -> human review of every output",
      "never reveals prices of other customers -> not tested") }),
];
