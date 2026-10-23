import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M92: ProjectSrc[] = [
  practice("m9-2-where-knowledge-should-come-from", "debug",
    pj("Wrong source for the question", 40, "Find why an assistant answers account questions from stale documents and route them to the right source.",
      [
        ["Run the starter assistant on the five sample questions and mark which answers are wrong.", "Note the source used."],
        ["Find why each wrong answer used the wrong source.", "Look at the router rules."],
        ["Route personal and live data questions to a lookup tool and policy questions to retrieval.", "Keep general questions with the model."],
        ["Rerun and report which answers changed.", "Add one new test for the fixed case."],
      ],
      "An assistant that sends each question to the right source and answers the five samples correctly.",
      ["Wrong sources found", "Routing fixed", "New test added"],
      "Look at the full context pipeline next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def answer(q):",
      "    docs = search_documents(q)      # used for everything, including 'what is my balance?'",
      "    return llm('Answer using: ' + docs + q)") }),
  practice("m9-2-the-full-context-pipeline", "reimplement",
    pj("Rebuild the context assembler", 45, "Rebuild the stage that assembles a prompt from parts under a token budget.",
      [
        ["Write the list of parts: instructions, history, retrieved chunks and the question.", "Give each a priority."],
        ["Write a function that counts tokens roughly and keeps parts in priority order within a budget.", "Drop whole chunks, not half a sentence."],
        ["Add a trace line saying what was kept and dropped and why.", "Print it for each request."],
        ["Test with a budget that is too small and one that is large.", "Check that instructions are never dropped."],
      ],
      "A context assembler that fits a token budget by priority and records what it dropped.",
      ["Priorities defined", "Budget respected", "Instructions never dropped"],
      "Look at combining retrieval approaches next.", ["Python 3.11 or newer"]) ),
  practice("m9-2-combining-retrieval-approaches", "review",
    pj("Review a retrieval design", 30, "Review a retrieval design that uses one method and propose a combination.",
      [
        ["Read the design and list the question types it handles well and badly.", "Give an example of each."],
        ["Predict which questions keyword search would fix and which meaning search would fix.", "Explain the guess."],
        ["Propose a combination with merging and a re-ranker.", "State the extra cost."],
        ["Write the test you would run to prove the combination helps.", "Give the metric. Keep a note of each result."],
      ],
      "A review of a retrieval design with predicted failures, a proposed hybrid and a test that would prove it helps.",
      ["Strengths and weaknesses listed", "Hybrid proposed", "Test and metric named"],
      "Look at freshness, access control and provenance next.", ["A text editor"]),
    { starter: code(
      "Design: all documents are embedded and the top 3 by cosine similarity go to the model.",
      "Users report that searching for product code 'AX-4471' returns unrelated pages,",
      "while paraphrased questions work well.") }),
  practice("m9-2-freshness-access-control-and-provenance", "optimise",
    pj("Faster permission filtering", 40, "Make permission filtering faster without ever showing a forbidden chunk.",
      [
        ["Run the starter retriever on 50 queries and record the time and any forbidden chunks returned.", "There should be none."],
        ["Find where the time goes, such as filtering after fetching a large set.", "Measure each part."],
        ["Move the filter into the search so only permitted chunks are ranked.", "Keep the checks. If it feels vague, add a number or an example."],
        ["Rerun and compare time, then add a test that proves no forbidden chunk appears.", "Report both. Check it with someone else or a model if you can."],
      ],
      "A retriever with the permission filter applied inside the search that is faster and leaks nothing.",
      ["Baseline timed", "Filter moved into search", "No-leak test passes"],
      "Look at retrieving dynamically or holding in context next.", ["Python 3.11 or newer"]),
    { starter: code(
      "hits = index.search(query, k=500)",
      "return [h for h in hits if user.team in h.teams][:5]      # fetches far too many") }),
  practice("m9-2-retrieved-dynamically-or-held-in-context", "extend",
    pj("Add a switch between retrieve and paste", 40, "Extend an assistant so it pastes a small document and retrieves from a large one.",
      [
        ["Run the starter on a small and a large document and note the cost of each.", "Write the numbers."],
        ["Add a size check that estimates tokens for each document.", "Make the limit a setting."],
        ["Paste small documents into the prompt and retrieve from large ones.", "Log which path was used."],
        ["Test with three sizes and check the answers stay correct.", "Report cost and path."],
      ],
      "An assistant that chooses between pasting and retrieval by document size and keeps answers correct.",
      ["Costs written down", "Size switch works", "Three sizes tested"],
      "Look at the module capstone next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def answer(q, doc):",
      "    return llm('Document: ' + doc + ' Question: ' + q)      # pastes even a 400-page manual") }),
];
