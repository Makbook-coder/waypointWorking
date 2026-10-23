import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const PY = ["Python 3.11 or newer"];
const MM = ["Python 3.11 or newer", "Access to two multimodal model APIs"];

export const P_M1210: ProjectSrc[] = [
  practice("m12-10-start-from-the-modalities", "extend",
    pj("Add the output side", 30, "Extend a requirements list that only covers inputs with the outputs and constraints it forgot.",
      [
        ["Read the starter list and note it has only inputs.", "Count. Write down what you see before changing anything."],
        ["Add the output modalities the product needs.", "Text, audio, image."],
        ["Add constraints for each such as latency and language.", "Short. Re-read the step and try the smallest version first."],
        ["Re-filter a model list and show how the shortlist changes.", "Before and after. Check one example by hand to be sure."],
      ],
      "A complete requirements list with outputs and constraints and a shortlist before and after.",
      ["Outputs added", "Constraints added", "Shortlist compared"],
      "Look at per-image and per-minute pricing next.", PY),
    { starter: code(
      "Product: field service app. Inputs: photos of equipment, voice notes. Output: not specified. Languages: not specified.") }),
  practice("m12-10-per-image-and-per-minute-pricing", "debug",
    pj("The price comparison that was wrong", 30, "Find why a pricing comparison picked the wrong model and correct it.",
      [
        ["Read the starter comparison and its units.", "List them. Save your work so you can compare later."],
        ["Recompute each cost for the same workload in the same unit.", "One table. Ask what changed since the last run."],
        ["Spot the mistake such as per-thousand mixed with per-million.", "Find it. Print the intermediate values to see them."],
        ["Write the corrected ranking and what it changes.", "Short. Start with a single input before using many."],
      ],
      "A corrected pricing comparison with the unit mix-up found and the new ranking.",
      ["Units listed", "Costs recomputed", "Ranking corrected"],
      "Look at the context cost of images next.", PY),
    { starter: code(
      "Model A: 0.0005 per image. Model B: 3 dollars per million tokens, an image is about 800 tokens. Model C: 0.006 per audio second.",
      "Workload: 40,000 images and 100 hours of audio per month. Sheet says A 20, B 2.4, C 2,160.") }),
  practice("m12-10-the-context-cost-of-images", "optimise",
    pj("Fit more in the window", 35, "Reduce the context used by images in a long chat without losing the answers.",
      [
        ["Read the starter chat and compute context use.", "Per turn. Take it one small step at a time."],
        ["Downscale older images and drop duplicates.", "Policy. Write down what you see before changing anything."],
        ["Replace very old images with short captions.", "Another policy. Re-read the step and try the smallest version first."],
        ["Re-run the questions and report answers kept and context saved.", "Both. Check one example by hand to be sure."],
      ],
      "A context policy for images with answers kept and context saved reported.",
      ["Use computed", "Policies applied", "Both reported"],
      "Look at latency by modality next.", MM),
    { starter: code(
      "Chat: 12 turns, each with a 1536x1024 photo (about 1,100 tokens), model window 8,000 tokens. Turn 8 fails with a context error.") }),
  practice("m12-10-latency-by-modality", "review",
    pj("Review a latency claim", 30, "Review a claim that images add no latency and say what evidence is missing.",
      [
        ["Read the starter claim and how it was measured.", "Method. Save your work so you can compare later."],
        ["Mark weaknesses such as one run and a tiny image.", "List. Ask what changed since the last run."],
        ["Design the measurement that would settle it.", "Sizes and runs. Print the intermediate values to see them."],
        ["Write what result would change your mind.", "A threshold. Start with a single input before using many."],
      ],
      "A review of a latency claim with weaknesses, a better measurement and a decision threshold.",
      ["Method read and confirmed", "Weaknesses listed", "Better measurement designed"],
      "Look at API against self-hosting next.", ["A text editor"]),
    { starter: code(
      "Claim: adding an image to a request adds no meaningful latency. Test: one request with a 64x64 icon, 640 ms vs 655 ms for text only.") }),
  practice("m12-10-api-vs-self-hosting", "reimplement",
    pj("A break-even model of your own", 35, "Rebuild a break-even model for API versus self-hosting from your own assumptions.",
      [
        ["List your inputs: price per request, GPU price, throughput and ops time.", "With sources. Take it one small step at a time."],
        ["Write a function for cost at a given volume for each option.", "Two functions. Write down what you see before changing anything."],
        ["Find the break-even volume numerically.", "Search. Re-read the step and try the smallest version first."],
        ["Vary two assumptions by plus and minus a third and show how the break-even moves.", "Table. Check one example by hand to be sure."],
      ],
      "A break-even model with a computed break-even volume and a sensitivity table.",
      ["Inputs listed", "Break-even found", "Sensitivity shown"],
      "Look at privacy for voice, faces and scans next.", PY)),
  practice("m12-10-privacy-for-voice-faces-and-scans", "challenge",
    pj("Send less, keep less", 55, "Redesign a multimodal feature so that it sends and stores the least personal data possible, with no steps given.",
      [],
      "A redesigned feature with a data flow before and after and tests that sensitive data is removed before leaving the device.",
      ["A data flow diagram before and after", "At least one working redaction step such as face blur or removal of identifiers", "A test showing the redaction on at least five inputs", "Retention limits and what quality is lost"],
      "Look at managed speech, vision and document services next.", PY),
    { hints: ["Ask what the model really needs; often a crop or a transcript is enough.", "Test redaction on hard inputs such as small faces or partial names.", "State the quality you lose, because redaction is never free."] }),
  practice("m12-10-managed-speech-vision-and-document-services", "extend",
    pj("Add a fallback service", 35, "Extend a document extraction call with a second service when the first is unsure.",
      [
        ["Read the starter call and its single dependency.", "Trace it. Save your work so you can compare later."],
        ["Return a confidence or a missing flag from the first service.", "Field level. Ask what changed since the last run."],
        ["Call a second service only for low-confidence documents.", "Policy. Print the intermediate values to see them."],
        ["Test on six documents and report calls to each service and total cost.", "Table. Start with a single input before using many."],
      ],
      "An extraction call with a fallback service, tested on six documents with call counts and cost.",
      ["Confidence returned", "Fallback policy works", "Counts and cost reported"],
      "Look at shortlist then test your own data next.", MM),
    { starter: code(
      "def extract(doc):",
      "    return service_a.analyze(doc)") }),
  practice("m12-10-shortlist-then-test-your-own-data", "review",
    pj("Review a model bake-off", 30, "Review a bake-off that picked a model from public benchmarks only.",
      [
        ["Read the starter report and what data it used.", "Sources. Take it one small step at a time."],
        ["Mark why public benchmarks may not match your inputs.", "Reasons. Write down what you see before changing anything."],
        ["Design a 20-input test from your own data.", "What to include. Re-read the step and try the smallest version first."],
        ["Write the decision rule before the test.", "Pass bar. Check one example by hand to be sure."],
      ],
      "A review of a benchmark-only decision with a 20-input test design and a decision rule.",
      ["Sources read", "Mismatch reasons marked", "Rule written"],
      "Return to the capstone: a multimodal model selection report.", ["A text editor"]),
    { starter: code(
      "Report: Model X scored 71 on a public vision benchmark vs 66 for Model Y, so we choose X. Our inputs are crumpled receipts photographed on phones in low light.") }),
];
