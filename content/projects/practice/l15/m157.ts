import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const NEED = ["A text editor", "A timer"];

export const P_M157: ProjectSrc[] = [
  practice("m15-7-a-process-for-evaluating-what-is-new", "review",
    pj("Review a hype-driven process", 30, "Review a process that adopts whatever is trending and fix it.",
      [
        ["Read the starter carefully and list every claim it makes.", "Quote the exact words of each claim."],
        ["Mark each claim as strong, weak or unsupported, with a reason.", "Ask what evidence would back the claim."],
        ["Write the follow-up question an interviewer would ask next and say where the answer breaks.", "Think of a number or a condition it lacks."],
        ["Write a stronger version of the weakest part in three sentences.", "Add one number, limit or condition."],
      ],
      "Review a process that adopts whatever is trending and fix it, written down and said aloud.",
      ["Claims listed", "Claims judged", "Stronger version written"],
      "Move on to the next topic in this module.", NEED),
    { starter: code("Process: when something trends on social media, switch the product to it that week and tell the team to adapt.") }),
  practice("m15-7-capability-change-vs-hype", "debug",
    pj("Find the unsupported claim", 35, "Find the unsupported claims in a launch post and turn them into tests.",
      [
        ["Read the starter and say what is wrong in one sentence.", "Look for the part that contradicts the goal."],
        ["Trace the problem to its root cause using only the evidence given.", "Ask what changes if that cause is removed."],
        ["Write the fix and explain why it addresses the cause and not the symptom.", "Keep the fix as small as you can."],
        ["Say how you would check that the fix worked and what would show it did not.", "Name a measurement or a test."],
      ],
      "Find the unsupported claims in a launch post and turn them into tests, written down and said aloud.",
      ["Cause identified", "Fix explained", "Check described"],
      "Move on to the next topic in this module.", NEED),
    { starter: code("Launch post: \"Our new model is 10x smarter, understands everything, and solves enterprise AI.\" Evidence: one cherry-picked demo video.") }),
  practice("m15-7-evaluating-a-newly-released-model", "extend",
    pj("Extend the day-one checklist", 35, "Extend a short day-one checklist for a new model.",
      [
        ["Read the starter and list what it leaves out.", "Think about numbers, limits and failure cases."],
        ["Add the missing parts with one concrete example.", "Use a situation from a real project if you have one."],
        ["Add one number, limit or condition that makes the answer checkable.", "A rough number is better than none."],
        ["Say the extended answer aloud in under three minutes and time it.", "Record it and listen for filler words."],
      ],
      "Extend a short day-one checklist for a new model, written down and said aloud.",
      ["Missing parts listed", "Missing parts added", "Answer timed aloud"],
      "Move on to the next topic in this module.", NEED),
    { starter: code("Checklist: 1 read the blog post 2 try three prompts 3 tweet about it.") }),
  practice("m15-7-benchmarks-evals-controlled-rollout", "optimise",
    pj("Tighten the rollout answer", 30, "Tighten a long answer on benchmarks, evals and rollout into one clear path.",
      [
        ["Say the starter aloud and time how long it takes.", "Use a phone timer."],
        ["Cut every sentence that does not help the listener decide or understand.", "Ask whether the answer changes without it."],
        ["Add the one fact or number that matters most and put it first.", "Lead with the point, then the reason."],
        ["Say the shorter version and time it again, aiming for under half the length.", "Compare both timings."],
      ],
      "Tighten a long answer on benchmarks, evals and rollout into one clear path, written down and said aloud.",
      ["Original timed", "Cuts applied and kept", "Shorter version timed"],
      "Move on to the next topic in this module.", NEED),
    { starter: code("Answer (4 min): Benchmarks are good but not perfect, so you also need evals, and then you can roll it out slowly, maybe, and watch things.") }),
  practice("m15-7-how-do-you-stay-current", "challenge",
    pj("Defend your habits", 50, "Defend your real habits for staying current against a sceptical interviewer, with no steps given.",
      [],
      "Defend your real habits for staying current against a sceptical interviewer, with no steps given, written down and said aloud.",
      ["A first answer given aloud and recorded", "Three hard follow-up questions answered", "Vague or unsupported claims marked and fixed", "A final answer you could give in an interview"],
      "Return to the module capstone.", NEED),
    { hints: ["Name three concrete sources and what you did with the last one.", "Give an example of something you decided not to adopt.", "State your weekly time budget."] }),
];
