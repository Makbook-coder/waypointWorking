import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M410: ProjectSrc[] = [
  practice("m4-10-retrieve-many-rerank-send-the-best", "extend",
    pj("Add a second stage", 40, "Extend a single-stage retriever with a reranking stage and a switch.",
      [
        ["Run the starter retriever on 20 questions and record recall at 5.", "Save the baseline."],
        ["Retrieve 30 candidates instead of 5 and rerank with a cross-encoder.", "Return the best 5."],
        ["Add a setting that turns reranking off.", "Test both modes so you know the switch works."],
        ["Compare recall at 5 and latency with and without reranking.", "Report recall and latency together for both modes."],
      ],
      "A retriever with a switchable reranking stage and a recall and latency comparison.",
      ["Thirty candidates fetched", "Reranking switchable", "Quality and latency compared"],
      "Look at cross-encoders next.", ["Python 3.11 or newer", "sentence-transformers"]),
    { starter: code(
      "def retrieve(question):",
      "    return vector_store.search(embed(question), k=5)") }),
  practice("m4-10-cross-encoder-and-reranking-models", "reimplement",
    pj("Train a toy reranker", 55, "Reimplement the idea of a reranker by training a small model that scores query and chunk pairs.",
      [
        ["Build 200 labelled pairs, relevant and not relevant, from your corpus.", "Split train and test."],
        ["Create features such as embedding similarity, word overlap and length ratio.", "Compute them for each pair."],
        ["Train a logistic regression on the features and evaluate on the test pairs.", "Report accuracy on the held-out test pairs only."],
        ["Use it to rerank retrieved lists and compare recall at 3 with a real cross-encoder.", "Explain the gap using your features and the real model."],
      ],
      "A toy feature-based reranker evaluated on held-out pairs and compared with a real cross-encoder.",
      ["Labelled pairs split into train and test", "Model trained and evaluated", "Compared with a cross-encoder"],
      "Look at relevance gained against latency next.", ["Python 3.11 or newer", "scikit-learn, sentence-transformers"]),
    {}),
  practice("m4-10-relevance-gained-latency-added", "optimise",
    pj("Faster reranking", 40, "Cut reranking latency while keeping quality.",
      [
        ["Run the starter and record recall at 5 and the time to rerank 50 candidates.", "Time several runs."],
        ["Batch the pairs and use a smaller maximum length.", "Measure again after the change to see the effect."],
        ["Reduce the number of candidates and see where recall starts to fall.", "Pick the smallest safe number."],
        ["Try a smaller reranking model and compare.", "Report quality and time."],
      ],
      "A reranker that is several times faster with recall within a stated tolerance.",
      ["Baseline timed", "Batching and length cut tested", "Candidates and model size compared"],
      "Look at when reranking adds little next.", ["Python 3.11 or newer", "sentence-transformers"]),
    { starter: code(
      "scores = []",
      "for chunk in candidates:                     # 50 candidates, one model call each",
      "    scores.append(cross_encoder.predict([(query, chunk.text)])[0])   # max length 512") }),
  practice("m4-10-when-reranking-adds-little", "review",
    pj("Review the rerank claim", 30, "Review a report that says reranking is essential and decide whether the data supports it.",
      [
        ["Read the report above and list its claims and evidence.", "Note the sample size."],
        ["Find at least three problems, such as an easy test set or no latency figure.", "Quote each problem from the report in your review."],
        ["Write what you would measure to test the claim properly.", "Name the metrics you would use to test the claim."],
        ["Write a corrected summary of what the data does show.", "Keep it to three sentences."],
      ],
      "A review with three problems, a better measurement plan and a corrected summary.",
      ["Claims and evidence listed", "Three problems quoted", "Corrected summary"],
      "Go on to query transformation in M4.11.", ["Python 3.11 or newer"]),
    { starter: code(
      "Report: reranking improved recall@5 from 0.90 to 0.93 on 10 queries, so we rerank every request.",
      "The rerank step takes about 400 ms on a CPU. All queries were long natural-language questions.",
      "Conclusion: reranking is essential for all our search.") }),
];
