import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M46: ProjectSrc[] = [
  practice("m4-6-lexical-retrieval-and-bm25", "reimplement",
    pj("Inverted index and BM25", 50, "Reimplement a tiny search engine with an inverted index and BM25 scoring.",
      [
        ["Write a tokeniser and build an inverted index mapping each term to the documents containing it.", "Store term counts too."],
        ["Implement BM25 using the index so you only score documents that contain a query term.", "Use `k1 = 1.5` and `b = 0.75`."],
        ["Compare your top 5 with a library on 10 queries.", "Explain any differences."],
        ["Time your index against scoring every document and report the difference.", "Use 10,000 documents."],
      ],
      "A small BM25 engine over an inverted index that matches a library and is faster than scoring everything.",
      ["Inverted index built", "BM25 matches a library", "Speed compared"],
      "Look at sparse versus dense retrieval next.", ["Python 3.11 or newer", "rank_bm25"]),
    {}),
  practice("m4-6-sparse-vs-dense-retrieval", "review",
    pj("Review a retrieval comparison", 30, "Review a write-up that claims one retrieval method is better and find what is wrong with it.",
      [
        ["Read the write-up above and list its claims.", "Mark which have numbers."],
        ["Find at least three flaws, such as a tiny test set, one query type or different chunk sets.", "Quote each flaw from the write-up in your review."],
        ["Write the experiment that would fix each flaw.", "Keep it practical."],
        ["Run the cheapest fix and say whether the conclusion survives.", "Report the numbers."],
      ],
      "A review of the comparison with three flaws, fixes and one rerun.",
      ["Claims listed", "Three flaws quoted", "One fix run and reported"],
      "Look at hybrid retrieval with fusion next.", ["Python 3.11 or newer", "rank_bm25, sentence-transformers"]),
    { starter: code(
      "Result: dense retrieval beats BM25 (recall@3 0.8 vs 0.6) on 5 queries.",
      "BM25 used the full documents; dense used 200-token chunks with a different tokeniser.",
      "All queries were paraphrased questions. Conclusion: dense retrieval is better, so we drop BM25.") }),
  practice("m4-6-hybrid-retrieval-with-rrf", "debug",
    pj("The broken fusion", 40, "Find why a fusion function returns a strange order and fix it.",
      [
        ["Run the starter with two short lists and write down the order you expect.", "Compute the scores by hand."],
        ["Compare the output with your hand calculation.", "Find the first mismatch."],
        ["Fix the rank handling and the handling of items found in only one list.", "Ranks start at one."],
        ["Add tests for ties, a one-list item and empty lists.", "Assert exact order."],
      ],
      "A correct fusion function and tests for ties, one-list items and empty lists.",
      ["Expected order computed by hand", "Bugs found and fixed", "Edge cases tested"],
      "Look at when hybrid retrieval helps next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def rrf(lists, k=60):",
      "    scores = {}",
      "    for lst in lists:",
      "        for rank, doc in enumerate(lst):          # rank starts at 0",
      "            scores[doc] = scores.get(doc, 1 / (k + rank))   # overwrites instead of adding",
      "    return sorted(scores, key=scores.get)         # ascending order") }),
  practice("m4-6-when-hybrid-retrieval-helps", "optimise",
    pj("Cheaper hybrid", 40, "Reduce the cost and latency of a hybrid search without losing recall.",
      [
        ["Run the starter and record recall at 5, latency and the number of candidates fetched.", "Use the same 30 queries for the baseline and every change."],
        ["Lower the number of candidates from each method and measure recall.", "Find the smallest number that holds recall."],
        ["Run the two searches in parallel and measure latency.", "Use threads or async."],
        ["Cache the query embedding and repeated queries.", "Report the new latency."],
      ],
      "A hybrid search with fewer candidates, parallel retrieval and caching, with recall and latency before and after.",
      ["Baseline measured", "Candidates reduced with recall held", "Parallel and cached latency reported"],
      "Go on to the hybrid search engine capstone in M4.7.", ["Python 3.11 or newer", "rank_bm25, sentence-transformers"]),
    { starter: code(
      "def hybrid(query):",
      "    dense = dense_search(query, k=200)",
      "    sparse = bm25_search(query, k=200)",
      "    return rrf([dense, sparse])[:5]   # runs one after the other, embeds the query every time") }),
];
