import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M43: ProjectSrc[] = [
  practice("m4-3-what-an-embedding-represents", "debug",
    pj("Why are these not similar", 35, "Find why two sentences that should be close score as unrelated, and why unrelated ones score high.",
      [
        ["Run the starter and look at the similarity scores for the sentence pairs.", "Note which scores look wrong."],
        ["Check whether the vectors are from the same model and normalised.", "Print the vector lengths."],
        ["Fix the bug that makes the scores unreliable.", "The pairs include negations, which may stay close."],
        ["Explain which wrong scores come from the bug and which from the model's limits.", "Back your explanation with the scores you printed."],
      ],
      "Corrected scores and a note separating a code bug from a limit of embeddings.",
      ["Wrong scores identified", "Bug found and fixed", "Limits of the model explained"],
      "Look at generating embeddings next.", ["Python 3.11 or newer", "sentence-transformers"]),
    { starter: code(
      "a = model.encode('The invoice was paid on time')",
      "b = model2.encode('The invoice was not paid on time')   # a different model",
      "score = float(a[:300] @ b[:300])   # truncated and not normalised",
      "print(score)") }),
  practice("m4-3-generating-embeddings", "extend",
    pj("Batch, cache and retry", 40, "Extend a one-at-a-time embedding loop with batching, a cache and retries.",
      [
        ["Run the starter on 100 chunks and time it.", "Count the API calls."],
        ["Send the chunks in batches and measure again.", "Respect the provider's batch limit."],
        ["Add a cache keyed by text hash so reruns cost nothing.", "Store the cache on disk so it survives restarts."],
        ["Add retries with backoff for temporary errors and test it with a fake client.", "Cap the retries so a bad case cannot loop forever."],
      ],
      "An embedding function with batching, a cache and retries, with before and after timings.",
      ["Batching reduces calls", "Cache makes reruns free", "Retries tested with a fake client"],
      "Look at choosing an embedding model next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "vectors = []",
      "for chunk in chunks:",
      "    vectors.append(client.embeddings.create(model=MODEL, input=chunk).data[0].embedding)") }),
  practice("m4-3-choosing-an-embedding-model", "review",
    pj("Review a model choice", 30, "Review an embedding model decision and find what evidence is missing.",
      [
        ["Read the decision note above and list its claims.", "Mark which have evidence."],
        ["Find at least three gaps, such as no test on your own data, no cost estimate and no language check.", "Quote each gap in the note so a reader can find it."],
        ["Write the test that would settle each gap.", "Make them cheap to run."],
        ["Run the cheapest one and report the result.", "Say whether the decision stands."],
      ],
      "A review of the decision with three gaps, tests for each and one result.",
      ["Claims listed", "Three gaps found", "One test run"],
      "Look at vector spaces that cannot be mixed next.", ["Python 3.11 or newer", "sentence-transformers"]),
    { starter: code(
      "Decision: we use the biggest model because it tops a public leaderboard.",
      "It has 3072 dimensions. Our documents are in German and English. Estimated 2M chunks.",
      "We have not tried any other model on our data.") }),
  practice("m4-3-vector-spaces-cannot-be-mixed", "challenge",
    pj("Safe model upgrade", 45, "Design and prove a safe way to move a vector index to a new embedding model, with no steps given.",
      [],
      "A migration script and a test showing queries never run against vectors from a different model.",
      ["The old index stays usable until the new one is ready", "Every index records its model name and dimension", "Queries from the wrong model are refused", "Recall is compared before and after migration"],
      "Go on to similarity and semantic search in M4.4.", ["Python 3.11 or newer", "sentence-transformers"]),
    { hints: ["Write the model name and dimension into the index header when you create it.", "Build the new index beside the old one and switch with a single setting.", "Test the refusal by deliberately querying with the wrong model."] }),
];
