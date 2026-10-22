import { LLM, levelCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M415: ProjectSrc[] = [
  levelCapstone(4,
    pj("Advanced RAG Application", 600, "Build, improve, measure and deploy a document question-answering application with a baseline, one proven improvement, graceful failure and cost tracking.",
      [
        ["Choose a real document set of at least 100 documents that you can share, and write 60 questions: answerable, partial, unanswerable and multi-hop.", "Save expected answers and right chunks."],
        ["Build the ingestion pipeline with loaders, cleaning, de-duplication and incremental updates.", "Reuse your module projects."],
        ["Choose a chunking method, an embedding model and a vector store by measurement.", "Record the comparison tables."],
        ["Build the baseline RAG with hybrid retrieval, a grounded prompt, numbered citations and a fallback.", "Measure retrieval recall and answer correctness separately."],
        ["Pick the largest failure group and add one real improvement, such as reranking, query rewriting or a corrective loop.", "Measure before and after."],
        ["Add verified citations, structured evidence and an abstention policy.", "Audit 100 sentences by hand."],
        ["Add logging of latency, tokens and cost per request and a budget cap.", "Report cost per 1,000 questions."],
        ["Write a regression suite from your question set that runs offline and blocks changes that make answers worse.", "Include must-pass questions."],
        ["Deploy as an API with a `/ask` endpoint or a simple web page, with input limits and no secrets in the code.", "Test from a second device."],
        ["Test degraded cases: empty results, a slow model, a bad file and prompt injection in a document.", "Record what the app does in each case."],
        ["Write a README with a diagram, the results tables, known failures, the cost report and the next three improvements.", "Include a demo transcript."],
      ],
      "A deployed document question-answering app with an evaluation table that proves the baseline and one improvement, verified citations, graceful failure and a cost report.",
      ["Ingestion handles updates and duplicates", "Retrieval and answers evaluated separately", "One improvement proven with before and after numbers", "App abstains on weak evidence and cites verified sources", "Latency, tokens and cost tracked per request", "Deployed and tested from another device"],
      "Level 5 starts AI agents, where this app becomes a tool an agent can call.",
      ["Everything from Level 4", LLM]),
  ),
];
