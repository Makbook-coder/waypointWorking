import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const PY = ["Python 3.11 or newer"];
const AI = ["Python 3.11 or newer", LLM];

export const P_M137: ProjectSrc[] = [
  practice("m13-7-teacher-student", "extend",
    pj("Add a student baseline", 30, "Extend a distillation plan with the baselines needed to judge it.",
      [
        ["Read the starter plan and write down the result.", "Steps. Take it one small step at a time."],
        ["Add the base student baseline and a prompted student baseline.", "Two. Write down what you see before changing anything."],
        ["Add the teacher as the ceiling.", "One. Re-read the step and try the smallest version first."],
        ["Define the gap-closed measure.", "Formula. Check one example by hand to be sure."],
      ],
      "A distillation plan with student baselines, a teacher ceiling and a gap-closed measure.",
      ["Baselines added", "Ceiling added", "Formula defined"],
      "Look at generating and filtering teacher outputs next.", AI),
    { starter: code(
      "Plan: ask the big model to answer 5,000 prompts, fine-tune the small model on them, then see if it feels good.") }),
  practice("m13-7-generating-and-filtering-teacher-outputs", "optimise",
    pj("Same quality, less teacher spend", 35, "Cut the teacher cost of building a dataset without losing quality.",
      [
        ["Read the starter spend and yield.", "Numbers. Save your work so you can compare later."],
        ["Remove duplicate and easy prompts before calling the teacher.", "Filter. Ask what changed since the last run."],
        ["Try a cheaper teacher for easy cases.", "Routing. Print the intermediate values to see them."],
        ["Compute the new cost and the kept-example quality.", "Table. Start with a single input before using many."],
      ],
      "A cheaper teacher data pipeline with spend and kept-example quality compared.",
      ["Prompts filtered", "Routing tried", "Cost and quality compared"],
      "Look at capability for cost and latency next.", AI),
    { starter: code(
      "10,000 prompts, 1,900 near-duplicates, 40% easy. Teacher: large model at 0.02 dollars per answer = 200 dollars. 12% of answers fail the format check.") }),
  practice("m13-7-capability-for-cost-and-latency", "debug",
    pj("A saving that did not appear", 30, "Find why a smaller model did not save money and fix the analysis.",
      [
        ["Read the starter numbers.", "Table. Take it one small step at a time."],
        ["Find the cost the analysis missed such as retries or fallback to the teacher.", "Items. Write down what you see before changing anything."],
        ["Recompute the real cost per request.", "Number. Re-read the step and try the smallest version first."],
        ["State when the student would pay off.", "Condition. Check one example by hand to be sure."],
      ],
      "A corrected cost analysis with the missed costs found and the condition for the student to pay off.",
      ["Missed costs found", "Cost recomputed", "Condition stated"],
      "Look at copied mistakes and low diversity next.", PY),
    { starter: code(
      "Teacher: 0.012 per request. Student: 0.002 per request. Expected saving 83%. Observed saving 19%. Student fails the quality check 35% of the time and then the teacher is called. Student hosting: 600 per month idle GPU.") }),
  practice("m13-7-copied-mistakes-low-diversity", "review",
    pj("Review a teacher dataset", 30, "Review a teacher generated dataset for copied mistakes and low diversity.",
      [
        ["Read the starter sample and write down the result.", "Examples. Save your work so you can compare later."],
        ["Mark mistakes a student would copy.", "Marks. Ask what changed since the last run."],
        ["Judge the diversity of the prompts and answers.", "Judgement. Print the intermediate values to see them."],
        ["Write fixes before training.", "List. Start with a single input before using many."],
      ],
      "A review of a teacher dataset with copied mistakes, diversity problems and fixes.",
      ["Mistakes marked", "Diversity judged", "Fixes written"],
      "Look at teacher terms of use next.", ["A text editor"]),
    { starter: code(
      "Sample answers: 'Sure! Here is a concise answer: ...' appears in 92 of 100. Three answers state the capital of Australia as Sydney. All prompts start with 'Explain' or 'What is'.") }),
  practice("m13-7-teacher-terms-of-use", "challenge",
    pj("Is this distillation allowed", 45, "Work out whether a distillation plan is allowed under a provider's terms and what you must change, with no steps given.",
      [],
      "A written assessment of a distillation plan against real provider terms with required changes.",
      ["The exact clauses quoted from a real provider's terms", "A table of planned uses against allowed or not", "Changes to the plan to stay within the terms", "Questions you would put to a lawyer"],
      "Return to the capstone: a distilled student.", PY),
    { hints: ["Quote the clause rather than summarising it from memory.", "Check separately for internal use, commercial products and competing models.", "Terms change; record the date you read them."] }),
];
