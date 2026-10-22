import { moduleCapstone, pj } from "../build";
import type { ProjectSrc } from "../types";

export const M47: ProjectSrc[] = [
  moduleCapstone("M4.7", ["m4-7-ingest-chunk-embed-and-index-a-real-corpus", "m4-7-dense-bm25-hybrid-retrieval", "m4-7-deploying-a-search-api-or-ui"],
    pj("Hybrid Search Engine", 360, "Build a deployed hybrid search engine over a real corpus, with ingestion, chunking, dense and BM25 retrieval, fusion, an evaluation set and a simple API or interface.",
      [
        ["Choose a real corpus of at least 200 documents you can legally use, such as docs, papers or articles, and write 50 queries with answers.", "Label the queries by type."],
        ["Build the ingestion pipeline: loaders, cleaning, de-duplication and a manifest for incremental runs.", "Reuse your module projects."],
        ["Choose a chunking method and size by measurement and add heading metadata.", "Save the comparison table."],
        ["Embed the chunks with a model chosen by your evaluation and store them in a vector database with a recorded model name.", "Add the guard against mixing models."],
        ["Add a BM25 index over the same chunks and keep both indexes in step on updates and deletes.", "Test an edit and a delete."],
        ["Add reciprocal rank fusion and evaluate dense, BM25 and hybrid on your 50 queries.", "Report recall per query type."],
        ["Add metadata filters and an access filter.", "Test them with two users."],
        ["Wrap the search in an API with a `/search` endpoint, or a small web page, with input validation and result sources.", "Return scores and snippets."],
        ["Deploy it where someone else can open it, or document a one-command local run.", "Check it from a second device."],
        ["Write a README with a diagram, the results table, known failures and the next three improvements.", "Include a demo transcript."],
      ],
      "A working hybrid search engine reachable through an API or page, with an evaluation table that shows hybrid retrieval against its parts.",
      ["Real corpus ingested incrementally", "Chunking and embedding model chosen by measurement", "Dense, BM25 and hybrid compared on 50 queries", "API or page reachable by someone else", "README documents results and failures"],
      "Next, RAG architecture in M4.8, where this search engine feeds a model.", ["Everything from M4.1 to M4.6", "Python 3.11 or newer"]),
  ),
];
