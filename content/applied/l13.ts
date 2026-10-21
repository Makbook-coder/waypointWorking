import type { AppliedModule } from "./types";

const LORA_LAND = { label: "Zhao et al.: LoRA Land, 310 fine-tuned LLMs that rival GPT-4", url: "https://arxiv.org/abs/2405.00732v1", kind: "paper" } as const;
const OPENAI_FT_35 = { label: "OpenAI: GPT-3.5 Turbo fine-tuning and API updates", url: "https://openai.com/blog/gpt-3-5-turbo-fine-tuning-and-api-updates", kind: "blog" } as const;
const OPENAI_OPT = { label: "OpenAI docs: Model optimization", url: "https://developers.openai.com/api/docs/guides/model-optimization", kind: "docs" } as const;
const OPENAI_RFT = { label: "OpenAI docs: Reinforcement fine-tuning", url: "https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning", kind: "docs" } as const;
const DEEPSEEK_R1 = { label: "DeepSeek-AI: DeepSeek-R1, incentivizing reasoning via reinforcement learning", url: "https://arxiv.org/html/2501.12948v1", kind: "paper" } as const;
const INSTRUCTGPT = { label: "Ouyang et al.: Training language models to follow instructions with human feedback", url: "https://arxiv.org/abs/2203.02155", kind: "paper" } as const;
const DPO = { label: "Rafailov et al.: Direct Preference Optimization", url: "https://arxiv.org/abs/2305.18290", kind: "paper" } as const;
const LORA = { label: "Hu et al.: LoRA, low-rank adaptation of large language models", url: "https://arxiv.org/abs/2106.09685", kind: "paper" } as const;
const QLORA = { label: "Dettmers et al.: QLoRA, efficient finetuning of quantized LLMs", url: "https://arxiv.org/abs/2305.14314", kind: "paper" } as const;
const REWARD_HACKING = { label: "Lilian Weng: Reward hacking in reinforcement learning", url: "https://lilianweng.github.io/posts/2024-11-28-reward-hacking/", kind: "blog" } as const;
const UNSLOTH = { label: "Unsloth docs: Fine-tuning LLMs guide", url: "https://unsloth.ai/docs/get-started/fine-tuning-llms-guide", kind: "docs" } as const;
const UNSLOTH_HP = { label: "Unsloth docs: LoRA hyperparameters guide", url: "https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide", kind: "docs" } as const;
const TRL_QUICK = { label: "Hugging Face docs: TRL quickstart", url: "https://huggingface.co/docs/trl/quickstart", kind: "docs" } as const;
const TRL_GRPO = { label: "Hugging Face docs: TRL GRPO trainer", url: "https://huggingface.co/docs/trl/grpo_trainer", kind: "docs" } as const;
const TRL_GKD = { label: "Hugging Face docs: TRL GKD trainer (distillation)", url: "https://huggingface.co/docs/trl/gkd_trainer", kind: "docs" } as const;
const PEFT_LORA = { label: "Hugging Face docs: PEFT LoRA reference", url: "https://huggingface.co/docs/peft/en/package_reference/lora", kind: "docs" } as const;
const AXOLOTL_METHOD = { label: "Axolotl docs: Choosing a fine-tuning method", url: "https://docs.axolotl.ai/docs/choosing_method.html", kind: "docs" } as const;
const VLLM_LORA = { label: "vLLM docs: LoRA adapters", url: "https://docs.vllm.ai/en/latest/features/lora/", kind: "docs" } as const;
const COPILOT_MODEL = { label: "GitHub Blog: Building a faster, smarter Copilot with a new custom model", url: "https://github.blog/ai-and-ml/github-copilot/the-road-to-better-completions-building-a-faster-smarter-github-copilot-with-a-new-custom-model/", kind: "case-study" } as const;
const CURSOR = { label: "Cursor: Editing files at 1000 tokens per second", url: "https://cursor.com/blog/instant-apply", kind: "case-study" } as const;
const APPLE_FM = { label: "Apple Machine Learning Research: Introducing Apple's on-device and server foundation models", url: "https://machinelearning.apple.com/research/introducing-apple-foundation-models", kind: "blog" } as const;

export const APPLIED_L13: AppliedModule[] = [
  {
    moduleId: "M13.1",
    howItWorks:
      "Fine-tuning trains an existing model further on your own examples. It is good at making behaviour consistent (format, tone, a narrow task, following house rules) and at letting a small cheap model match a big one on one job. It is poor at adding fresh knowledge, which retrieval does better, and it costs data work, training runs and ongoing maintenance. The usual order is: build an eval set, push prompting and retrieval as far as they go, and fine-tune only when the eval shows a gap that prompting cannot close or when cost and latency at volume justify a smaller tuned model.",
    uses: [
      {
        who: "OpenAI model optimization guide",
        what: "OpenAI's guide recommends writing evals first, then improving prompts, and only then fine-tuning, and describes several kinds of tuning (supervised, vision, preference and reinforcement). It also notes that OpenAI is winding down its own fine-tuning platform for new users, so hosted options change.",
        source: OPENAI_OPT,
      },
      {
        who: "LoRA Land (Predibase)",
        what: "Researchers fine-tuned 310 small models with LoRA across 31 narrow tasks and found the tuned models beat their base models by about 34 points on average and beat GPT-4 by about 10, showing where fine-tuning pays off: narrow, well-defined tasks.",
        source: LORA_LAND,
      },
    ],
    scenario: {
      title: "Deciding whether to fine-tune a ticket classifier",
      context:
        "A SaaS company routes support tickets into 40 categories with a prompted frontier model. It works well but costs too much at 200,000 tickets a day, and some category rules keep being ignored.",
      architecture:
        "The team compares the prompted frontier model, a prompted small model, and a small model fine-tuned on labelled past tickets, all on the same held-out eval set, and estimates cost at full volume.",
      tools: ["a labelled eval set", "a prompted baseline", "a small open-weight model", "a fine-tuning library", "a cost spreadsheet"],
      steps: [
        "Build a held-out eval set of 500 tickets labelled by the support leads.",
        "Measure the prompted frontier model and a prompted small model on it.",
        "Collect a few thousand labelled past tickets for training, with no overlap with the eval set.",
        "Fine-tune the small model and measure on the same eval set.",
        "Decide using accuracy, cost per ticket, latency and who will maintain the model.",
      ],
    },
    example: {
      title: "A fine-tuning decision record",
      lang: "yaml",
      code: `task: support ticket routing (40 categories)
eval_set: 500 held-out tickets, labelled by support leads
results:
  prompted_frontier:  {accuracy: 0.93, cost_per_1k: 4.20, p95_latency_s: 2.1}
  prompted_small:     {accuracy: 0.81, cost_per_1k: 0.15, p95_latency_s: 0.6}
  finetuned_small:    {accuracy: 0.94, cost_per_1k: 0.18, p95_latency_s: 0.6}
gap_closed_by_prompting: no (small model ignores rare-category rules)
knowledge_needed: none new (categories are stable)
decision: fine-tune small model
owner: ml-platform team, retrain when categories change
fallback: prompted frontier model behind the same interface`,
      notes:
        "Fine-tuning is chosen because the task is narrow, stable and high-volume, and the record names an owner because a tuned model needs retraining when the categories change.",
    },
    tradeoffs: [
      { issue: "Fine-tuning does not reliably add new facts.", response: "Use retrieval for knowledge and fine-tuning for behaviour and format." },
      { issue: "A tuned model needs retraining when the task or base model changes.", response: "Keep the data pipeline and evals so retraining is routine, and name an owner." },
      { issue: "Hosted fine-tuning options change or are withdrawn.", response: "Prefer open-weight models and portable formats such as LoRA adapters when lock-in is a risk." },
    ],
    junior: "Wants to fine-tune because the prompt output is not quite right, before building an eval set or trying better prompts.",
    senior: "Fine-tunes only when an eval shows a gap prompting cannot close, or when cost at volume justifies it, and plans for retraining and ownership.",
    reading: [OPENAI_OPT, LORA_LAND, AXOLOTL_METHOD],
  },
  {
    moduleId: "M13.2",
    howItWorks:
      "The training data decides what a fine-tuned model learns, so most of the work is data curation. Examples should look exactly like real production inputs, use the same chat template the model will see at inference, and show the output you want, not just outputs you happen to have. Teams remove duplicates and near-duplicates, fix or drop bad labels, balance rare cases, keep personal data out, and make sure no eval examples leak into training. A few hundred to a few thousand clean examples usually beat a large noisy set.",
    uses: [
      {
        who: "InstructGPT",
        what: "OpenAI's InstructGPT was trained on demonstrations and rankings written by hired labellers, and the 1.3B-parameter tuned model was preferred by people over the 175B-parameter GPT-3, which shows how much carefully collected data can matter compared with model size.",
        source: INSTRUCTGPT,
      },
      {
        who: "Unsloth fine-tuning guide",
        what: "Unsloth's guide stresses formatting training data with the model's own chat template, holding out about a fifth of the data for evaluation, and watching the training loss, since a loss falling to near zero usually means the model is memorising.",
        source: UNSLOTH,
      },
    ],
    scenario: {
      title: "Building a training set from support replies",
      context:
        "A company wants to fine-tune a model to write support replies in its house style. It has 50,000 past replies, but many are short, outdated or written by new agents.",
      architecture:
        "A pipeline filters replies by quality signals (customer rating, senior agent, recent date), removes duplicates and personal data, formats them in the model's chat template, and splits them with no shared tickets between train and eval.",
      tools: ["pandas or similar", "a PII scrubber", "a near-duplicate detector", "the model's tokenizer and chat template", "a small manual review"],
      steps: [
        "Define what a good reply looks like with the support leads and write it down.",
        "Filter by quality signals and remove replies about retired products.",
        "Remove personal data and near-duplicates.",
        "Hand-review a random 200 and fix the filters if bad examples remain.",
        "Split by ticket or customer so no conversation appears in both train and eval.",
      ],
    },
    example: {
      title: "Cleaning, splitting and formatting chat data",
      lang: "python",
      code: `import hashlib, json, random, re

def norm(text: str) -> str:
    return re.sub(r"\\s+", " ", text.lower()).strip()

seen, rows = set(), []
for r in json.load(open("replies.json")):
    if r["rating"] < 4 or len(r["reply"]) < 80:
        continue
    key = hashlib.md5(norm(r["question"]).encode()).hexdigest()
    if key in seen:                      # drop exact duplicates after normalising
        continue
    seen.add(key)
    rows.append({"customer": r["customer_id"], "messages": [
        {"role": "system", "content": "You are Acme support. Be brief and kind."},
        {"role": "user", "content": r["question"]},
        {"role": "assistant", "content": r["reply"]}]})

customers = sorted({r["customer"] for r in rows})
random.Random(0).shuffle(customers)
eval_ids = set(customers[: len(customers) // 5])        # split by customer
for name, keep in [("train", False), ("eval", True)]:
    with open(f"{name}.jsonl", "w") as f:
        for r in rows:
            if (r["customer"] in eval_ids) == keep:
                f.write(json.dumps({"messages": r["messages"]}) + "\\n")`,
      notes:
        "Splitting by customer rather than by row stops the same conversation or customer appearing in both sets, which would make eval scores look better than they really are.",
    },
    tradeoffs: [
      { issue: "Strict filters leave too few examples.", response: "Write or fix examples by hand for rare cases, or use a strong model to draft them and have people review." },
      { issue: "Old data teaches outdated behaviour.", response: "Filter by date and product, and refresh the set when policies change." },
      { issue: "Personal data can be memorised by the model.", response: "Scrub personal data before training and test the tuned model for leaks." },
    ],
    junior: "Exports every past example into a file and starts training on it.",
    senior: "Defines what good looks like, filters and reviews the data, uses the right chat template, and splits so the eval set is truly unseen.",
    reading: [UNSLOTH, INSTRUCTGPT],
  },
  {
    moduleId: "M13.3",
    howItWorks:
      "Supervised fine-tuning (SFT) shows the model input and output pairs and trains it to produce the outputs. Usually only the assistant's part of each example counts toward the loss. The main settings are learning rate, number of epochs and batch size: too high a learning rate or too many epochs and the model memorises the training set and gets worse at everything else. In practice teams start from an instruction-tuned model, train for one to three epochs, watch training and eval loss, and judge the result with the task eval, not the loss.",
    uses: [
      {
        who: "OpenAI GPT-3.5 fine-tuning",
        what: "When OpenAI launched GPT-3.5 Turbo fine-tuning it said early testers got better instruction following, more reliable output formatting and a consistent tone, and some cut prompt length by up to 90% because the instructions were learned rather than repeated in every call.",
        source: OPENAI_FT_35,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub built its newer code completion model by further training on a large set of repositories and then supervised fine-tuning for fill-in-the-middle completions, followed by reinforcement learning, showing SFT as one stage in a longer training recipe.",
        source: COPILOT_MODEL,
      },
    ],
    scenario: {
      title: "Teaching a model a fixed report format",
      context:
        "An insurance team needs a model to turn adjuster notes into a fixed eight-section report. Prompting gets the format right most of the time, but sections are often missing or reordered.",
      architecture:
        "A small instruction-tuned model is fine-tuned on 1,500 note and report pairs written by senior adjusters. A validator checks the sections, and the eval compares the tuned model with the prompted baseline.",
      tools: ["TRL SFTTrainer", "a GPU", "train and eval JSONL files", "a section validator", "experiment tracking"],
      steps: [
        "Prepare chat-formatted train and eval files from the curated pairs.",
        "Run a short training job and check that the eval loss falls with the training loss.",
        "Run the task eval: format validity and content scores from reviewers.",
        "Try one change at a time, such as learning rate or epochs, and compare.",
        "Keep the best checkpoint and record its data version and settings.",
      ],
    },
    example: {
      title: "A small SFT run with TRL",
      lang: "python",
      code: `from datasets import load_dataset
from trl import SFTConfig, SFTTrainer

data = load_dataset("json", data_files={"train": "train.jsonl", "eval": "eval.jsonl"})

args = SFTConfig(
    output_dir="out/report-sft",
    num_train_epochs=2,
    learning_rate=2e-5,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,     # effective batch size 8
    eval_strategy="steps",
    eval_steps=50,
    logging_steps=10,
)
trainer = SFTTrainer(model="Qwen/Qwen2.5-0.5B-Instruct", args=args,
                     train_dataset=data["train"], eval_dataset=data["eval"])
trainer.train()
trainer.save_model("out/report-sft/final")`,
      notes:
        "Logging eval loss every 50 steps shows when the model starts to memorise (training loss keeps falling while eval loss rises). The real decision still comes from the task eval run on the saved model.",
    },
    tradeoffs: [
      { issue: "Too many epochs make the model memorise and lose general skills.", response: "Watch eval loss, keep epochs low and test general tasks as well as the target task." },
      { issue: "Full fine-tuning needs a lot of GPU memory.", response: "Use LoRA or QLoRA unless there is a clear reason to update all weights." },
      { issue: "A falling loss does not mean better outputs.", response: "Judge each checkpoint with the task eval and human review." },
    ],
    junior: "Trains for many epochs because the training loss keeps going down, and never checks eval loss or the task metric.",
    senior: "Changes one setting at a time, watches eval loss for overfitting, and picks checkpoints by task metrics.",
    reading: [TRL_QUICK, OPENAI_FT_35, UNSLOTH],
  },
  {
    moduleId: "M13.4",
    howItWorks:
      "LoRA freezes the original model weights and trains small low-rank matrices added to some layers, so only a tiny fraction of parameters change. The adapter is small (often megabytes to a few hundred megabytes) and can be swapped on top of a shared base model. QLoRA loads the frozen base model in 4-bit precision to cut memory further, so mid-sized models can be tuned on one GPU. The key settings are the rank, the scaling factor alpha, which layers get adapters and the learning rate, which is usually higher than for full fine-tuning.",
    uses: [
      {
        who: "Apple",
        what: "Apple tunes its on-device model with small LoRA adapters, one per feature such as summarisation, which are loaded on top of a single shared base model so the phone does not need a separate full model for each task.",
        source: APPLE_FM,
      },
      {
        who: "LoRA Land (Predibase)",
        what: "The LoRA Land study trained 310 4-bit LoRA adapters and served 25 of them for one base model on a single A100 GPU with LoRAX, showing how many specialised models can share one deployment.",
        source: LORA_LAND,
      },
    ],
    scenario: {
      title: "Tuning an 8B model on a single GPU",
      context:
        "A start-up wants to tune an 8B open model to extract fields from legal contracts. It has one 24 GB GPU and cannot afford full fine-tuning.",
      architecture:
        "The base model is loaded in 4-bit, LoRA adapters are added to all linear layers, and only the adapters are trained and saved. The adapter is evaluated against a prompted baseline before deployment.",
      tools: ["PEFT", "bitsandbytes for 4-bit loading", "TRL", "a 24 GB GPU", "a contract eval set"],
      steps: [
        "Check that the base model in 4-bit fits in GPU memory with a small batch.",
        "Start with a common setup: rank 16, alpha 16 or 32, all linear layers, learning rate around 2e-4.",
        "Train one to three epochs and watch eval loss.",
        "Evaluate the adapter on the contract eval set against the prompted base model.",
        "Save the adapter separately with the base model name and data version.",
      ],
    },
    example: {
      title: "QLoRA with PEFT and TRL",
      lang: "python",
      code: `import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                         bnb_4bit_compute_dtype=torch.bfloat16)
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B-Instruct",
                                             quantization_config=bnb)
lora = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                  target_modules="all-linear", task_type="CAUSAL_LM")

trainer = SFTTrainer(model=model, peft_config=lora,
                     train_dataset=load_dataset("json", data_files="train.jsonl")["train"],
                     args=SFTConfig(output_dir="out/contracts-lora", learning_rate=2e-4,
                                    num_train_epochs=2, per_device_train_batch_size=2,
                                    gradient_accumulation_steps=4))
trainer.train()
trainer.save_model("out/contracts-lora/adapter")   # saves only the adapter weights`,
      notes:
        "The base model stays frozen in 4-bit and only the adapter is trained and saved. Targeting all linear layers follows the QLoRA recipe, and the higher learning rate is normal for LoRA.",
    },
    tradeoffs: [
      { issue: "A low rank may not capture a complex task.", response: "Try a higher rank only if the eval shows the adapter is underfitting." },
      { issue: "4-bit loading can slightly lower quality.", response: "Compare against a 16-bit LoRA run when memory allows, on the same eval." },
      { issue: "Adapters only work with the exact base model they were trained on.", response: "Store the base model name and version with every adapter." },
    ],
    junior: "Copies LoRA settings from a blog post and never checks whether the adapter beats a good prompt.",
    senior: "Understands what rank, alpha and target layers do, starts from known defaults, and changes them only when the eval says so.",
    reading: [LORA, QLORA, PEFT_LORA],
  },
  {
    moduleId: "M13.5",
    howItWorks:
      "Preference tuning teaches a model which of two answers is better, rather than copying one correct answer. The classic method, RLHF, trains a reward model from human rankings and then optimises the model against it with reinforcement learning. DPO skips the reward model and the RL loop: it trains directly on pairs of chosen and rejected answers with a simple loss, which is cheaper and more stable. Teams use it after SFT to shape tone, helpfulness, safety or length, where it is easier for people to compare two answers than to write the perfect one.",
    uses: [
      {
        who: "InstructGPT",
        what: "InstructGPT used supervised fine-tuning and then reinforcement learning from human rankings of model outputs. People preferred its answers to much larger GPT-3, and it was more truthful and less toxic, which made this recipe standard for chat models.",
        source: INSTRUCTGPT,
      },
      {
        who: "DPO paper",
        what: "The DPO authors showed that preference tuning can be done with a classification-style loss on chosen and rejected pairs, with no separate reward model and no reinforcement learning, and matched or beat the RL-based method in their tests while being simpler to run.",
        source: DPO,
      },
    ],
    scenario: {
      title: "Making a support assistant less wordy",
      context:
        "After SFT, a support assistant gives correct but long answers. Customers rate short, direct answers higher, but writing perfect short answers for thousands of tickets is too slow.",
      architecture:
        "The SFT model generates two answers per question. Support agents pick the better one in a simple review tool. The pairs train the model with DPO, starting from the SFT checkpoint.",
      tools: ["the SFT model", "a pairwise review tool", "TRL DPOTrainer", "an eval set with length and quality checks"],
      steps: [
        "Generate two answers per question at different temperatures from the SFT model.",
        "Have agents choose the better answer with written guidelines, and drop pairs where they disagree.",
        "Train with DPO from the SFT checkpoint on a few thousand pairs.",
        "Compare SFT and DPO models on quality, length and safety on the eval set.",
        "Check that the model has not become short at the cost of missing needed steps.",
      ],
    },
    example: {
      title: "Preference pairs and a DPO run",
      lang: "python",
      code: `# pairs.jsonl, one line per comparison:
# {"prompt": [{"role": "user", "content": "How do I reset my password?"}],
#  "chosen": [{"role": "assistant", "content": "Go to Settings > Security > Reset ..."}],
#  "rejected": [{"role": "assistant", "content": "Thanks for reaching out! Passwords ..."}]}

from datasets import load_dataset
from trl import DPOConfig, DPOTrainer

pairs = load_dataset("json", data_files="pairs.jsonl")["train"]
args = DPOConfig(output_dir="out/support-dpo", beta=0.1,
                 learning_rate=5e-7, num_train_epochs=1)
trainer = DPOTrainer(model="out/report-sft/final", args=args, train_dataset=pairs)
trainer.train()`,
      notes:
        "DPO starts from the SFT model and only needs chosen and rejected answers. The beta setting controls how far the model may move from where it started, and the learning rate is much lower than for SFT.",
    },
    tradeoffs: [
      { issue: "Reviewers disagree on what is better.", response: "Write guidelines, measure agreement and drop pairs where reviewers disagree." },
      { issue: "The model can learn a shortcut such as always being shorter.", response: "Check that quality holds, not only the preferred trait, on the eval set." },
      { issue: "Preference tuning can make a model more agreeable or flattering.", response: "Include pairs where the correct answer disagrees with the user, and test for it." },
    ],
    junior: "Thinks preference tuning is only for big labs and keeps adding instructions to the prompt instead.",
    senior: "Uses preference pairs when comparing is easier than writing, guards against shortcuts, and checks the side effects on the eval set.",
    reading: [DPO, INSTRUCTGPT, TRL_QUICK],
  },
  {
    moduleId: "M13.6",
    howItWorks:
      "Reinforcement fine-tuning (RFT) lets the model try a task many times and rewards the attempts a grader scores well. It suits tasks with answers that can be checked, such as maths, code that must pass tests, or classifications experts agree on, and where the model already succeeds sometimes. The grader is the most important part: if it can be fooled, the model learns to fool it, which is called reward hacking. Teams use exact checks where possible, test the grader on known good and bad answers, and read samples during training.",
    uses: [
      {
        who: "OpenAI reinforcement fine-tuning",
        what: "OpenAI's RFT guide says the method fits expert tasks with answers that can be verified, where experts agree and the model sometimes gets it right, uses graders such as exact string checks or model-based scoring, and warns about reward hacking. The service is limited to one model being retired in 2026.",
        source: OPENAI_RFT,
      },
      {
        who: "DeepSeek-R1",
        what: "DeepSeek trained R1 with large-scale reinforcement learning on tasks with checkable answers. The version trained only with RL reasoned well but mixed languages and was hard to read, so the final recipe added supervised data before and between RL stages.",
        source: DEEPSEEK_R1,
      },
      {
        who: "GitHub Copilot",
        what: "When GitHub added reinforcement learning to its completion model, it had to guard against reward hacking, including penalising the model for padding suggestions with comments that scored well but did not help developers.",
        source: COPILOT_MODEL,
      },
    ],
    scenario: {
      title: "RFT for medical billing codes",
      context:
        "A billing team wants a small model to choose the right billing code from clinical notes. Experts agree on the right code for most notes, and the prompted model is right about 60% of the time.",
      architecture:
        "Each training example has a note and the expert code. The model samples several answers per note, a grader gives full reward for the exact code and partial reward for the right category, and training increases the probability of high-reward answers.",
      tools: ["TRL GRPOTrainer or a hosted RFT service", "an exact-match grader", "a held-out eval set", "sample reviews during training"],
      steps: [
        "Confirm experts agree on the labels and that the model is sometimes right before training.",
        "Write the grader and test it on known correct, wrong and tricky answers.",
        "Start with a few hundred examples and a short run.",
        "Read sampled outputs during training to spot reward hacking.",
        "Compare with the prompted and SFT baselines on the held-out set.",
      ],
    },
    example: {
      title: "A checkable reward function for GRPO",
      lang: "python",
      code: `import re
from datasets import load_dataset
from trl import GRPOConfig, GRPOTrainer

def code_reward(completions, answer, **kwargs):
    rewards = []
    for text, gold in zip(completions, answer):
        found = re.findall(r"CODE:\\s*([A-Z]\\d{2}\\.?\\d*)", text)
        if len(found) != 1:          # no code or several codes: no reward
            rewards.append(0.0)
        elif found[0] == gold:
            rewards.append(1.0)
        else:
            rewards.append(0.3 if found[0][:3] == gold[:3] else 0.0)
    return rewards

data = load_dataset("json", data_files="notes.jsonl")["train"]   # columns: prompt, answer
trainer = GRPOTrainer(model="Qwen/Qwen2.5-1.5B-Instruct", reward_funcs=code_reward,
                      args=GRPOConfig(output_dir="out/billing-rft"), train_dataset=data)
trainer.train()`,
      notes:
        "The reward refuses answers with several codes, which closes an obvious hack: listing many codes so one is right. Partial credit for the right category gives a learning signal when exact answers are still rare.",
    },
    tradeoffs: [
      { issue: "A weak grader teaches the model to game it.", response: "Test the grader on adversarial answers and read samples throughout training." },
      { issue: "RFT does not help if the model never gets the task right.", response: "Start with SFT or a stronger base model until the model succeeds sometimes." },
      { issue: "Model-based graders can be biased or fooled.", response: "Prefer exact checks, and validate model graders against expert labels." },
    ],
    junior: "Writes a quick grader and trusts the rising reward curve without reading any of the sampled outputs.",
    senior: "Picks tasks with checkable answers, tests the grader for loopholes, reads samples during training and confirms gains on a held-out set.",
    reading: [OPENAI_RFT, REWARD_HACKING, TRL_GRPO],
  },
  {
    moduleId: "M13.7",
    howItWorks:
      "Distillation trains a small student model to copy a large teacher model. The simplest version is to have the teacher answer many real or synthetic inputs, filter the answers for quality, and fine-tune the student on them with SFT. More advanced versions train on the teacher's probabilities. The student is cheaper and faster, and on a narrow task it can get close to the teacher. Teams check model licences, keep the filtering step strict, and evaluate the student on held-out real data rather than on the teacher's outputs.",
    uses: [
      {
        who: "DeepSeek-R1",
        what: "DeepSeek generated about 800,000 training samples with R1 and used them to fine-tune smaller Qwen and Llama models with SFT only. The distilled 32B model beat OpenAI's o1-mini on several reasoning benchmarks and did better than running RL directly on the same small model.",
        source: DEEPSEEK_R1,
      },
      {
        who: "Cursor",
        what: "Cursor trained a model specialised for applying code edits that a frontier model has planned, so the expensive model plans and a cheaper fine-tuned model does the fast, high-volume work of rewriting the file.",
        source: CURSOR,
      },
    ],
    scenario: {
      title: "Distilling a product-description writer",
      context:
        "An online shop uses a large model to write product descriptions from supplier data. Quality is good but it is too slow and expensive for a catalogue of two million items.",
      architecture:
        "The large model writes descriptions for 20,000 varied products. Rule checks and a reviewer sample filter out weak ones. A small model is fine-tuned on the rest and served for the full catalogue, with the large model kept for hard categories.",
      tools: ["the teacher model API", "a quality filter", "TRL SFTTrainer", "a held-out eval set", "a router for hard categories"],
      steps: [
        "Check that the teacher model's terms allow training another model on its outputs.",
        "Pick inputs that cover all categories, including rare ones.",
        "Generate teacher outputs and filter them with rules and a reviewed sample.",
        "Fine-tune the student and compare with the teacher on held-out products.",
        "Route categories where the student falls short back to the teacher.",
      ],
    },
    example: {
      title: "Generating and filtering teacher outputs",
      lang: "python",
      code: `import json

def passes(desc: str, product: dict) -> bool:
    words = desc.split()
    return (40 <= len(words) <= 120
            and product["name"].lower() in desc.lower()
            and "!!" not in desc
            and all(dim not in desc for dim in product.get("forbidden_claims", [])))

kept = 0
with open("distill_train.jsonl", "w") as out:
    for product in json.load(open("products_sample.json")):
        desc = teacher_write(product)          # call to the large model
        if not passes(desc, product):
            continue
        out.write(json.dumps({"messages": [
            {"role": "user", "content": json.dumps(product["specs"])},
            {"role": "assistant", "content": desc}]}) + "\\n")
        kept += 1
print("kept", kept)`,
      notes:
        "The student copies whatever it is given, so the filter decides its quality. Training on the teacher's mistakes would make them permanent in a cheaper model.",
    },
    tradeoffs: [
      { issue: "The student copies the teacher's mistakes.", response: "Filter teacher outputs strictly and review a sample by hand." },
      { issue: "Some model licences forbid training on outputs.", response: "Check terms before generating data and prefer teachers whose licences allow it." },
      { issue: "Students fall short on rare or hard inputs.", response: "Keep the teacher for those cases with a router." },
    ],
    junior: "Dumps teacher outputs into a training file without filtering or checking the licence.",
    senior: "Covers the input space, filters hard, checks licences, and evaluates the student on real held-out data.",
    reading: [DEEPSEEK_R1, TRL_GKD, CURSOR],
  },
  {
    moduleId: "M13.8",
    howItWorks:
      "A fine-tune must beat what you already have on the task you care about, without breaking other things. Teams compare it against the prompted base model and the current production model on the same held-out set, with the same prompts and settings. They also run a regression set of general skills and safety checks, since tuning can make a model forget other abilities or become more willing to follow harmful requests. Human or model-graded review of samples catches problems that metrics miss, such as tone drift or repeated phrases.",
    uses: [
      {
        who: "Cursor",
        what: "Cursor evaluated its fine-tuned edit-apply model on a set of about 450 real edits graded by a strong model, comparing it with frontier models before relying on it, rather than trusting training metrics.",
        source: CURSOR,
      },
      {
        who: "Apple",
        what: "Apple evaluates its fine-tuned adapters with human graders on task-specific prompts, for example several hundred samples for the summarisation adapter, and compares them with other models rather than relying only on benchmarks.",
        source: APPLE_FM,
      },
    ],
    scenario: {
      title: "Signing off a fine-tuned legal summariser",
      context:
        "A legal tech company fine-tuned a model to summarise court judgments. Before launch it needs evidence that summaries are better and that the model has not become unsafe or worse at other tasks.",
      architecture:
        "Three systems (prompted base, current production, fine-tune) run on the same 300 held-out judgments. Lawyers rate a blind sample, automated checks score citations and length, and a regression suite covers general and safety tasks.",
      tools: ["a held-out eval set", "blind side-by-side review", "automated checks", "a general and safety regression suite", "experiment tracking"],
      steps: [
        "Freeze the eval set before training so it cannot leak into the training data.",
        "Run all three systems with the same inputs and settings.",
        "Have lawyers compare outputs blind, without knowing which system wrote them.",
        "Run the regression and safety suites and compare with the base model.",
        "Ship only if the fine-tune wins on the task and does not regress elsewhere.",
      ],
    },
    example: {
      title: "Comparing a fine-tune with baselines on the same set",
      lang: "python",
      code: `import json, statistics

systems = {"prompted_base": run_prompted_base,
           "production": run_production,
           "finetune_v3": run_finetune}
eval_rows = [json.loads(l) for l in open("eval_frozen.jsonl")]

report = {}
for name, run in systems.items():
    scores, cites = [], []
    for row in eval_rows:
        out = run(row["input"])
        scores.append(judge_score(out, row["reference"]))   # 1-5 rubric score
        cites.append(all(c in row["input"] for c in extract_citations(out)))
    report[name] = {"mean_score": round(statistics.mean(scores), 2),
                    "citation_ok": round(sum(cites) / len(cites), 3)}

report["finetune_v3"]["regression"] = run_suite("general_and_safety", run_finetune)
print(json.dumps(report, indent=2))`,
      notes:
        "Running every system through the same loop on the same frozen rows makes the comparison fair. The citation check catches made-up references that a rubric score might miss, and the regression suite looks for side effects.",
    },
    tradeoffs: [
      { issue: "Eval data that leaked into training makes results look too good.", response: "Freeze the eval set first and check for overlap before every run." },
      { issue: "Model judges may favour a style rather than correctness.", response: "Validate the judge against human ratings and use blind human review for sign-off." },
      { issue: "Tuning can weaken safety or general skills.", response: "Run a regression and safety suite on every fine-tune." },
    ],
    junior: "Reports that the fine-tune got a lower loss and looks good on a few examples.",
    senior: "Compares against baselines on a frozen held-out set, uses blind review, and checks for regressions and safety side effects before shipping.",
    reading: [CURSOR, APPLE_FM, OPENAI_OPT],
  },
  {
    moduleId: "M13.9",
    howItWorks:
      "A LoRA adapter can be merged into the base model weights and served like any model, or kept separate and loaded on top of a shared base model at request time. Keeping adapters separate lets one GPU deployment serve many tuned variants, for example one per customer or task, and lets you roll back an adapter without redeploying the base. Serving engines such as vLLM load several adapters at once and pick one per request by name. Teams version each adapter with its base model, data and eval results, and roll out new adapters gradually.",
    uses: [
      {
        who: "LoRA Land (Predibase)",
        what: "The LoRA Land authors served 25 fine-tuned LoRA adapters for one base model from a single A100 GPU using the open-source LoRAX server, instead of deploying 25 separate models.",
        source: LORA_LAND,
      },
      {
        who: "Apple",
        what: "Apple keeps one base model on the device and swaps in small task-specific LoRA adapters at runtime, which keeps storage and memory low while giving each feature its own tuning.",
        source: APPLE_FM,
      },
    ],
    scenario: {
      title: "One deployment, many customer adapters",
      context:
        "A B2B writing tool has trained a LoRA adapter for each of 30 enterprise customers to match their style. Running 30 separate model servers would be far too expensive.",
      architecture:
        "One vLLM server runs the base model with LoRA enabled and loads customer adapters by name. The gateway maps each customer to an adapter name. New adapters roll out to one customer at a time with the old version kept for rollback.",
      tools: ["vLLM with LoRA support", "an adapter registry", "a gateway", "per-adapter evals", "monitoring by adapter"],
      steps: [
        "Store each adapter with its base model version, data version and eval scores.",
        "Start vLLM with LoRA enabled and the current adapters registered.",
        "Map customers to adapter names in the gateway.",
        "Load a new adapter version, send a small share of that customer's traffic, and compare metrics.",
        "Monitor latency and quality per adapter, and roll back by changing the mapping.",
      ],
    },
    example: {
      title: "Serving several LoRA adapters with vLLM",
      lang: "bash",
      code: `vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --enable-lora \\
  --max-loras 4 \\
  --lora-modules acme-v3=./adapters/acme-v3 globex-v1=./adapters/globex-v1

# pick the adapter per request by its name
curl http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model": "acme-v3",
       "messages": [{"role": "user", "content": "Draft a renewal reminder email."}],
       "max_tokens": 200}'`,
      notes:
        "Every adapter shares one copy of the base model in GPU memory. The model field in the request selects the adapter, so routing and rollback are a gateway configuration change rather than a new deployment.",
    },
    tradeoffs: [
      { issue: "Serving adapters separately adds some latency compared with a merged model.", response: "Merge the adapter for a single very high-volume task, and keep separate adapters when there are many." },
      { issue: "Many active adapters compete for GPU memory.", response: "Limit how many are loaded at once and load rarely used ones on demand." },
      { issue: "An adapter breaks if the base model is upgraded.", response: "Version adapters with their base model and retrain and re-evaluate when the base changes." },
    ],
    junior: "Merges every adapter into its own full model copy and deploys each one separately.",
    senior: "Shares one base model across adapters, versions them with their evals, and rolls them out and back through the gateway.",
    reading: [VLLM_LORA, LORA_LAND, UNSLOTH_HP],
  },
];
