import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M48: ProjectSrc[] = [
  practice("m4-8-the-core-rag-pipeline", "reimplement",
    pj("RAG in fifty lines", 45, "Reimplement the core of a RAG framework in about fifty lines and compare it with a real one.",
      [
        ["Write `Index.add(texts)` that chunks, embeds and stores vectors in memory.", "Use a numpy matrix."],
        ["Write `Index.retrieve(question, k)` that returns chunks with scores.", "One matrix operation."],
        ["Write `ask(question)` that builds a prompt from the chunks and calls the model.", "Return the answer and the sources."],
        ["Run the same five questions through your code and a framework and compare answers and sources.", "Note what the framework adds."],
      ],
      "A fifty-line RAG core that answers questions with sources, compared with a framework.",
      ["Add, retrieve and ask implemented", "Answers include sources", "Compared with a framework"],
      "Look at what RAG solves next.", ["Python 3.11 or newer", LLM]),
    {}),
  practice("m4-8-what-rag-solves", "challenge",
    pj("Stale facts", 40, "Show that a RAG system answers correctly after a document changes when the model alone does not, with no steps given.",
      [],
      "A demonstration with before and after answers and a short note on what changed and what did not.",
      ["A fact that changes between two document versions", "Model alone answers wrongly or refuses", "RAG answers correctly after the update without retraining", "A fact RAG still gets wrong is shown and explained"],
      "Look at when not to use RAG next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Invent a policy, like a refund window, so the model cannot know it.", "Change the document and re-index only that document.", "Find a question that needs a calculation or a comparison across documents."] }),
  practice("m4-8-when-not-to-use-rag", "review",
    pj("Review a project plan", 30, "Review a plan to build a RAG system and decide whether something simpler would do.",
      [
        ["Read the plan above and list its data size, update rate and question types.", "Write them as numbers."],
        ["For each question type decide whether RAG, a long prompt, a tool call or a database query fits best.", "Write the reason next to each choice you make."],
        ["Estimate the cost and effort of the plan and of your simpler alternative.", "Use rough numbers."],
        ["Write a recommendation in five lines.", "State what would change your mind."],
      ],
      "A review with question types matched to approaches, a cost comparison and a recommendation.",
      ["Data and questions quantified", "Approaches matched to question types", "Recommendation with a changing condition"],
      "Look at retrieval failure versus generation failure next.", [LLM]),
    { starter: code(
      "Plan: build a vector database and RAG pipeline for our 40-page employee handbook.",
      "It changes twice a year. Most questions are 'what is the notice period?' and",
      "'how many leave days do I get?'. Some ask for a sum of leave days across roles.") }),
  practice("m4-8-retrieval-failure-vs-generation-failure", "debug",
    pj("Whose fault is it", 40, "Debug a RAG pipeline whose answers are wrong by finding out whether retrieval or generation failed each time.",
      [
        ["Run the five failing questions and print the retrieved chunks next to each answer.", "Mark the correct passage in the documents."],
        ["For each failure decide whether the right passage was retrieved.", "Label retrieval or generation."],
        ["Fix one retrieval failure and one generation failure with the smallest change you can.", "Prove each with a rerun."],
        ["Write a test that fails for each original problem and passes after the fix.", "Keep them as regression tests."],
      ],
      "Failures labelled by stage, one fix for each stage and tests that keep them fixed.",
      ["Right passage located for each failure", "Both stages fixed once", "Regression tests added"],
      "Go on to baseline RAG from scratch in M4.9.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "chunks = retrieve(question, k=2)   # chunk size 80 tokens",
      "prompt = f'Answer briefly.\\n{chunks}\\nQ: {question}'   # no instruction about the context",
      "# failures: 'refund window' (passage not retrieved), 'notice period' (retrieved but ignored)") }),
];
