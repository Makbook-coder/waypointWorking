import type { AppliedModule } from "./types";

const GENAI_PLATFORM = { label: "Chip Huyen: Building a generative AI platform", url: "https://huyenchip.com/2024/07/25/genai-platform.html", kind: "blog" } as const;
const LLM_ENGINEERING = { label: "Chip Huyen: Building LLM applications for production", url: "https://huyenchip.com/2023/04/11/llm-engineering.html", kind: "blog" } as const;
const LLM_PATTERNS = { label: "Eugene Yan: Patterns for building LLM-based systems and products", url: "https://eugeneyan.com/writing/llm-patterns/", kind: "blog" } as const;
const UBER = { label: "Uber Engineering: Navigating the LLM landscape with GenAI Gateway", url: "https://www.uber.com/blog/genai-gateway", kind: "case-study" } as const;
const CURSOR = { label: "Cursor: Editing files at 1000 tokens per second", url: "https://cursor.com/blog/instant-apply", kind: "case-study" } as const;
const COPILOT_MODEL = { label: "GitHub Blog: Building a faster, smarter Copilot with a new custom model", url: "https://github.blog/ai-and-ml/github-copilot/the-road-to-better-completions-building-a-faster-smarter-github-copilot-with-a-new-custom-model/", kind: "case-study" } as const;
const HONEYCOMB = { label: "Honeycomb: All the hard stuff nobody talks about when building products with LLMs", url: "https://www.honeycomb.io/blog/hard-stuff-nobody-talks-about-llm", kind: "case-study" } as const;
const OPENAI_OUTAGE = { label: "OpenAI status: December 11, 2024 incident write-up", url: "https://status.openai.com/incidents/ctrsv3lwd797/write-up", kind: "case-study" } as const;
const DOORDASH = { label: "DoorDash: Path to high-quality LLM-based Dasher support automation", url: "https://careersatdoordash.com/blog/large-language-modules-based-dasher-support-automation/", kind: "case-study" } as const;
const DOORDASH_BEDROCK = { label: "AWS case study: DoorDash builds a generative AI contact center with Amazon Bedrock", url: "https://aws.amazon.com/solutions/case-studies/doordash-bedrock-case-study", kind: "case-study" } as const;
const RESEARCH = { label: "Anthropic: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" } as const;
const CONTEXTUAL = { label: "Anthropic: Introducing Contextual Retrieval", url: "https://www.anthropic.com/news/contextual-retrieval", kind: "blog" } as const;
const GRAPHRAG = { label: "microsoft/graphrag on GitHub", url: "https://github.com/microsoft/graphrag", kind: "docs" } as const;
const LITELLM_ROUTING = { label: "LiteLLM docs: Router and load balancing", url: "https://docs.litellm.ai/docs/routing", kind: "docs" } as const;
const LITELLM_FALLBACKS = { label: "LiteLLM docs: Fallbacks and reliability", url: "https://docs.litellm.ai/docs/proxy/reliability", kind: "docs" } as const;
const OPENROUTER_ROUTING = { label: "OpenRouter docs: Provider routing", url: "https://openrouter.ai/docs/guides/routing/provider-selection", kind: "docs" } as const;
const STREAMING = { label: "Claude docs: Streaming messages", url: "https://platform.claude.com/docs/en/build-with-claude/streaming", kind: "docs" } as const;
const PROMPT_CACHING = { label: "Claude docs: Prompt caching", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", kind: "docs" } as const;
const NEMO = { label: "NVIDIA NeMo Guardrails overview", url: "https://docs.nvidia.com/nemo/guardrails/latest/index.html", kind: "docs" } as const;
const LANGGRAPH_THINKING = { label: "LangGraph docs: Thinking in LangGraph", url: "https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph", kind: "docs" } as const;
const LANGGRAPH_PERSIST = { label: "LangGraph docs: Persistence", url: "https://docs.langchain.com/oss/python/langgraph/persistence", kind: "docs" } as const;
const LANGFUSE = { label: "Langfuse docs: Observability and tracing", url: "https://langfuse.com/docs/observability/overview", kind: "docs" } as const;
const EVALS_FAQ = { label: "Hamel Husain and Shreya Shankar: AI evals FAQ", url: "https://hamel.dev/blog/posts/evals-faq/", kind: "blog" } as const;

export const APPLIED_L9: AppliedModule[] = [
  {
    moduleId: "M9.1",
    howItWorks:
      "AI system design starts the same way as any system design (users, requirements, scale, constraints) and then adds AI-specific questions: what quality is good enough and how will it be measured, what context the model needs and where it comes from, what the model is allowed to do, what latency and cost per request are acceptable, and what happens when the model is wrong. A useful approach is to start from the simplest version (one model call) and add components only when a measured need appears: retrieval, guardrails, a router, caching, then multi-step logic, each with evaluation and observability.",
    uses: [
      {
        who: "Honeycomb Query Assistant",
        what: "Honeycomb found that the model was the easy part of its natural-language query feature. Schemas too large for the context, latency, prompt injection, and legal review for regulated customers took most of the work, and they concluded that an LLM is an engine for features rather than a product.",
        source: HONEYCOMB,
      },
      {
        who: "DoorDash (voice support on Bedrock)",
        what: "DoorDash designed its driver voice-support system around a hard requirement of answering within 2.5 seconds, because drivers call while driving. It combined its existing phone system, a knowledge base over help-centre content, and an automated test framework running thousands of tests per hour.",
        source: DOORDASH_BEDROCK,
      },
    ],
    scenario: {
      title: "Designing an internal IT help assistant",
      context:
        "A 5,000-person company wants an assistant that answers IT questions and can reset passwords or open tickets. The interview-style question is: design it.",
      architecture:
        "Requirements first: 2,000 questions a day, answers in under 5 seconds, 90 percent of answers rated correct by IT, no action without identity checks. The design is a router (question, action, or out of scope), RAG over IT docs for questions, a small set of gated tools for actions, input and output guardrails, a gateway for model access, tracing and an eval set.",
      tools: ["a requirements checklist", "an architecture diagram", "an eval set of real tickets", "a cost and latency estimate per request", "tracing"],
      steps: [
        "Write functional and non-functional requirements, including quality targets and what the system must never do.",
        "Estimate traffic, tokens per request, latency budget per step and monthly cost.",
        "Draw the simplest design that could meet the requirements and list what it cannot handle yet.",
        "Add components (retrieval, router, guardrails, tools) only for named needs, and note the trade-off each adds.",
        "Define how it will be evaluated before launch and monitored after, and what the fallback is when it fails.",
      ],
    },
    example: {
      title: "A one-page design summary",
      lang: "yaml",
      code: `goal: answer IT questions and run safe IT actions for employees
requirements:
  quality: 90% of answers rated correct by IT on the eval set
  latency: p95 under 5 s for answers, actions confirmed in under 10 s
  scale: 2,000 requests/day, peak 5 per second
  safety: no action without SSO identity; password resets need a second factor
components:
  router: small classifier -> question | action | out_of_scope
  knowledge: hybrid search over IT docs, reranked, cited
  actions: reset_password, open_ticket (gated, logged)
  guardrails: PII masking in logs, output policy check
  gateway: one internal endpoint, budgets per team, provider fallback
cost_estimate: about 3k input + 400 output tokens per answer
fallback: open a ticket for a human when confidence is low or a check fails
evaluation: 300 real tickets offline; weekly sampled review online`,
      notes:
        "Putting quality, latency, cost and failure behaviour on one page forces the trade-offs to be decided up front. Each component is justified by a requirement rather than added because it is popular.",
    },
    tradeoffs: [
      { issue: "Designing every component up front adds complexity before it is needed.", response: "Start with the simplest design that meets the requirements and add parts when measurements show the need." },
      { issue: "Quality requirements are vague, so nobody can tell whether the system is done.", response: "Turn them into eval-set targets agreed with the people who own the domain." },
      { issue: "Cost and latency surprises appear only at scale.", response: "Estimate tokens and latency per step early and load-test before launch." },
    ],
    junior: "Jumps straight to a vector database and an agent framework without stating requirements.",
    senior: "Starts from requirements and a measurable quality bar, estimates cost and latency, and adds components one justified step at a time.",
    reading: [GENAI_PLATFORM, LLM_ENGINEERING, HONEYCOMB],
  },
  {
    moduleId: "M9.2",
    howItWorks:
      "Context and knowledge architecture decides where the facts the model needs come from and how they reach it: static instructions, documents through retrieval, structured data through SQL or APIs, live data through tools, and user or session memory. Each source has its own freshness, access rules and format. Good designs keep a clear owner and update path for every source, choose retrieval methods per source (keyword, vector, hybrid, graph, SQL), and keep metadata such as source, date and permissions attached so answers can be cited and filtered.",
    uses: [
      {
        who: "Honeycomb",
        what: "Honeycomb's query assistant needed each customer's schema in context, but some had over 5,000 fields. Sending only fields that had data in the past week usually made the schema fit, showing that choosing context is a design decision, not just a bigger window.",
        source: HONEYCOMB,
      },
      {
        who: "Anthropic (Contextual Retrieval)",
        what: "Anthropic showed that adding a short, model-written description of where each chunk sits in its document before embedding and indexing it, combined with keyword search and reranking, sharply reduced failed retrievals in their tests.",
        source: CONTEXTUAL,
      },
    ],
    scenario: {
      title: "Knowledge architecture for a bank's relationship managers",
      context:
        "Relationship managers want an assistant that answers questions about products, a client's holdings and recent market news in one place.",
      architecture:
        "Product policies go through hybrid retrieval over a document index updated nightly. Client holdings come from a read-only API, filtered by which clients the manager covers. Market news comes from a licensed feed through a search tool. Each piece of context carries source, timestamp and access level, and answers cite them.",
      tools: ["a document index with hybrid search", "an internal holdings API", "a news search tool", "an entitlement service", "a context assembler"],
      steps: [
        "List every knowledge source with its owner, freshness, size and access rules.",
        "Choose the access pattern per source: retrieval, SQL or API, or live tool call.",
        "Attach source, timestamp and permission metadata to every piece of context.",
        "Build the assembler that combines sources for each question within a token budget.",
        "Test with questions that need one, two and all three sources, and check citations and freshness.",
      ],
    },
    example: {
      title: "A source registry that drives context assembly",
      lang: "yaml",
      code: `sources:
  product_policies:
    access: hybrid_retrieval
    refresh: nightly
    owner: product-compliance
    permission: all_staff
  client_holdings:
    access: api            # never indexed; fetched live, read-only
    refresh: live
    owner: core-banking
    permission: covering_manager_only
  market_news:
    access: search_tool
    refresh: live
    owner: data-licensing
    permission: all_staff
    note: show publication time with every item`,
      notes:
        "Writing sources down with owner, freshness and permission makes it clear which data can be indexed, which must be fetched live, and who to call when an answer is out of date.",
    },
    tradeoffs: [
      { issue: "Indexing everything is simple but copies sensitive and fast-changing data.", response: "Index stable documents and fetch sensitive or live data through APIs at question time." },
      { issue: "Combining many sources makes prompts long and answers harder to verify.", response: "Budget tokens per source and require citations to the source of each fact." },
      { issue: "Advanced methods like graph RAG add cost and maintenance.", response: "Use them only where tests show plain or hybrid retrieval fails, such as questions about relationships across many documents." },
    ],
    junior: "Puts every data source into one vector index and hopes similarity search finds the right thing.",
    senior: "Chooses the access pattern per source, keeps metadata and permissions attached, and knows who owns each source's freshness.",
    reading: [LLM_PATTERNS, CONTEXTUAL, GRAPHRAG],
  },
  {
    moduleId: "M9.3",
    howItWorks:
      "A model router decides which model or path handles a request, for example a small fast model for simple questions and a larger one for hard ones, or a fixed reply for out-of-scope requests. A gateway is the single entry point all applications use to reach models: it handles authentication, keys, budgets per team, logging, provider fallback and load balancing behind one API. Together they let a company change models, providers and policies in one place instead of in every application.",
    uses: [
      {
        who: "Uber",
        what: "Uber's GenAI Gateway gives every team one OpenAI-compatible API in front of external and Uber-hosted models, with PII redaction, authentication, audit logs for cost attribution, and budget management. When described, it served about 30 teams and 16 million queries a month.",
        source: UBER,
      },
      {
        who: "OpenRouter",
        what: "OpenRouter's default routing spreads requests across providers of the same model, favouring recent uptime and lower price, and lets callers pin a provider order, sort by price, throughput or latency, or exclude providers that keep user data.",
        source: OPENROUTER_ROUTING,
      },
    ],
    scenario: {
      title: "A company-wide model gateway",
      context:
        "Twelve teams call three model providers directly with their own keys. Finance cannot see who spends what, security cannot audit prompts, and an outage at one provider took down four products.",
      architecture:
        "One gateway service exposes an OpenAI-compatible API. Teams get virtual keys with budgets. Requests are logged with team and use case, PII is masked before external calls, and each model alias maps to a primary and fallback deployment. A small classifier in front of the support bot routes easy questions to a cheaper model.",
      tools: ["LiteLLM proxy or a similar gateway", "a secrets manager for provider keys", "a logging and cost dashboard", "a PII masking step", "an intent classifier"],
      steps: [
        "Stand up the gateway with one provider and move one team onto it.",
        "Add virtual keys, budgets and per-team cost reporting.",
        "Define model aliases with fallbacks across providers and test failover.",
        "Add PII masking and audit logging, reviewed with security.",
        "Add routing by difficulty for one high-volume use case and compare quality and cost.",
      ],
    },
    example: {
      title: "Model aliases with load balancing and fallback",
      lang: "python",
      code: `import os
from litellm import Router

router = Router(
    model_list=[
        {"model_name": "chat-default",
         "litellm_params": {"model": "azure/gpt-4o-eu", "api_key": os.environ["AZURE_KEY"],
                            "api_base": os.environ["AZURE_BASE"], "rpm": 900}},
        {"model_name": "chat-default",
         "litellm_params": {"model": "openai/gpt-4o", "api_key": os.environ["OPENAI_KEY"], "rpm": 500}},
        {"model_name": "chat-backup",
         "litellm_params": {"model": "anthropic/claude-sonnet-4-5", "api_key": os.environ["ANTHROPIC_KEY"]}},
    ],
    fallbacks=[{"chat-default": ["chat-backup"]}],
    num_retries=2,
)
reply = router.completion(model="chat-default", messages=[{"role": "user", "content": "Hi"}])`,
      notes:
        "Applications ask for an alias, not a vendor model. The gateway spreads load across two deployments and falls back to a different provider if both fail, so a single outage does not take the product down.",
    },
    tradeoffs: [
      { issue: "A central gateway becomes a single point of failure and a bottleneck.", response: "Run it with several replicas, keep it simple, and monitor its own latency and errors." },
      { issue: "Fallback models behave differently and may break prompts or output formats.", response: "Run the eval suite against every fallback model and keep prompts that work on both." },
      { issue: "Routing by difficulty can send hard questions to a weak model.", response: "Evaluate the router's decisions on labelled examples and route uncertain cases to the stronger model." },
    ],
    junior: "Hard-codes one provider's SDK and API key in every service, so an outage or price change means editing every app.",
    senior: "Puts a gateway in front of all model calls for keys, budgets, logging and failover, and evaluates every model the router can send traffic to.",
    reading: [LITELLM_ROUTING, OPENROUTER_ROUTING, GENAI_PLATFORM],
  },
  {
    moduleId: "M9.4",
    howItWorks:
      "Users feel two latencies: time to first token (how long until something appears) and total time to finish. Teams cut the first with streaming, shorter prompts, prompt caching and smaller models; they cut the second with fewer output tokens, parallel calls for independent steps, fewer chained calls, and faster inference such as speculative decoding. Each step in a pipeline gets a latency budget, and percentiles (p50, p95) are tracked, not averages, because slow outliers are what users remember.",
    uses: [
      {
        who: "Cursor",
        what: "Cursor split code edits into planning by a frontier model and applying by a fine-tuned model, and used a speculative decoding method that guesses upcoming tokens from the original file. Applying edits reached about 1,000 tokens per second, many times faster than their earlier setup.",
        source: CURSOR,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub's custom completion model cut latency by 35 percent and tripled tokens per second, and changes ship only when A/B tests on real developers show significant gains in measures such as time to first token and accepted code.",
        source: COPILOT_MODEL,
      },
    ],
    scenario: {
      title: "Getting a support answer under two seconds",
      context:
        "A support chat takes six seconds before showing anything: it classifies the question, rewrites it, retrieves, reranks, then generates a long answer without streaming.",
      architecture:
        "Classification and query rewriting run in parallel. Retrieval and reranking have a 400 ms budget. The stable system prompt is cached. The answer streams to the user, and the prompt asks for a short answer with a link to more detail. Each step's latency is traced.",
      tools: ["tracing with per-step timings", "streaming responses", "prompt caching", "asyncio for parallel calls", "a load test tool"],
      steps: [
        "Trace 200 requests and chart time per step, at p50 and p95.",
        "Turn on streaming so the first words appear as soon as generation starts.",
        "Run independent steps in parallel and remove steps that do not improve quality on the eval set.",
        "Cache the stable prompt prefix and shorten the expected answer.",
        "Load-test at peak traffic and check p95 time to first token against the target.",
      ],
    },
    example: {
      title: "Run independent steps in parallel, then stream",
      lang: "python",
      code: `import asyncio

async def answer(question: str, llm, retriever):
    intent_task = asyncio.create_task(llm.classify(question))      # small model
    rewrite_task = asyncio.create_task(llm.rewrite_query(question))  # runs at the same time
    intent, query = await asyncio.gather(intent_task, rewrite_task)
    if intent == "out_of_scope":
        yield "I can help with orders, payments and deliveries."
        return
    docs = await asyncio.wait_for(retriever.search(query), timeout=0.4)
    async for token in llm.stream_answer(question, docs, max_tokens=250):
        yield token                                                  # user sees text immediately`,
      notes:
        "Two calls that do not depend on each other run together, retrieval has a hard time budget, and streaming makes the answer start appearing while the rest is still being generated.",
    },
    tradeoffs: [
      { issue: "Smaller, faster models may give worse answers.", response: "Use them for steps where the eval set shows no quality loss, such as classification and rewriting." },
      { issue: "Streaming makes it harder to run output checks before the user sees text.", response: "Check the first part before showing it, run checks on chunks, or stream only for low-risk content." },
      { issue: "Timeouts can cut off useful steps under load.", response: "Choose timeouts from measured percentiles and define what the system does when a step times out." },
    ],
    junior: "Optimises average latency of the model call and ignores the five other steps in the pipeline.",
    senior: "Traces every step, sets budgets at p95, streams, parallelises, and removes steps that do not earn their latency.",
    reading: [STREAMING, CURSOR, GENAI_PLATFORM],
  },
  {
    moduleId: "M9.5",
    howItWorks:
      "AI systems cache at several levels. Provider prompt caching reuses the processed prompt prefix and cuts input cost and time to first token. Exact caching stores whole answers for identical requests, which works well for content keyed by an item, like a product summary. Semantic caching reuses answers for similar questions using embeddings, but can return the wrong answer when two questions look alike and differ in a detail. Retrieval and tool results can be cached too. Every cache needs rules for what is cacheable, how long it lives, and how it is invalidated.",
    uses: [
      {
        who: "Product review summaries (via Eugene Yan)",
        what: "Eugene Yan points to AI summaries of product reviews, as on Amazon, as content that can be generated once per product and cached. He warns that semantic caching can confuse similar inputs, such as two films in the same series.",
        source: LLM_PATTERNS,
      },
      {
        who: "Gemini context caching (via Chip Huyen)",
        what: "Chip Huyen notes that a 1,000-token system prompt sent with a million calls a day means a billion repeated input tokens daily, and cites Gemini's context cache as charging much less for cached input plus a storage fee per hour.",
        source: GENAI_PLATFORM,
      },
    ],
    scenario: {
      title: "Caching for a product Q&A widget",
      context:
        "An e-commerce site adds an AI widget answering questions on each product page. Many shoppers ask the same few questions about popular products.",
      architecture:
        "Per-product summaries are generated nightly and stored by product id. Common questions are normalised and cached by product id plus question key for 24 hours. The system prompt and product data use provider prompt caching. Answers about stock or price are never cached and are fetched live.",
      tools: ["Redis for exact caching", "provider prompt caching", "a question normaliser", "cache hit and staleness metrics"],
      steps: [
        "Log questions for two weeks and find how many repeat per product.",
        "Precompute and cache per-product summaries keyed by product id and version.",
        "Add an exact cache for normalised common questions with a time limit and invalidation on product change.",
        "Mark time-sensitive answers like price and stock as uncacheable.",
        "Track hit rate, cost saved and complaints about stale answers.",
      ],
    },
    example: {
      title: "Exact cache keyed by item and version",
      lang: "python",
      code: `import hashlib, json

UNCACHEABLE = {"price", "stock", "delivery_date"}

def cache_key(product_id: str, product_version: int, question_key: str) -> str:
    raw = json.dumps([product_id, product_version, question_key])
    return "qa:" + hashlib.sha256(raw.encode()).hexdigest()

def answer(product, question_key: str, cache, generate) -> str:
    if question_key in UNCACHEABLE:
        return generate(product, question_key)          # always live
    key = cache_key(product.id, product.version, question_key)
    if (hit := cache.get(key)) is not None:
        return hit
    text = generate(product, question_key)
    cache.set(key, text, ex=24 * 3600)                  # expires after a day
    return text`,
      notes:
        "Including the product version in the key means editing a product automatically invalidates its cached answers. Time-sensitive questions bypass the cache entirely.",
    },
    tradeoffs: [
      { issue: "Semantic caches can return a confident answer to a slightly different question.", response: "Prefer keys based on item ids and normalised intents, and use semantic caching only with a strict threshold and a measured error rate." },
      { issue: "Cached answers go stale when the underlying data changes.", response: "Include versions in keys, set time limits, and never cache time-sensitive facts." },
      { issue: "Caches can leak one user's answer to another.", response: "Never cache personalised responses in shared keys, and include the user or tenant in keys where needed." },
    ],
    junior: "Adds a semantic cache with a loose threshold and serves wrong answers to similar-looking questions.",
    senior: "Caches by stable keys with versions and expiry, uses provider prompt caching for prefixes, and keeps live data out of the cache.",
    reading: [PROMPT_CACHING, LLM_PATTERNS],
  },
  {
    moduleId: "M9.6",
    howItWorks:
      "AI features fail in more ways than normal services: provider outages, rate limits, timeouts, malformed output, unsafe output, and confident wrong answers. Reliable systems plan a response for each: retries with backoff for transient errors, fallback models or providers, validation and repair for output format, guardrails for unsafe content, and a degraded mode when nothing works, such as a simpler answer, a search result, or a handoff to a human. The product should still work, perhaps less well, when the model does not.",
    uses: [
      {
        who: "OpenAI (December 2024 outage)",
        what: "A new telemetry service overloaded Kubernetes control planes across OpenAI's clusters and took down the API, ChatGPT and Sora for about four hours. Staging did not show it because only large clusters were affected. OpenAI committed to phased rollouts, emergency access paths and decoupling critical services.",
        source: OPENAI_OUTAGE,
      },
      {
        who: "DoorDash",
        what: "DoorDash's support bot checks every generated reply with a guardrail, and when a reply fails the check the conversation is handed to a human agent rather than shown, so a bad generation degrades to normal support instead of a wrong answer.",
        source: DOORDASH,
      },
    ],
    scenario: {
      title: "Graceful degradation for a writing assistant",
      context:
        "A document editor's AI assistant fails noisily when its provider has incidents or rate limits, and support tickets spike every time.",
      architecture:
        "Calls go through a gateway with retries and a fallback provider. Output is validated against the expected schema with one repair attempt. If all fails, the UI shows a clear message, keeps the user's text, and offers a simpler non-AI feature. A circuit breaker stops calling a failing provider for a short time.",
      tools: ["a gateway with retries and fallbacks", "schema validation", "a circuit breaker", "status-aware UI messages", "alerts on error rates"],
      steps: [
        "List the failure types seen in logs and decide the system's response to each.",
        "Add retries with backoff for rate limits and timeouts, and a fallback provider.",
        "Validate output, attempt one repair, then fall back to a safe response.",
        "Design the degraded UI so users never lose work and know what happened.",
        "Run a game day: block the primary provider in staging and check the product still works.",
      ],
    },
    example: {
      title: "Retry, fall back, then degrade",
      lang: "python",
      code: `import time

def generate(prompt: str, providers: list, validate, max_retries: int = 2) -> dict:
    for provider in providers:                      # primary first, then fallbacks
        if provider.circuit_open():
            continue
        for attempt in range(max_retries + 1):
            try:
                out = provider.call(prompt, timeout=20)
                if validate(out):
                    return {"status": "ok", "text": out, "provider": provider.name}
                break                               # bad output: try the next provider
            except (provider.RateLimited, provider.Timeout):
                time.sleep(2 ** attempt)            # back off and retry
            except provider.Unavailable:
                provider.trip_circuit(seconds=60)
                break
    return {"status": "degraded", "text": None}     # UI shows a fallback and keeps the user's work`,
      notes:
        "Each failure type has a defined response, and the last resort is an explicit degraded state the interface knows how to show, rather than an exception the user sees.",
    },
    tradeoffs: [
      { issue: "Retries and fallbacks add latency and can double costs during incidents.", response: "Cap retries, set timeouts from measured percentiles, and alert when fallback rates rise." },
      { issue: "Fallback models may produce different quality or formats.", response: "Evaluate fallbacks on the same eval set and validate their output just as strictly." },
      { issue: "Degraded modes are rarely tested and fail when finally needed.", response: "Exercise them on purpose with regular failure drills in staging." },
    ],
    junior: "Wraps the model call in a try block that shows 'something went wrong'.",
    senior: "Designs a response for each failure type, falls back and degrades gracefully, and tests those paths before an incident does.",
    reading: [LITELLM_FALLBACKS, NEMO, GENAI_PLATFORM],
  },
  {
    moduleId: "M9.7",
    howItWorks:
      "Orchestration is how the steps of an AI pipeline are connected: which runs first, which run in parallel, where results are checked, what happens on failure, and how state is saved between steps. Simple pipelines are plain code. Pipelines with branches, loops, human approval or long waits benefit from a graph or workflow engine that persists state, so a run can pause, resume or recover after a crash. The common advice is to start with plain code and add a framework only when its features are actually needed.",
    uses: [
      {
        who: "Klarna",
        what: "Klarna's customer support assistant was built with LangGraph so the flow could be broken into steps with explicit control over which path a conversation takes, rather than one large prompt deciding everything.",
        source: { label: "LangChain: How Klarna's AI assistant redefined customer support", url: "https://www.langchain.com/blog/customers-klarna", kind: "case-study" },
      },
      {
        who: "Honeycomb",
        what: "Honeycomb tried chaining several model calls for its query assistant and found it added latency and compounded errors, since steps that are each 90 percent accurate multiply to much lower accuracy, so they kept the pipeline short.",
        source: HONEYCOMB,
      },
    ],
    scenario: {
      title: "An invoice processing pipeline with human review",
      context:
        "A finance team processes 3,000 supplier invoices a day: extract fields, match to a purchase order, flag mismatches for a person, then post to the ledger.",
      architecture:
        "A graph with nodes for extract, validate, match, human review and post. Validation failures loop back to extraction once. Mismatches pause at a human review node until someone approves. State is checkpointed after every node so crashes and long human waits do not lose work.",
      tools: ["LangGraph or a workflow engine", "a checkpointer backed by a database", "a review queue UI", "tracing per node", "idempotent posting to the ledger"],
      steps: [
        "Write the pipeline as plain functions first and test each step on real invoices.",
        "Draw the graph with branches, loops and the human review point.",
        "Move to a workflow engine with checkpointing once pauses and retries are needed.",
        "Make the posting step idempotent so a retried run cannot post twice.",
        "Trace runs end to end and measure throughput, review rate and errors per node.",
      ],
    },
    example: {
      title: "A small graph with a retry loop and a human pause",
      lang: "python",
      code: `from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import InMemorySaver

g = StateGraph(InvoiceState)
g.add_node("extract", extract_fields)
g.add_node("validate", validate_fields)
g.add_node("match", match_purchase_order)
g.add_node("review", human_review)            # calls interrupt() and waits for a person
g.add_node("post", post_to_ledger)            # idempotent by invoice id

g.set_entry_point("extract")
g.add_edge("extract", "validate")
g.add_conditional_edges("validate", lambda s: "match" if s["valid"] or s["tries"] > 1 else "extract")
g.add_conditional_edges("match", lambda s: "post" if s["matched"] else "review")
g.add_edge("review", "post")
g.add_edge("post", END)
app = g.compile(checkpointer=InMemorySaver())  # use a database checkpointer in production`,
      notes:
        "The graph makes the flow visible: one retry for bad extraction, a pause for people only when matching fails, and checkpoints so a run can resume after a crash or a long wait.",
    },
    tradeoffs: [
      { issue: "Frameworks add abstractions that hide what prompts and calls actually run.", response: "Start with plain code, adopt a framework for specific needs like persistence, and keep tracing on." },
      { issue: "Long chains multiply errors and latency.", response: "Measure each step's accuracy and cost, and remove steps that do not improve the end result." },
      { issue: "Retried steps can repeat side effects such as payments or emails.", response: "Make side-effecting steps idempotent with unique keys." },
    ],
    junior: "Adopts a heavy framework for a three-step pipeline and cannot see what prompt is sent.",
    senior: "Uses plain code until branching, pauses or recovery are needed, then a workflow engine with checkpoints and idempotent side effects.",
    reading: [LANGGRAPH_THINKING, LANGGRAPH_PERSIST, GENAI_PLATFORM],
  },
  {
    moduleId: "M9.8",
    howItWorks:
      "After launch, the system needs a loop that turns production behaviour into improvements. It collects traces of every request, explicit feedback (thumbs, ratings), implicit feedback (edits, retries, abandonment, escalations), and automated scores from judges and guardrails. People review samples regularly, failures are grouped and counted, the biggest problems are fixed, and the fixed cases join the eval set. Metrics are broken down by prompt version, model and user segment so a change can be tied to its effect.",
    uses: [
      {
        who: "GitHub Copilot (via Eugene Yan)",
        what: "Eugene Yan describes Copilot's implicit feedback: whether a suggestion is accepted, accepted and then edited, or ignored. Signals like these are collected on every use without asking users to rate anything.",
        source: LLM_PATTERNS,
      },
      {
        who: "Rechat",
        what: "Rechat logged full traces of its real-estate assistant and reviewed them regularly, both by people and with a model critic. Making traces easy to read was one of the main lessons of its improvement loop.",
        source: { label: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "case-study" },
      },
    ],
    scenario: {
      title: "A feedback loop for an AI email drafting tool",
      context:
        "A CRM product drafts sales emails. Usage is high, but the team does not know which drafts users like and which they rewrite completely.",
      architecture:
        "Every draft is traced with prompt version and model. The editor records how much of the draft the user kept before sending. Drafts with heavy edits are sampled for weekly review, failure types are counted, and fixes are checked against an eval set built from those reviews.",
      tools: ["a tracing tool such as Langfuse", "edit-distance tracking in the editor", "a weekly review session", "an eval set", "a dashboard by version"],
      steps: [
        "Trace every draft with version, model, latency and cost.",
        "Measure how much of each draft survives to the sent email as an implicit quality signal.",
        "Sample heavily edited drafts weekly, write down what was wrong, and count failure types.",
        "Fix the top failure, add those cases to the eval set, and release behind a version tag.",
        "Compare kept-text rates by version to confirm the fix helped in production.",
      ],
    },
    example: {
      title: "An implicit quality signal from user edits",
      lang: "python",
      code: `from difflib import SequenceMatcher

def kept_ratio(draft: str, sent: str) -> float:
    return SequenceMatcher(None, draft, sent).ratio()      # 1.0 means sent unchanged

def record_send(trace_id: str, draft: str, sent: str, tracer) -> None:
    ratio = kept_ratio(draft, sent)
    tracer.score(trace_id=trace_id, name="kept_ratio", value=round(ratio, 3))
    if ratio < 0.5:
        tracer.tag(trace_id, "heavily_edited")              # goes into the weekly review sample`,
      notes:
        "Users rarely click thumbs, but they always edit or send. Attaching this score to the trace lets the team compare versions and find the drafts most worth reviewing.",
    },
    tradeoffs: [
      { issue: "Implicit signals are noisy; a user may rewrite a good draft out of habit.", response: "Use them to rank traces for review and compare versions in aggregate, not to judge single drafts." },
      { issue: "Reviewing production data takes time every week.", response: "Keep sessions short and regular, and use sampling to focus on the most informative traces." },
      { issue: "Storing traces creates privacy obligations.", response: "Redact personal data, limit retention, and restrict access to traces." },
    ],
    junior: "Ships, adds a thumbs button nobody clicks, and waits for complaints.",
    senior: "Collects traces and implicit signals, reviews samples on a schedule, and closes the loop into the eval set and the next release.",
    reading: [LANGFUSE, EVALS_FAQ],
  },
  {
    moduleId: "M9.9",
    howItWorks:
      "Case studies show how the ideas fit together under real constraints. Reading them well means looking past the headline numbers for the decisions: what requirement drove the design, which simpler option they tried first, how they measured quality, what failed in production, and what they would do differently. Most published systems share a shape (routing, retrieval or tools, generation, checks, tracing, evaluation, human fallback) but differ in where they put effort, depending on whether latency, accuracy, cost or safety mattered most.",
    uses: [
      {
        who: "Anthropic research system",
        what: "Anthropic's research feature uses a lead agent that plans and spawns sub-agents to search in parallel. They report it used far more tokens than a single agent and found early versions spawned too many sub-agents for simple queries, which they fixed with explicit effort rules in the prompts.",
        source: RESEARCH,
      },
      {
        who: "DoorDash (voice support on Bedrock)",
        what: "DoorDash built its voice support system with AWS in about eight weeks, with a 2.5-second latency target and automated testing at thousands of tests per hour. After rollout to all drivers it cut escalations to live agents by thousands a day.",
        source: DOORDASH_BEDROCK,
      },
    ],
    scenario: {
      title: "A case study reading habit",
      context:
        "A learner preparing for AI engineering interviews reads many engineering blog posts but struggles to apply them to new design questions.",
      architecture:
        "For each case study, a one-page note records the problem, constraints, design, how quality was measured, what failed, and the numbers that mattered. Notes are compared side by side to find recurring patterns and the reasons designs differ.",
      tools: ["company engineering blogs", "a case study template", "a comparison table", "a design question bank"],
      steps: [
        "Pick five case studies from different domains, such as support, coding, search and research.",
        "Fill the template for each, separating facts the post states from your own guesses.",
        "Build a table of which components each system used and why.",
        "Answer one practice design question using only patterns found in the case studies.",
        "Revisit a case study after a few weeks and check what you would now design differently.",
      ],
    },
    example: {
      title: "A case study template",
      lang: "yaml",
      code: `case: DoorDash voice support (AWS Bedrock)
problem: drivers call support while driving; most questions are routine
constraints: answer within 2.5 s; hundreds of thousands of calls a day
design: phone system -> retrieval over help centre -> small fast model -> answer
quality: automated test framework, thousands of tests per hour
failure_handling: escalate to a live agent when needed
results: escalations reduced by thousands per day after full rollout
what_drove_the_design: latency for drivers on the road
my_open_questions:
  - how do they evaluate answers on calls with background noise?
  - what share of calls still go to people?`,
      notes:
        "Separating the stated facts from your own questions keeps you honest about what the post actually shows, and the 'what drove the design' line is what transfers to new problems.",
    },
    tradeoffs: [
      { issue: "Published case studies show successes and skip what did not work.", response: "Read for decisions and constraints, and look for posts that describe failures and changes of plan." },
      { issue: "Big-company designs assume budgets and teams a small company lacks.", response: "Note which parts are essential to the problem and which are due to scale." },
      { issue: "Numbers are hard to compare across companies with different metrics.", response: "Compare designs and trade-offs rather than headline numbers." },
    ],
    junior: "Copies a famous company's architecture for a problem a hundred times smaller.",
    senior: "Reads case studies for the constraints and decisions behind them and reuses the reasoning, not the diagram.",
    reading: [RESEARCH, GENAI_PLATFORM],
  },
];
