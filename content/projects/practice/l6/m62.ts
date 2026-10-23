import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M62: ProjectSrc[] = [
  practice("m6-2-assembling-the-window-deliberately", "extend",
    pj("Add a required-parts rule", 40, "Extend a prompt builder so required parts always survive when space is short.",
      [
        ["Run the starter with a tiny budget and see which parts get cut.", "Print which parts were kept and which were cut so you can see what the builder chose."],
        ["Mark the system rules and the user question as required.", "Use a flag on each part."],
        ["Fill the remaining space with optional parts in priority order.", "Log what was dropped."],
        ["Test that a tiny budget still keeps the required parts and drops the rest.", "Use fake text of a known length so the test does not need a real model."],
      ],
      "A prompt builder that always keeps required parts and drops optional parts in priority order.",
      ["Required flag added", "Optional parts dropped in order", "Tiny budget test passes"],
      "Look at always-present, retrieved and excluded context next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def build(parts, budget):",
      "    out, used = [], 0",
      "    for p in parts:                 # arrives in arbitrary order",
      "        if used + p.tokens > budget: break",
      "        out.append(p); used += p.tokens",
      "    return out") }),
  practice("m6-2-always-present-retrieved-or-excluded", "debug",
    pj("Retrieved when it should be present", 40, "Find why an agent forgets its own rules and fix how the rules are included.",
      [
        ["Run the starter on the five test questions and note where the rule is ignored.", "Save the outputs so you can compare them with the outputs after the fix."],
        ["Check which questions had the rule retrieved and which did not.", "Look at the retrieval log."],
        ["Move the rule into the always-present part and keep documents retrieved.", "Rerun the questions."],
        ["Add a test that fails if the rule is missing from the final prompt.", "Run the test once without the rule to confirm it fails, then check it passes with the rule."],
      ],
      "An assembler that always includes the rules, with a test that fails if they are missing.",
      ["Ignored rule located", "Rule moved to always present", "Missing-rule test passes"],
      "Look at prioritizing what matters next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "ALWAYS = [system_intro]",
      "RETRIEVE = [style_rules, refund_rules, docs]       # rules are searched for like documents",
      "def prompt(q): return ALWAYS + search(RETRIEVE, q, k=2)") }),
  practice("m6-2-prioritizing-what-matters", "reimplement",
    pj("Rebuild a priority trimmer", 45, "Rebuild a trimmer that drops content by priority class from a table of behaviours.",
      [
        ["Read the behaviour table and write one test for each row.", "Use small fake items."],
        ["Write the trimmer so it removes low priority items first and never removes must-keep items.", "Keep the order of what remains."],
        ["Make all tests pass and add a case where everything is must-keep.", "Decide what the trimmer should do."],
        ["Run it on a realistic prompt and read what it kept.", "Note anything surprising."],
      ],
      "A priority trimmer that passes tests from a behaviour table, including the all-must-keep case.",
      ["Tests from the table", "Trimmer passes all", "All-must-keep case handled"],
      "Look at ordering and source labels next.", ["Python 3.11 or newer"]),
    {}),
  practice("m6-2-ordering-so-sources-stay-distinguishable", "review",
    pj("Review a retrieved prompt", 30, "Review a prompt with retrieved passages and find where sources get mixed up.",
      [
        ["Read the prompt below and list each passage and where it came from.", "Mark any with no source."],
        ["Find at least three problems, such as missing labels or conflicting passages placed side by side.", "Quote the exact words of each problem so it is clear which part of the prompt has it."],
        ["Say what wrong answer each problem could cause.", "Give an example question."],
        ["Rewrite the prompt layout with clear labels and a sensible order.", "Keep the new layout short and make sure every passage has a clear source name."],
      ],
      "A review of a retrieved-passage prompt with three problems, the wrong answers they could cause and a clearer layout.",
      ["Passages listed with sources", "Three problems found", "Layout rewritten"],
      "Look at cutting redundant and stale context next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Context:",
      "The refund window is 30 days. The refund window is 14 days for sale items.",
      "Our policy was updated last year. Returns need a receipt.",
      "Shipping takes 3 to 5 days. The refund window is 30 days.",
      "Question: how long do I have to return a sale item?") }),
  practice("m6-2-cutting-redundant-and-stale-context", "optimise",
    pj("Shrink the retrieved context", 40, "Reduce the retrieved context for each question while keeping answers correct.",
      [
        ["Run the starter on ten questions and record the tokens and answers.", "Save them as your baseline."],
        ["Remove duplicate and near-duplicate passages before they are added.", "Count how many were removed."],
        ["Drop passages older than the newest version of the same document.", "Check the answers again."],
        ["Compare tokens and correctness before and after.", "Use a table with tokens and correctness for the old and new versions side by side."],
      ],
      "A retrieval step that removes duplicates and stale passages and keeps ten answers correct with fewer tokens.",
      ["Baseline saved", "Duplicates and stale passages removed", "Before and after compared"],
      "Move on to compression and compaction.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def context_for(q):",
      "    return '\\n\\n'.join(p.text for p in search(q, k=15))   # no dedupe, no version check") }),
];
