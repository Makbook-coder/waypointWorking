import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M75: ProjectSrc[] = [
  practice("m7-5-from-mmlu-to-harder-knowledge-tests", "debug",
    pj("The score does not add up", 40, "Find why a multiple-choice run reports a surprisingly low score and fix the parsing.",
      [
        ["Run the starter on 40 questions and print the score and the first 10 raw answers.", "Compare with the key."],
        ["Find answers that were correct but marked wrong and write why.", "Quote three of the answers and say why each should have been marked correct."],
        ["Fix the answer parser so it handles 'The answer is B', '(B)' and 'b'.", "Add tests for each form."],
        ["Rerun and report the score before and after the fix.", "Count answers that cannot be parsed at all."],
      ],
      "A multiple-choice parser that handles common answer formats, with the score corrected and tests added.",
      ["Wrong marks found", "Parser fixed with tests", "Scores compared"],
      "Look at human exams as benchmarks next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def parse(text):",
      "    return text.strip()[0]          # takes the first character of the reply",
      "# raw replies look like: 'The answer is B because...' or '(C)' or 'b'") }),
  practice("m7-5-human-exams-as-benchmarks", "extend",
    pj("Add partial marks", 40, "Extend an exam scorer to give partial marks using the mark scheme.",
      [
        ["Run the starter scorer and note that it gives only full or zero marks.", "Find an answer that deserved half."],
        ["Represent the mark scheme as a list of points with their marks.", "Use two example questions."],
        ["Score an answer by checking each point and adding the marks.", "Cap the total at the maximum marks for the question so extra points cannot be added."],
        ["Test with a full answer, a half answer and an empty answer for each question.", "Check the totals by hand for the full, half and empty answers to confirm the scorer."],
      ],
      "An exam scorer that awards partial marks from a mark scheme, tested on full, half and empty answers.",
      ["Zero-or-full problem shown", "Scheme as points", "Tests on three answer types"],
      "Look at GPQA, MMLU-Pro, SimpleQA and HLE next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def mark(answer, expected):",
      "    return 3 if answer.strip().lower() == expected.lower() else 0") }),
  practice("m7-5-gpqa-mmlu-pro-simpleqa-hle", "review",
    pj("Review a benchmark report", 30, "Review a report that compares models using one benchmark and find overclaims.",
      [
        ["Read the report below and list what it claims.", "Number the claims."],
        ["Find at least three claims that the evidence does not support.", "Quote each claim and say which number or fact in the report fails to support it."],
        ["Say which other benchmark type would add the missing evidence.", "Give a reason in one sentence, such as that the benchmark never tested the skill in question."],
        ["Rewrite the conclusion so it fits the evidence.", "Keep it to three sentences."],
      ],
      "A review of a benchmark report with three overclaims and a corrected conclusion.",
      ["Claims numbered", "Three overclaims found", "Conclusion rewritten"],
      "Look at why benchmarks keep getting harder next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Report: 'Model A scores 74 and Model B scores 72 on a hard factual benchmark, so A is smarter.",
      "A also beats B on creative writing. Both are far above human experts, so they know everything.'",
      "(Benchmark: 500 short factual questions, one run each, no interval reported.)") }),
  practice("m7-5-why-benchmarks-keep-getting-harder", "optimise",
    pj("A cheaper hard test", 40, "Cut the cost of running a hard benchmark while keeping it able to rank models.",
      [
        ["Run three models on the 200 starter questions and record scores and tokens.", "Save the per-question results."],
        ["Find questions that every model gets right and questions that every model gets wrong.", "Count the two groups so you can see how many questions add information."],
        ["Build a smaller set that keeps the questions that separate the models.", "Aim for about 80 questions."],
        ["Check that the smaller set gives the same ranking and report the cost saved.", "Say what you risk losing."],
      ],
      "A smaller benchmark that keeps the model ranking at much lower cost, with the risks stated.",
      ["Baseline scores and tokens", "Uninformative questions found", "Ranking and saving reported"],
      "Move on to custom model evaluations.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "questions.jsonl: 200 items; 70 are answered correctly by all three models,",
      "40 by none (some look mislabelled); average prompt 900 tokens") }),
];
