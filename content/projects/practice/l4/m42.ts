import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M42: ProjectSrc[] = [
  practice("m4-2-why-documents-must-be-split", "challenge",
    pj("Prove splitting helps", 40, "Show with an experiment that searching pieces beats searching whole documents, with no steps given.",
      [],
      "A short report with recall and tokens sent for whole-document and chunk search over the same questions.",
      ["At least 15 questions with known answer passages", "Whole-document and chunk search both measured", "Tokens sent to the model compared", "One question type where splitting does not help is named"],
      "Look at the different splitting methods next.", ["Python 3.11 or newer"]),
    { hints: ["Use long documents so the difference is visible.", "A hit means the retrieved text contains the answer passage.", "Count characters or tokens in what you would send to the model."] }),
  practice("m4-2-fixed-recursive-structural-and-semantic", "reimplement",
    pj("Mini recursive splitter", 45, "Reimplement the recursive character splitter used by popular libraries and compare it with the real one.",
      [
        ["Write `split(text, size, separators)` that tries paragraph breaks, then lines, then sentences, then words.", "Fall back to the next separator when a piece is too big."],
        ["Merge small pieces back together up to the size limit.", "Do not exceed the limit."],
        ["Add overlap by repeating the last part of the previous chunk.", "Check the overlap in a test."],
        ["Compare your chunks with a library splitter on the same text and explain any differences.", "Use identical settings."],
      ],
      "A working recursive splitter with overlap that is compared against a library implementation.",
      ["Separators tried in order", "Small pieces merged", "Compared with the library"],
      "Look at size, overlap and metadata next.", ["Python 3.11 or newer"]),
    {}),
  practice("m4-2-size-overlap-boundaries-and-metadata", "optimise",
    pj("Tune the chunker", 45, "Tune a slow, poorly performing chunker for retrieval quality and speed.",
      [
        ["Run the starter chunker on the sample documents and record the chunk count, time and recall at 3.", "Use the question set provided."],
        ["Find the setting that hurts most, such as zero overlap or cutting mid-sentence.", "Look at some bad chunks."],
        ["Change the splitting to respect sentence boundaries and add overlap.", "Change one thing at a time."],
        ["Speed up the code by avoiding repeated string joins and measure again.", "Report both quality and time."],
      ],
      "A tuned chunker with recall and time before and after, and the setting that mattered most.",
      ["Baseline measured", "Boundary and overlap changes tested one at a time", "Speed measured again"],
      "Look at precise versus context-rich chunks next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def chunk(text, size=500):",
      "    out = ''",
      "    pieces = []",
      "    for ch in text:",
      "        out += ch",
      "        if len(out) == size:",
      "            pieces.append(out)",
      "            out = ''",
      "    return pieces") }),
  practice("m4-2-precise-chunks-vs-context-rich-chunks", "review",
    pj("Review a chunking config", 35, "Review a chunking and retrieval configuration and identify its risks.",
      [
        ["Read the configuration above and list what each setting does to precision and context.", "Write one line for each."],
        ["Find at least three risks, such as tiny chunks losing context or huge chunks diluting the embedding.", "Quote the setting for each."],
        ["Propose a change for each risk and say what you would measure to check it.", "Name the metric you would use for each change."],
        ["Test one proposed change on five questions.", "Report the result honestly."],
      ],
      "A review with three risks, proposed changes with metrics and one tested change.",
      ["Settings explained", "Three risks found", "One change tested"],
      "Go on to embeddings fundamentals in M4.3.", ["Python 3.11 or newer"]),
    { starter: code(
      "chunk_size = 80          # tokens",
      "chunk_overlap = 0",
      "top_k = 12",
      "embed_text = chunk.text  # no title or heading",
      "send_to_llm = all 12 chunks, each cut mid-sentence") }),
];
