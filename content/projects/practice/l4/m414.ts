import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M414: ProjectSrc[] = [
  practice("m4-14-rebuilding-with-llamaindex-or-langchain", "reimplement",
    pj("Framework in miniature", 50, "Reimplement a tiny version of a framework's index and query engine, then compare it with the real thing.",
      [
        ["Write `Document`, `Node` and `Index` classes that load, chunk and embed text.", "Keep the classes small so the structure stays clear."],
        ["Write a `Retriever` and a `QueryEngine` class with the same method names as the framework.", "Use its docs for the names."],
        ["Run 10 questions through your classes and through the framework.", "Compare sources and answers."],
        ["List what the framework does that yours does not.", "Note at least three features."],
      ],
      "A miniature framework with the same interface shapes and a list of what the real one adds.",
      ["Four classes written", "Compared with the framework on 10 questions", "Missing features listed"],
      "Look at indexes, retrievers and query engines next.", ["Python 3.11 or newer", LLM, "llama-index or langchain"]),
    {}),
  practice("m4-14-indexes-retrievers-and-query-engines", "extend",
    pj("Add metadata filtering", 40, "Extend a framework query engine with metadata filters and source display.",
      [
        ["Run the starter on five questions and note that it ignores document types.", "Print the sources."],
        ["Add metadata to the documents when loading.", "Include type and year."],
        ["Add a filter to the retriever and test it with two filters.", "Check that results obey them."],
        ["Display the source file and page with each answer.", "Verify the source file and page against the original."],
      ],
      "A query engine with metadata filters and visible sources, tested on two filters.",
      ["Metadata attached", "Filters obeyed in a test", "Sources shown"],
      "Look at reranking and query transforms in frameworks next.", ["Python 3.11 or newer", LLM, "llama-index or langchain"]),
    { starter: code(
      "docs = SimpleDirectoryReader('docs').load_data()",
      "index = VectorStoreIndex.from_documents(docs)",
      "engine = index.as_query_engine()",
      "print(engine.query('What is the refund window?'))") }),
  practice("m4-14-framework-reranking-and-query-transforms", "optimise",
    pj("Slim the framework pipeline", 40, "Reduce the latency and calls of a framework pipeline that uses every available option.",
      [
        ["Run the starter and record latency, model calls and recall at 5 on 20 questions.", "Turn on logging to count calls."],
        ["Switch off the transforms that do not improve recall.", "Test one at a time."],
        ["Lower the number of candidates sent to the reranker.", "Check recall after lowering the number of candidates."],
        ["Cache embeddings and responses where the framework allows.", "Report the final numbers."],
      ],
      "A framework pipeline with fewer calls and lower latency with recall held and a table of each change.",
      ["Baseline measured", "Transforms tested one at a time", "Final numbers reported"],
      "Look at framework versus hand-built next.", ["Python 3.11 or newer", LLM, "llama-index or langchain"]),
    { starter: code(
      "engine = index.as_query_engine(",
      "    similarity_top_k=50,",
      "    node_postprocessors=[CrossEncoderRerank(top_n=5)],",
      "    query_transform=HyDEQueryTransform(include_original=True),   # plus multi-query on top",
      ")") }),
  practice("m4-14-framework-vs-hand-built", "review",
    pj("Review a stack choice", 30, "Review a decision to adopt a framework or to hand-build, and test its main assumption.",
      [
        ["Read the decision above and list its assumptions.", "Mark which have evidence."],
        ["Find at least three risks, such as lock-in, hidden defaults or upgrade churn.", "Quote the text that shows each risk."],
        ["Design a small experiment that tests the riskiest assumption.", "Say how long it would take."],
        ["Run it if you can and report the result.", "Otherwise say what you expect."],
      ],
      "A review of the decision with risks quoted and a small experiment that tests the riskiest assumption.",
      ["Assumptions listed", "Three risks quoted", "Experiment designed or run"],
      "Go on to the Level 4 capstone in M4.15.", ["Python 3.11 or newer"]),
    { starter: code(
      "Decision: adopt the framework because it takes 20 lines and supports every vector store.",
      "We will not read its default prompts or chunking settings. We expect to swap models",
      "monthly and upgrade the framework whenever a new version is released.") }),
];
