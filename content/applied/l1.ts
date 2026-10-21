import type { AppliedModule } from "./types";

const AA_MODELS = { label: "Artificial Analysis: models by intelligence, speed and price", url: "https://artificialanalysis.ai/models", kind: "docs" } as const;

export const APPLIED_L1: AppliedModule[] = [
  {
    moduleId: "M1.1",
    howItWorks:
      "Products use LLMs as a general text engine: the same model writes, classifies, extracts, translates and explains, depending only on the prompt. Because it predicts likely text rather than looking facts up, teams wrap it in software that supplies the facts (from a database, documents or tools), checks the output, and limits what it can promise. The engineering question is never just whether the model can do the task. It is how often it does it correctly, and what happens when it does not.",
    uses: [
      {
        who: "Duolingo",
        what: "Duolingo launched Max, built on GPT-4, with Roleplay conversations where learners practise scenarios like ordering coffee and get feedback, and an explain-my-answer feature. One model covers open conversation and feedback that used to need separate hand-built systems.",
        source: { label: "Duolingo blog: Introducing Duolingo Max", url: "https://blog.duolingo.com/duolingo-max/", kind: "blog" },
      },
      {
        who: "Air Canada (a failure case)",
        what: "Air Canada's website chatbot told a grieving customer he could claim a bereavement discount after flying, which was not the policy. A Canadian tribunal ruled the airline was responsible for what its chatbot said and ordered it to pay. Fluent text is not the same as true text, and the company owns the answer.",
        source: { label: "CX Today: Court orders Air Canada to pay out for chatbot's bad advice", url: "https://www.cxtoday.com/conversational-ai/court-orders-air-canada-to-pay-out-for-chatbots-bad-advice/", kind: "news" },
      },
    ],
    scenario: {
      title: "Deciding whether an LLM should answer refund questions",
      context:
        "A travel company wants a chat assistant on its help page. Refund rules are strict and change every few months, and a wrong answer can cost money and trust.",
      architecture:
        "The model never answers policy questions from memory. The app retrieves the current policy text, puts it in the prompt with an instruction to answer only from it, and routes anything uncertain or money-related to a human agent with the conversation attached.",
      tools: ["An LLM API", "the policy documents store", "a small eval set of real questions", "a human handoff in the support tool"],
      steps: [
        "Collect 50 real customer questions with the correct answers written by the support team.",
        "Try the model with no context and record how often it is wrong; this shows why memory alone is not enough.",
        "Add the current policy text to the prompt and an instruction to say it does not know when the text does not cover the question; re-run the set.",
        "Add a rule that refunds and legal topics always offer a human, and log every answer with the policy version used.",
        "Launch to a small share of traffic, review conversations weekly, and grow the eval set with every mistake found.",
      ],
    },
    example: {
      title: "Same model, different jobs, controlled by the prompt",
      lang: "python",
      code: `from anthropic import Anthropic

client = Anthropic()
MODEL = "your-model-id"  # pick from the provider's models page

def ask(system: str, user: str) -> str:
    r = client.messages.create(model=MODEL, max_tokens=300, system=system,
                               messages=[{"role": "user", "content": user}])
    return r.content[0].text

ticket = "I was charged twice for order 8812 and nobody answers my emails."
print(ask("Classify the ticket as billing, shipping or other. Reply with one word.", ticket))
print(ask("Extract any order numbers as a JSON list.", ticket))
print(ask("Write a two-sentence empathetic reply. Do not promise a refund.", ticket))`,
      notes:
        "One model does classification, extraction and writing because each is just a different next-text prediction task. Note the last instruction: the model will happily promise things unless the prompt and the surrounding software prevent it.",
    },
    tradeoffs: [
      { issue: "The model states wrong facts with full confidence.", response: "Ground answers in retrieved sources, require citations for factual claims, and route high-stakes topics to humans." },
      { issue: "Outputs vary between runs and between model versions.", response: "Pin model versions, keep an evaluation set, and re-run it before any model or prompt change." },
      { issue: "A general model is slower and more expensive than a narrow classifier for simple tasks.", response: "Use the LLM to prototype and label data, then switch high-volume simple tasks to a smaller model or a classic classifier if it is good enough." },
    ],
    junior: "Tries a few prompts in a playground, sees good answers, and assumes the model knows the facts and will behave the same way in production.",
    senior: "Treats the model as a probabilistic component, measures how reliably it does the task on real examples, and designs the product around what happens when it is wrong.",
    reading: [
      { label: "Large Language Models explained briefly (3Blue1Brown)", url: "https://www.3blue1brown.com/lessons/mini-llm/", kind: "talk" },
      { label: "Common pitfalls when building generative AI applications (Chip Huyen)", url: "https://huyenchip.com/2025/01/16/ai-engineering-pitfalls.html", kind: "blog" },
    ],
  },
  {
    moduleId: "M1.2",
    howItWorks:
      "Every API call is billed, rate limited and size limited in tokens, so tokens are the unit of cost planning. Teams count tokens before sending (with the provider's tokenizer or count endpoint), cap input sizes, and track input and output tokens per request in their logs. Token counts differ by model family and by language, so a budget measured on English text with one model can be wrong for Hindi text or for the next model version.",
    uses: [
      {
        who: "Anthropic token counting",
        what: "Claude offers a free endpoint that counts the input tokens of a message (including system prompt, tools and images) before you send it, for budgeting and routing. The docs warn that newer Claude models use a different tokenizer that yields noticeably more tokens for the same text, so counts must be redone per model.",
        source: { label: "Claude docs: Token counting", url: "https://platform.claude.com/docs/en/build-with-claude/token-counting", kind: "docs" },
      },
      {
        who: "Multilingual products",
        what: "Researchers measured that the same content can take many times more tokens in some languages than in English, even with tokenizers built for many languages. For users of those languages that means higher cost, slower replies and less room in the context window.",
        source: { label: "Petrov et al.: Language Model Tokenizers Introduce Unfairness Between Languages", url: "https://arxiv.org/abs/2305.15425", kind: "paper" },
      },
    ],
    scenario: {
      title: "Budgeting a document-summary feature",
      context:
        "Your team is launching summaries of uploaded PDFs in English and Hindi. Finance wants a monthly cost estimate and a guarantee that one huge upload cannot cost hundreds of dollars.",
      architecture:
        "Before each call, the service counts tokens for the extracted text. Inputs above a cap are truncated or split into chunks. Every call logs input and output token counts, and a dashboard sums cost per day by language and feature.",
      tools: ["the provider's token counter (tiktoken or a count endpoint)", "a usage log table", "a cost dashboard", "sample documents per language"],
      steps: [
        "Collect 20 typical documents per language and count their tokens with the exact tokenizer of the model you will use.",
        "Multiply average input and expected output tokens by the price per million tokens and by expected daily volume to get a cost estimate per language.",
        "Set a maximum input size in tokens, and decide what happens above it: truncate, summarise in chunks, or refuse with a message.",
        "Log `input_tokens` and `output_tokens` from every response, not your own estimate, and build a daily cost chart.",
        "Re-run the token counts whenever you change model, since a new tokenizer can change cost even at the same price per token.",
      ],
    },
    example: {
      title: "Counting tokens and estimating cost before calling",
      lang: "python",
      code: `import tiktoken

enc = tiktoken.get_encoding("o200k_base")  # use the encoding your model uses
PRICE_IN, PRICE_OUT = 2.50, 10.00            # USD per million tokens, from the pricing page
MAX_INPUT = 20_000

def plan_call(text: str, expected_output: int = 400) -> dict:
    tokens = enc.encode(text)
    if len(tokens) > MAX_INPUT:
        text = enc.decode(tokens[:MAX_INPUT])  # or split into chunks instead
        tokens = tokens[:MAX_INPUT]
    cost = len(tokens) / 1e6 * PRICE_IN + expected_output / 1e6 * PRICE_OUT
    return {"text": text, "input_tokens": len(tokens), "est_cost_usd": round(cost, 5)}

for sample in ["Refund policy for damaged items...", "क्षतिग्रस्त वस्तुओं के लिए धनवापसी नीति..."]:
    print(plan_call(sample)["input_tokens"], "tokens for", len(sample), "characters")`,
      notes:
        "The prices are placeholders; read them from the provider's pricing page. Comparing token counts for the same sentence in two languages makes the per-language cost difference visible before launch. In production, bill and report from the usage numbers the API returns.",
    },
    tradeoffs: [
      { issue: "Local tokenizers do not always match the provider's count, especially with images or tools.", response: "Use the provider's count endpoint or the usage field in responses as the source of truth, and local counting only for rough limits." },
      { issue: "Truncating long inputs silently drops important content.", response: "Prefer chunking and summarising in parts for long documents, and tell the user when content was cut." },
      { issue: "Output tokens usually cost several times more than input tokens.", response: "Set `max_tokens` sensibly, ask for concise formats, and watch output length in dashboards." },
    ],
    junior: "Estimates cost from word counts, sets no input limit, and is surprised by the first monthly bill.",
    senior: "Measures token counts on real data per language and per model, caps inputs, logs actual usage per request, and re-checks the budget whenever the model changes.",
    reading: [
      { label: "openai/tiktoken (fast BPE tokenizer)", url: "https://github.com/openai/tiktoken", kind: "docs" },
      { label: "HF LLM Course: Building a tokenizer, block by block", url: "https://huggingface.co/learn/llm-course/en/chapter6/8", kind: "docs" },
    ],
  },
  {
    moduleId: "M1.3",
    howItWorks:
      "You will not build a transformer at work, but its design shows up in every decision you make about models. Parameter counts drive memory and serving cost. Attention over the whole context is why long prompts are slower and pricier. Mixture-of-Experts models activate only part of their weights per token, which is why a very large open model can be cheaper to run per token than its total size suggests. When you read a model card, these are the numbers that tell you what hardware you need and what it will cost.",
    uses: [
      {
        who: "Mistral AI (Mixtral)",
        what: "Mixtral uses 8 expert blocks per layer and a router that picks 2 for each token. Each token can draw on about 47B parameters in total while only about 13B are active, so it runs closer to the speed and cost of a 13B dense model.",
        source: { label: "Mixtral of Experts (arXiv)", url: "https://arxiv.org/abs/2401.04088", kind: "paper" },
      },
      {
        who: "DeepSeek (DeepSeek-V3)",
        what: "DeepSeek-V3 is a Mixture-of-Experts model with 671B total parameters but only 37B activated per token. Total size sets how much memory you need to hold it; active size sets compute per token.",
        source: { label: "DeepSeek-V3 Technical Report (arXiv)", url: "https://arxiv.org/abs/2412.19437", kind: "paper" },
      },
    ],
    scenario: {
      title: "Sizing hardware to self-host an open model",
      context:
        "Your company cannot send data to an external API, so you must host an open-weight model. You need to choose between a dense model and an MoE model and estimate GPU needs.",
      architecture:
        "An inference server (such as vLLM) on GPU machines inside the company network, behind an internal API. The model's total parameters decide GPU memory; active parameters and context length decide throughput and latency.",
      tools: ["model cards on Hugging Face", "vLLM or a similar inference server", "a GPU memory calculator", "a load-testing script"],
      steps: [
        "Read the model cards: total and active parameters, context length, precision options and licence.",
        "Estimate memory: parameters times bytes per parameter (2 for 16-bit, about 0.5 for 4-bit), plus room for the KV cache, which grows with context length and concurrent users.",
        "Shortlist one dense and one MoE model that fit the GPUs you can get.",
        "Deploy both on a test machine and load-test with realistic prompt lengths, measuring tokens per second and time to first token.",
        "Pick on measured quality on your eval set plus measured cost per request, not on parameter count alone.",
      ],
    },
    example: {
      title: "Back-of-envelope memory and compute for two models",
      lang: "python",
      code: `def weights_gb(total_params_b: float, bytes_per_param: float) -> float:
    return total_params_b * bytes_per_param  # billions * bytes = GB

models = {
    "dense-70B":         {"total": 70,  "active": 70},
    "moe-47B-total-13B": {"total": 47,  "active": 13},
}
for name, m in models.items():
    fp16 = weights_gb(m["total"], 2)
    q4 = weights_gb(m["total"], 0.5)
    print(f"{name}: weights ~{fp16:.0f} GB fp16 / ~{q4:.0f} GB 4-bit; "
          f"compute per token ~ {m['active']}B params")
# MoE needs memory for ALL experts but compute only for the active ones.`,
      notes:
        "This ignores the KV cache and activations, which can add many gigabytes at long context and high concurrency, so leave headroom. The key lesson is the split: total parameters decide whether it fits, active parameters decide how fast it runs.",
    },
    tradeoffs: [
      { issue: "Bigger models are usually better but slower and more expensive to serve.", response: "Measure quality on your own task; a smaller or MoE model often reaches the same quality for far less." },
      { issue: "MoE models still need memory for every expert even though few are active.", response: "Plan GPU memory from total parameters, and use quantisation or more GPUs if it does not fit." },
      { issue: "Long contexts make attention and the KV cache expensive.", response: "Keep prompts lean, cap context per request, and use serving engines with efficient KV cache management." },
    ],
    junior: "Chooses the model with the most parameters, assuming bigger always means better, and discovers it does not fit on the GPUs.",
    senior: "Reads total versus active parameters and context length from the model card, estimates memory and cost before deploying, and confirms with load tests and evals.",
    reading: [
      { label: "The Illustrated Transformer (Jay Alammar)", url: "https://jalammar.github.io/illustrated-transformer/", kind: "blog" },
      { label: "Attention in transformers, step by step (3Blue1Brown)", url: "https://www.3blue1brown.com/lessons/attention/", kind: "talk" },
    ],
  },
  {
    moduleId: "M1.4",
    howItWorks:
      "How a model was trained explains how it behaves in your product. Pretraining on huge text gives knowledge and language skill, up to a cutoff date. Post-training (supervised fine-tuning on example answers, then preference training with human or AI feedback) turns that into an assistant that follows instructions, refuses some requests and writes in a house style. In practice this tells you why the model does not know last week's news, why it may be overly cautious or verbose, and why prompting a base model is very different from prompting a chat model.",
    uses: [
      {
        who: "OpenAI (InstructGPT)",
        what: "OpenAI fine-tuned GPT-3 on written demonstrations, then trained it with reinforcement learning from human rankings of answers. People preferred the outputs of the 1.3B-parameter tuned model to the 175B-parameter original, showing that post-training, not just size, shapes usefulness.",
        source: { label: "Ouyang et al.: Training language models to follow instructions with human feedback", url: "https://arxiv.org/abs/2203.02155", kind: "paper" },
      },
      {
        who: "Anthropic (Constitutional AI)",
        what: "Anthropic trained a harmless assistant mostly from AI feedback: the model critiques and revises its own answers against written principles, then a preference model trained on AI judgements provides the reward for reinforcement learning. This is one reason chat models explain objections rather than just refusing.",
        source: { label: "Bai et al.: Constitutional AI: Harmlessness from AI Feedback", url: "https://arxiv.org/abs/2212.08073", kind: "paper" },
      },
    ],
    scenario: {
      title: "Explaining odd model behaviour to your product team",
      context:
        "The product manager asks why the assistant does not know about a pricing change from last month, why it sometimes refuses harmless requests, and whether it learns from user chats.",
      architecture:
        "A chat product built on an API model. Fresh facts come from retrieval, behaviour is shaped by the system prompt, and any feedback data is stored by your app for evaluation, not sent back into the model automatically.",
      tools: ["the model card and release notes", "a retrieval step for fresh facts", "an eval set of refusal cases", "your app's feedback log"],
      steps: [
        "Check the model's documented knowledge cutoff, and confirm that recent facts must come from retrieval or tools.",
        "Collect examples of unwanted refusals and test whether clearer context in the system prompt fixes them before changing models.",
        "Explain that API models do not learn from your conversations by default; improvements come from your prompts, data and evals.",
        "Store user thumbs-up and thumbs-down with the conversation, and use them to build eval sets and, later, fine-tuning data if needed.",
        "Re-test behaviour whenever the provider releases a new version, since post-training changes can shift tone and refusals.",
      ],
    },
    example: {
      title: "Base completion versus instruction-tuned chat",
      lang: "text",
      code: `Prompt to a BASE model (pretraining only):
  "Write a haiku about rain."
Likely continuation:
  "Write a haiku about snow. Write a haiku about the sea. ..."
  (it continues the pattern of a list of prompts it has seen)

Same prompt to an INSTRUCTION-TUNED chat model:
  "Soft rain on the roof /
   the gutters hum their old song /
   puddles hold the sky"

Few-shot prompt that makes a base model useful:
  "Q: capital of France?  A: Paris
   Q: capital of Japan?   A: Tokyo
   Q: capital of Kenya?   A:"
  -> " Nairobi"`,
      notes:
        "Base models complete documents; post-trained models follow instructions. If you ever use a base or lightly tuned open model, few-shot patterns are how you steer it. With chat models, the system prompt and examples steer behaviour that post-training already set up.",
    },
    tradeoffs: [
      { issue: "Knowledge stops at the training cutoff.", response: "Provide fresh facts through retrieval, tools or the prompt, and never rely on the model for recent events." },
      { issue: "Preference tuning can make models over-cautious, wordy or eager to agree with the user.", response: "Give explicit context and permission in the system prompt, ask for concise answers, and test for sycophancy in evals." },
      { issue: "Fine-tuning your own model is costly and can erase useful behaviour.", response: "Exhaust prompting and retrieval first, and fine-tune only for stable style or format needs backed by a good dataset." },
    ],
    junior: "Thinks the model is learning from every chat and expects it to know about recent events.",
    senior: "Knows which behaviours come from pretraining versus post-training, fixes freshness with retrieval, shapes behaviour with prompts and evals, and treats fine-tuning as a last resort.",
    reading: [
      { label: "Hugging Face LLM Course", url: "https://huggingface.co/learn/llm-course/en/chapter1/1", kind: "docs" },
      { label: "Training language models to follow instructions (InstructGPT)", url: "https://arxiv.org/abs/2203.02155", kind: "paper" },
    ],
  },
  {
    moduleId: "M1.5",
    howItWorks:
      "When you send a prompt, the server first processes all input tokens at once (prefill), then generates output one token at a time (decode), keeping a KV cache of what it has already computed. That is why time to first token grows with prompt length, why total time grows with output length, and why serving engines that manage the KV cache well can handle many more users per GPU. Providers pass these mechanics on to you as pricing: cached prompt prefixes are cheaper, and output tokens cost more than input.",
    uses: [
      {
        who: "vLLM and LMSYS Chatbot Arena",
        what: "vLLM introduced PagedAttention, which stores the KV cache in small blocks like virtual memory pages, cutting wasted memory from most of the cache to a few percent. LMSYS moved its Vicuna and Chatbot Arena serving to vLLM and reported much higher throughput with about half the GPUs.",
        source: { label: "vLLM blog: Easy, fast and cheap LLM serving with PagedAttention", url: "https://vllm.ai/blog/2023-06-20-vllm", kind: "blog" },
      },
      {
        who: "Anthropic prompt caching",
        what: "Claude lets you mark a stable prompt prefix (tools, system prompt, long documents) for caching. Later requests that reuse the exact prefix skip reprocessing it, and cached reads are billed at a small fraction of the normal input price, which speeds up and cheapens long, repeated prompts.",
        source: { label: "Claude docs: Prompt caching", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", kind: "docs" },
      },
    ],
    scenario: {
      title: "Making a document assistant feel fast",
      context:
        "Users ask many questions about the same 40-page contract. Each answer takes several seconds before any text appears, and the bill is dominated by re-sending the contract every time.",
      architecture:
        "The contract and instructions form a fixed prefix marked for caching, followed by the user's question. Responses are streamed. Metrics record time to first token, total latency and cached versus uncached input tokens per request.",
      tools: ["an LLM API with prompt caching", "streaming responses", "a latency dashboard", "the usage fields in each response"],
      steps: [
        "Measure the baseline: time to first token, total time and input tokens for ten real questions.",
        "Reorder the prompt so everything stable (instructions, contract) comes first and the question comes last.",
        "Mark the stable prefix for caching and confirm in the usage fields that later calls report cache reads.",
        "Turn on streaming so users see text as soon as decode starts.",
        "Compare the new metrics with the baseline and keep the dashboard to catch regressions, such as a timestamp sneaking into the prefix and breaking the cache.",
      ],
    },
    example: {
      title: "Caching a long, stable prefix",
      lang: "python",
      code: `from anthropic import Anthropic

client = Anthropic()
contract = open("contract.txt").read()

def ask(question: str):
    r = client.messages.create(
        model="your-model-id",
        max_tokens=500,
        system=[
            {"type": "text", "text": "Answer only from the contract. Quote the clause."},
            {"type": "text", "text": contract,
             "cache_control": {"type": "ephemeral"}},   # cache up to here
        ],
        messages=[{"role": "user", "content": question}],
    )
    u = r.usage
    print("cache write", u.cache_creation_input_tokens,
          "cache read", u.cache_read_input_tokens, "fresh", u.input_tokens)
    return r.content[0].text`,
      notes:
        "The first call writes the cache; follow-up calls within the cache lifetime read it. If any byte before the breakpoint changes, such as a date in the system prompt, the cache misses, which is why stable content goes first.",
    },
    tradeoffs: [
      { issue: "Long prompts raise time to first token for every request.", response: "Trim context, cache stable prefixes, and stream so users see progress early." },
      { issue: "Long outputs dominate total latency and cost.", response: "Ask for concise formats, set `max_tokens`, and split long generations into steps the user can see." },
      { issue: "Self-hosting gives control but GPU utilisation is hard to keep high.", response: "Use a serving engine with continuous batching and paged KV cache, and load-test at realistic concurrency before buying hardware." },
    ],
    junior: "Puts the user's question first and a changing timestamp in the system prompt, so nothing is ever cached, and waits for the full answer before showing anything.",
    senior: "Designs prompts around prefill and decode costs, measures time to first token and cache hit rate, and picks serving or caching options from those numbers.",
    reading: [
      { label: "HF LLM Course: Behind the pipeline", url: "https://huggingface.co/learn/llm-course/chapter2/2", kind: "docs" },
      { label: "Claude docs: Prompt caching", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", kind: "docs" },
    ],
  },
  {
    moduleId: "M1.6",
    howItWorks:
      "At each step the model produces probabilities for every possible next token, and sampling settings decide which one is picked. In production teams choose settings per task: low or zero temperature for extraction, classification and code where consistency matters; higher temperature for brainstorming or creative variants. When output must follow a strict format, the strongest control is not temperature but constrained decoding, where the server blocks any token that would break the schema.",
    uses: [
      {
        who: "OpenAI Structured Outputs",
        what: "OpenAI turns a JSON Schema into a grammar and, during decoding, masks out any token that would make the output invalid. They reported full schema adherence on their complex-schema eval with this on, versus well under half for an older model relying on prompting alone.",
        source: { label: "OpenAI: Introducing Structured Outputs in the API", url: "https://openai.com/index/introducing-structured-outputs-in-the-api/", kind: "blog" },
      },
      {
        who: "Best-of-N in practice",
        what: "Chip Huyen describes generating several candidates and picking the best by average log-probability, a verifier or a simple rule such as the most common answer. It is a sampling-level way to buy quality with extra compute, with gains that flatten as N grows.",
        source: { label: "Chip Huyen: Generation configurations", url: "https://huyenchip.com/2024/01/16/sampling.html", kind: "blog" },
      },
    ],
    scenario: {
      title: "Choosing settings for three features in one app",
      context:
        "An e-commerce app uses one model for three things: tagging product reviews by topic, drafting marketing taglines, and extracting order details into JSON for the warehouse system.",
      architecture:
        "A shared LLM client accepts a per-feature config: model, temperature, max tokens and whether to use structured output. Configs live in code next to each feature's eval set.",
      tools: ["an LLM API", "structured outputs or a JSON schema", "per-feature eval sets", "a config file per feature"],
      steps: [
        "Write an eval set for each feature: correct tags, rated taglines and expected JSON.",
        "Start review tagging and extraction at temperature 0 and taglines at around 0.8 to 1.0.",
        "Turn on structured output with a schema for extraction, rather than relying on temperature to keep the JSON valid.",
        "Run each eval several times to see run-to-run variance, and adjust settings only if variance hurts the metric.",
        "Freeze the configs in code, and re-run the evals when you change model, because the same temperature behaves differently across models.",
      ],
    },
    example: {
      title: "Per-task generation settings",
      lang: "python",
      code: `TASKS = {
    "tag_review":   {"temperature": 0.0, "max_tokens": 20},
    "extract_order": {"temperature": 0.0, "max_tokens": 300, "schema": "Order"},
    "tagline":      {"temperature": 0.9, "max_tokens": 60, "n_variants": 5},
}

def settings_for(task: str) -> dict:
    cfg = dict(TASKS[task])
    if "schema" in cfg:
        cfg["structured_output"] = True   # let the server enforce the format
    return cfg

# A creative task asks for several variants and lets a human or a scorer pick;
# an extraction task asks once, deterministically, with a schema.
print(settings_for("tagline"))
print(settings_for("extract_order"))`,
      notes:
        "The point is that sampling is configured per task, not once for the whole app. Some providers ignore or restrict some parameters on certain models, especially reasoning models, so check the API reference for the model you use.",
    },
    tradeoffs: [
      { issue: "Temperature 0 is more consistent but not guaranteed identical across runs.", response: "Design tests to tolerate small wording changes and assert on structure or meaning, not exact strings." },
      { issue: "High temperature gives variety but more errors and off-topic output.", response: "Generate several candidates at a moderate temperature and filter them with rules, a scorer or a human." },
      { issue: "Changing sampling to fix a format problem rarely works.", response: "Use structured outputs, validation and repair for format; use sampling only for the variety you actually want." },
    ],
    junior: "Leaves defaults everywhere, then raises or lowers temperature at random whenever output looks wrong.",
    senior: "Chooses sampling per task based on whether consistency or variety matters, uses constrained decoding for formats, and confirms each choice with repeated eval runs.",
    reading: [
      { label: "Generation configurations: temperature, top-k, top-p (Chip Huyen)", url: "https://huyenchip.com/2024/01/16/sampling.html", kind: "blog" },
      { label: "HF LLM Course: Behind the pipeline", url: "https://huggingface.co/learn/llm-course/chapter2/2", kind: "docs" },
    ],
  },
  {
    moduleId: "M1.7",
    howItWorks:
      "Reasoning models spend extra hidden tokens thinking before they answer, and APIs expose a dial for how much (an effort level or a thinking budget). Those thinking tokens are billed as output and add latency. Teams therefore use reasoning where it pays off, such as multi-step analysis, planning, tricky code and maths, and switch it down or off for simple classification, extraction or chat. The usual practice is to route requests: cheap fast settings by default, more thinking only for hard cases.",
    uses: [
      {
        who: "OpenAI reasoning models",
        what: "OpenAI's docs describe a reasoning-effort setting from none up to very high, bill reasoning tokens as output, report them in the usage object, and advise leaving plenty of room in the output limit so the model does not run out mid-thought and return nothing visible.",
        source: { label: "OpenAI docs: Reasoning models", url: "https://developers.openai.com/api/docs/guides/reasoning", kind: "docs" },
      },
      {
        who: "Anthropic extended and adaptive thinking",
        what: "Claude can think before answering, controlled by an effort level in adaptive mode, and the thinking tokens are billed as output and reported in usage. The docs note that changing thinking settings between calls invalidates prompt caches.",
        source: { label: "Claude docs: Extended thinking", url: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking", kind: "docs" },
      },
    ],
    scenario: {
      title: "Adding reasoning to a data-analysis assistant without blowing the budget",
      context:
        "Analysts ask an internal assistant both quick lookups (what was revenue last month) and hard questions (why did churn rise in one region). Hard answers are often wrong; quick ones must stay fast.",
      architecture:
        "A cheap router classifies each request as simple or complex. Simple requests go to a fast model with reasoning off or low. Complex ones go to a reasoning model with higher effort and a larger output limit. Usage logs record thinking tokens and latency per route.",
      tools: ["a reasoning-capable LLM API", "a small router prompt or classifier", "an eval set split by difficulty", "a cost and latency dashboard"],
      steps: [
        "Build an eval set with both easy and hard questions and their correct answers.",
        "Run it at low and high effort, recording accuracy, latency and total output tokens for each.",
        "Find where higher effort improves accuracy (usually only the hard set) and where it just adds cost.",
        "Add the router, and send only complex requests to high effort with a generous output limit.",
        "Watch thinking tokens and latency per route weekly, and adjust the router when costs drift.",
      ],
    },
    example: {
      title: "Route effort by difficulty",
      lang: "python",
      code: `from openai import OpenAI

client = OpenAI()

def is_complex(q: str) -> bool:
    # In production this is a cheap classifier call or rules tuned on your evals.
    return any(w in q.lower() for w in ("why", "compare", "plan", "root cause"))

def answer(q: str) -> str:
    effort = "high" if is_complex(q) else "low"
    r = client.responses.create(
        model="your-reasoning-model",
        reasoning={"effort": effort},
        max_output_tokens=25_000 if effort == "high" else 2_000,
        input=q,
    )
    if r.status == "incomplete":
        return "That needs more work than allowed; try narrowing the question."
    return r.output_text`,
      notes:
        "Reasoning tokens count against the output limit, so high-effort calls need a much larger limit. Checking for an incomplete status avoids returning an empty answer when the model used its whole budget thinking.",
    },
    tradeoffs: [
      { issue: "Reasoning raises latency and cost on every call.", response: "Route by difficulty, default to low effort, and measure accuracy gains before turning effort up." },
      { issue: "The model can run out of output budget while thinking and return nothing.", response: "Set generous output limits for high effort and handle incomplete responses explicitly." },
      { issue: "Prompts written for older models (step-by-step instructions) can hurt reasoning models.", response: "Give reasoning models the goal and constraints, not a scripted chain of thought, and test both styles on your evals." },
    ],
    junior: "Turns reasoning to maximum for everything because answers look smarter, then wonders why the app is slow and expensive.",
    senior: "Measures where reasoning improves accuracy, routes only those requests to higher effort, and tracks thinking tokens as a cost line of their own.",
    reading: [
      { label: "Why We Think (Lilian Weng)", url: "https://lilianweng.github.io/posts/2025-05-01-thinking/", kind: "blog" },
      { label: "Claude docs: Extended thinking", url: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking", kind: "docs" },
    ],
  },
  {
    moduleId: "M1.8",
    howItWorks:
      "The context window is the model's whole working memory for one request: system prompt, tool definitions, retrieved documents, conversation history and the answer it is writing. Real systems manage it on purpose. They decide what goes in, in what order, and what is summarised or dropped as conversations grow, because a full window costs more, runs slower and is used less reliably. Putting key instructions and facts at the start or end, and loading details only when needed, beats stuffing everything in.",
    uses: [
      {
        who: "Shopify Sidekick",
        what: "Shopify's merchant assistant moved guidance out of an ever-growing system prompt and instead returns the relevant instructions together with tool results, only when needed. They found this kept the prompt manageable and also stopped instruction changes from breaking prompt caches.",
        source: { label: "Shopify Engineering: Building production-ready agentic systems", url: "https://shopify.engineering/building-production-ready-agentic-systems", kind: "case-study" },
      },
      {
        who: "Anthropic context engineering",
        what: "Anthropic describes context as a limited attention budget: recall drops as the window fills. Their agents compact long histories into summaries, keep notes outside the window, load files just in time by reference, and hand side work to sub-agents with clean contexts.",
        source: { label: "Anthropic: Effective context engineering for AI agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", kind: "blog" },
      },
      {
        who: "Lost in the Middle (research)",
        what: "Researchers found models answer best when the needed fact is near the start or end of a long input and worse when it sits in the middle, even for long-context models. It is why teams put the most relevant retrieved passages at the edges.",
        source: { label: "Liu et al.: Lost in the Middle", url: "https://arxiv.org/abs/2307.03172", kind: "paper" },
      },
    ],
    scenario: {
      title: "A support chat that stays sharp after 60 turns",
      context:
        "Long support conversations get slower, more expensive, and the assistant starts forgetting the customer's original problem or ignoring rules from the system prompt.",
      architecture:
        "A context builder assembles each request from parts with a token budget for each: system rules, a running summary of older turns, the last few turns verbatim, and only the retrieved articles relevant to the latest message. Important facts (order id, plan) live in a structured state block.",
      tools: ["a token counter", "a summarisation call", "retrieval for help articles", "per-request token logging"],
      steps: [
        "Log how many tokens each part of the prompt uses over long real conversations to see what is growing.",
        "Set a budget per part, for example rules 1k, state 300, summary 1k, recent turns 4k, articles 3k.",
        "Keep key facts in a small structured state block that is always included, instead of hoping the model finds them in old turns.",
        "When history exceeds its budget, summarise the oldest turns into the running summary and drop them.",
        "Test with long synthetic conversations that check whether the assistant still remembers the original issue and follows the rules.",
      ],
    },
    example: {
      title: "A budgeted context builder",
      lang: "python",
      code: `def build_context(rules, state, summary, turns, articles, count, budget=9000):
    parts = [
        ("rules", rules),
        ("state", f"Customer facts: {state}"),
        ("summary", f"Earlier in this chat: {summary}"),
    ]
    used = sum(count(t) for _, t in parts)
    recent = []
    for turn in reversed(turns):                 # newest first
        if used + count(turn) > budget * 0.6:
            break
        recent.insert(0, turn)
        used += count(turn)
    docs = []
    for a in articles:                          # already ranked by relevance
        if used + count(a) > budget:
            break
        docs.append(a); used += count(a)
    # Most relevant article last, right before the question
    return parts, docs[::-1], recent`,
      notes:
        "Every part has a budget, newest turns win over old ones, and the dropped history should already be folded into the summary. The most relevant article is placed nearest the question, where models use it most reliably.",
    },
    tradeoffs: [
      { issue: "Large windows tempt teams to send everything, which raises cost and lowers accuracy.", response: "Budget tokens per part and include only what the current step needs." },
      { issue: "Summaries lose details that turn out to matter later.", response: "Keep critical facts in a structured state block and keep raw history in storage so it can be retrieved again." },
      { issue: "Changing the prompt layout often breaks prompt caching.", response: "Keep stable parts first and in a fixed order, and put changing parts at the end." },
    ],
    junior: "Appends every message and document to the prompt until the API errors with a context-length message.",
    senior: "Treats context as a budget, designs what goes in each request, measures recall over long sessions, and uses summaries, state and just-in-time loading to keep the window focused.",
    reading: [
      { label: "Claude docs: Context windows", url: "https://platform.claude.com/docs/en/build-with-claude/context-windows", kind: "docs" },
      { label: "Effective context engineering for AI agents (Anthropic)", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", kind: "blog" },
    ],
  },
  {
    moduleId: "M1.9",
    howItWorks:
      "Teams assume the model will sometimes be wrong and design around it. They learn the common failure modes for their task (made-up facts, wrong arithmetic, ignored instructions, overconfidence, inconsistency), measure how often each happens on real examples, and add a defence for each: retrieval for facts, tools for maths, validation for formats, and human review for high-stakes answers. The useful question is always how reliably, measured, not whether it can.",
    uses: [
      {
        who: "Air Canada",
        what: "A tribunal held Air Canada liable after its website chatbot invented a refund route for bereavement fares. It is now the standard example that hallucinations in a customer-facing bot are the company's responsibility, not the model's.",
        source: { label: "CX Today: Court orders Air Canada to pay out for chatbot's bad advice", url: "https://www.cxtoday.com/conversational-ai/court-orders-air-canada-to-pay-out-for-chatbots-bad-advice/", kind: "news" },
      },
      {
        who: "Rechat (Lucy assistant)",
        what: "Rechat's real-estate assistant hit a plateau of whack-a-mole failures until the team built a layered evaluation process: hundreds of cheap assertion tests on every change, regular human and model review of logged traces, and A/B tests once mature.",
        source: { label: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "case-study" },
      },
    ],
    scenario: {
      title: "A failure-mode audit before launch",
      context:
        "An HR assistant answers employee questions about leave and benefits. Before launch, leadership asks how often it is wrong and what kind of wrong.",
      architecture:
        "The assistant retrieves from the HR policy wiki and answers with citations. An evaluation harness runs a labelled question set and tags each failure by type, and production logs feed new cases back into the set.",
      tools: ["a labelled eval set", "a trace viewer or spreadsheet", "simple assertion tests", "an LLM judge checked against human labels"],
      steps: [
        "Collect 100 real questions and have HR write the correct answers and the source page for each.",
        "Run the assistant and read every answer, tagging failures: invented fact, wrong policy version, missed nuance, refused wrongly, bad format.",
        "Count failures by type and fix the biggest bucket first, for example adding retrieval for the missing policy pages.",
        "Turn each fixed failure into an automated test so it cannot quietly return.",
        "Publish the measured accuracy and the known weak spots to leadership, and add a visible 'check with HR' path for sensitive topics.",
      ],
    },
    example: {
      title: "Cheap assertions that catch common failures",
      lang: "python",
      code: `import re

def check_answer(answer: str, sources: list[str], expected_days: int | None) -> list[str]:
    problems = []
    if not re.search(r"\\[source: [^\\]]+\\]", answer):
        problems.append("no citation")
    for cited in re.findall(r"\\[source: ([^\\]]+)\\]", answer):
        if cited not in sources:
            problems.append(f"cites a page that was not retrieved: {cited}")
    if expected_days is not None:
        nums = [int(n) for n in re.findall(r"\\b(\\d{1,3}) days\\b", answer)]
        if nums and expected_days not in nums:
            problems.append(f"wrong number of days: {nums}")
    if "as an ai" in answer.lower():
        problems.append("boilerplate disclaimer")
    return problems

print(check_answer("You get 20 days [source: leave-policy]", ["leave-policy"], 24))`,
      notes:
        "These checks are fast and free, so they run on every change. They do not judge overall quality, but they catch the frequent, embarrassing failures: missing or invented citations and wrong key numbers.",
    },
    tradeoffs: [
      { issue: "You cannot remove hallucinations completely.", response: "Reduce them with grounding and tools, detect them with checks, and limit the damage with citations, scope limits and human escalation." },
      { issue: "Manual review of outputs is slow.", response: "Start manual to learn the failure types, then automate the common ones with assertions and a calibrated LLM judge." },
      { issue: "A fix for one failure can cause another.", response: "Keep every past failure in the eval set and run the whole set before each change." },
    ],
    junior: "Demos the five questions that work and calls the assistant ready.",
    senior: "Collects real questions, measures failure rates by type, adds a specific defence for each, and tells stakeholders the measured reliability and the remaining risk.",
    reading: [
      { label: "Extrinsic Hallucinations in LLMs (Lilian Weng)", url: "https://lilianweng.github.io/posts/2024-07-07-hallucination/", kind: "blog" },
      { label: "Your AI product needs evals (Hamel Husain)", url: "https://hamel.dev/blog/posts/evals/", kind: "blog" },
    ],
  },
  {
    moduleId: "M1.10",
    howItWorks:
      "Companies rarely use one model for everything. They mix closed API models (strong, easy, pay per token), open-weight models (self-hosted or through a hosting provider, for privacy, cost or customisation) and managed cloud platforms that resell both. Model choice is also a maintenance job: models get new snapshots, older ones are deprecated and retired, and licences limit how open models may be used. Teams pin exact model versions, track deprecation notices, and keep the code ready to switch.",
    uses: [
      {
        who: "Anthropic model lifecycle",
        what: "Anthropic documents stages for each model (active, legacy, deprecated, retired) and gives customers advance notice before retirement, after which requests to that model fail. Any production app needs a plan to migrate before that date.",
        source: { label: "Claude docs: Model deprecations", url: "https://platform.claude.com/docs/en/about-claude/model-deprecations", kind: "docs" },
      },
      {
        who: "Artificial Analysis",
        what: "This independent site measures many closed and open models on a combined intelligence index, output speed, time to first token and price per million tokens. Teams use such comparisons to shortlist models, then test the shortlist on their own data.",
        source: AA_MODELS,
      },
    ],
    scenario: {
      title: "Keeping a product working through model changes",
      context:
        "Your app uses one hosted model. Legal now wants some customers' data kept in-region, and the provider has announced that your current model version will be retired.",
      architecture:
        "A model registry in config maps each feature to a pinned model id, provider and fallback. A thin client layer hides provider differences, and every feature has an eval set used to approve any switch.",
      tools: ["a config-driven model registry", "provider SDKs or a gateway such as LiteLLM", "per-feature eval sets", "model cards and licence pages"],
      steps: [
        "List every model id in use and where, and subscribe to each provider's deprecation and release notes.",
        "Pin exact versions or snapshots in config instead of floating aliases for anything customers depend on.",
        "Shortlist replacements, including an open-weight model hosted in the required region, and read their licences.",
        "Run each feature's eval set on the candidates and compare quality, latency and cost.",
        "Switch one feature at a time behind a flag, watch metrics, and retire the old model before its shutdown date.",
      ],
    },
    example: {
      title: "A model registry instead of hard-coded ids",
      lang: "yaml",
      code: `# models.yaml - one place to change models, reviewed like code
features:
  support_chat:
    primary:  { provider: anthropic, model: "pinned-model-snapshot-id" }
    fallback: { provider: openai,    model: "pinned-model-snapshot-id" }
    eval_set: evals/support_chat.jsonl
  eu_contract_review:
    primary:  { provider: self_hosted_eu, model: "open-weight-model@rev-abc123" }
    licence_checked: 2026-10-01
    eval_set: evals/contracts.jsonl
  tagging:
    primary:  { provider: anthropic, model: "small-fast-model-id" }
retirements:
  - model: "old-model-id"
    shutdown: 2026-12-15
    owner: platform-team`,
      notes:
        "Each feature points at a pinned model and its own eval set, so a switch is a reviewed config change backed by numbers. Tracking retirement dates with an owner turns provider announcements into planned work instead of outages.",
    },
    tradeoffs: [
      { issue: "Closed APIs are easy but create vendor lock-in and data-residency questions.", response: "Keep a thin provider-agnostic layer and at least one tested fallback, and check each provider's data and region options." },
      { issue: "Open-weight models give control but you own serving, scaling and upgrades.", response: "Start with a managed host for open models, and self-host only when cost or privacy clearly justifies the operations work." },
      { issue: "Floating model aliases change behaviour without warning.", response: "Pin snapshots for production and upgrade deliberately after running evals." },
    ],
    junior: "Hard-codes one model name across the codebase and learns about its retirement from a wave of failed requests.",
    senior: "Keeps a registry of pinned models with owners, fallbacks and eval sets, watches lifecycle notices and licences, and treats model changes as planned, tested releases.",
    reading: [
      { label: "Claude docs: Models overview", url: "https://platform.claude.com/docs/en/models/overview", kind: "docs" },
      { label: "Hugging Face Hub docs: Model cards", url: "https://huggingface.co/docs/hub/model-cards", kind: "docs" },
    ],
  },
  {
    moduleId: "M1.11",
    howItWorks:
      "Benchmarks and leaderboards are a starting filter, not a decision. Public scores measure general tasks under test conditions that may not match yours, can be inflated by contamination or tuning to the leaderboard, and say nothing about your prompts, data, latency or cost. Teams use them to pick three or four candidates, then run their own small evaluation built from real examples. That private eval is what decides, and it is rerun whenever a model changes.",
    uses: [
      {
        who: "Chatbot Arena (a cautionary study)",
        what: "Researchers found that some providers privately tested many variants on the Arena and published only the best, and that big providers received far more of the Arena's data than open models. They argue this lets models fit the leaderboard rather than get better in general.",
        source: { label: "Singh et al.: The Leaderboard Illusion", url: "https://arxiv.org/abs/2504.20879", kind: "paper" },
      },
      {
        who: "Shopify Sidekick",
        what: "Shopify built its own ground-truth sets from sampled real merchant conversations, labelled by several experts, and calibrated LLM judges until their agreement with humans came close to human-to-human agreement. Their own eval, not public benchmarks, gates releases.",
        source: { label: "Shopify Engineering: Building production-ready agentic systems", url: "https://shopify.engineering/building-production-ready-agentic-systems", kind: "case-study" },
      },
    ],
    scenario: {
      title: "From leaderboard to a decision in one week",
      context:
        "A team building a contract-clause extractor sees a new model top a public leaderboard and wants to switch to it immediately.",
      architecture:
        "A private eval set of 150 real clauses with expected extractions, a scoring script, and a results table comparing candidates on accuracy, latency and cost per 1,000 documents.",
      tools: ["public leaderboards for shortlisting", "a private labelled eval set", "a scoring script", "a spreadsheet or eval tool"],
      steps: [
        "Use leaderboards and model cards to shortlist three candidates, including the current model as the baseline.",
        "Build or reuse a private eval set from real documents, kept out of any prompt examples to avoid leaking answers.",
        "Run every candidate with the same prompt and settings, three times each to see variance.",
        "Compare accuracy on your task, p95 latency and cost per 1,000 documents side by side.",
        "Switch only if the new model wins on your numbers, and record the results so the decision can be revisited later.",
      ],
    },
    example: {
      title: "A tiny private benchmark runner",
      lang: "python",
      code: `import json, statistics, time

def run_eval(call_model, cases_path: str, runs: int = 3) -> dict:
    cases = [json.loads(l) for l in open(cases_path)]
    scores, latencies = [], []
    for _ in range(runs):
        correct = 0
        for c in cases:
            t = time.perf_counter()
            out = call_model(c["input"])
            latencies.append(time.perf_counter() - t)
            correct += int(out.strip().lower() == c["expected"].strip().lower())
        scores.append(correct / len(cases))
    return {
        "accuracy_mean": round(statistics.mean(scores), 3),
        "accuracy_spread": round(max(scores) - min(scores), 3),
        "p95_latency_s": round(sorted(latencies)[int(0.95 * len(latencies))], 2),
    }`,
      notes:
        "Exact match is the simplest scorer; real tasks often need field-level matching or a judge. Running several times shows how much of a difference between models is just noise.",
    },
    tradeoffs: [
      { issue: "Building a private eval set takes time and domain experts.", response: "Start with 50 to 100 real examples and grow it with every production failure; a small honest set beats a large generic one." },
      { issue: "Public scores can be inflated by training-data overlap or leaderboard tuning.", response: "Treat them as a shortlist signal only and rely on your own held-out data." },
      { issue: "LLM judges are cheap but can disagree with humans.", response: "Measure judge agreement against human labels and improve the judge before trusting it." },
    ],
    junior: "Picks whatever model is first on the leaderboard this week and switches the app over the same day.",
    senior: "Uses leaderboards to shortlist, decides with a private eval on real data that includes latency and cost, and keeps that eval for every future model change.",
    reading: [
      { label: "Artificial Analysis LLM leaderboard", url: "https://artificialanalysis.ai/leaderboards/models", kind: "docs" },
      { label: "MTEB: Massive Text Embedding Benchmark", url: "https://huggingface.co/blog/mteb", kind: "blog" },
    ],
  },
  {
    moduleId: "M1.12",
    howItWorks:
      "Model choice is a trade between capability, quality on your task, latency, cost, context size, modalities, privacy and product features (tools, structured output, caching, batch). Teams write down which of these matter for each feature, shortlist models that meet the hard requirements, and then decide by running their own evals. A common pattern is starting with a strong model to prove the feature works, then trying cheaper or faster models (or lower effort) and keeping the cheapest one that still passes.",
    uses: [
      {
        who: "Anthropic model selection guide",
        what: "Anthropic's guide suggests either starting with the small fast model and upgrading only where tests show gaps, or starting with the most capable model and stepping down as prompts improve. It says to tune effort before switching models and to decide with benchmark tests built from your own data.",
        source: { label: "Claude docs: Choosing the right model", url: "https://platform.claude.com/docs/en/about-claude/models/choosing-a-model", kind: "docs" },
      },
      {
        who: "Klarna",
        what: "Klarna's support assistant tailors prompts to each scenario and routes requests to specific handlers, which LangChain's case study credits with lowering token cost and latency while serving a very large customer base.",
        source: { label: "LangChain: How Klarna's AI assistant redefined customer support", url: "https://www.langchain.com/blog/customers-klarna", kind: "case-study" },
      },
    ],
    scenario: {
      title: "Picking models for a meeting-notes product",
      context:
        "The product transcribes meetings, writes a summary, extracts action items as JSON, and answers questions about past meetings. Customers include a bank that forbids data leaving its cloud region.",
      architecture:
        "Each feature has its own model choice in config. Summaries and action items run on a mid-size model with structured output, Q&A over many meetings uses a long-context model with caching, and the bank's tenant uses models available in its required region.",
      tools: ["a requirements table per feature", "pricing pages and model cards", "per-feature eval sets", "a model registry config"],
      steps: [
        "For each feature, write the hard requirements (region, modalities, context size, structured output) and the targets (accuracy, p95 latency, cost per meeting).",
        "Filter the model list by hard requirements first; this often removes most options.",
        "Prototype each feature with a strong model to confirm the task is possible and to create a quality bar.",
        "Run the eval with two cheaper or faster candidates and keep the cheapest that meets the bar.",
        "Record the choice and the numbers in the registry, and revisit when prices or models change.",
      ],
    },
    example: {
      title: "A requirements-first selection sheet",
      lang: "text",
      code: `Feature: action-item extraction
Hard requirements
  - structured output (JSON schema)          must
  - EU data residency for tenant "bank-eu"    must
  - context >= 32k tokens                     must
Targets (from evals/action_items.jsonl, 120 meetings)
  - field-level F1 >= 0.90
  - p95 latency <= 6 s
  - cost <= $0.01 per meeting

Results                       F1    p95    $/meeting   passes?
  large-model                 0.94  9.1s   0.031       no (latency, cost)
  mid-model                   0.92  4.2s   0.008       YES  <- choose
  small-model                 0.84  1.9s   0.002       no (quality)
  small-model + 3 examples    0.89  2.3s   0.003       no (close; retry after prompt work)`,
      notes:
        "Hard requirements filter, measured targets decide. The last row shows the habit of improving the prompt on a cheaper model before giving up on it; a later prompt change might make it the winner.",
    },
    tradeoffs: [
      { issue: "The best model on quality is often too slow or expensive at scale.", response: "Set explicit quality, latency and cost targets per feature and choose the cheapest model that meets all three." },
      { issue: "Using different models per feature adds operational complexity.", response: "Centralise model config and the client layer so that many models do not mean many code paths." },
      { issue: "Prices and models change every few months.", response: "Keep the eval harness ready so re-running the comparison takes an hour, not a project." },
    ],
    junior: "Uses the most famous model for everything without checking cost, region rules or whether a smaller model would do.",
    senior: "Writes requirements and targets per feature, filters by hard constraints, decides with evals and cost per task, and makes switching models a routine config change.",
    reading: [
      { label: "Artificial Analysis: models by intelligence, speed and price", url: "https://artificialanalysis.ai/models", kind: "docs" },
      { label: "Claude docs: Models overview", url: "https://platform.claude.com/docs/en/models/overview", kind: "docs" },
    ],
  },
];
