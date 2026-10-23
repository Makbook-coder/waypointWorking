import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const PY = ["Python 3.11 or newer"];
const AI = ["Python 3.11 or newer", LLM];

export const P_M136: ProjectSrc[] = [
  practice("m13-6-reward-based-tuning", "reimplement",
    pj("A policy gradient bandit", 40, "Implement a small reward-based learner from scratch and watch it learn.",
      [
        ["Create a policy over four actions with learnable probabilities.", "Softmax. Check one example by hand to be sure."],
        ["Give a reward of 1 for the right action.", "Function. Save your work so you can compare later."],
        ["Update the policy with the reward-weighted gradient.", "Loop. Ask what changed since the last run."],
        ["Plot the probability of the right action over 500 steps.", "Plot. Print the intermediate values to see them."],
      ],
      "A reward-based learner whose probability of the correct action rises over steps.",
      ["Policy created", "Update implemented", "Plot shows learning"],
      "Look at RFT versus SFT versus DPO next.", ["Python 3.11 or newer", "numpy", "matplotlib"])),
  practice("m13-6-rft-vs-sft-vs-dpo", "review",
    pj("Review a method choice", 30, "Review a choice of tuning method for a task and say whether it is the right one.",
      [
        ["Read the starter proposal.", "Method and task. Start with a single input before using many."],
        ["List the data it would need.", "Items. Take it one small step at a time."],
        ["Judge whether that data exists.", "Check. Write down what you see before changing anything."],
        ["Recommend a method and write down the result.", "Reason. Re-read the step and try the smallest version first."],
      ],
      "A review of a tuning method choice with data needs checked and a recommendation.",
      ["Proposal read", "Data needs checked", "Recommendation written"],
      "Look at tasks with gradable outputs next.", ["A text editor"]),
    { starter: code(
      "Task: summarise legal contracts in a house style. Proposal: reinforcement fine-tuning with a reward from a grader model. We have 300 approved summaries and no automatic check of style.") }),
  practice("m13-6-tasks-with-gradable-outputs", "debug",
    pj("A grader that passes wrong answers", 30, "Find why a grader accepts wrong answers and fix it.",
      [
        ["Read the starter grader and the failing examples.", "Both. Check one example by hand to be sure."],
        ["Find why each passes and write down the result.", "Reasons. Save your work so you can compare later."],
        ["Fix the grader and write down the result.", "Code. Ask what changed since the last run."],
        ["Re-run on the examples and show they fail.", "Output. Print the intermediate values to see them."],
      ],
      "A fixed grader that rejects the examples it used to pass.",
      ["Reasons found", "Grader fixed", "Examples now fail"],
      "Look at reward design and reward hacking next.", PY),
    { starter: code(
      "def grade(answer, expected): return expected.strip().lower() in answer.lower()",
      "Passing but wrong: expected '12', answer 'It is not 12, it is 120'. Expected 'no', answer 'I know'.") }),
  practice("m13-6-reward-design-and-reward-hacking", "challenge",
    pj("Break and fix a reward", 55, "Red-team a reward function and harden it until you cannot break it cheaply, with no steps given.",
      [],
      "A reward function with a log of attacks, fixes and a final attack success rate.",
      ["A starting reward function for a gradable task", "At least eight distinct attack outputs", "Fixes for each successful attack", "A final attack success rate and the attacks still open"],
      "Look at reaching RFT in practice next.", AI),
    { hints: ["Try outputs that satisfy the letter of the check without doing the task.", "Add held-out checks the model does not optimise for.", "Record every attack, not just the ones you fixed."] }),
  practice("m13-6-reaching-rft-in-practice", "extend",
    pj("Add stopping rules", 30, "Extend a pilot plan with stopping rules and held-out checks.",
      [
        ["Read the starter plan and write down the result.", "Goal and budget. Start with a single input before using many."],
        ["Add a no-progress rule with numbers.", "Rule. Take it one small step at a time."],
        ["Add a reward hacking check using a held-out grader.", "Check. Write down what you see before changing anything."],
        ["Add the checks that must stay stable.", "List. Re-read the step and try the smallest version first."],
      ],
      "A pilot plan extended with stopping rules and held-out checks.",
      ["No-progress rule added", "Hacking check added", "Stable checks listed"],
      "Return to the capstone: a hard-to-game grader.", AI),
    { starter: code(
      "Pilot: reward-based tuning of a SQL generator. Budget: 200 dollars. Reward: query returns the same rows as the reference. Success: execution accuracy above 70%.") }),
];
