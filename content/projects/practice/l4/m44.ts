import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M44: ProjectSrc[] = [
  practice("m4-4-cosine-dot-product-and-euclidean", "reimplement",
    pj("Similarity from scratch", 40, "Reimplement the three similarity measures and a top-k search with only numpy, then check them against a library.",
      [
        ["Write dot product, cosine similarity and Euclidean distance as functions.", "Do not call library similarity functions."],
        ["Write `top_k(query, matrix, k, metric)` that uses one matrix operation for all chunks.", "Avoid a Python loop over chunks."],
        ["Compare your top-k lists with a library on random vectors and on real embeddings.", "They should match."],
        ["Time your search for 100,000 vectors and explain what dominates the cost.", "Use a simple profile."],
      ],
      "Your own similarity functions and top-k search that match a library and a note on where time goes.",
      ["Three measures implemented", "Top-k uses one matrix operation", "Matches the library"],
      "Look at semantic search from scratch next.", ["Python 3.11 or newer", "numpy"]),
    {}),
  practice("m4-4-semantic-search-from-scratch", "optimise",
    pj("Speed up the search", 40, "Speed up a slow search loop without changing its results.",
      [
        ["Run the starter on 20,000 vectors and time one query.", "Save its top-5 results."],
        ["Replace the Python loop with a matrix operation and use `float32`.", "Check the results are the same."],
        ["Pre-normalise the vectors and use dot product for cosine.", "Measure again after normalising to check nothing changed."],
        ["Find the top k with a partial sort instead of sorting all scores.", "Measure again and report all three speedups."],
      ],
      "A search that is many times faster with identical results and a record of each speedup.",
      ["Baseline timed", "Results unchanged after each change", "Each speedup reported"],
      "Look at semantic versus keyword matching next.", ["Python 3.11 or newer", "numpy"]),
    { starter: code(
      "def search(query_vec, vectors, k=5):",
      "    scores = []",
      "    for i, v in enumerate(vectors):          # list of Python lists of float64",
      "        dot = sum(a * b for a, b in zip(query_vec, v))",
      "        norm = (sum(a * a for a in query_vec) ** 0.5) * (sum(b * b for b in v) ** 0.5)",
      "        scores.append((dot / norm, i))",
      "    return sorted(scores, reverse=True)[:k]") }),
  practice("m4-4-semantic-similarity-vs-keyword-match", "extend",
    pj("Add keyword fallback", 40, "Extend a semantic search with an exact-match step for ids and quoted phrases.",
      [
        ["Run the starter on five queries, two of which contain an error code.", "Note which ones fail."],
        ["Detect ids and quoted phrases in the query with a regular expression.", "Test the pattern on examples."],
        ["Search for those terms exactly and put matches first, then fill with semantic results.", "Remove duplicates."],
        ["Measure recall at 3 on 15 queries before and after.", "Include queries without ids to check nothing broke."],
      ],
      "A search with exact-match handling for ids and quotes with recall before and after.",
      ["Ids and quotes detected", "Exact matches ranked first", "No regression on other queries"],
      "Look at where semantic search fails next.", ["Python 3.11 or newer", "numpy, sentence-transformers"]),
    { starter: code(
      "def search(query):",
      "    q = model.encode(query, normalize_embeddings=True)",
      "    scores = matrix @ q",
      "    return [chunks[i] for i in scores.argsort()[::-1][:3]]") }),
  practice("m4-4-where-semantic-search-fails", "debug",
    pj("Why did it miss", 40, "Find out why a search misses queries that should be easy, and fix the real cause.",
      [
        ["Run the starter on the five failing queries and print the rank of the right chunk.", "Note how far down it is."],
        ["Check whether chunks and queries were embedded the same way, for example with or without a prefix.", "Print what was embedded."],
        ["Fix the mismatch and rerun.", "Check that the ranks improve."],
        ["Write which remaining misses are real limits of semantic search and which were bugs.", "Back each claim with a score or a rank you measured."],
      ],
      "Ranks that improve after fixing an embedding mismatch and a list separating bugs from real limits.",
      ["Right-chunk ranks printed", "Embedding mismatch found", "Bugs separated from limits"],
      "Go on to vector databases in M4.5.", ["Python 3.11 or newer", "numpy, sentence-transformers"]),
    { starter: code(
      "chunk_vecs = model.encode(['passage: ' + c for c in chunks])",
      "query_vec = model.encode('what is the refund window?')   # no 'query: ' prefix",
      "scores = chunk_vecs @ query_vec   # vectors not normalised") }),
];
