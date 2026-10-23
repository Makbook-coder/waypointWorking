import { practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const PY = ["Python 3.11 or newer"];
const SRV = ["Python 3.11 or newer", "A GPU or a notebook service", "A tuned adapter"];

export const P_M139: ProjectSrc[] = [
  practice("m13-9-separate-adapter-or-merged-weights", "review",
    pj("Review a packaging choice", 30, "Review a choice to merge adapters for a multi-customer product.",
      [
        ["Read the starter plan and write down the result.", "Details. Save your work so you can compare later."],
        ["Estimate storage and memory under the plan.", "Numbers. Ask what changed since the last run."],
        ["Compare with separate adapters on a shared base.", "Numbers. Print the intermediate values to see them."],
        ["Recommend an approach and write down the result.", "Reason. Start with a single input before using many."],
      ],
      "A review of a merge-everything plan with storage and memory compared to separate adapters.",
      ["Plan read and confirmed", "Both estimated", "Approach recommended"],
      "Look at save, load and merge next.", ["A text editor"]),
    { starter: code(
      "Product serves 40 customers, each with their own tuned adapter (80 MB). Plan: merge each into a separate 7B model (14 GB each) and run 40 servers.") }),
  practice("m13-9-save-load-and-merge", "debug",
    pj("A merged model that behaves differently", 35, "Find why a merged model gives different outputs and fix it.",
      [
        ["Read the starter steps and write down the result.", "Process. Take it one small step at a time."],
        ["Find the likely cause such as precision or the wrong base.", "Reason. Write down what you see before changing anything."],
        ["Fix the merge step and write down the result.", "Code. Re-read the step and try the smallest version first."],
        ["Show outputs match on five prompts.", "Check. Check one example by hand to be sure."],
      ],
      "A fixed merge step with outputs matching the adapter version on five prompts.",
      ["Cause found and confirmed", "Merge fixed and confirmed", "Five prompts match"],
      "Look at multi-LoRA serving next.", SRV),
    { starter: code(
      "Trained: adapter on 'base-v1' in bf16. Merge script loads 'base-v2' in fp16 and merges. Adapter outputs: valid JSON 97%. Merged outputs: valid JSON 61%.") }),
  practice("m13-9-multi-lora-serving-with-vllm", "extend",
    pj("Add routing by tenant", 35, "Extend a multi-adapter server config so requests pick an adapter by tenant.",
      [
        ["Read the starter config and write down the result.", "Adapters. Save your work so you can compare later."],
        ["Add a mapping from tenant to adapter name.", "Map. Ask what changed since the last run."],
        ["Add a default and an error for unknown tenants.", "Rules. Print the intermediate values to see them."],
        ["Test three tenants and an unknown one.", "Cases. Start with a single input before using many."],
      ],
      "A routing layer from tenant to adapter with a default and error handling tested on four cases.",
      ["Mapping added", "Unknown handled", "Four cases tested"],
      "Look at quantized export for Ollama next.", SRV),
    { starter: code(
      "adapters = {'support-v3': '/models/support-v3', 'sales-v1': '/models/sales-v1'}",
      "def handle(request): return generate(request.prompt, adapter='support-v3')") }),
  practice("m13-9-quantized-export-for-ollama", "optimise",
    pj("Smallest export that holds quality", 35, "Pick the smallest quantized export that holds quality.",
      [
        ["Read the starter table of exports.", "Table. Take it one small step at a time."],
        ["Mark the ones above the quality bar.", "Filter. Write down what you see before changing anything."],
        ["Choose the smallest and fastest among them.", "Rule. Re-read the step and try the smallest version first."],
        ["Propose one more level to test.", "Next. Check one example by hand to be sure."],
      ],
      "A chosen quantized export with the table, bar and one more level to test.",
      ["Bar applied and confirmed", "Export chosen", "Next level proposed"],
      "Look at managed hosting next.", PY),
    { starter: code(
      "fp16 14.0 GB score 81 18 tok/s | q8 7.5 GB score 81 31 tok/s | q5 5.0 GB score 80 40 tok/s | q4 4.1 GB score 77 46 tok/s | q3 3.2 GB score 68 50 tok/s. Bar: 79") }),
  practice("m13-9-managed-and-serverless-adapter-hosting", "review",
    pj("Review a hosting plan", 30, "Review a hosting plan for cold starts and cost under bursty traffic.",
      [
        ["Read the starter plan and write down the result.", "Traffic and host. Save your work so you can compare later."],
        ["Estimate cold start impact.", "Seconds. Ask what changed since the last run."],
        ["Estimate monthly cost and write down the result.", "Number. Print the intermediate values to see them."],
        ["Recommend a change and write down the result.", "Reason. Start with a single input before using many."],
      ],
      "A review of a hosting plan with cold start impact, cost estimate and a recommended change.",
      ["Plan read and confirmed", "Cold starts estimated", "Change recommended"],
      "Look at matching template and tokenizer next.", ["A text editor"]),
    { starter: code(
      "Traffic: 20 requests per day in bursts at 9am. Plan: always-on dedicated GPU endpoint at 2.40 dollars per hour. Latency target 3 s.") }),
  practice("m13-9-matching-template-and-tokenizer", "debug",
    pj("The deployed model rambles", 30, "Find why the deployed model rambles and never stops.",
      [
        ["Read the starter serving config and outputs.", "Both. Take it one small step at a time."],
        ["Find the missing stop token or template.", "Cause. Write down what you see before changing anything."],
        ["Fix the serving configuration.", "Config. Re-read the step and try the smallest version first."],
        ["Show a stopped output on three prompts.", "Check. Check one example by hand to be sure."],
      ],
      "A fixed serving config where outputs stop correctly on three prompts.",
      ["Cause found and confirmed", "Config fixed", "Three prompts stop"],
      "Look at versioning and rollback next.", SRV),
    { starter: code(
      "Training end-of-turn token: <|im_end|>. Serving config: stop=['</s>'], template=default. Output: 'The answer is 4.<|im_end|>\\n<|im_start|>user\\nWhat about 5? ...' continues for 800 tokens") }),
  practice("m13-9-versioning-and-rollback", "reimplement",
    pj("A tiny model registry", 35, "Build a minimal registry that tracks adapter versions and a live pointer.",
      [
        ["Write a registry file format with version, scores, data hash and status.", "Schema. Save your work so you can compare later."],
        ["Write commands to register, promote and roll back.", "Functions. Ask what changed since the last run."],
        ["Add a guard that refuses to promote a version below the current score.", "Rule. Print the intermediate values to see them."],
        ["Show a promote, a refused promote and a rollback.", "Demo. Start with a single input before using many."],
      ],
      "A small adapter registry with promote, guarded promote refusal and rollback demonstrated.",
      ["Schema written", "Guard works and confirmed", "Rollback demonstrated"],
      "Look at gradual rollout next.", PY)),
  practice("m13-9-gradual-rollout-via-the-gateway", "extend",
    pj("Add automatic halting", 35, "Extend a rollout script so it halts automatically on bad metrics.",
      [
        ["Read the starter rollout script.", "Stages. Take it one small step at a time."],
        ["Add a metric check between stages.", "Check. Write down what you see before changing anything."],
        ["Halt and roll back when a metric crosses its threshold.", "Rule. Re-read the step and try the smallest version first."],
        ["Simulate a bad metric and show the halt.", "Test. Check one example by hand to be sure."],
      ],
      "A rollout script with metric checks and an automatic halt shown on a simulated bad metric.",
      ["Check added and confirmed", "Halt works and confirmed", "Simulation shows halt"],
      "Look at latency and cost versus baseline next.", PY),
    { starter: code(
      "for share in [0.01, 0.1, 0.5, 1.0]:",
      "    router.set_share('v2', share)",
      "    sleep(3600)") }),
  practice("m13-9-latency-and-cost-vs-baseline", "optimise",
    pj("Cut serving cost per request", 35, "Reduce the serving cost of an adapter without breaking latency.",
      [
        ["Read the starter measurements.", "Numbers. Save your work so you can compare later."],
        ["Pick two changes such as batching and a quantized export.", "Ideas. Ask what changed since the last run."],
        ["Estimate the effect of each on cost and latency.", "Numbers. Print the intermediate values to see them."],
        ["Choose a combination and state the new numbers.", "Plan. Start with a single input before using many."],
      ],
      "A plan to cut serving cost with estimated effects on cost and latency.",
      ["Numbers read", "Effects estimated", "Combination chosen"],
      "Look at retraining triggers next.", PY),
    { starter: code(
      "One GPU at 1.90 dollars per hour, utilisation 18%, 60 requests per hour, p95 latency 1.1 s, target p95 2 s. Cost per 1,000 requests: 31.67 dollars. Hosted baseline: 4.50 dollars per 1,000.") }),
  practice("m13-9-retraining-triggers", "challenge",
    pj("Design a trigger you would trust", 50, "Design a retraining trigger that fires when needed and not otherwise, and test it on simulated history, with no steps given.",
      [],
      "A retraining trigger tested on simulated history with its false alarm and miss rates.",
      ["A simulated or recorded history of at least 12 periods with known drift", "A trigger rule using at least two signals", "False alarm and missed drift counts on the history", "A statement of who is alerted and what happens next"],
      "Return to the capstone: serve a tuned adapter safely.", PY),
    { hints: ["Simulate drift at a known time so you can measure how late the trigger fires.", "A single noisy metric causes false alarms; combine two signals.", "Write the response plan; a trigger nobody acts on is useless."] }),
];
