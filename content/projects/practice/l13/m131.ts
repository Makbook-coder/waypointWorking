import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const PY = ["Python 3.11 or newer"];
const AI = ["Python 3.11 or newer", LLM];

export const P_M131: ProjectSrc[] = [
  practice("m13-1-fine-tuning-as-the-costliest-option", "review",
    pj("Review a go-straight-to-tuning plan", 30, "Review a plan that jumps to fine-tuning and list the cheaper options it skipped.",
      [
        ["Read the starter plan and list its claims.", "Quote them. Take it one small step at a time."],
        ["List four cheaper things the plan did not try.", "Prompting, examples, retrieval."],
        ["Estimate the cost of trying each.", "Hours. Write down what you see before changing anything."],
        ["Write the order you would try them in.", "Ranked. Re-read the step and try the smallest version first."],
      ],
      "A review of a tuning-first plan listing four skipped cheaper options with costs and an order to try them.",
      ["Claims listed", "Cheaper options costed", "Order written"],
      "Look at what fine-tuning is good for next.", ["A text editor"]),
    { starter: code(
      "Plan: our support bot sometimes answers in the wrong tone. We will collect 10,000 chats and fine-tune a 70B model for two weeks.",
      "No prompt changes have been tried. There is no test set yet.") }),
  practice("m13-1-what-fine-tuning-is-good-for", "extend",
    pj("Add the right candidates", 30, "Extend a task list with the kinds of tasks fine-tuning is actually good at.",
      [
        ["Read the starter list and mark which tasks suit tuning.", "Reasons. Check one example by hand to be sure."],
        ["Add three tasks that fit well such as a fixed output format.", "Realistic. Save your work so you can compare later."],
        ["For each, write the evidence that would show tuning helps.", "A test. Ask what changed since the last run."],
        ["Rank all tasks by fit and write down the result.", "Table. Print the intermediate values to see them."],
      ],
      "A ranked task list with three added good-fit tasks and evidence for each.",
      ["Starter marked", "Three tasks added", "Ranking made"],
      "Look at what it is not good for next.", PY),
    { starter: code(
      "Tasks: 1 answer questions about our new product launch. 2 write replies in the exact tone of our brand. 3 look up live order status. 4 emit JSON in our schema every time.") }),
  practice("m13-1-what-it-is-not-good-for", "debug",
    pj("The tuned model that still lies about facts", 35, "Find why a tuned model still invents facts and choose the right fix.",
      [
        ["Read the starter results and count wrong facts before and after tuning.", "Numbers. Start with a single input before using many."],
        ["Work out why training on answers did not teach reliable facts.", "Reason. Take it one small step at a time."],
        ["Propose a retrieval based fix.", "Design. Write down what you see before changing anything."],
        ["Write a test that would show the fix works.", "Test. Re-read the step and try the smallest version first."],
      ],
      "A diagnosis of why tuning did not fix invented facts with a retrieval fix and a test.",
      ["Counts compared", "Reason written", "Test written"],
      "Look at starting from a measured failure next.", AI),
    { starter: code(
      "Before tuning: 31 of 100 product questions wrong. After tuning on 2,000 Q&A pairs: 27 of 100 wrong. Wrong answers sound confident and use the right style.") }),
  practice("m13-1-start-from-a-measured-failure", "challenge",
    pj("Turn a complaint into a test", 50, "Turn a vague complaint about a model into a measured failure set, with no steps given.",
      [],
      "A failure test set built from a vague complaint with a measured baseline pass rate and a target.",
      ["At least 30 real inputs that show the complaint", "Expected outputs written against a clear rule", "A baseline pass rate measured on the set", "A target rate and a statement of what would count as fixed"],
      "Look at the full cost of a tune next.", AI),
    { hints: ["Start from real inputs where users complained, not made-up ones.", "Write the rule for a pass before you score anything.", "Include a few easy cases so you can tell if a fix breaks things that worked."] }),
  practice("m13-1-the-full-cost-of-a-tune", "optimise",
    pj("Trim a cost estimate", 30, "Find the hidden costs in a tuning estimate and reduce them.",
      [
        ["Read the starter estimate and mark what it leaves out.", "Missing items. Check one example by hand to be sure."],
        ["Add the missing items with rough numbers.", "Estimates. Save your work so you can compare later."],
        ["Find the two largest and think of how to shrink each.", "Ideas. Ask what changed since the last run."],
        ["Write the new total and what it changes.", "Number. Print the intermediate values to see them."],
      ],
      "A fuller tuning cost estimate with the two largest items and ideas to shrink them.",
      ["Missing items listed", "Totals recomputed", "Shrink ideas written"],
      "Look at being tied to one base model next.", PY),
    { starter: code(
      "Estimate: 8 GPU hours at 2 dollars = 16 dollars. Total: 16 dollars.") }),
  practice("m13-1-tied-to-one-base-model", "reimplement",
    pj("Migrate a tune by hand", 40, "Plan and carry out a paper migration of a tune from one base model to another.",
      [
        ["List everything tied to the old base: template, tokenizer, adapter and tests.", "Inventory. Start with a single input before using many."],
        ["Write the steps to redo the tune on a new base.", "Runbook. Take it one small step at a time."],
        ["Estimate the time of each step.", "Hours. Write down what you see before changing anything."],
        ["Identify the step most likely to go wrong and add a check for it.", "Risk. Re-read the step and try the smallest version first."],
      ],
      "A migration runbook with an inventory of tied items, estimates and a check for the riskiest step.",
      ["Inventory written", "Steps estimated", "Check added and confirmed"],
      "Return to the capstone: a decision memo.", PY)),
];
