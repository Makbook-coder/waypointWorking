import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M412: ProjectSrc[] = [
  practice("m4-12-answering-from-evidence", "extend",
    pj("Add an evidence check", 40, "Extend an answer pipeline with a check that every sentence is supported by the evidence.",
      [
        ["Run the starter on 10 questions and save the answers and chunks.", "Read three answers."],
        ["Split each answer into sentences and ask a model if the evidence supports each one.", "Return supported or not."],
        ["Remove or flag unsupported sentences.", "Keep the supported ones in order."],
        ["Compare a hand check of 20 sentences with the automatic check.", "Report the agreement."],
      ],
      "An evidence check that flags unsupported sentences with a measured agreement against hand labels.",
      ["Answers split into sentences", "Unsupported sentences flagged", "Agreement measured"],
      "Look at attaching claims to sources next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def answer(question):",
      "    chunks = retrieve(question)",
      "    return llm(f'Answer using this context:\\n{chunks}\\nQ: {question}')") }),
  practice("m4-12-attaching-claims-to-sources", "debug",
    pj("Citations point nowhere", 35, "Find why citations in answers point to the wrong sources and fix the numbering.",
      [
        ["Run the starter and compare the cited numbers with the chunks that hold each claim.", "Note the mismatches."],
        ["Print the numbering in the prompt and the numbering used to render sources.", "Find where they diverge."],
        ["Fix the bug and reject citation numbers that do not exist.", "Add a clear error."],
        ["Write tests for correct numbers, a missing number and a reordered list.", "Assert the rendered sources."],
      ],
      "Correct citation rendering with tests for missing and reordered sources.",
      ["Mismatch located", "Numbering fixed", "Three tests pass"],
      "Look at citations versus grounding next.", ["Python 3.11 or newer"]),
    { starter: code(
      "prompt_chunks = chunks                         # numbered from 1 in the prompt",
      "sorted_chunks = sorted(chunks, key=lambda c: c.source)   # used for rendering",
      "def render(n): return sorted_chunks[n].source   # n comes from the answer, starts at 1") }),
  practice("m4-12-citations-are-not-grounding", "review",
    pj("Audit the citations", 40, "Review a set of answers with citations and judge which citations really support their claims.",
      [
        ["Read the answers and cited chunks above and list each claim.", "Mark the cited chunk number."],
        ["Judge each claim as supported, partly supported or unsupported.", "Be strict: a claim counts only if the chunk says it."],
        ["Compute the share of cited claims that are really supported.", "Show the numbers behind the share you compute."],
        ["Suggest two changes to the system that would close the gap and one test for each.", "Be specific about what each change would alter and test."],
      ],
      "An audit with a supported share, quoted unsupported claims and two proposed changes with tests.",
      ["Claims listed and judged", "Supported share computed", "Two changes with tests"],
      "Look at abstaining on insufficient evidence next.", [LLM]),
    { starter: code(
      "Chunk 1: 'Refunds are available within 14 days for unopened items.'",
      "Chunk 2: 'Shipping takes 3 to 5 days in the EU.'",
      "Answer: 'You can get a refund within 30 days [1]. Shipping is free for orders in the EU [2].'") }),
  practice("m4-12-abstaining-on-insufficient-evidence", "challenge",
    pj("Teach it to say no", 45, "Make a RAG bot decline questions its evidence cannot answer without refusing the ones it can, with no steps given.",
      [],
      "A bot, a labelled question set and a table of wrong answers and wrong refusals before and after your changes.",
      ["At least 30 labelled questions across three kinds", "Both error types measured", "Policy tuned at least once", "Remaining mistakes quoted"],
      "Look at keeping evidence and synthesis separate next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Include answerable, partly answerable and unanswerable questions.", "Use the retrieval score and a sufficiency check together.", "Plot the two error types against your threshold to choose it."] }),
  practice("m4-12-keeping-evidence-and-synthesis-distinct", "reimplement",
    pj("Mini quote checker", 45, "Reimplement a quote verifier that checks every quoted passage appears in a source.",
      [
        ["Write a function that extracts quoted passages from a structured answer.", "Use the JSON format from the module."],
        ["Normalise whitespace and punctuation and check each quote against the source chunks.", "Allow small differences."],
        ["Return verified, near-match and fabricated labels with a similarity score.", "Choose a cutoff by looking at a few real near-matches."],
        ["Test on real answers and on answers with invented quotes.", "Report precision and recall of the checker."],
      ],
      "A quote verifier that labels quotes as verified, near-match or fabricated and a precision and recall result.",
      ["Quotes extracted", "Three labels returned", "Precision and recall reported"],
      "Go on to RAG variants in M4.13.", ["Python 3.11 or newer"]),
    {}),
];
