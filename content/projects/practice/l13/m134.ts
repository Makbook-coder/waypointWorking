import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const GPU = ["Python 3.11 or newer", "A GPU or a notebook service with a GPU", "transformers, peft and trl"];
const PY = ["Python 3.11 or newer"];

export const P_M134: ProjectSrc[] = [
  practice("m13-4-lora-adapters", "reimplement",
    pj("A LoRA layer from scratch", 40, "Write a LoRA wrapper around a linear layer yourself and train it on a toy task.",
      [
        ["Write a module that holds a frozen linear layer plus two thin matrices.", "Rank r. Take it one small step at a time."],
        ["Initialise the second matrix to zero and check the output equals the base.", "Test. Write down what you see before changing anything."],
        ["Train only the thin matrices on a toy regression.", "Loss falls. Re-read the step and try the smallest version first."],
        ["Count trainable against total parameters.", "Share. Check one example by hand to be sure."],
      ],
      "A hand-written LoRA layer that starts equal to the base, trains on a toy task and reports its trainable share.",
      ["Wrapper written", "Starts equal to base", "Trainable share reported"],
      "Look at QLoRA on a quantized base next.", ["Python 3.11 or newer", "torch"])),
  practice("m13-4-qlora-on-a-quantized-base", "debug",
    pj("QLoRA runs out of memory anyway", 35, "Find why a QLoRA run still runs out of memory and fix it.",
      [
        ["Read the starter config and error.", "Both. Save your work so you can compare later."],
        ["Compute the memory of the quantized weights and the rest.", "Estimate. Ask what changed since the last run."],
        ["Change sequence length, batch size and gradient accumulation.", "Settings. Print the intermediate values to see them."],
        ["Show a configuration that fits with an estimate.", "Numbers. Start with a single input before using many."],
      ],
      "A QLoRA configuration that fits in memory with an estimate that explains why.",
      ["Memory estimated", "Settings changed", "Configuration fits"],
      "Look at rank, alpha and target modules next.", GPU),
    { starter: code(
      "GPU: 16 GB. Model: 7B in 4-bit, lora r=64 on all linear layers, max_seq_length=8192, per_device_batch=8, gradient_checkpointing=False",
      "Error: CUDA out of memory. Tried to allocate 3.1 GiB") }),
  practice("m13-4-rank-alpha-and-target-modules", "optimise",
    pj("The smallest adapter that works", 40, "Shrink an adapter while keeping the score above a bar.",
      [
        ["Read the starter sweep results.", "Table. Take it one small step at a time."],
        ["Find the smallest configuration above the bar.", "Rule. Write down what you see before changing anything."],
        ["Propose one more configuration to test between points.", "Gap. Re-read the step and try the smallest version first."],
        ["State the saving in size against the largest.", "Percent. Check one example by hand to be sure."],
      ],
      "The smallest adapter configuration above a stated bar with one more configuration proposed.",
      ["Table read and confirmed", "Smallest above bar found", "Saving stated"],
      "Look at adapters against full fine-tuning next.", PY),
    { starter: code(
      "r=4 attn: 61% | r=8 attn: 68% | r=16 attn: 74% | r=16 all-linear: 79% | r=64 attn: 75% | r=64 all-linear: 80%. Bar: 77%. Sizes (MB): 8, 17, 34, 80, 135, 320") }),
  practice("m13-4-adapters-vs-full-fine-tuning", "review",
    pj("Review a full-tuning decision", 30, "Review a decision to fully fine-tune and say whether an adapter would do.",
      [
        ["Read the starter decision.", "Reasons. Save your work so you can compare later."],
        ["Mark the reasons that really require full tuning.", "Judge. Ask what changed since the last run."],
        ["List the costs of full tuning that the note ignores.", "Items. Print the intermediate values to see them."],
        ["Write the test that would show an adapter is not enough.", "Design. Start with a single input before using many."],
      ],
      "A review of a full-tuning decision with the real reasons, ignored costs and a test.",
      ["Reasons judged", "Costs listed", "Test designed"],
      "Look at PEFT tools next.", ["A text editor"]),
    { starter: code(
      "Decision: fully fine-tune the 8B model because adapters are for hobbyists and we want the best quality. We will keep five full copies for five customers.") }),
  practice("m13-4-peft-with-unsloth-or-axolotl", "extend",
    pj("Extend a config", 35, "Extend a tool config with evaluation, saving and tracking.",
      [
        ["Read the starter config and write down the result.", "Fields. Take it one small step at a time."],
        ["Add evaluation on a held-out set at intervals.", "Eval. Write down what you see before changing anything."],
        ["Add checkpoint saving with a limit.", "Save. Re-read the step and try the smallest version first."],
        ["Add tracking of the run name and seed.", "Tracking. Check one example by hand to be sure."],
      ],
      "A tool config extended with evaluation, saving limits and tracking.",
      ["Evaluation added", "Saving limited", "Tracking added"],
      "Look at estimating GPU memory next.", GPU),
    { starter: code(
      "base_model: some/7b-instruct",
      "adapter: qlora",
      "lora_r: 16",
      "datasets: [{path: train.jsonl, type: chat}]",
      "num_epochs: 3") }),
  practice("m13-4-estimating-gpu-memory", "challenge",
    pj("Predict the memory within ten percent", 50, "Build and validate a memory estimator that is within ten percent of real runs, with no steps given.",
      [],
      "A memory estimator validated against real runs with its error range stated.",
      ["An estimator covering weights, adapter, optimiser, gradients and activations", "At least four real runs with measured peak memory", "Error computed for each and for the average", "The conditions where the estimator is not reliable"],
      "Look at tracking runs next.", GPU),
    { hints: ["Activations grow with batch and sequence length; fit that part from your runs.", "Gradient checkpointing changes the activation term a lot.", "Measure peak memory after a few steps, not at load time."] }),
  practice("m13-4-tracking-runs", "debug",
    pj("A good run nobody can reproduce", 30, "Find why a good run cannot be reproduced and fix the tracking.",
      [
        ["Read the starter run record.", "Fields. Save your work so you can compare later."],
        ["List what is missing to rerun it.", "Items. Ask what changed since the last run."],
        ["Add the missing items to the record.", "Schema. Print the intermediate values to see them."],
        ["Show a record that would let someone rerun it.", "Example. Start with a single input before using many."],
      ],
      "A fixed run record with missing items added and an example that allows a rerun.",
      ["Missing items listed", "Schema updated", "Example shown"],
      "Look at DIY versus managed tuning next.", PY),
    { starter: code(
      "Run 'best-v3': score 0.84. Notes: 'used the new data, lr tweaked, seems good'. Files: adapter.safetensors") }),
  practice("m13-4-diy-vs-managed-fine-tuning", "review",
    pj("Review a build-or-buy note", 30, "Review a note choosing DIY tuning over a managed service.",
      [
        ["Read the starter note and write down the result.", "Reasons. Take it one small step at a time."],
        ["Check each cost claim and write down the result.", "Arithmetic. Write down what you see before changing anything."],
        ["Add costs it ignores such as ops time.", "Items. Re-read the step and try the smallest version first."],
        ["Write your recommendation with conditions.", "Rule. Check one example by hand to be sure."],
      ],
      "A review of a DIY decision with cost claims checked, ignored costs added and a recommendation.",
      ["Claims checked", "Missing costs added", "Recommendation written"],
      "Return to the capstone: a reproducible LoRA run.", ["A text editor"]),
    { starter: code(
      "DIY: GPU rental 2 dollars per hour x 5 hours = 10 dollars. Managed service: 60 dollars per run. Conclusion: DIY is six times cheaper. Team has never tuned a model; we expect 20 runs.") }),
];
