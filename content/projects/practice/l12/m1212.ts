import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const DEV = ["Python 3.11 or newer", "A laptop with 16 GB of memory or similar", "A small open model"];

export const P_M1212: ProjectSrc[] = [
  practice("m12-12-why-modalities-suit-the-device", "review",
    pj("Review an all-on-device plan", 30, "Review a plan to run every modality on the phone and say which parts do not belong there.",
      [
        ["Read the starter plan and the device spec.", "Compare. Start with a single input before using many."],
        ["Estimate each model's memory.", "Parameters times bytes."],
        ["Mark the parts that do not fit or would drain the battery.", "Reasons. Take it one small step at a time."],
        ["Propose a split between device and cloud.", "Table. Write down what you see before changing anything."],
      ],
      "A review of the all-on-device plan with memory estimates and a proposed split.",
      ["Memory estimated", "Misfits marked", "Split proposed"],
      "Look at quantization and what it costs next.", ["A text editor"]),
    { starter: code(
      "Plan: run a 13B language model, a large vision encoder, speech recognition and image generation on a mid-range phone with 6 GB of memory. Everything offline.") }),
  practice("m12-12-quantization-and-what-it-costs", "debug",
    pj("The quantized model that got dumber", 35, "Find which tasks a quantized model got worse at and decide if the loss is acceptable.",
      [
        ["Read the starter scores for full precision and quantized.", "Per task. Re-read the step and try the smallest version first."],
        ["Find the tasks with the largest drop.", "Rank. Check one example by hand to be sure."],
        ["Check whether the drop is noise by looking at spread.", "Repeats. Save your work so you can compare later."],
        ["Decide whether to keep the quantization, change level or route those tasks elsewhere.", "Justify. Ask what changed since the last run."],
      ],
      "A diagnosis of quantization losses by task with a decision backed by spread.",
      ["Drops ranked", "Noise checked", "Decision justified"],
      "Look at phone and laptop hardware limits next.", DEV),
    { starter: code(
      "task: summarise 88 -> 87 | extract fields 91 -> 90 | arithmetic 74 -> 52 | translate 80 -> 78 | code 69 -> 61. Level: 4-bit. Size: 14 GB -> 4 GB.") }),
  practice("m12-12-phone-and-laptop-hardware-limits", "extend",
    pj("Add context to the fit check", 35, "Extend a model fit check to count the memory used by long context and image inputs.",
      [
        ["Read the starter check and what it counts.", "Weights only. Print the intermediate values to see them."],
        ["Add memory for the key-value cache from context length.", "Formula. Start with a single input before using many."],
        ["Add working memory for an image input.", "Estimate. Take it one small step at a time."],
        ["Re-run the check for two models and a long context and print the verdicts.", "Compare. Write down what you see before changing anything."],
      ],
      "A fit check that includes cache and image memory with verdicts for two models at long context.",
      ["Cache added and confirmed", "Image memory added", "Verdicts printed"],
      "Look at what on-device buys you next.", DEV),
    { starter: code(
      "def fits(params_b, bits, device_gb): return params_b * bits / 8 <= device_gb * 0.8") }),
  practice("m12-12-what-on-device-buys-you", "optimise",
    pj("Cut the battery cost", 40, "Reduce the battery and heat cost of an on-device feature without hurting results.",
      [
        ["Read the starter measurements.", "Baseline. Re-read the step and try the smallest version first."],
        ["Try a smaller model and shorter inputs.", "Two changes. Check one example by hand to be sure."],
        ["Try running only when needed such as on speech detected.", "Gating. Save your work so you can compare later."],
        ["Compare battery per hour, latency and accuracy and choose.", "Table. Ask what changed since the last run."],
      ],
      "A lower-power on-device setup with battery, latency and accuracy compared.",
      ["Baseline read", "Changes measured", "Choice made and confirmed"],
      "Look at on-device against self-hosted against API next.", DEV),
    { starter: code(
      "Always-on transcription model (small): battery drain 22% per hour, device warm after 20 minutes, accuracy 91% of words. Runs on every audio frame, including silence.") }),
  practice("m12-12-on-device-self-hosted-or-api", "challenge",
    pj("Defend a deployment choice", 55, "Make and defend a deployment choice for a feature with measured evidence from all three options, with no steps given.",
      [],
      "A decision record with measured accuracy, latency, cost and privacy for on-device, self-hosted and API options.",
      ["At least 20 real inputs run through all three options", "Accuracy, latency and cost per request tabulated", "Privacy and operations effort assessed in words", "A decision with a fallback and the conditions that would change it"],
      "Return to the capstone: an edge versus cloud feature.", DEV),
    { hints: ["Use the same inputs and scoring for all three or the comparison is meaningless.", "Cost per request should include idle hardware for the self-hosted option.", "State what would make you change the decision, such as volume or a new model."] }),
];
