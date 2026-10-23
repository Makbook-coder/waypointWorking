import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M65: ProjectSrc[] = [
  practice("m6-5-why-big-windows-do-not-solve-it", "challenge",
    pj("Beat the full window", 50, "Show that a smaller prompt can beat a full window on both cost and accuracy, with no steps given.",
      [],
      "A smaller prompt that matches or beats a full-window prompt on accuracy at a fraction of the cost.",
      ["At least 20 questions over a long document with known answers", "A full-window baseline with accuracy, cost and time", "A smaller approach with the same three measures", "A note on when the full window would still win"],
      "Look at managing lost-in-the-middle next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Try retrieval of the top few chunks as your first smaller approach.", "Use the same questions and the same model for both so the comparison is fair.", "Record cost from the usage data rather than estimating it."] }),
  practice("m6-5-managing-lost-in-the-middle", "debug",
    pj("The fact in the middle", 40, "Find why a prompt loses a key fact in the middle and fix its placement.",
      [
        ["Run the starter on the five questions and note which answers are wrong.", "Save the outputs so you can check which answers change after the fix."],
        ["Find where the needed passage sits in each failing prompt.", "Write the position."],
        ["Change the prompt builder so the best passage goes to the edges and the question is repeated at the end.", "Rerun the questions after the change and compare each answer with the saved one."],
        ["Compare the five answers before and after.", "Report any still wrong."],
      ],
      "A prompt builder that places key passages at the edges, with five answers compared before and after.",
      ["Failing answers noted", "Positions identified", "Before and after compared"],
      "Look at stuffing versus retrieval versus summarization next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def build(question, passages):",
      "    ranked = sorted(passages, key=lambda p: p.score)          # lowest score first",
      "    return '\\n\\n'.join(p.text for p in ranked) + '\\n\\n' + question") }),
  practice("m6-5-stuffing-vs-retrieval-vs-summarization", "optimise",
    pj("Cheaper way to answer", 40, "Find the cheapest of three approaches that still answers a question set well.",
      [
        ["Run the starter stuffing approach on ten questions and record accuracy and cost.", "Save the outputs so you can compare accuracy and cost with the other approaches."],
        ["Add a retrieval version that sends the top three chunks only.", "Record the same numbers."],
        ["Add a summary version for the overview questions only.", "Record the same numbers."],
        ["Pick the cheapest approach that meets a 90 percent target for each question type.", "Explain with the table."],
      ],
      "A cost and accuracy table for three approaches and a cheapest choice that meets the accuracy target.",
      ["Baseline recorded", "Two other approaches measured", "Cheapest choice justified"],
      "Look at more context versus better context next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def answer(q):",
      "    return llm(f'{WHOLE_DOCUMENT}\\n\\nQuestion: {q}')    # 40,000 tokens every time") }),
  practice("m6-5-more-context-or-better-context", "review",
    pj("Review a fix", 30, "Review a proposed fix for wrong answers and decide whether more or better context is the right remedy.",
      [
        ["Read the three failures and the fix proposed for each.", "Write what each fix changes."],
        ["Decide for each whether the context was missing, buried, stale or noisy.", "Quote the evidence."],
        ["Say which proposed fixes are likely to work and which are likely to make things worse.", "Give the reason for each decision in one sentence so the review is easy to follow."],
        ["Write a better fix for the weakest proposal.", "Describe how to test it."],
      ],
      "A review of three proposed fixes with failure causes identified and a better fix for the weakest.",
      ["Fixes understood", "Causes identified", "Better fix proposed"],
      "Move on to tool context management.", ["Python 3.11 or newer"]),
    { starter: code(
      "1) answer wrong, right passage retrieved but 11th of 12.   proposed fix: retrieve 30 passages",
      "2) answer wrong, retrieved a 2019 price list.            proposed fix: use a bigger model",
      "3) answer wrong, no passage covered the question.        proposed fix: reorder the passages") }),
];
