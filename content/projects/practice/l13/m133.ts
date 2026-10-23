import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const GPU = ["Python 3.11 or newer", "A GPU or a notebook service with a GPU", "transformers and trl"];
const PY = ["Python 3.11 or newer"];

export const P_M133: ProjectSrc[] = [
  practice("m13-3-what-sft-changes", "review",
    pj("Review a tuning claim", 30, "Review a claim about what SFT achieved and separate what it shows from what it does not.",
      [
        ["Read the starter claim and the evidence.", "Both. Write down what you see before changing anything."],
        ["List what the evidence supports.", "Items. Re-read the step and try the smallest version first."],
        ["List what it does not show.", "Items. Check one example by hand to be sure."],
        ["Write the test that would check the rest.", "Design. Save your work so you can compare later."],
      ],
      "A review of a tuning claim separating supported and unsupported statements with a test.",
      ["Evidence read", "Both lists made", "Test designed"],
      "Look at hyperparameters that matter next.", ["A text editor"]),
    { starter: code(
      "Claim: after SFT the model knows our products. Evidence: 5 hand-picked prompts from the training set now get correct answers. No held-out check was done.") }),
  practice("m13-3-hyperparameters-that-matter", "optimise",
    pj("Fix a run that diverges", 35, "Change hyperparameters so a diverging run trains stably.",
      [
        ["Read the starter config and the loss behaviour.", "Both. Ask what changed since the last run."],
        ["Pick the most likely cause.", "Learning rate. Print the intermediate values to see them."],
        ["Change one setting at a time and note the effect.", "Table. Start with a single input before using many."],
        ["Choose the stable setting with the best validation loss.", "Rule. Take it one small step at a time."],
      ],
      "A stable configuration chosen from single-setting changes with the effect of each noted.",
      ["Cause picked", "Changes tabled", "Stable setting chosen"],
      "Look at full versus parameter-efficient next.", GPU),
    { starter: code(
      "learning_rate=2e-3, epochs=5, batch_size=2, warmup_steps=0. Loss: 2.1, 1.4, 6.8, nan, nan.") }),
  practice("m13-3-full-vs-parameter-efficient", "extend",
    pj("Add a memory check", 30, "Extend a training script with a check that predicts whether full tuning fits.",
      [
        ["Read the starter script and note it launches without a check.", "Trace. Write down what you see before changing anything."],
        ["Add a memory estimate for full tuning with the optimiser.", "Formula. Re-read the step and try the smallest version first."],
        ["Print a recommendation for adapter tuning when it will not fit.", "Message. Check one example by hand to be sure."],
        ["Test with two model sizes and a given GPU.", "Output. Save your work so you can compare later."],
      ],
      "A training script with a memory check that recommends an adapter when full tuning will not fit.",
      ["Estimate added", "Recommendation printed", "Two sizes tested"],
      "Look at a first SFT run with TRL next.", PY),
    { starter: code(
      "model = load(MODEL_NAME)",
      "trainer = SFTTrainer(model, train_dataset=data)",
      "trainer.train()") }),
  practice("m13-3-a-first-sft-run-with-trl", "debug",
    pj("A first run that crashes", 35, "Find why a first SFT run fails and get it training.",
      [
        ["Read the starter error log.", "Find the first error."],
        ["Fix the dataset format problem.", "Fields. Ask what changed since the last run."],
        ["Fix the memory problem by changing batch size or precision.", "Settings. Print the intermediate values to see them."],
        ["Run a few steps and show loss decreasing.", "Log. Start with a single input before using many."],
      ],
      "A repaired SFT run showing a decreasing loss over a few steps.",
      ["First error found", "Format and memory fixed", "Loss decreases"],
      "Look at reading the loss curves next.", GPU),
    { starter: code(
      "KeyError: 'text'  (dataset columns: ['prompt', 'completion'])",
      "After fixing: torch.cuda.OutOfMemoryError: tried to allocate 2.00 GiB (batch_size=16, max_seq_length=4096, fp32)") }),
  practice("m13-3-reading-the-loss-curves", "review",
    pj("Review two curves", 30, "Review two training curves and decide what to do next with each run.",
      [
        ["Read the starter numbers for both runs.", "Both. Take it one small step at a time."],
        ["Describe each curve in one sentence.", "Shape. Write down what you see before changing anything."],
        ["Decide the next action for each.", "Stop or change. Re-read the step and try the smallest version first."],
        ["Say what extra evidence you want before acting.", "Outputs. Check one example by hand to be sure."],
      ],
      "A reading of two curves with an action for each and the extra evidence needed.",
      ["Curves described", "Actions decided", "Evidence named"],
      "Look at catastrophic forgetting next.", ["A text editor"]),
    { starter: code(
      "Run A train loss: 1.9 1.2 0.8 0.5 0.3 0.15 | val loss: 1.9 1.3 1.0 1.1 1.3 1.6",
      "Run B train loss: 1.9 1.7 1.6 1.6 1.55 1.55 | val loss: 1.9 1.8 1.7 1.7 1.7 1.7") }),
  practice("m13-3-catastrophic-forgetting", "challenge",
    pj("Keep the task, keep the skills", 55, "Tune for a task while keeping general skills within a tolerance you choose, with no steps given.",
      [],
      "A tuning recipe that meets a task bar while keeping general skills within a stated tolerance.",
      ["A general skills test of at least 30 prompts and a task test of at least 30 cases", "Task and general scores before tuning", "At least two mitigation attempts such as lower learning rate and data mixing", "A final recipe meeting both bars with the evidence"],
      "Look at reading outputs, not just loss next.", GPU),
    { hints: ["Decide the tolerance, for example no more than a 3 point drop, before you run anything.", "Mixing a small share of general data is a cheap thing to try first.", "Check outputs by hand as well as scores; some drops show up only in style."] }),
  practice("m13-3-read-outputs-not-just-loss", "extend",
    pj("Add an output review step", 30, "Extend a training script to save sample outputs at every checkpoint.",
      [
        ["Read the starter script and note it logs only loss.", "Trace. Save your work so you can compare later."],
        ["Add a fixed set of ten prompts.", "Prompts. Ask what changed since the last run."],
        ["Generate and save outputs at every evaluation step.", "Files. Print the intermediate values to see them."],
        ["Write a script that prints outputs for two checkpoints side by side.", "Compare. Start with a single input before using many."],
      ],
      "A training script that saves fixed-prompt outputs at each checkpoint with a side by side viewer.",
      ["Prompts fixed", "Outputs saved", "Viewer works"],
      "Look at choosing a checkpoint next.", GPU),
    { starter: code(
      "args = TrainingArguments(output_dir='out', eval_steps=100, logging_steps=10, save_steps=100)",
      "trainer = SFTTrainer(model, args=args, train_dataset=train, eval_dataset=val)") }),
  practice("m13-3-choosing-a-checkpoint", "reimplement",
    pj("A checkpoint picker", 35, "Write a small tool that picks a checkpoint by validation score and keeps the test set untouched.",
      [
        ["Read a folder of checkpoint results with validation scores.", "Parse. Take it one small step at a time."],
        ["Pick the best by a rule with a tie-break for smaller step.", "Rule. Write down what you see before changing anything."],
        ["Run the chosen checkpoint once on the test set.", "Single use. Re-read the step and try the smallest version first."],
        ["Log the choice and a guard that blocks a second test run.", "Guard. Check one example by hand to be sure."],
      ],
      "A checkpoint picker that chooses on validation, tests once and blocks reuse of the test set.",
      ["Rule implemented", "Single test run", "Guard blocks reuse"],
      "Return to the capstone: a tuned model you can defend.", PY)),
];
