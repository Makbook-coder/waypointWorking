import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M36: ProjectSrc[] = [
  practice("m3-6-diagnosing-prompt-failures", "debug",
    pj("Three bad replies", 35, "Diagnose why a prompt gives three different kinds of bad reply and fix each cause separately.",
      [
        ["Run the prompt on the four inputs above and label each bad reply by failure type.", "Types: missing instruction, ambiguity, bad input, wrong format."],
        ["Write a one-line hypothesis for each failure before you change anything.", "Say what you expect to see after the fix."],
        ["Fix one cause at a time and rerun all four inputs after each fix.", "Keep a log of every change."],
        ["Check that no earlier good reply has broken.", "Add one more input of your own to test this."],
      ],
      "A failure log with a hypothesis and a fix per cause, and all four inputs handled correctly at the end.",
      ["Failures labelled by type", "Hypothesis written before each fix", "One change at a time"],
      "Build a small test set next.", [LLM]),
    { starter: code(
      "prompt = 'Extract the date and the amount from the message. Reply in a table.'",
      "inputs = ['Paid 40 on 3 March', 'Invoice for $12.50 due next Friday',",
      "          'I owe you thirty pounds', '']") }),
  practice("m3-6-building-a-small-test-set", "challenge",
    pj("Test set from scratch", 45, "Build a small test set that separates a weak prompt from a good one, with no steps given.",
      [],
      "A labelled test set with categories, two prompt versions and per-category scores that show a clear difference.",
      ["At least 30 cases with expected answers", "Cases cover easy, hard and odd inputs", "Two prompts score differently overall and per category", "At least one weak case is rewritten or removed with a reason"],
      "Compare versions on the same examples next.", [LLM]),
    { hints: ["Start from real inputs rather than ones you invent for convenience.", "Tag each case with a category so you can see where a prompt is weak.", "A case every version passes tells you little; replace it with a harder one."] }),
  practice("m3-6-comparing-versions-on-the-same-examples", "reimplement",
    pj("Mini eval runner", 55, "Reimplement in miniature what an evaluation framework does: run versions on cases, score and report.",
      [
        ["Define a case file format with id, input, expected and tags.", "JSON lines is a good choice."],
        ["Write a runner that runs a prompt version on each case with a result cache.", "Key the cache by version, input and settings."],
        ["Add pluggable scorers: exact match, contains and a custom function.", "Each returns a number."],
        ["Print a report per version and per tag, with a list of cases that differ between versions.", "Sort by the largest difference."],
        ["Compare your output with an existing tool such as `promptfoo` on the same cases.", "Note what yours lacks."],
      ],
      "A small runner with caching, scorers and a diff report, with notes on how it compares to an existing tool.",
      ["Cases load from a file", "Results cached", "Differences listed", "Compared with an existing tool"],
      "Reduce variance and regressions next.", [LLM, "Python 3.11 or newer"]),
    {}),
  practice("m3-6-reducing-variance-and-regressions", "optimise",
    pj("Steady the score", 40, "Reduce the run-to-run variation of a flaky prompt without losing accuracy.",
      [
        ["Run the starter five times and record the score each time.", "Save the replies that change."],
        ["Lower the temperature and rerun five times.", "Compare the spread."],
        ["Tighten the output format and add one clarifying example, then rerun five times.", "Change one thing at a time."],
        ["Pick the setup with the smallest spread that keeps accuracy within one point.", "Write the numbers."],
        ["Set a regression tolerance based on the final spread.", "Explain how you chose it."],
      ],
      "A table of score spread across setups and a tolerance chosen from the measured variance.",
      ["Baseline spread measured", "Two changes tested separately", "Tolerance chosen from data"],
      "Go on to prompts in a real project in M3.7.", [LLM]),
    { starter: code(
      "settings = {'temperature': 1.0}",
      "prompt = 'Is this review positive, negative or mixed? Explain briefly.'",
      "# scores on 20 reviews swing between 14 and 19 from run to run") }),
];
