import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const PY = ["Python 3.11 or newer"];
const AI = ["Python 3.11 or newer", LLM];

export const P_M138: ProjectSrc[] = [
  practice("m13-8-baselines-before-training", "extend",
    pj("Add the strong baseline", 30, "Extend an evaluation that only has a weak baseline.",
      [
        ["Read the starter evaluation.", "Baselines. Take it one small step at a time."],
        ["Add a prompt with instructions and three examples.", "Strong. Write down what you see before changing anything."],
        ["Add a larger-model baseline.", "Ceiling. Re-read the step and try the smallest version first."],
        ["Re-score and restate the bar the tune must clear.", "Number. Check one example by hand to be sure."],
      ],
      "An evaluation with a strong prompted baseline and a larger-model baseline and a restated bar.",
      ["Strong prompt added", "Larger model added", "Bar restated"],
      "Look at the same held-out set and judge next.", AI),
    { starter: code(
      "Baseline: 'Answer the question.' score 52. Tuned model score 71. Conclusion: tuning adds 19 points.") }),
  practice("m13-8-same-held-out-set-same-judge", "debug",
    pj("An unfair comparison", 30, "Find why a comparison between two models is unfair and make it fair.",
      [
        ["Read the starter comparison setup.", "Details. Save your work so you can compare later."],
        ["List what differs besides the model.", "Differences. Ask what changed since the last run."],
        ["Fix the setup so only the model differs.", "Rules. Print the intermediate values to see them."],
        ["State how the conclusion could change.", "Prediction. Start with a single input before using many."],
      ],
      "A corrected comparison setup where only the model differs with a prediction of the effect.",
      ["Differences listed", "Setup fixed and confirmed", "Prediction stated"],
      "Look at going beyond a single score next.", AI),
    { starter: code(
      "Model A scored on 50 cases judged by model X at temperature 0. Model B scored on 80 cases (the 50 plus 30 easier ones) judged by model Y at temperature 0.7.") }),
  practice("m13-8-beyond-a-single-score", "optimise",
    pj("Find the slice that matters", 30, "Reduce a long report to the slices that drive the decision.",
      [
        ["Read the starter score table.", "Slices. Take it one small step at a time."],
        ["Mark the slices where the tune differs from the baseline.", "Differences. Write down what you see before changing anything."],
        ["Keep the three that matter most and justify.", "Choice. Re-read the step and try the smallest version first."],
        ["Write the one-paragraph summary.", "Summary. Check one example by hand to be sure."],
      ],
      "A shortened score report with three key slices and a summary paragraph.",
      ["Differences marked", "Three slices chosen", "Summary written"],
      "Look at regressions outside the task next.", PY),
    { starter: code(
      "Overall 74 vs 71. Slices (tuned vs base): short inputs 80/79, long inputs 62/70, format 98/88, tone 75/74, refusals 91/93, numbers 55/57, dates 70/69, names 72/72") }),
  practice("m13-8-regressions-outside-the-task", "review",
    pj("Review a regression check", 30, "Review a regression check and find what it misses.",
      [
        ["Read the starter check and write down the result.", "Coverage. Save your work so you can compare later."],
        ["List areas it does not test.", "Gaps. Ask what changed since the last run."],
        ["Judge whether thresholds are sensible.", "Numbers. Print the intermediate values to see them."],
        ["Suggest three added tests.", "Tests. Start with a single input before using many."],
      ],
      "A review of a regression check with gaps, threshold judgement and three added tests.",
      ["Gaps listed and confirmed", "Thresholds judged", "Three tests suggested"],
      "Look at reading individual failures next.", ["A text editor"]),
    { starter: code(
      "Regression check: 10 general knowledge questions. Fail the release if the score drops more than 40 percentage points.") }),
  practice("m13-8-reading-individual-failures", "reimplement",
    pj("A failure triage tool", 40, "Build a small tool that groups failures so they are easy to read.",
      [
        ["Load failing cases with input, output and expected.", "Data. Take it one small step at a time."],
        ["Add a quick feature such as a type tag or length class.", "Tag. Write down what you see before changing anything."],
        ["Group and count by tag, printing two examples per group.", "Report. Re-read the step and try the smallest version first."],
        ["Run it on 30 failures and write the main finding.", "Summary. Check one example by hand to be sure."],
      ],
      "A failure triage tool that groups thirty failures and prints examples with a main finding.",
      ["Cases loaded", "Groups counted", "Finding written"],
      "Look at simpler alternatives next.", AI)),
  practice("m13-8-simpler-alternatives-one-last-time", "challenge",
    pj("Beat the tune without training", 55, "Try to beat your own tuned model using only prompts, retrieval or a bigger model, with no steps given.",
      [],
      "A fair attempt to beat a tuned model without training with scores, costs and an honest conclusion.",
      ["A tuned model result on a frozen held-out set", "At least three non-training options tried with equal effort", "Scores with spread and cost per request for every option", "A conclusion that picks a winner and says what would change it"],
      "Look at writing the decision down next.", AI),
    { hints: ["Give each option the same amount of time to improve.", "Include cost per request, since a cheaper tie is a win.", "Do not tune the prompt on the held-out set."] }),
  practice("m13-8-writing-the-decision-down", "review",
    pj("Review a decision record", 30, "Review a decision record and find where the evidence is thin.",
      [
        ["Read the starter record and write down the result.", "Sections. Save your work so you can compare later."],
        ["Mark claims without evidence.", "Marks. Ask what changed since the last run."],
        ["Mark missing risks and write down the result.", "Items. Print the intermediate values to see them."],
        ["Rewrite the decision with conditions.", "Text. Start with a single input before using many."],
      ],
      "A review of a decision record with unsupported claims, missing risks and a rewritten decision.",
      ["Claims marked", "Risks added and confirmed", "Decision rewritten"],
      "Return to the capstone: a fine-tune evaluation report.", ["A text editor"]),
    { starter: code(
      "Decision: ship the tuned model. Evidence: it scored higher. Risks: none. Revisit: never.") }),
];
