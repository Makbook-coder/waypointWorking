import type { AppliedModule } from "./types";

const CONTEXTUAL = { label: "Anthropic: Introducing Contextual Retrieval", url: "https://www.anthropic.com/news/contextual-retrieval", kind: "blog" } as const;
const DOORDASH = { label: "DoorDash: Path to high-quality LLM-based Dasher support automation", url: "https://careersatdoordash.com/blog/large-language-modules-based-dasher-support-automation/", kind: "case-study" } as const;
const LINKEDIN = { label: "Xu et al. (LinkedIn): RAG with Knowledge Graphs for Customer Service QA", url: "https://arxiv.org/abs/2404.17723", kind: "paper" } as const;
const PGVECTOR = { label: "pgvector on GitHub", url: "https://github.com/pgvector/pgvector", kind: "docs" } as const;
const RRF = { label: "Elasticsearch docs: Reciprocal rank fusion", url: "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion", kind: "docs" } as const;

export const APPLIED_L4: AppliedModule[] = [
  {
    moduleId: "M4.1",
    howItWorks:
      "RAG quality is decided before any model runs: if text is extracted badly, nothing downstream can fix it. Real ingestion pipelines convert each source (PDF, HTML, DOCX, slides) into clean text that keeps structure such as headings, tables and reading order, attach metadata (source, title, date, permissions), remove boilerplate and duplicates, and track a content hash so changed documents are re-indexed and deleted ones removed. It runs as a scheduled or event-driven job, not a one-off script.",
    uses: [
      {
        who: "IBM Research (Docling)",
        what: "Docling, started by IBM Research and now hosted by the LF AI & Data Foundation, converts PDFs, Office files, HTML and images into one document format, analysing layout, reading order and table structure, with OCR for scans. It can run fully locally, which matters for private documents.",
        source: { label: "Docling on GitHub", url: "https://github.com/docling-project/docling", kind: "docs" },
      },
      {
        who: "DoorDash",
        what: "DoorDash's support assistant retrieves from knowledge-base articles and past resolved cases. One problem they set out to solve was that the right article was hard to find and slow to search within, which is an ingestion and indexing problem before it is a generation problem.",
        source: DOORDASH,
      },
    ],
    scenario: {
      title: "Ingesting an HR policy library for an internal assistant",
      context:
        "HR has 900 documents: scanned PDFs, Word files and intranet pages, many with tables of leave entitlements. Several versions of the same policy exist, and documents change monthly.",
      architecture:
        "A nightly job lists sources, skips unchanged files by content hash, converts each to Markdown with a layout-aware parser, strips headers and footers, attaches metadata (department, effective date, audience, URL), marks superseded versions, and upserts the result into the document store that the chunker reads from.",
      tools: ["Docling or Unstructured", "OCR for scans", "a document store (Postgres table or object storage)", "content hashes", "a scheduler"],
      steps: [
        "Inventory sources and formats, and pick 20 representative documents including the worst scans and the most complex tables.",
        "Run two parsers on those 20 and compare the output by eye, especially tables and headings; choose the one that preserves structure best.",
        "Add cleaning: remove repeated headers, footers and navigation, and normalise whitespace while keeping headings.",
        "Attach metadata and detect duplicates and superseded versions by title and effective date, keeping only the current one searchable.",
        "Schedule the job with hashing so only changed files are reprocessed, and delete index entries for removed documents.",
      ],
    },
    example: {
      title: "Incremental ingestion with hashing and metadata",
      lang: "python",
      code: `import hashlib, pathlib
from docling.document_converter import DocumentConverter

converter = DocumentConverter()

def ingest(folder: str, store) -> None:
    seen = set()
    for path in pathlib.Path(folder).rglob("*"):
        if path.suffix.lower() not in {".pdf", ".docx", ".html", ".pptx"}:
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        seen.add(str(path))
        if store.hash_of(str(path)) == digest:
            continue                                   # unchanged: skip
        markdown = converter.convert(str(path)).document.export_to_markdown()
        store.upsert(
            source=str(path), hash=digest, text=markdown,
            metadata={"title": path.stem, "type": path.suffix[1:], "dept": path.parts[-2]},
        )
    for stale in store.sources() - seen:
        store.delete(stale)                            # removed upstream: remove here`,
      notes:
        "Hashing keeps nightly runs cheap, Markdown output keeps headings and tables for the chunker, and the final loop removes documents that disappeared upstream, which teams often forget until someone gets an answer from a deleted policy.",
    },
    tradeoffs: [
      { issue: "Layout-aware parsing and OCR are slow and can be expensive at scale.", response: "Use fast text extraction for simple digital files and reserve heavy parsing for scans and table-heavy documents." },
      { issue: "Duplicates and old versions cause contradictory answers.", response: "Deduplicate by hash and title, track effective dates, and index only current versions or tag old ones clearly." },
      { issue: "Permissions are lost when documents are copied into an index.", response: "Store access-control metadata with every document and filter retrieval by the user's permissions." },
    ],
    junior: "Runs a basic PDF-to-text function once, gets jumbled tables and repeated page headers, and never re-indexes when documents change.",
    senior: "Treats ingestion as a maintained pipeline: chooses parsers by inspecting real outputs, keeps structure and metadata, handles updates and deletions, and carries permissions through.",
    reading: [
      { label: "Claude docs: PDF support", url: "https://platform.claude.com/docs/en/build-with-claude/pdf-support", kind: "docs" },
      { label: "LlamaIndex: High-level concepts", url: "https://developers.llamaindex.ai/python/framework/getting_started/concepts/", kind: "docs" },
    ],
  },
  {
    moduleId: "M4.2",
    howItWorks:
      "Documents are split into chunks small enough to retrieve precisely but large enough to make sense on their own. Production systems usually split along structure first (headings, sections, paragraphs), then by size with some overlap, and attach metadata such as document title and section path to each chunk. A common improvement is adding a short context sentence to each chunk explaining where it comes from, because a chunk like 'revenue grew 3%' is useless without knowing which company and quarter.",
    uses: [
      {
        who: "Anthropic (Contextual Retrieval)",
        what: "Anthropic prepended a short, model-written context to each chunk before embedding and keyword indexing. On their tests this cut top-20 retrieval failures by about a third with embeddings alone, about half when combined with contextual BM25, and about two thirds with reranking added; prompt caching kept the one-off cost low.",
        source: CONTEXTUAL,
      },
      {
        who: "LinkedIn customer service",
        what: "LinkedIn's team found that treating past support tickets as flat text lost their structure, so they parsed tickets into a graph of sections and links instead. They report much better retrieval and a lower median time to resolve issues after deploying it.",
        source: LINKEDIN,
      },
    ],
    scenario: {
      title: "Chunking a product manual for a support bot",
      context:
        "A hardware company's manuals have nested sections, numbered steps and warning boxes. Fixed 500-character chunks cut procedures in half and lose which product model a step belongs to.",
      architecture:
        "Split by Markdown headings into sections, then split long sections into roughly 400-token pieces at paragraph boundaries with a small overlap. Each chunk stores product model, section path and page. A one-line context header is prepended before embedding.",
      tools: ["a Markdown-aware text splitter", "a tokenizer", "an embedding model", "a retrieval eval set"],
      steps: [
        "Collect 50 real questions with the passage that answers each.",
        "Baseline with fixed-size chunks and measure recall at 5 (is the right passage in the top 5).",
        "Switch to heading-aware splitting with paragraph boundaries and size limits, keeping numbered procedures together.",
        "Add metadata and a context header (product, section path) to each chunk and re-measure.",
        "Try two or three chunk sizes and keep the one with the best recall at an acceptable token cost per query.",
      ],
    },
    example: {
      title: "Structure-first chunking with a context header",
      lang: "python",
      code: `import re

def chunk_markdown(doc: str, product: str, max_tokens: int, count) -> list[dict]:
    chunks, path = [], []
    for block in re.split(r"(?m)^(?=#{1,3} )", doc):          # split at headings
        m = re.match(r"(#{1,3}) (.+)", block)
        if m:
            level = len(m.group(1))
            path = path[: level - 1] + [m.group(2).strip()]
        section = " > ".join(path)
        header = f"{product} manual > {section}"               # context for every chunk
        pieces, current = [], ""
        for p in block.split("\\n\\n"):                          # break only between paragraphs
            if current and count(current + p) > max_tokens:
                pieces.append(current); current = ""
            current += p + "\\n\\n"
        if current.strip():
            pieces.append(current)
        chunks += [{"text": f"{header}\\n\\n{t.strip()}", "section": section, "product": product}
                   for t in pieces]
    return chunks`,
      notes:
        "Chunks never cross a heading, long sections break at paragraph boundaries, and every chunk carries its product and section path both as metadata (for filtering) and as a header in the text (for embedding). That header is a cheap version of contextual retrieval.",
    },
    tradeoffs: [
      { issue: "Small chunks retrieve precisely but lose context; large chunks keep context but dilute relevance.", response: "Measure recall with a few sizes on your own questions, and consider retrieving small chunks but sending their parent section to the model." },
      { issue: "Model-generated chunk context costs a call per chunk.", response: "Use a small model with prompt caching of the whole document, as in contextual retrieval, or a template header from metadata." },
      { issue: "Tables and code blocks break badly when split.", response: "Keep tables and code blocks whole, and store a text summary of large tables for retrieval." },
    ],
    junior: "Uses the default 1,000-character splitter for everything and never checks whether the right chunk is being retrieved.",
    senior: "Splits by document structure, keeps metadata and context with each chunk, and chooses chunk size by measuring retrieval recall on real questions.",
    reading: [
      { label: "Introducing Contextual Retrieval (Anthropic)", url: "https://www.anthropic.com/news/contextual-retrieval", kind: "blog" },
      { label: "Retrieval Augmented Generation series (Pinecone)", url: "https://www.pinecone.io/learn/series/rag/", kind: "blog" },
    ],
  },
  {
    moduleId: "M4.3",
    howItWorks:
      "An embedding model turns text into a vector so that similar meanings land near each other. In production, teams choose a model by testing it on their own queries and documents (public leaderboards only shortlist), embed documents in batches during ingestion, embed queries at request time with the same model, and record the model name and version with every vector. Changing the embedding model means re-embedding everything, because vectors from different models cannot be compared.",
    uses: [
      {
        who: "Facebook Search",
        what: "Meta described adding embedding-based retrieval to Facebook Search, which had relied mainly on term matching. They built a unified embedding model that also uses the searcher's context, served it with approximate nearest neighbour search inside the existing search stack, and saw significant gains in online A/B tests.",
        source: { label: "Huang et al. (Meta): Embedding-based Retrieval in Facebook Search", url: "https://arxiv.org/abs/2006.11632", kind: "paper" },
      },
      {
        who: "Hugging Face MTEB",
        what: "The Massive Text Embedding Benchmark compares embedding models across many tasks and languages. Teams use it to shortlist models by size, language support and task type, then confirm on their own data, because rank on the benchmark does not guarantee results on a specific domain.",
        source: { label: "Hugging Face: MTEB, Massive Text Embedding Benchmark", url: "https://huggingface.co/blog/mteb", kind: "blog" },
      },
    ],
    scenario: {
      title: "Choosing an embedding model for multilingual support articles",
      context:
        "A company's help centre has articles in English, Hindi and Spanish, and users ask questions in any of them, sometimes mixing languages.",
      architecture:
        "Articles are chunked and embedded in a batch job with a multilingual model; vectors are stored with `embedding_model` and `dimension` columns. Queries are embedded at request time with the same model. A retrieval eval with questions in all three languages decides the model.",
      tools: ["sentence-transformers or a hosted embedding API", "MTEB for shortlisting", "a vector store", "a labelled query set"],
      steps: [
        "Shortlist three multilingual models from MTEB, considering size, latency and licence.",
        "Build 60 queries (20 per language, some cross-language) labelled with the correct article.",
        "Embed the corpus with each candidate and measure recall at 5 and query latency.",
        "Pick the winner, store its name and version with every vector, and normalise vectors if you will use cosine or dot product.",
        "Document the re-embedding procedure, since any model change requires rebuilding the whole index.",
      ],
    },
    example: {
      title: "Embedding with recorded model version",
      lang: "python",
      code: `from sentence_transformers import SentenceTransformer

MODEL_NAME = "your-multilingual-embedding-model"
model = SentenceTransformer(MODEL_NAME)

def embed_chunks(chunks: list[dict]) -> list[dict]:
    vectors = model.encode([c["text"] for c in chunks], batch_size=64,
                           normalize_embeddings=True, show_progress_bar=True)
    return [
        {**c, "embedding": v.tolist(), "embedding_model": MODEL_NAME, "dim": len(v)}
        for c, v in zip(chunks, vectors)
    ]

def embed_query(q: str):
    # Same model, same normalisation, or similarity scores are meaningless
    return model.encode([q], normalize_embeddings=True)[0]`,
      notes:
        "Every stored vector says which model produced it, so a mixed index is detectable. Normalising at both ingestion and query time makes dot product equal to cosine similarity, which many vector stores compute fastest.",
    },
    tradeoffs: [
      { issue: "Larger embedding models are more accurate but slower and costlier to run and store.", response: "Measure recall per model on your data; often a mid-size model is within a point of the largest at a fraction of the cost." },
      { issue: "Switching models requires re-embedding the full corpus.", response: "Keep ingestion re-runnable, build the new index alongside the old one, and switch over after evaluating." },
      { issue: "General models can miss domain jargon.", response: "Add hybrid keyword search, or fine-tune an embedding model on query-document pairs if evals justify it." },
    ],
    junior: "Picks the top leaderboard model, embeds documents with one model and queries with another, and wonders why search is random.",
    senior: "Chooses the model with an eval on real queries, records model versions with vectors, and plans re-embedding as a routine operation.",
    reading: [
      { label: "Sentence Transformers documentation", url: "https://sbert.net/", kind: "docs" },
      { label: "MTEB: Massive Text Embedding Benchmark", url: "https://huggingface.co/blog/mteb", kind: "blog" },
    ],
  },
  {
    moduleId: "M4.4",
    howItWorks:
      "Semantic search embeds the query, compares it with stored vectors by cosine similarity or dot product, and returns the closest chunks. It finds paraphrases that keyword search misses, but it can also miss exact identifiers (error codes, product SKUs, names) and return passages that are related but do not answer. Production systems therefore check retrieval quality with labelled queries, filter by metadata before ranking, and combine semantic search with keyword search where exact terms matter.",
    uses: [
      {
        who: "Facebook Search",
        what: "Meta's paper explains that term matching alone could not capture what users meant in social search, so they added embedding-based retrieval, and that the right results also depend on context such as the searcher's social graph, not only text similarity.",
        source: { label: "Huang et al. (Meta): Embedding-based Retrieval in Facebook Search", url: "https://arxiv.org/abs/2006.11632", kind: "paper" },
      },
      {
        who: "Anthropic (Contextual Retrieval)",
        what: "In Anthropic's retrieval experiments, plain embedding search still missed the right chunk in a notable share of queries; adding keyword (BM25) search on top cut those failures further, showing where pure semantic similarity falls short.",
        source: CONTEXTUAL,
      },
    ],
    scenario: {
      title: "Semantic search over an engineering wiki",
      context:
        "Engineers search the internal wiki for things like 'how do we rotate database credentials'. Keyword search fails when the page says 'secret rotation for Postgres', but searches for error codes like `E4021` must still work.",
      architecture:
        "Chunks with embeddings in a vector table, filtered by team or space before similarity ranking. A query classifier sends queries that look like identifiers to keyword search first. A labelled query set measures recall at 5 for each change.",
      tools: ["an embedding model", "NumPy for a from-scratch baseline", "a vector store", "a labelled query set"],
      steps: [
        "Build a brute-force baseline: embed all chunks, compute cosine similarity with NumPy, and return the top 5.",
        "Label 50 real queries with the page that answers them and measure recall at 5.",
        "Inspect the misses and group them: exact identifiers, very short queries, outdated pages, wrong space.",
        "Add metadata filters for space and recency, and route identifier-like queries to keyword search.",
        "Re-measure, then move from brute force to a vector database once the corpus is too large for memory.",
      ],
    },
    example: {
      title: "Semantic search from scratch, with a filter",
      lang: "python",
      code: `import numpy as np

class TinyIndex:
    def __init__(self, vectors: np.ndarray, meta: list[dict]):
        self.v = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
        self.meta = meta

    def search(self, q: np.ndarray, k: int = 5, space: str | None = None):
        q = q / np.linalg.norm(q)
        scores = self.v @ q                                   # cosine similarity
        if space:
            mask = np.array([m["space"] == space for m in self.meta])
            scores = np.where(mask, scores, -np.inf)          # filter BEFORE ranking
        top = np.argsort(-scores)[:k]
        return [(float(scores[i]), self.meta[i]["title"]) for i in top if np.isfinite(scores[i])]

def recall_at_k(index, labelled, embed, k=5) -> float:
    hits = sum(any(t == want for _, t in index.search(embed(q), k)) for q, want in labelled)
    return hits / len(labelled)`,
      notes:
        "Brute force is fine up to tens of thousands of chunks and makes behaviour easy to understand. Filtering before ranking means you never return a top result from the wrong space. `recall_at_k` is the number every later change should move.",
    },
    tradeoffs: [
      { issue: "Embeddings blur exact identifiers, numbers and rare names.", response: "Add keyword search or route identifier-like queries to it, then combine results." },
      { issue: "High similarity does not mean the passage answers the question.", response: "Rerank the top candidates with a cross-encoder or an LLM, and test answerability, not just similarity." },
      { issue: "Brute-force search does not scale to millions of vectors.", response: "Move to an approximate nearest neighbour index once latency or memory demands it." },
    ],
    junior: "Ships semantic search without measuring it and is surprised that searching for an error code returns vaguely related pages.",
    senior: "Starts with a simple baseline, measures recall on real queries, studies the misses by type, and adds filters, keyword search or reranking to fix specific failure groups.",
    reading: [
      { label: "Sentence Transformers: Semantic search", url: "https://sbert.net/examples/sentence_transformer/applications/semantic-search/README.html", kind: "docs" },
      { label: "Build a semantic search engine with LangChain", url: "https://docs.langchain.com/oss/python/langchain/knowledge-base", kind: "docs" },
    ],
  },
  {
    moduleId: "M4.5",
    howItWorks:
      "Once there are too many vectors for brute force, they go into a vector database or a vector extension of an existing database, with an approximate nearest neighbour (ANN) index such as HNSW or IVF. The index trades a little recall for much lower latency, and its parameters set that trade. In practice teams also need metadata filtering (tenant, permissions, date), updates and deletes as documents change, and monitoring of recall against exact search, because a badly tuned or filtered index silently returns worse results.",
    uses: [
      {
        who: "pgvector",
        what: "pgvector adds vector columns, distance operators and HNSW and IVFFlat indexes to Postgres. Its docs explain that HNSW gives a better speed-recall trade-off but builds slower and uses more memory, that query-time settings trade recall for speed, and that filters applied after an approximate scan can return too few rows unless iterative scans are enabled.",
        source: PGVECTOR,
      },
      {
        who: "Facebook Search",
        what: "Meta describes serving embedding-based retrieval with ANN search inside an inverted-index search stack, and tuning ANN parameters as part of end-to-end optimisation, which shows the index settings are a product-quality decision, not just infrastructure.",
        source: { label: "Huang et al. (Meta): Embedding-based Retrieval in Facebook Search", url: "https://arxiv.org/abs/2006.11632", kind: "paper" },
      },
    ],
    scenario: {
      title: "Multi-tenant document search on Postgres",
      context:
        "A B2B SaaS app adds document Q&A for each customer. There are 200 tenants, 30 million chunks in total, and one tenant must never see another tenant's data.",
      architecture:
        "A `chunks` table in the existing Postgres with a `vector` column, `tenant_id` and permission columns, an HNSW index on the vector, and a B-tree index on `tenant_id`. Queries always filter by tenant, with iterative index scans so filtering does not starve results. Large tenants can get their own partition.",
      tools: ["PostgreSQL with pgvector", "HNSW index", "row-level security or enforced tenant filters", "a recall check against exact search"],
      steps: [
        "Create the table with vector, tenant and permission columns, and enforce tenant filtering in the data-access layer or with row-level security.",
        "Load data, then build the HNSW index with default parameters and measure p95 latency and recall@10 against exact search on 200 sample queries.",
        "Tune query-time search breadth up until recall is acceptable, watching latency.",
        "Turn on iterative scans and test the smallest tenants, where filtering after the ANN scan is most likely to return too few rows.",
        "Handle updates and deletes in the ingestion job and schedule periodic recall checks as the data grows.",
      ],
    },
    example: {
      title: "pgvector schema, index and a filtered query",
      lang: "sql",
      code: `CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE chunks (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  BIGINT NOT NULL,
  doc_id     BIGINT NOT NULL,
  content    TEXT NOT NULL,
  embedding  vector(1024) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX chunks_tenant ON chunks (tenant_id);
CREATE INDEX chunks_embedding ON chunks USING hnsw (embedding vector_cosine_ops);

-- Per query: wider search for better recall, and keep scanning when the filter removes rows
SET hnsw.ef_search = 100;
SET hnsw.iterative_scan = relaxed_order;

SELECT id, doc_id, content, 1 - (embedding <=> $1) AS similarity
FROM chunks
WHERE tenant_id = $2
ORDER BY embedding <=> $1
LIMIT 10;`,
      notes:
        "`<=>` is cosine distance, so similarity is one minus it. The tenant filter is mandatory in every query. Without the iterative scan setting, a small tenant could get fewer than 10 results because the approximate scan found mostly other tenants' rows first.",
    },
    tradeoffs: [
      { issue: "ANN indexes return approximate results and can miss relevant chunks.", response: "Measure recall against exact search on sample queries and tune search breadth until it meets your target." },
      { issue: "HNSW uses a lot of memory and builds slowly on large tables.", response: "Size memory for the index, build after bulk loads, consider IVF or quantisation for very large sets, and partition big tenants." },
      { issue: "Metadata filters interact badly with approximate search.", response: "Use iterative scans, partial indexes or partitioning for selective filters, and test the smallest filter groups." },
    ],
    junior: "Adds a vector database as a new service for 5,000 documents and forgets the tenant filter in one query path.",
    senior: "Starts with the database the team already runs when it is enough, enforces tenant filtering centrally, tunes the index from recall and latency measurements, and plans for updates and growth.",
    reading: [
      { label: "pgvector/pgvector", url: "https://github.com/pgvector/pgvector", kind: "docs" },
      { label: "Filtering in vector search: when to use what (Qdrant)", url: "https://qdrant.tech/articles/vector-search-filtering/", kind: "blog" },
    ],
  },
  {
    moduleId: "M4.6",
    howItWorks:
      "Keyword search (usually BM25) is excellent at exact terms such as error codes, names and product numbers; dense vector search is excellent at meaning and paraphrase. Hybrid retrieval runs both and merges the results, most often with Reciprocal Rank Fusion, which combines rankings without needing comparable scores. It is now a common default in production RAG because it fixes many failures of either method alone for little extra cost.",
    uses: [
      {
        who: "Elasticsearch",
        what: "Elasticsearch has a built-in RRF retriever that runs a BM25 query and a kNN vector query independently and merges their top results, scoring each document by summing one over a constant plus its rank in each list, with a default constant of 60.",
        source: RRF,
      },
      {
        who: "Anthropic (Contextual Retrieval)",
        what: "In Anthropic's tests, combining contextual embeddings with contextual BM25 cut retrieval failures substantially more than embeddings alone, which is direct evidence that keyword and vector search catch different things.",
        source: CONTEXTUAL,
      },
    ],
    scenario: {
      title: "Hybrid search for an IT help desk",
      context:
        "Employees search IT knowledge articles with both natural questions ('laptop won't connect to office wifi') and exact strings ('error 0x80070005', 'VPN-GW-02'). Vector search alone misses the exact strings.",
      architecture:
        "Each query runs BM25 over a full-text index and kNN over chunk embeddings in parallel, takes the top 50 from each, fuses them with RRF, and passes the top 10 on (optionally to a reranker). Both indexes are built from the same chunk table so ids match.",
      tools: ["BM25 (Postgres full-text, Elasticsearch, OpenSearch or a library)", "a vector index", "RRF fusion", "a labelled query set split by query type"],
      steps: [
        "Label 80 queries and tag each as exact-term or natural-language.",
        "Measure recall at 10 for BM25 only and vector only, per query type, to see each method's blind spots.",
        "Implement RRF over the two result lists and measure again.",
        "Tune the candidate depth from each retriever and the RRF constant only if evals show a benefit.",
        "Keep the per-type breakdown on the dashboard so a regression in either query type is visible.",
      ],
    },
    example: {
      title: "Reciprocal Rank Fusion in a few lines",
      lang: "python",
      code: `from collections import defaultdict

def rrf(result_lists: list[list[str]], k: int = 60, top_n: int = 10) -> list[tuple[str, float]]:
    scores: dict[str, float] = defaultdict(float)
    for results in result_lists:
        for rank, doc_id in enumerate(results, start=1):
            scores[doc_id] += 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: -x[1])[:top_n]

bm25_ids   = ["kb-412", "kb-077", "kb-903", "kb-120"]     # exact match on "0x80070005"
vector_ids = ["kb-077", "kb-555", "kb-412", "kb-018"]     # semantically similar
print(rrf([bm25_ids, vector_ids]))
# kb-412 and kb-077 rise to the top because both retrievers ranked them highly`,
      notes:
        "RRF only uses ranks, so it does not matter that BM25 scores and cosine similarities are on different scales. Documents ranked well by both methods win, and a document found by only one still appears.",
    },
    tradeoffs: [
      { issue: "Running two retrievers adds latency and another index to maintain.", response: "Run them in parallel, keep candidate depth modest, and build both indexes from the same ingestion job." },
      { issue: "Fusion can push down a perfect result found by only one retriever.", response: "Check per-query-type recall; add a reranker after fusion to restore precision." },
      { issue: "BM25 needs language-aware tokenisation for good results.", response: "Configure analysers for each language, and test non-English queries separately." },
    ],
    junior: "Chooses either keyword or vector search and argues that it is better in every case.",
    senior: "Measures each retriever's blind spots by query type, combines them with simple fusion, and keeps per-type metrics so neither kind of query regresses.",
    reading: [
      { label: "Hybrid search in Qdrant", url: "https://qdrant.tech/articles/hybrid-search/", kind: "blog" },
      { label: "What is hybrid search? (Elastic)", url: "https://www.elastic.co/what-is/hybrid-search", kind: "blog" },
    ],
  },
  {
    moduleId: "M4.8",
    howItWorks:
      "RAG answers questions from your own or fresh data by retrieving relevant passages and putting them in the prompt. A production RAG system has two halves that fail differently: retrieval (did we find the right evidence?) and generation (did the model use it correctly?). Teams measure them separately, because the fix for a retrieval miss (better chunking, hybrid search, filters) is different from the fix for a generation error (prompting, citations, abstention). RAG is chosen when knowledge changes, is private or must be cited; it is not needed when a model already knows the answer or when the task is a fixed transformation.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash built a RAG chatbot for delivery drivers that condenses the conversation into the core issue, retrieves similar resolved cases and knowledge-base articles, and generates a reply. A guardrail checks grounding and policy before replies are shown, and they report large reductions in hallucinations and compliance issues.",
        source: DOORDASH,
      },
      {
        who: "LinkedIn customer service",
        what: "LinkedIn's support team used RAG over a knowledge graph built from past tickets. After about six months in use they reported much better retrieval and a noticeable cut in median time to resolve an issue.",
        source: LINKEDIN,
      },
      {
        who: "Meta AI Research (the original RAG paper)",
        what: "The RAG paper combined a generator model with a retriever over a dense Wikipedia index, so answers could draw on an external, updatable knowledge source instead of only what was memorised in weights.",
        source: { label: "Lewis et al.: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401", kind: "paper" },
      },
    ],
    scenario: {
      title: "Deciding whether and how to build RAG for a sales team",
      context:
        "Sales wants an assistant that answers product and pricing questions. Pricing changes monthly, some documents are confidential to certain regions, and answers must point to the source.",
      architecture:
        "Ingestion of product docs and price sheets with region permissions, hybrid retrieval filtered by the user's region, a grounded-answer prompt with citations, and an abstain path when evidence is weak. Separate metrics for retrieval recall and answer correctness.",
      tools: ["an ingestion pipeline", "a vector plus keyword index", "an LLM", "retrieval and answer eval sets"],
      steps: [
        "Confirm RAG is the right tool: knowledge changes often, is private and needs citations, so yes.",
        "Build a question set with the correct source passage and the correct answer for each.",
        "Build the simplest pipeline end to end and measure retrieval recall and answer correctness separately.",
        "Classify each failure as retrieval miss or generation error and fix the larger group first.",
        "Add permissions, freshness checks and monitoring before launch, and keep adding real failures to the eval sets.",
      ],
    },
    example: {
      title: "Separating retrieval failures from generation failures",
      lang: "python",
      code: `def diagnose(case: dict, retrieve, generate, judge) -> str:
    chunks = retrieve(case["question"], k=5)
    found = any(c["doc_id"] == case["gold_doc_id"] for c in chunks)
    answer = generate(case["question"], chunks)
    correct = judge(answer, case["gold_answer"])
    if correct:
        return "ok"
    if not found:
        return "retrieval_miss"        # fix chunking, search, filters
    return "generation_error"          # fix prompt, citations, model

def report(cases, **fns) -> dict:
    out = {}
    for c in cases:
        label = diagnose(c, **fns)
        out[label] = out.get(label, 0) + 1
    return out
# e.g. {"ok": 61, "retrieval_miss": 27, "generation_error": 12}`,
      notes:
        "This one function tells the team where to spend the next week. If most failures are retrieval misses, prompt tweaks will not help; if the evidence was found but the answer is wrong, better search will not help.",
    },
    tradeoffs: [
      { issue: "RAG adds a whole pipeline (ingestion, indexes, retrieval) to maintain.", response: "Use it only when knowledge is changing, private or must be cited; for small, stable knowledge, put it directly in the prompt with caching." },
      { issue: "Retrieved text can be outdated, contradictory or injected.", response: "Track freshness, deduplicate versions, treat retrieved content as untrusted, and show sources." },
      { issue: "End-to-end scores hide which half is failing.", response: "Measure retrieval and generation separately and keep both numbers on the dashboard." },
    ],
    junior: "Builds RAG for everything, measures only whether final answers look right, and tweaks the prompt when the real problem is retrieval.",
    senior: "Decides when RAG is warranted, measures retrieval and generation separately, and fixes the failing half with the right tool.",
    reading: [
      { label: "Retrieval Augmented Generation series (Pinecone)", url: "https://www.pinecone.io/learn/series/rag/", kind: "blog" },
      { label: "100 Days of AI Engineering: RAG", url: "https://ai-engineer-roadmap-2026.vercel.app/100-days/rag/", kind: "docs" },
    ],
  },
  {
    moduleId: "M4.9",
    howItWorks:
      "A baseline RAG pipeline is a few explicit steps: embed the question, retrieve the top k chunks, assemble them into a prompt with instructions to answer only from them and cite them, call the model, and return the answer with sources. Building it by hand first, without a framework, shows exactly what the model sees. Teams then tune the obvious levers with measurements: k, chunk ordering, context formatting, and what happens when retrieved evidence is weak.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash's pipeline first condenses a multi-turn conversation into a summary of the core issue, uses that summary to retrieve similar past cases and articles, and then generates the reply. Rewriting the conversation into a good retrieval query is part of the baseline, not an advanced extra.",
        source: DOORDASH,
      },
      {
        who: "Lost in the Middle (research)",
        what: "Researchers found models use information best when it is at the start or end of the context and worst in the middle, which is why ordering retrieved chunks, and not just picking them, affects answer quality.",
        source: { label: "Liu et al.: Lost in the Middle", url: "https://arxiv.org/abs/2307.03172", kind: "paper" },
      },
    ],
    scenario: {
      title: "A hand-built RAG baseline for a university handbook",
      context:
        "A university wants students to ask questions about the 300-page student handbook. The team needs a working baseline in a week to show the dean.",
      architecture:
        "Chunks with embeddings in a small vector table; a `answer(question)` function that retrieves k chunks, formats them with ids and titles, asks the model to answer only from them with bracketed citations, and returns the answer plus the cited sources. No framework.",
      tools: ["an embedding model", "a vector table or NumPy index", "an LLM API", "a 40-question eval set"],
      steps: [
        "Write 40 real student questions with the correct answer and handbook section.",
        "Implement retrieve, assemble and generate as three plain functions, and print the full prompt for a few questions.",
        "Add the grounded-answer instructions: use only the excerpts, cite them by id, and say so when they do not contain the answer.",
        "Try k of 3, 5 and 8 and two orderings (best first, best last) and record accuracy and token cost.",
        "Freeze the best setting as the baseline that every later improvement must beat.",
      ],
    },
    example: {
      title: "Retrieve, assemble, generate",
      lang: "python",
      code: `def retrieve(question: str, index, embed, k: int = 5) -> list[dict]:
    return index.search(embed(question), k=k)          # [{"id", "title", "text", "score"}]

def assemble(question: str, chunks: list[dict]) -> str:
    ordered = sorted(chunks, key=lambda c: c["score"])  # best LAST, nearest the question
    context = "\\n\\n".join(f'<excerpt id="{c["id"]}" title="{c["title"]}">\\n{c["text"]}\\n</excerpt>' for c in ordered)
    return (f"{context}\\n\\nAnswer the student's question using only the excerpts above. "
            f"Cite excerpt ids like [h-12]. If the excerpts do not answer it, say you could not find it "
            f"in the handbook and suggest contacting student services.\\n\\nQuestion: {question}")

def answer(question: str, index, embed, llm, k: int = 5) -> dict:
    chunks = retrieve(question, index, embed, k)
    text = llm(assemble(question, chunks))
    cited = [c for c in chunks if f'[{c["id"]}]' in text]
    return {"answer": text, "sources": [{"id": c["id"], "title": c["title"]} for c in cited]}`,
      notes:
        "Every step is visible and testable. The most relevant excerpt sits right before the question, the prompt defines what to do when evidence is missing, and the response returns only the sources the answer actually cited.",
    },
    tradeoffs: [
      { issue: "Larger k improves the chance of including the answer but adds noise and cost.", response: "Measure accuracy and tokens across a few k values and pick the knee of the curve; add reranking if you need large k." },
      { issue: "Grounding instructions can make the model refuse answerable questions.", response: "Track both wrong answers and wrong refusals in the eval, and tune the instruction wording." },
      { issue: "Hand-built code needs more maintenance as features grow.", response: "Keep the hand-built baseline as the reference, and adopt a framework later only for parts it clearly simplifies." },
    ],
    junior: "Copies a framework's five-line RAG demo, never looks at the assembled prompt, and cannot explain why an answer is wrong.",
    senior: "Builds the baseline by hand, inspects the actual prompts, tunes k and ordering with measurements, and treats the result as the bar every later change must beat.",
    reading: [
      { label: "LlamaIndex: Building RAG from scratch", url: "https://developers.llamaindex.ai/python/framework/optimizing/building_rag_from_scratch/", kind: "docs" },
      { label: "Retrieval-Augmented Generation for LLMs: A Survey", url: "https://arxiv.org/pdf/2312.10997", kind: "paper" },
    ],
  },
  {
    moduleId: "M4.10",
    howItWorks:
      "Reranking is a second stage: retrieve a generous candidate set cheaply (for example the top 50 from hybrid search), then score each candidate against the query with a more accurate model such as a cross-encoder or a hosted rerank API, and keep only the best few for the prompt. Cross-encoders read the query and passage together, so they judge relevance much better than vector similarity, at the cost of extra latency per candidate. Teams add reranking when the right passage is often retrieved but not ranked near the top.",
    uses: [
      {
        who: "Anthropic (Contextual Retrieval)",
        what: "Adding a reranking step on top of contextual embeddings and contextual BM25 brought Anthropic's retrieval failure reduction from about half to about two thirds in their tests, the largest single gain after the hybrid step.",
        source: CONTEXTUAL,
      },
      {
        who: "Cohere Rerank",
        what: "Cohere's Rerank API takes a query and a list of documents and returns them ordered by relevance with a score for each, with multilingual models available. It is designed to sit after a first-stage search and reorder its results.",
        source: { label: "Cohere docs: Rerank overview", url: "https://docs.cohere.com/docs/rerank-overview", kind: "docs" },
      },
    ],
    scenario: {
      title: "Adding a reranker to a legal research assistant",
      context:
        "Lawyers ask detailed questions over thousands of contracts. The right clause is usually somewhere in the top 50 results but often not in the top 5 that fit in the prompt.",
      architecture:
        "Hybrid retrieval returns 50 candidates; a cross-encoder reranker scores each query-passage pair; the top 6 go to the model. Reranker latency and the rank of the gold passage before and after reranking are logged.",
      tools: ["a cross-encoder (sentence-transformers) or a rerank API", "hybrid retrieval", "a labelled query set", "latency metrics"],
      steps: [
        "Measure recall at 50 and recall at 6 without reranking; a big gap means reranking can help.",
        "Add the reranker over the 50 candidates and measure recall at 6 again.",
        "Measure the added latency and try 25 or 30 candidates if it is too slow.",
        "Set a minimum reranker score below which passages are dropped, to reduce noise.",
        "Re-run end-to-end answer accuracy to confirm the retrieval gain turns into better answers.",
      ],
    },
    example: {
      title: "Retrieve wide, rerank narrow",
      lang: "python",
      code: `from sentence_transformers import CrossEncoder

reranker = CrossEncoder("your-cross-encoder-model")

def retrieve_and_rerank(query: str, first_stage, keep: int = 6, min_score: float | None = None):
    candidates = first_stage(query, k=50)                     # cheap, high recall
    pairs = [(query, c["text"]) for c in candidates]
    scores = reranker.predict(pairs, batch_size=32)            # accurate, slower
    ranked = sorted(zip(candidates, scores), key=lambda x: -x[1])
    if min_score is not None:
        ranked = [(c, s) for c, s in ranked if s >= min_score]
    return [{**c, "rerank_score": float(s)} for c, s in ranked[:keep]]`,
      notes:
        "The first stage only needs to get the right passage somewhere in the 50; the reranker's job is to bring it into the 6 the model will see. Keeping the score lets you drop weak passages and study reranker behaviour later.",
    },
    tradeoffs: [
      { issue: "Reranking adds latency proportional to the number of candidates.", response: "Rerank 20 to 50 candidates, batch the scoring, use a small reranker or GPU, and measure p95." },
      { issue: "Hosted rerank APIs add cost and send text to another provider.", response: "Use an open cross-encoder you host when data cannot leave, and compare quality on your eval set." },
      { issue: "If the first stage misses the passage, reranking cannot help.", response: "Check recall at the candidate depth first; improve retrieval before adding a reranker." },
    ],
    junior: "Adds a reranker because a blog recommended it and never checks whether recall at the candidate depth was the problem.",
    senior: "Measures the gap between deep and shallow recall, adds reranking only when that gap is large, and tunes candidate count against latency.",
    reading: [
      { label: "Rerankers and two-stage retrieval (Pinecone)", url: "https://www.pinecone.io/learn/series/rag/rerankers/", kind: "blog" },
      { label: "Sentence Transformers: Retrieve & re-rank", url: "https://sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html", kind: "docs" },
    ],
  },
  {
    moduleId: "M4.11",
    howItWorks:
      "Users type short, vague or conversational questions that make poor search queries. Query transformation rewrites them before retrieval: condensing a chat history into a standalone question, expanding with synonyms or product names, generating several alternative queries and fusing their results (RAG-Fusion), or writing a hypothetical answer and searching with its embedding (HyDE). Each adds a model call, so teams use it where measurements show it lifts recall and skip it for queries that are already specific.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash's support system summarises the whole multi-turn conversation into the driver's core issue before retrieving. A follow-up like 'it still doesn't work' cannot be searched as is; the condensed issue can.",
        source: DOORDASH,
      },
      {
        who: "HyDE (research)",
        what: "HyDE has a model write a fictional answer to the query, embeds that draft, and retrieves real documents similar to it. It improved retrieval without any labelled training data, because the draft looks more like the target documents than the question does.",
        source: { label: "Gao et al.: Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE)", url: "https://arxiv.org/abs/2212.10496", kind: "paper" },
      },
    ],
    scenario: {
      title: "Better retrieval for follow-up questions in a docs assistant",
      context:
        "Developers chat with a documentation assistant. Follow-ups like 'and for the Python SDK?' or 'what about rate limits there?' retrieve nothing useful.",
      architecture:
        "A cheap model rewrites each turn into a standalone query using the last few messages. For broad questions, it also produces two alternative phrasings; all queries are searched and fused with RRF. Specific queries (containing code identifiers) skip expansion.",
      tools: ["a small fast LLM for rewriting", "hybrid retrieval", "RRF", "an eval set of multi-turn conversations"],
      steps: [
        "Collect 40 real multi-turn conversations and label the right doc for each follow-up.",
        "Measure recall when searching the raw last message.",
        "Add the standalone rewrite step and measure again; this usually gives the biggest gain.",
        "Add multi-query expansion only for broad questions and measure the extra gain and latency.",
        "Log the rewritten query in traces so bad rewrites are easy to spot and fix.",
      ],
    },
    example: {
      title: "Standalone rewrite plus multi-query fusion",
      lang: "python",
      code: `REWRITE = """Rewrite the user's last message as a standalone search query for our developer docs.
Use the conversation for missing context. Return only the query.
<conversation>{history}</conversation>
<last_message>{message}</last_message>"""

EXPAND = "Write 2 different search queries for the same need, one per line:\\n{query}"

def queries_for(history: str, message: str, small_llm) -> list[str]:
    q = small_llm(REWRITE.format(history=history, message=message)).strip()
    if any(ch in q for ch in "_.()") or len(q.split()) > 8:   # specific enough: skip expansion
        return [q]
    alts = [l.strip() for l in small_llm(EXPAND.format(query=q)).splitlines() if l.strip()]
    return [q] + alts[:2]

def search(history, message, small_llm, retrieve, rrf):
    qs = queries_for(history, message, small_llm)
    return rrf([[r["id"] for r in retrieve(q, k=20)] for q in qs])`,
      notes:
        "The rewrite fixes the most common failure (follow-ups without context) for one cheap call. Expansion is applied only to short, broad queries, and the fused ranking rewards documents found by several phrasings.",
    },
    tradeoffs: [
      { issue: "Every transformation adds a model call, latency and cost.", response: "Use a small fast model, run expansions in parallel, and skip transformation for already-specific queries." },
      { issue: "Rewrites can drift from what the user meant.", response: "Log rewrites, review bad ones, and keep the original query as one of the searched variants." },
      { issue: "HyDE drafts can contain plausible but wrong content that steers search astray.", response: "Use HyDE only where evals show a gain, and never show the hypothetical draft to users." },
    ],
    junior: "Adds four query transformation techniques at once without measuring any of them, tripling latency.",
    senior: "Starts with the standalone rewrite, adds expansion only where it helps on measured query types, and logs rewrites so they can be debugged.",
    reading: [
      { label: "Advanced RAG techniques (Pinecone)", url: "https://www.pinecone.io/learn/advanced-rag-techniques/", kind: "blog" },
      { label: "HyDE paper (arXiv)", url: "https://arxiv.org/abs/2212.10496", kind: "paper" },
    ],
  },
  {
    moduleId: "M4.12",
    howItWorks:
      "Grounding means the answer's claims are supported by the retrieved evidence, and production systems check it rather than trust it. They ask the model to cite passages for each claim, use provider citation features that point to exact source spans where available, check citations in code, run a grounding check before showing the answer in high-stakes products, and let the assistant say it does not know when evidence is weak. A citation that exists is not proof that the claim matches it, so teams test faithfulness separately.",
    uses: [
      {
        who: "Anthropic Citations API",
        what: "Claude can return answers split into claims with citations that point to exact sentences, character ranges or pages in the documents you supplied. Because the API extracts the cited text itself, the citations are guaranteed to point at real passages, and the quoted text is not billed as output.",
        source: { label: "Claude docs: Citations", url: "https://platform.claude.com/docs/en/build-with-claude/citations", kind: "docs" },
      },
      {
        who: "DoorDash",
        what: "DoorDash runs every generated support reply through a guardrail that checks grounding in the source articles, coherence and policy compliance, using a cheap similarity check first and an LLM evaluator only when needed. Replies that fail are not shown to the driver.",
        source: DOORDASH,
      },
    ],
    scenario: {
      title: "A medical-benefits assistant that must not invent coverage",
      context:
        "An insurer's assistant answers members' coverage questions. Inventing coverage could cost money and break regulations, so every claim needs a source and uncertain answers must say so.",
      architecture:
        "Retrieved policy sections are sent with citations enabled. The answer is checked: every sentence must carry a citation, cited passages must come from the member's plan, and a grounding judge checks that each claim is supported. Failures fall back to a templated 'I couldn't confirm this, here is how to reach us' with the most relevant sections linked.",
      tools: ["a provider citations feature or citation-tag prompting", "a grounding judge (LLM or NLI model)", "faithfulness metrics such as Ragas", "an eval set with unanswerable questions"],
      steps: [
        "Build an eval set where a third of the questions are deliberately not answerable from the plan documents.",
        "Enable citations and require one per factual sentence.",
        "Add code checks for missing citations and citations from the wrong plan, and a grounding judge for claim support.",
        "Define the abstain behaviour and measure both wrong answers and unnecessary refusals.",
        "Show citations in the UI so members and support staff can verify claims themselves.",
      ],
    },
    example: {
      title: "Requesting and checking citations",
      lang: "python",
      code: `from anthropic import Anthropic

client = Anthropic()

def grounded_answer(question: str, sections: list[dict]) -> dict:
    docs = [{"type": "document", "title": s["title"], "citations": {"enabled": True},
             "source": {"type": "text", "media_type": "text/plain", "data": s["text"]}}
            for s in sections]
    r = client.messages.create(
        model="your-model-id", max_tokens=600,
        messages=[{"role": "user", "content": docs + [{"type": "text", "text":
            f"{question}\\nAnswer only from the documents. If they do not answer it, say so."}]}],
    )
    claims = [{"text": b.text, "cites": [c.cited_text for c in (b.citations or [])]}
              for b in r.content if b.type == "text"]
    uncited = [c["text"] for c in claims if not c["cites"] and len(c["text"].split()) > 6]
    if uncited:
        return {"status": "needs_review", "uncited": uncited, "claims": claims}
    return {"status": "ok", "claims": claims}`,
      notes:
        "The citations point to exact passages from the supplied documents, so they cannot be fabricated. The code then flags substantive sentences with no citation. A separate grounding check is still needed to confirm a cited passage actually supports its claim.",
    },
    tradeoffs: [
      { issue: "Strict grounding increases refusals on questions that are answerable with inference.", response: "Measure refusals alongside errors, and allow clearly labelled reasoning that combines cited facts." },
      { issue: "Grounding checks add latency and cost to every answer.", response: "Use a cheap first check and escalate to an LLM judge only when it flags something, as DoorDash does." },
      { issue: "Citations can be correct passages that do not support the claim.", response: "Evaluate faithfulness claim by claim on a sample, not just whether citations exist." },
    ],
    junior: "Tells the model to 'cite sources' and assumes any bracketed reference in the answer means the answer is grounded.",
    senior: "Uses structured citations, checks them in code, runs grounding checks proportional to risk, designs a good abstain path, and measures faithfulness and refusals together.",
    reading: [
      { label: "Ragas: Faithfulness", url: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/", kind: "docs" },
      { label: "Extrinsic Hallucinations in LLMs (Lilian Weng)", url: "https://lilianweng.github.io/posts/2024-07-07-hallucination/", kind: "blog" },
    ],
  },
  {
    moduleId: "M4.13",
    howItWorks:
      "Advanced RAG patterns each target a specific failure. Corrective RAG grades retrieved documents and falls back (for example to web search) when they are poor. Self-RAG and adaptive RAG decide whether to retrieve at all. Iterative and multi-hop RAG retrieve again based on what was found, for questions that need several connected facts. Graph RAG builds a knowledge graph of entities and relations to answer questions about a whole collection. Teams choose a pattern only after their eval shows the failure it fixes, because each adds calls, latency and moving parts.",
    uses: [
      {
        who: "Microsoft Research (GraphRAG)",
        what: "Microsoft's GraphRAG has a model extract entities and relationships into a knowledge graph, clusters it into communities with pre-written summaries, and uses those at query time. They showed it handles questions like 'what are the main themes in this dataset' and multi-hop questions that baseline vector RAG struggles with.",
        source: { label: "Microsoft Research: GraphRAG", url: "https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/", kind: "blog" },
      },
      {
        who: "LinkedIn customer service",
        what: "LinkedIn represented past support tickets as a knowledge graph, keeping the structure within tickets and the links between related tickets, and retrieved sub-graphs to answer new questions, reporting large retrieval gains over flat-text RAG.",
        source: LINKEDIN,
      },
      {
        who: "Corrective RAG (research)",
        what: "CRAG adds a lightweight evaluator that rates how good the retrieved documents are and triggers different actions based on that confidence, including web search when the local corpus falls short, and filters retrieved text down to its useful parts.",
        source: { label: "Yan et al.: Corrective Retrieval Augmented Generation", url: "https://arxiv.org/abs/2401.15884", kind: "paper" },
      },
    ],
    scenario: {
      title: "Fixing multi-hop failures in a due-diligence assistant",
      context:
        "Analysts ask questions like 'which of our suppliers share a parent company with a sanctioned firm?'. Baseline RAG retrieves passages about each company but never connects them.",
      architecture:
        "Keep baseline RAG for simple questions. A router sends relationship questions to an iterative loop: retrieve, extract entities found, retrieve again for those entities, up to three hops, then answer with citations. A small entity-relationship graph built at ingestion speeds up the hops.",
      tools: ["a baseline RAG pipeline", "a router prompt", "an entity extraction step", "a graph store or adjacency table", "an eval set tagged by failure type"],
      steps: [
        "Tag eval failures by type (single-fact miss, multi-hop, whole-collection, weak retrieval) and count them.",
        "Pick the pattern that targets the largest group; here multi-hop, so iterative retrieval with entity extraction.",
        "Route only relationship-style questions to the new path so simple ones stay fast and cheap.",
        "Cap hops and log each hop's query and findings in the trace.",
        "Compare accuracy, latency and cost per question type against the baseline before rolling out.",
      ],
    },
    example: {
      title: "A capped multi-hop retrieval loop",
      lang: "python",
      code: `def multi_hop(question: str, retrieve, extract_entities, llm, max_hops: int = 3) -> dict:
    evidence, seen, known_entities, queries = [], set(), set(), [question]
    for hop in range(max_hops):
        new = []
        for q in queries:
            for chunk in retrieve(q, k=5):
                if chunk["id"] not in seen:
                    seen.add(chunk["id"]); evidence.append(chunk); new.append(chunk)
        if not new:
            break                                        # nothing new found: stop early
        entities = extract_entities(new) - known_entities  # companies not yet followed
        known_entities |= entities
        queries = [f"{e} parent company ownership" for e in sorted(entities)[:5]]
        if not queries:
            break
    answer = llm(question, evidence)                     # grounded answer with citations
    return {"answer": answer, "hops": hop + 1, "evidence_ids": [c["id"] for c in evidence]}`,
      notes:
        "The loop follows newly found entities to the next hop, stops when nothing new turns up, and never runs more than three hops. Recording hops and evidence ids makes these slower answers explainable to analysts.",
    },
    tradeoffs: [
      { issue: "Advanced patterns multiply model calls, latency and cost.", response: "Route only the question types that need them, and cap iterations." },
      { issue: "Graph construction with an LLM is expensive and needs refreshing as data changes.", response: "Build graphs only for collections where whole-dataset or relationship questions matter, and update incrementally." },
      { issue: "Teams adopt patterns because they are new, not because they fix a measured failure.", response: "Tag failures by type first and choose the pattern that targets the biggest group." },
    ],
    junior: "Rebuilds the system around the newest RAG paper without checking which failures the current system actually has.",
    senior: "Tags failures by type, picks the pattern that fixes the largest group, routes only those queries to it, and proves the gain with before-and-after measurements.",
    reading: [
      { label: "microsoft/graphrag", url: "https://github.com/microsoft/graphrag", kind: "docs" },
      { label: "Self-RAG: Learning to Retrieve, Generate, and Critique", url: "https://arxiv.org/pdf/2310.11511", kind: "paper" },
    ],
  },
  {
    moduleId: "M4.14",
    howItWorks:
      "Frameworks like LlamaIndex and LangChain package the RAG building blocks: document loaders, splitters, embedding and vector store integrations, retrievers, rerankers, query transforms and query engines. Teams use them to move faster and to swap components without rewriting glue code. The experienced pattern is to rebuild a hand-made baseline in the framework, confirm it scores the same on the eval set, and only then use framework features, so you know whether the framework or a change caused any difference.",
    uses: [
      {
        who: "IBM Research (Docling integrations)",
        what: "Docling provides integrations for LangChain, LlamaIndex, CrewAI and Haystack, so its layout-aware parsing can be dropped into a framework pipeline instead of writing custom loaders, which is the kind of reuse frameworks are good for.",
        source: { label: "Docling on GitHub", url: "https://github.com/docling-project/docling", kind: "docs" },
      },
      {
        who: "Anthropic's advice on frameworks",
        what: "Anthropic warns that frameworks can hide the actual prompts and responses and encourage unnecessary complexity, and advises understanding the code underneath any framework you use, which applies directly to RAG query engines.",
        source: { label: "Anthropic: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "blog" },
      },
    ],
    scenario: {
      title: "Moving a hand-built RAG baseline onto LlamaIndex",
      context:
        "Your hand-built handbook assistant works, but the team now wants to add reranking, PDF parsing for new sources and a second vector store, and maintaining all the glue is getting slow.",
      architecture:
        "LlamaIndex ingestion pipeline (loader, splitter, embedding) writing to the existing vector store, a retriever plus reranker postprocessor, and a query engine with the same grounded-answer prompt as before. The eval harness calls both implementations.",
      tools: ["LlamaIndex", "the existing vector store", "a reranker postprocessor", "the existing eval set", "tracing"],
      steps: [
        "Wrap the existing eval so it can call any `answer(question)` function.",
        "Rebuild the baseline in LlamaIndex with the same chunking, embedding model, k and prompt.",
        "Confirm the scores match the hand-built version within noise; investigate any gap by comparing prompts in traces.",
        "Add the reranker and new loaders using framework components and measure each change separately.",
        "Keep the hand-built version as a reference until the framework version has been stable for a few weeks.",
      ],
    },
    example: {
      title: "The same pipeline in LlamaIndex, with reranking",
      lang: "python",
      code: `from llama_index.core import PromptTemplate, Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.postprocessor import SentenceTransformerRerank

Settings.node_parser = SentenceSplitter(chunk_size=400, chunk_overlap=40)

docs = SimpleDirectoryReader("handbook/").load_data()
index = VectorStoreIndex.from_documents(docs)

qa_prompt = PromptTemplate(
    "{context_str}\\n\\nAnswer using only the excerpts above. If they do not answer it, "
    "say you could not find it in the handbook.\\nQuestion: {query_str}"
)

engine = index.as_query_engine(
    similarity_top_k=20,
    node_postprocessors=[SentenceTransformerRerank(model="your-cross-encoder-model", top_n=5)],
    text_qa_template=qa_prompt,
)
resp = engine.query("How many days of sick leave do part-time students get?")
print(resp, [n.node.metadata.get("file_name") for n in resp.source_nodes])`,
      notes:
        "The prompt and settings mirror the hand-built baseline, so the eval comparison is fair. Reranking is one line here, which is the framework's real benefit; `source_nodes` keeps sources visible for citations and debugging.",
    },
    tradeoffs: [
      { issue: "Framework defaults (chunk size, prompts) silently differ from your baseline.", response: "Set every important parameter explicitly and compare against the baseline on the same eval set." },
      { issue: "Upgrades can change behaviour or break integrations.", response: "Pin versions, run the eval in CI, and read changelogs before upgrading." },
      { issue: "Debugging is harder through layers of abstraction.", response: "Turn on tracing, log the final prompt, and keep the hand-built reference for comparison." },
    ],
    junior: "Builds the first version directly in a framework with all defaults and cannot tell whether a quality change came from the data, the settings or a library update.",
    senior: "Treats the framework as an implementation of a known baseline, matches it on the eval first, sets parameters explicitly, and adds framework features one measured change at a time.",
    reading: [
      { label: "LlamaIndex: Introduction to RAG", url: "https://developers.llamaindex.ai/python/framework/understanding/rag/", kind: "docs" },
      { label: "Build a semantic search engine with LangChain", url: "https://docs.langchain.com/oss/python/langchain/knowledge-base", kind: "docs" },
    ],
  },
];
