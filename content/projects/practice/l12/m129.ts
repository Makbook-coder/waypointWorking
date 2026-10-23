import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const EMB = ["Python 3.11 or newer", "A CLIP-style embedding model"];

export const P_M129: ProjectSrc[] = [
  practice("m12-9-a-shared-embedding-space", "review",
    pj("Review a claim about embeddings", 30, "Review a claim that image and text vectors can be compared directly and say what is missing.",
      [
        ["Read the starter claim and list what it assumes.", "Assumptions. Print the intermediate values to see them."],
        ["Mark what must be true for the claim to hold such as the same model for both.", "Conditions. Start with a single input before using many."],
        ["Name two ways it could silently break.", "Mixed models, normalisation."],
        ["Write a check that would catch each.", "Small tests. Take it one small step at a time."],
      ],
      "A review of the shared space claim with conditions, two silent failures and checks.",
      ["Assumptions listed", "Failures named", "Checks written"],
      "Look at CLIP-style joint embeddings next.", ["A text editor"]),
    { starter: code(
      "We store text vectors from model A and image vectors from model B in one index and compare them with dot product because both are 512 numbers long.") }),
  practice("m12-9-clip-style-joint-embeddings", "debug",
    pj("Zero-shot labels that always lose", 35, "Find why a zero-shot classifier never predicts one class and fix it.",
      [
        ["Read the starter results and count predictions per class.", "Confusion counts. Write down what you see before changing anything."],
        ["Check how that class prompt is worded compared with the others.", "Wording. Re-read the step and try the smallest version first."],
        ["Rewrite it and try a few templates.", "Three. Check one example by hand to be sure."],
        ["Re-run and report the per-class counts.", "Before and after. Save your work so you can compare later."],
      ],
      "A fixed zero-shot label with the cause found and per-class counts before and after.",
      ["Counts read and confirmed", "Wording compared", "Counts improved"],
      "Look at searching across modalities next.", EMB),
    { starter: code(
      "labels: 'dog' 'cat' 'a picture of a person riding a bicycle in the rain at night' | predictions over 50 images: dog 25, cat 25, person-bicycle 0 (true count 8)") }),
  practice("m12-9-searching-across-modalities", "extend",
    pj("Add a filter to the search", 35, "Extend an image search with a metadata filter that is applied before ranking.",
      [
        ["Read the starter search and its index layout.", "Fields. Ask what changed since the last run."],
        ["Add metadata such as date and source to the index.", "Store it. Print the intermediate values to see them."],
        ["Apply a filter before similarity ranking.", "Order matters. Start with a single input before using many."],
        ["Test with three filtered queries and print the results.", "Check. Take it one small step at a time."],
      ],
      "An image search with a metadata filter applied before ranking tested on three queries.",
      ["Metadata stored", "Filter applied first", "Three queries tested"],
      "Look at cross-modal against caption-then-search next.", EMB),
    { starter: code(
      "index = {'vectors': np.array([...]), 'paths': ['a.jpg', 'b.jpg', ...]}",
      "def search(query): scores = index['vectors'] @ embed_text(query); return top_k(scores, 5)") }),
  practice("m12-9-cross-modal-vs-caption-then-search", "optimise",
    pj("Cheaper captions, same recall", 40, "Cut the cost of caption-then-search while keeping recall about the same.",
      [
        ["Read the starter cost and recall figures.", "Baseline. Write down what you see before changing anything."],
        ["Try shorter captions and a cheaper captioning model.", "Two changes. Re-read the step and try the smallest version first."],
        ["Re-measure recall on the same queries.", "Table. Check one example by hand to be sure."],
        ["Pick the cheapest setup within two points of the baseline recall.", "State the rule. Save your work so you can compare later."],
      ],
      "A cheaper captioning setup with recall within two points of the baseline.",
      ["Baseline read", "Two changes measured", "Setup chosen"],
      "Look at where cross-modal retrieval fails next.", ["Python 3.11 or newer", "A multimodal model API"]),
    { starter: code(
      "Captioner: large model, 150-word captions, 0.012 per image. 20,000 images => 240 dollars. recall@5 = 0.81 on 40 queries.") }),
  practice("m12-9-where-cross-modal-retrieval-fails", "reimplement",
    pj("A reranker from scratch", 45, "Build a simple reranker that fixes a class of cross-modal retrieval failure.",
      [
        ["Pick one failure class such as counting or text in images.", "Evidence. Ask what changed since the last run."],
        ["Write a reranker that checks the top ten results with a vision model.", "Yes or no. Print the intermediate values to see them."],
        ["Run it on your failing queries and a control set.", "Both. Start with a single input before using many."],
        ["Report fixed failures, new errors and extra cost.", "Table. Take it one small step at a time."],
      ],
      "A reranker for one failure class with fixed failures, new errors and extra cost reported.",
      ["Failure class picked", "Reranker run on both sets", "Cost reported"],
      "Look at evaluating on your own collection next.", ["Python 3.11 or newer", "A CLIP-style embedding model", "A multimodal model API"])),
  practice("m12-9-evaluating-on-your-own-collection", "challenge",
    pj("An honest search evaluation", 55, "Build an evaluation of a cross-modal search that you would trust before shipping, with no steps given.",
      [],
      "An evaluation set, a recall report and a list of queries the search cannot answer.",
      ["At least 50 queries written by people other than the builder where possible", "Recall at several cutoffs and a ranking measure", "Results split by query type", "A short list of failing query types and a decision on shipping"],
      "Return to the capstone: a cross-modal search tool.", EMB),
    { hints: ["Queries you write while looking at the images are easier than real ones; ask someone else.", "Report results by query type since averages hide the weak spots.", "Keep a held-out set you never tune on."] }),
];
