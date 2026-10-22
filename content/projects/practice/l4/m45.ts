import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M45: ProjectSrc[] = [
  practice("m4-5-storing-vectors-in-pgvector-or-qdrant", "extend",
    pj("Add a vector table properly", 40, "Extend a quick vector table with the right types, an index and batch inserts.",
      [
        ["Run the starter schema and insert 1,000 chunks one by one.", "Time the loop with a timer so you have a baseline."],
        ["Add an index suited to cosine search and a unique chunk id.", "Check the dimension matches the model."],
        ["Insert in batches and measure again.", "Count rows afterwards."],
        ["Write a test that inserts, queries and deletes a few rows.", "Use a test database."],
      ],
      "A vector table with an index, batched inserts and a passing test, with timings before and after.",
      ["Index and unique id added", "Batch insert faster", "Round-trip test passes"],
      "Look at top-k search with filters next.", ["Docker", "Python 3.11 or newer", "psycopg or qdrant-client"]),
    { starter: code(
      "CREATE TABLE chunks (id serial, text text, embedding vector);",
      "-- no dimension, no index, no source column",
      "for c in chunks: cur.execute('INSERT INTO chunks (text, embedding) VALUES (%s, %s)', (c.text, c.vec))") }),
  practice("m4-5-top-k-search-with-metadata-filters", "review",
    pj("Review a filtered query", 35, "Review a filtered search function for correctness and security.",
      [
        ["Read the function above and write what each filter does.", "Note anything user-controlled."],
        ["Find at least three problems, such as building the query by pasting text or ignoring an access level.", "Quote the exact lines that cause each problem."],
        ["Rewrite the function with parameters and an enforced access filter.", "Keep the signature."],
        ["Write tests that try to read another user's documents and a malicious filter string.", "Both must fail safely."],
      ],
      "A review with three problems, a safe rewrite and tests for access and injection attempts.",
      ["Problems quoted", "Rewrite uses parameters", "Access tests pass"],
      "Look at why ANN search exists next.", ["Python 3.11 or newer", "psycopg or qdrant-client"]),
    { starter: code(
      "def search(vec, k, source=None, user=None):",
      "    sql = f\"SELECT text FROM chunks WHERE source = '{source}' ORDER BY embedding <=> '{vec}' LIMIT {k}\"",
      "    return db.execute(sql)   # user is never checked") }),
  practice("m4-5-why-ann-search-exists", "reimplement",
    pj("Mini approximate index", 55, "Reimplement a simple approximate nearest-neighbour index with random partitions and compare it with exact search.",
      [
        ["Create 100,000 random vectors and find exact top-10 answers for 50 queries.", "Save them as truth."],
        ["Build an IVF-style index: pick centroids, assign each vector to its nearest one.", "Use k-means or random centroids."],
        ["At query time search only the closest few partitions and return the top 10.", "Make the number of partitions configurable."],
        ["Measure recall and speed for different numbers of partitions searched.", "Tabulate recall and speed for each setting."],
      ],
      "A small IVF-style index with recall and speed measured against exact search for several settings.",
      ["Exact answers saved", "Partition index built", "Recall against speed tabulated"],
      "Look at HNSW and IVF trade-offs next.", ["Python 3.11 or newer", "numpy"]),
    {}),
  practice("m4-5-hnsw-and-ivf-trade-offs", "challenge",
    pj("Hit the recall target", 45, "Choose index settings that reach 95 percent recall at the lowest latency, with no steps given.",
      [],
      "A table of settings tried and the chosen configuration with recall, latency and memory.",
      ["Exact results computed for at least 50 queries", "At least four settings tried", "Chosen setting reaches 95 percent recall", "Memory and build time recorded"],
      "Look at indexing, updates and deletes next.", ["Python 3.11 or newer", "numpy, faiss-cpu"]),
    { hints: ["Compute exact search first and use it as the truth.", "Raise `efSearch` or `nprobe` until recall reaches the target, then stop.", "Record the build time and memory of each index, not only the speed."] }),
  practice("m4-5-indexing-updates-and-deletes", "debug",
    pj("Ghost chunks", 40, "Find why deleted and edited documents still appear in answers, and fix the pipeline.",
      [
        ["Run the starter update on a document and search for its old text.", "Note that old text is still returned."],
        ["Count rows for the document before and after the update.", "Look for duplicates."],
        ["Fix the update so old chunks are removed before new ones are added, using a document id.", "Do it in one transaction if you can."],
        ["Write a test that updates and deletes a document and asserts the counts.", "Check search results too."],
      ],
      "An update path that leaves no old chunks and a test that proves it for edits and deletes.",
      ["Duplicates found", "Old chunks removed first", "Edit and delete tested"],
      "Go on to sparse and hybrid retrieval in M4.6.", ["Docker", "Python 3.11 or newer", "psycopg or qdrant-client"]),
    { starter: code(
      "def update(doc_id, new_text):",
      "    for chunk in split(new_text):",
      "        store.add(id=uuid4(), text=chunk, vec=embed(chunk), doc=doc_id)",
      "def delete(doc_id):",
      "    store.mark_deleted(doc_id)   # search never checks this flag") }),
];
