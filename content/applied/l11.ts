import type { AppliedModule } from "./types";

const DOORDASH_BEDROCK = { label: "AWS case study: DoorDash builds a generative AI contact center with Amazon Bedrock", url: "https://aws.amazon.com/solutions/case-studies/doordash-bedrock-case-study", kind: "case-study" } as const;
const UBER = { label: "Uber Engineering: Navigating the LLM landscape with GenAI Gateway", url: "https://www.uber.com/blog/genai-gateway", kind: "case-study" } as const;
const HONEYCOMB = { label: "Honeycomb: All the hard stuff nobody talks about when building products with LLMs", url: "https://www.honeycomb.io/blog/hard-stuff-nobody-talks-about-llm", kind: "case-study" } as const;
const CURSOR = { label: "Cursor: Editing files at 1000 tokens per second", url: "https://cursor.com/blog/instant-apply", kind: "case-study" } as const;
const GITHUB_EVALS = { label: "GitHub Blog: How we evaluate AI models for GitHub Copilot", url: "https://github.blog/ai-and-ml/generative-ai/how-we-evaluate-models-for-github-copilot/", kind: "case-study" } as const;
const VLLM = { label: "vLLM blog: Easy, fast and cheap LLM serving with PagedAttention", url: "https://vllm.ai/blog/2023-06-20-vllm", kind: "blog" } as const;
const CRIS = { label: "AWS ML Blog: Securing Amazon Bedrock cross-Region inference, geographic and global", url: "https://aws.amazon.com/blogs/machine-learning/securing-amazon-bedrock-cross-region-inference-geographic-and-global/", kind: "blog" } as const;
const GENAI_PLATFORM = { label: "Chip Huyen: Building a generative AI platform", url: "https://huyenchip.com/2024/07/25/genai-platform.html", kind: "blog" } as const;
const BEDROCK = { label: "AWS docs: What is Amazon Bedrock?", url: "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html", kind: "docs" } as const;
const CONVERSE = { label: "AWS docs: Amazon Bedrock Converse API", url: "https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html", kind: "docs" } as const;
const BEDROCK_ENDPOINTS = { label: "AWS docs: Amazon Bedrock inference endpoints", url: "https://docs.aws.amazon.com/bedrock/latest/userguide/endpoints.html", kind: "docs" } as const;
const VERTEX = { label: "Google Cloud docs: Vertex AI generative AI overview", url: "https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/overview", kind: "docs" } as const;
const FOUNDRY = { label: "Microsoft Learn: What is Microsoft Foundry?", url: "https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry", kind: "docs" } as const;
const AZURE_ARCH = { label: "Microsoft Learn: Get started with AI architecture design", url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/ai-get-started", kind: "docs" } as const;
const LITELLM_USERS = { label: "LiteLLM docs: Budgets and rate limits", url: "https://docs.litellm.ai/docs/proxy/users", kind: "docs" } as const;
const LITELLM_ROUTING = { label: "LiteLLM docs: Router and load balancing", url: "https://docs.litellm.ai/docs/routing", kind: "docs" } as const;
const LITELLM_FALLBACKS = { label: "LiteLLM docs: Fallbacks and reliability", url: "https://docs.litellm.ai/docs/proxy/reliability", kind: "docs" } as const;
const OPENROUTER_ROUTING = { label: "OpenRouter docs: Provider routing", url: "https://openrouter.ai/docs/guides/routing/provider-selection", kind: "docs" } as const;
const OPENROUTER_QUICK = { label: "OpenRouter docs: Quickstart", url: "https://openrouter.ai/docs/quickstart", kind: "docs" } as const;
const AA_MODELS = { label: "Artificial Analysis: models by intelligence, speed and price", url: "https://artificialanalysis.ai/models", kind: "docs" } as const;
const HF_HUB = { label: "Hugging Face Hub documentation", url: "https://huggingface.co/docs/hub/index", kind: "docs" } as const;
const TGI = { label: "Hugging Face docs: Text Generation Inference", url: "https://huggingface.co/docs/text-generation-inference/index", kind: "docs" } as const;
const VLLM_LORA = { label: "vLLM docs: LoRA adapters", url: "https://docs.vllm.ai/en/latest/features/lora/", kind: "docs" } as const;
const DPDP = { label: "Digital Personal Data Protection Act, 2023 (MeitY, PDF)", url: "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf", kind: "docs" } as const;
const EU_AI_ACT = { label: "EU AI Act: High-level summary", url: "https://artificialintelligenceact.eu/high-level-summary/", kind: "docs" } as const;

export const APPLIED_L11: AppliedModule[] = [
  {
    moduleId: "M11.1",
    howItWorks:
      "There are three common ways to use a model. Call a model provider's API directly (fastest to start, newest models, data goes to that provider). Use a cloud platform such as Bedrock, Vertex AI or Microsoft Foundry (many models behind one cloud account, with the cloud's identity, networking, billing and compliance). Or host open-weight models yourself (most control over data, cost at high volume and customisation, but you run the GPUs). Many companies mix them, and the choice is usually driven by data rules, existing cloud contracts, model needs, and the team's ability to operate infrastructure.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash built its voice support system on Amazon Bedrock with a model from a third-party provider, alongside AWS services it already used for its contact centre, which let it build and test the system in about eight weeks.",
        source: DOORDASH_BEDROCK,
      },
      {
        who: "Uber",
        what: "Uber's gateway serves models from an external API provider, a cloud platform (Vertex AI) and Uber-hosted open models through one interface, so teams can use all three ways to consume a model without changing their code.",
        source: UBER,
      },
    ],
    scenario: {
      title: "Choosing how to consume models at a fintech",
      context:
        "A fintech already on AWS wants to add AI features. Security requires that customer data stays in its cloud account, and one feature needs a fine-tuned small model for transaction categorisation.",
      architecture:
        "General assistant features use frontier models through Bedrock in the company's region. The categorisation feature uses a fine-tuned open-weight model served on the company's own GPUs. A gateway hides the difference from applications.",
      tools: ["Amazon Bedrock", "an open-weight model and a serving engine", "a gateway", "a decision record"],
      steps: [
        "List each use case with its data sensitivity, model needs, volume and latency target.",
        "Check which options meet the data rules, and which models each option offers.",
        "Estimate cost at expected volume for API, cloud platform and self-hosting.",
        "Pick per use case and record why, including who will operate what.",
        "Put a gateway in front so the choice can change later without rewriting apps.",
      ],
    },
    example: {
      title: "A decision record per use case",
      lang: "yaml",
      code: `use_cases:
  - name: support_assistant
    data: customer messages (personal data)
    needs: strong reasoning, tool use
    volume: 40k requests/day
    choice: cloud platform (Bedrock, in-region)
    why: data stays in our AWS account; frontier models available; existing contract
  - name: transaction_categoriser
    data: transaction descriptions
    needs: narrow task, very low cost, high volume
    volume: 3M requests/day
    choice: self-hosted fine-tuned open-weight model
    why: API cost too high at this volume; small model matches accuracy after tuning
review_after: 6 months or a major model release`,
      notes:
        "Recording the reasons per use case stops the decision being made once for the whole company, and the review date reminds the team that prices and models change quickly.",
    },
    tradeoffs: [
      { issue: "Direct provider APIs get new models first but add another vendor for security review.", response: "Use them where model quality matters most and the data rules allow it, through a gateway." },
      { issue: "Cloud platforms may lag on the newest models or features.", response: "Check model and feature availability per region before committing." },
      { issue: "Self-hosting looks cheap per token but carries operating costs.", response: "Include GPU utilisation, on-call and engineering time in the comparison." },
    ],
    junior: "Picks whichever API they used in a tutorial for every use case.",
    senior: "Chooses per use case based on data rules, model needs, volume and operating capacity, and keeps the choice reversible.",
    reading: [BEDROCK, VERTEX, FOUNDRY],
  },
  {
    moduleId: "M11.2",
    howItWorks:
      "The big three cloud AI platforms share a similar anatomy: a catalogue of models from several providers, a unified inference API, managed retrieval (knowledge bases or search), agent services, guardrails or content safety, evaluation tools, fine-tuning, and the cloud's identity, networking, logging and billing around them. Knowing the parts helps you map a design onto any of them: Bedrock on AWS, Vertex AI on Google Cloud, and Microsoft Foundry on Azure. The differences are in which models are offered, regional availability, pricing modes and how the parts integrate with each cloud.",
    uses: [
      {
        who: "Amazon Bedrock (Converse API)",
        what: "Bedrock's Converse API gives one request format for all its chat models, including tool use, guardrails, prompt caching points and usage reporting, so switching models within Bedrock mostly means changing the model id.",
        source: CONVERSE,
      },
      {
        who: "Microsoft Foundry",
        what: "Microsoft Foundry groups a large multi-provider model catalogue, hosted agents, evaluation and tracing under one Azure resource with Entra identity, role-based access, network isolation and policy, and existing Azure OpenAI resources can be upgraded into it.",
        source: FOUNDRY,
      },
    ],
    scenario: {
      title: "Mapping one design onto three clouds",
      context:
        "A consultancy builds the same RAG assistant for clients on AWS, Google Cloud and Azure, and wants one architecture with a small cloud-specific layer.",
      architecture:
        "The core app (ingestion, prompts, evaluation, UI) is cloud-neutral. A thin adapter layer maps model calls, retrieval and guardrails to each platform's services. Each client deployment uses that cloud's identity and logging.",
      tools: ["Bedrock Converse API and knowledge bases", "Vertex AI models and search", "Microsoft Foundry models and agents", "an adapter interface", "a shared eval suite"],
      steps: [
        "Write the architecture in platform-neutral terms: model call, retrieval, guardrail, logging.",
        "Map each part to the equivalent service on each cloud in a table.",
        "Implement an adapter interface with one implementation per cloud.",
        "Run the same eval suite on each deployment and record differences.",
        "Document region and model availability for each client before quoting.",
      ],
    },
    example: {
      title: "A model call through Bedrock's Converse API",
      lang: "python",
      code: `import boto3

client = boto3.client("bedrock-runtime", region_name="eu-central-1")

def ask(question: str, context: str, model_id: str) -> dict:
    resp = client.converse(
        modelId=model_id,                      # change the id to switch models
        system=[{"text": "Answer only from the context. Say if it is not there."}],
        messages=[{"role": "user", "content": [
            {"text": f"<context>{context}</context>\\n\\nQuestion: {question}"}]}],
        inferenceConfig={"maxTokens": 500, "temperature": 0.2},
    )
    return {"text": resp["output"]["message"]["content"][0]["text"],
            "tokens": resp["usage"]["totalTokens"],
            "stop": resp["stopReason"]}`,
      notes:
        "The same request shape works across Bedrock's chat models. Usage and stop reason come back in a standard form, which makes cost tracking and evaluation easier.",
    },
    tradeoffs: [
      { issue: "Managed retrieval and agent services are fast to adopt but hard to move away from.", response: "Keep data pipelines and prompts in your own code and use managed parts behind adapters." },
      { issue: "Model and feature availability differ by region.", response: "Check availability in the required region before designing around a model or feature." },
      { issue: "Platform features change and get renamed often.", response: "Pin SDK versions, read release notes, and rely on core APIs rather than preview features for critical paths." },
    ],
    junior: "Learns one platform's console clicks and cannot explain the equivalent elsewhere.",
    senior: "Understands the shared anatomy, maps designs onto any platform, and isolates platform-specific parts behind adapters.",
    reading: [CONVERSE, VERTEX, FOUNDRY],
  },
  {
    moduleId: "M11.3",
    howItWorks:
      "Enterprise AI deployments need the same security plumbing as any cloud service. Identity: apps call models using cloud roles or managed identities instead of long-lived keys, with least-privilege permissions per model. Networking: traffic to model endpoints stays on private links rather than the public internet where required. Tenancy: in a multi-customer product, each tenant's data, indexes, logs and spend are separated, and per-tenant limits stop one customer from using everyone's capacity.",
    uses: [
      {
        who: "Uber",
        what: "Uber's gateway handles authentication and authorisation for every LLM call, keeps audit logs, manages budgets centrally, and requires use cases to pass a review against Uber's data-handling standard run by its security team.",
        source: UBER,
      },
      {
        who: "Microsoft Foundry",
        what: "Foundry applies Microsoft Entra identity, role-based access control, network isolation and Azure Policy across agents, models and tools in one resource, so access and networking rules are set once rather than per service.",
        source: FOUNDRY,
      },
    ],
    scenario: {
      title: "A multi-tenant AI assistant for B2B customers",
      context:
        "A B2B software company adds an AI assistant. Each customer's documents must be invisible to others, large customers want their own spending caps, and security forbids API keys in application config.",
      architecture:
        "The app calls models through a gateway using a workload identity. Each tenant has its own index namespace and a virtual key with a budget and rate limit. Logs are tagged with tenant id and stored with access controls. Model endpoints are reached over private networking.",
      tools: ["cloud IAM roles or managed identities", "private endpoints", "a gateway with per-tenant keys and budgets", "tenant-scoped indexes", "audit logs"],
      steps: [
        "Replace API keys with workload identities and grant only the model permissions needed.",
        "Route model traffic through private endpoints where the cloud supports it.",
        "Give each tenant a separate index namespace and enforce it in every query.",
        "Issue per-tenant gateway keys with budgets and rate limits.",
        "Write tests that try to read across tenants and assert they fail.",
      ],
    },
    example: {
      title: "Per-tenant keys with budgets and limits",
      lang: "bash",
      code: `# create a gateway key for one tenant with a monthly budget and rate limits
curl -s http://gateway.internal:4000/key/generate \\
  -H "Authorization: Bearer $GATEWAY_ADMIN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "key_alias": "tenant-acme",
        "metadata": {"tenant_id": "acme"},
        "max_budget": 500,
        "budget_duration": "30d",
        "rpm_limit": 120,
        "tpm_limit": 200000
      }'
# the app stores this key per tenant and sends it with that tenant's requests`,
      notes:
        "Each tenant's spend and rate are capped separately, so one heavy customer cannot exhaust shared capacity or budget, and every request in the logs carries the tenant id.",
    },
    tradeoffs: [
      { issue: "Strict per-tenant separation multiplies indexes and configuration.", response: "Use namespaces or filtered collections for most tenants and dedicated resources only for those who need them." },
      { issue: "Private networking adds setup work and can break when services change.", response: "Automate it with infrastructure as code and test connectivity in CI." },
      { issue: "Central gateways can become a bottleneck for many teams.", response: "Run them highly available and give teams self-service key creation within policy." },
    ],
    junior: "Shares one API key across all customers and filters documents in the prompt.",
    senior: "Uses workload identities, private networking, and per-tenant data, keys, budgets and logs, with tests for cross-tenant access.",
    reading: [AZURE_ARCH, LITELLM_USERS, BEDROCK_ENDPOINTS],
  },
  {
    moduleId: "M11.4",
    howItWorks:
      "Many customers and laws require personal data to be stored or processed in particular places. For AI systems this covers prompts, outputs, logs, vector indexes and fine-tuning data. Cloud platforms let you choose regions, and some route requests across regions for capacity, which can conflict with residency rules unless the routing stays within an approved geography. Compliance work includes knowing where every copy of data goes, the provider's retention and training terms, contracts such as data processing agreements, and the rules of each market such as India's DPDP Act and the EU AI Act.",
    uses: [
      {
        who: "Amazon Bedrock cross-Region inference",
        what: "AWS explains that geographic cross-Region inference keeps processing within a set geography such as the EU or US, while global routing can use any commercial region. Stored data and logs stay in the source region, and logs record which region processed each request.",
        source: CRIS,
      },
      {
        who: "Honeycomb",
        what: "Honeycomb's privacy-focused and regulated customers raised concerns when it added an LLM feature. After a security audit only one provider met its requirements, and it updated its terms, added in-product disclosures and an easy off switch, and flagged customers with healthcare agreements.",
        source: HONEYCOMB,
      },
    ],
    scenario: {
      title: "Serving EU and Indian customers",
      context:
        "A SaaS company sells to customers in the EU and India. Contracts require EU customer data to be processed in the EU, and the company must meet DPDP obligations for Indian users.",
      architecture:
        "Each customer is pinned to a region. EU customers' requests go to model endpoints and indexes in EU regions, with any cross-region routing limited to the EU geography. Indian customers' data is processed under a documented purpose with consent records. Logs stay in the customer's region with set retention.",
      tools: ["region-pinned deployments", "geography-limited inference profiles", "a data map", "data processing agreements", "consent and retention records"],
      steps: [
        "Map every place customer data goes: prompts, outputs, logs, indexes, backups, fine-tuning.",
        "Pin each customer to a region and enforce it in routing and storage.",
        "Check model availability in each region and configure cross-region routing to stay within the allowed geography.",
        "Confirm provider retention and training terms and sign the needed agreements.",
        "Document purpose, consent and retention for each market and review it with counsel.",
      ],
    },
    example: {
      title: "Region pinning in configuration",
      lang: "yaml",
      code: `regions:
  eu:
    model_endpoint: bedrock eu-central-1
    inference_profile: eu.anthropic.claude-sonnet-4-5   # routes only within the EU geography
    vector_index: eu-west-1/prod-index
    logs: eu-central-1, retention 30 days
  in:
    model_endpoint: bedrock ap-south-1
    vector_index: ap-south-1/prod-index
    logs: ap-south-1, retention 30 days
    consent_required: true
customers:
  acme-gmbh: eu
  example-pvt-ltd: in
default_region: none        # unknown customers are rejected, never routed by default`,
      notes:
        "Routing is decided by configuration per customer, not by whichever region has capacity. A missing mapping fails closed rather than sending data somewhere unapproved.",
    },
    tradeoffs: [
      { issue: "Newer models may not be available in every region.", response: "Check availability early and agree with customers which models their region can use." },
      { issue: "Region pinning reduces capacity and can increase cost.", response: "Use geography-limited cross-region routing where allowed and request quota increases in advance." },
      { issue: "Logs and traces often leak data across regions unnoticed.", response: "Include observability tools in the data map and keep their storage in the same region." },
    ],
    junior: "Picks the cheapest region and assumes the provider handles compliance.",
    senior: "Maps every copy of data, pins customers to regions, limits routing to approved geographies, and documents the legal basis per market.",
    reading: [BEDROCK_ENDPOINTS, DPDP, EU_AI_ACT],
  },
  {
    moduleId: "M11.5",
    howItWorks:
      "Managed models come with quotas: requests and tokens per minute per model and region. At scale, these limits, not price, are often what breaks a launch. Capacity planning estimates peak tokens per minute, requests quota increases early, and spreads load across regions, deployments or providers. Cost control combines choosing the cheapest model that meets the quality bar, prompt caching, shorter prompts and outputs, batch processing for non-urgent work, and per-team budgets with alerts. Some platforms also sell reserved or provisioned capacity for steady, predictable traffic.",
    uses: [
      {
        who: "Uber",
        what: "Uber's gateway centralises usage and budget management and attributes cost per team through audit logs, so finance can see spend by use case across about 30 teams and millions of monthly queries.",
        source: UBER,
      },
      {
        who: "Prompt caching at scale (via Chip Huyen)",
        what: "Chip Huyen works through the arithmetic: a 1,000-token system prompt sent a million times a day repeats a billion input tokens daily, which is why caching shared prefixes is one of the biggest cost levers at volume.",
        source: GENAI_PLATFORM,
      },
    ],
    scenario: {
      title: "Planning capacity for a product launch",
      context:
        "A company will turn on an AI feature for 2 million users next month. Its current quota is enough for internal testing only, and leadership wants a cost forecast.",
      architecture:
        "A forecast model estimates requests and tokens per minute at peak from beta usage. Quota increases are requested per model and region. Traffic is spread across two regions and a fallback model. Budgets and alerts are set per feature, and non-urgent summarisation moves to batch jobs.",
      tools: ["beta usage data", "a capacity and cost spreadsheet", "cloud quota requests", "a gateway with load balancing and budgets", "batch inference"],
      steps: [
        "Measure tokens per request and requests per active user from beta traffic.",
        "Estimate peak tokens per minute with a safety margin and compare with quotas.",
        "Request quota increases early and set up a second region or deployment.",
        "Reduce tokens per request with caching and shorter outputs; move non-urgent work to batch.",
        "Set budgets and alerts per feature and review actual cost weekly after launch.",
      ],
    },
    example: {
      title: "Estimate peak load and monthly cost",
      lang: "python",
      code: `def forecast(daily_users: int, req_per_user: float, in_tok: int, out_tok: int,
             price_in: float, price_out: float, peak_factor: float = 3.0,
             cache_hit: float = 0.6, cached_discount: float = 0.9) -> dict:
    req_day = daily_users * req_per_user
    peak_rpm = req_day / (24 * 60) * peak_factor
    peak_tpm = peak_rpm * (in_tok + out_tok)
    eff_in = in_tok * (1 - cache_hit * cached_discount)       # cached input is cheaper
    cost_day = req_day * (eff_in * price_in + out_tok * price_out) / 1_000_000
    return {"peak_rpm": round(peak_rpm), "peak_tpm": round(peak_tpm),
            "cost_month_usd": round(cost_day * 30)}

print(forecast(2_000_000 * 0.15, 4, in_tok=3000, out_tok=300,
               price_in=3.0, price_out=15.0))   # prices per million tokens`,
      notes:
        "Even a rough model shows whether the quota is the bottleneck and how much caching or shorter outputs change the bill. Replace the guesses with measured values as soon as real traffic arrives.",
    },
    tradeoffs: [
      { issue: "Reserved capacity lowers unit cost but is wasted if traffic falls.", response: "Reserve only the steady baseline and serve peaks on demand." },
      { issue: "Cheaper models can lower quality.", response: "Route by difficulty and keep evals running so cost cuts do not quietly hurt users." },
      { issue: "Quota increases take time and are not guaranteed.", response: "Request them weeks ahead and plan fallback regions or providers." },
    ],
    junior: "Discovers rate limits on launch day and the bill at the end of the month.",
    senior: "Forecasts peak tokens and cost, secures quota early, spreads load, and controls spend with caching, batching, routing and budgets.",
    reading: [AA_MODELS, LITELLM_USERS, BEDROCK],
  },
  {
    moduleId: "M11.6",
    howItWorks:
      "Open-weight models (such as Llama, Mistral, Qwen or DeepSeek families) can be downloaded and run anywhere. Teams use them for data control, lower cost at high volume, fine-tuning, and running in places APIs cannot reach. Serving them well needs an inference engine such as vLLM or Text Generation Inference for batching and memory management, GPUs sized for the model, and often quantisation to fit smaller hardware. Platforms such as Hugging Face, serverless GPU services, and the major clouds can host them so you do not have to manage machines yourself.",
    uses: [
      {
        who: "Cursor",
        what: "Cursor fine-tuned an open-weight Llama 3 70B model for applying code edits and served it with an inference provider that supported its custom speculative decoding, reaching about 1,000 tokens per second and beating larger closed models on its own edit benchmark.",
        source: CURSOR,
      },
      {
        who: "LMSYS",
        what: "LMSYS served open models for Vicuna and Chatbot Arena with vLLM, using its memory-efficient attention to get much higher throughput while cutting the GPUs needed roughly in half.",
        source: VLLM,
      },
    ],
    scenario: {
      title: "Serving several fine-tuned adapters on one GPU",
      context:
        "A company has fine-tuned small LoRA adapters for three tasks: SQL generation, ticket classification and summarisation. Running three separate model servers wastes GPUs.",
      architecture:
        "One vLLM server loads the base model once and serves the three LoRA adapters, each exposed under its own model name on an OpenAI-compatible API. The gateway maps task aliases to adapter names. Load tests check throughput with mixed traffic.",
      tools: ["an open-weight base model from Hugging Face", "vLLM with LoRA support", "a GPU instance or serverless GPU platform", "a gateway", "a load test"],
      steps: [
        "Choose a base model that fits the GPU, with quantisation if needed, and check its licence.",
        "Start vLLM with LoRA enabled and register each adapter by name.",
        "Point the gateway's task aliases at the adapter names.",
        "Load-test mixed traffic and tune the number of concurrent adapters and batch settings.",
        "Run each task's eval set against the served adapters before switching traffic.",
      ],
    },
    example: {
      title: "One server, several adapters",
      lang: "bash",
      code: `# serve a base model with three LoRA adapters behind an OpenAI-compatible API
vllm serve meta-llama/Llama-3.2-3B-Instruct \\
  --enable-lora \\
  --max-loras 3 \\
  --lora-modules sql=./adapters/sql ticket-cls=./adapters/tickets summary=./adapters/summary

# each adapter is selected by the model name in the request
curl -s http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model": "ticket-cls",
       "messages": [{"role": "user", "content": "My card was charged twice"}],
       "max_tokens": 10}'`,
      notes:
        "The base model is loaded once and adapters are small, so several fine-tuned tasks share one GPU. Clients choose a task by model name, just as they would with a hosted API.",
    },
    tradeoffs: [
      { issue: "Self-hosting needs GPU capacity planning and on-call support.", response: "Use managed or serverless GPU platforms until volume justifies running your own." },
      { issue: "Open-weight licences vary and some restrict commercial use.", response: "Check the licence of every model and adapter before shipping." },
      { issue: "Quantisation saves memory but can reduce quality.", response: "Evaluate quantised versions on your tasks before deploying them." },
    ],
    junior: "Runs a model in a notebook on one GPU and calls it production.",
    senior: "Picks models by licence and fit, serves them with a proper inference engine, shares GPUs across adapters, and evaluates every served variant.",
    reading: [VLLM_LORA, TGI, HF_HUB],
  },
  {
    moduleId: "M11.7",
    howItWorks:
      "A model router chooses a model or provider per request; an LLM gateway is the shared service that does routing along with keys, budgets, logging and fallbacks. They can be self-hosted (for example LiteLLM proxy) or used as a service (for example OpenRouter). Routing rules can be static (this task uses that model), based on health and price (send to the cheapest healthy provider), or based on the request (send hard questions to a larger model). Data rules must be part of routing: some requests may only go to providers with no data retention or in certain regions.",
    uses: [
      {
        who: "OpenRouter",
        what: "OpenRouter's default routing favours providers without recent outages and weights cheaper ones more often, while callers can pin an order, disable fallbacks, require zero data retention, or exclude providers that collect data.",
        source: OPENROUTER_ROUTING,
      },
      {
        who: "Uber",
        what: "Uber's gateway mirrors the OpenAI API so teams can use standard client libraries and frameworks, while the gateway decides which external or internal model actually serves the request.",
        source: UBER,
      },
    ],
    scenario: {
      title: "A gateway with data-aware routing",
      context:
        "A company uses models from three providers. Some features process customer personal data and may only use providers under a signed agreement with zero retention; others can use any provider.",
      architecture:
        "A self-hosted gateway defines model aliases per data class. The restricted alias routes only to approved deployments; the general alias load-balances across providers with fallbacks. Every request is logged with its alias, provider and cost.",
      tools: ["LiteLLM proxy", "provider agreements and data classes", "model aliases", "fallback rules", "cost and routing dashboards"],
      steps: [
        "Classify features by the data they send to models.",
        "Define aliases per class and list which deployments each may use.",
        "Configure load balancing and fallbacks only within the allowed set.",
        "Test that restricted traffic never reaches unapproved providers, including during failover.",
        "Monitor routing decisions, fallback rates and cost per alias.",
      ],
    },
    example: {
      title: "Aliases that respect data rules",
      lang: "yaml",
      code: `model_list:
  - model_name: restricted-chat          # personal data: approved providers only
    litellm_params: { model: azure/gpt-4o-eu, api_base: os.environ/AZURE_EU_BASE }
  - model_name: restricted-chat
    litellm_params: { model: bedrock/anthropic.claude-sonnet-4-5, aws_region_name: eu-central-1 }
  - model_name: general-chat             # no personal data: any provider
    litellm_params: { model: openai/gpt-4o-mini }
  - model_name: general-chat
    litellm_params: { model: openrouter/meta-llama/llama-3.3-70b-instruct }
router_settings:
  routing_strategy: simple-shuffle
  num_retries: 2
  fallbacks:
    - general-chat: [restricted-chat]     # general may fall back to restricted, never the reverse`,
      notes:
        "Data rules are encoded in which deployments each alias contains and in the direction of fallbacks, so a provider outage cannot push personal data to an unapproved provider.",
    },
    tradeoffs: [
      { issue: "Hosted routers add another company that sees your traffic.", response: "Use them for non-sensitive workloads, or self-host a gateway for sensitive ones." },
      { issue: "Dynamic routing makes behaviour vary between requests.", response: "Evaluate every model an alias can reach and log which one served each request." },
      { issue: "Fallbacks can break data rules during incidents.", response: "Restrict fallbacks to approved deployments and test failover paths." },
    ],
    junior: "Adds a router that picks the cheapest provider for everything, including personal data.",
    senior: "Routes by data class, health and cost, evaluates every reachable model, and tests that failover never breaks data rules.",
    reading: [LITELLM_ROUTING, OPENROUTER_QUICK, LITELLM_FALLBACKS],
  },
  {
    moduleId: "M11.8",
    howItWorks:
      "Cloud platforms offer managed building blocks: knowledge bases for RAG, agent runtimes, guardrails, evaluation, prompt management and fine-tuning. Using them can save months, but each one decides some behaviour for you and ties you to that platform. A practical rule is to buy the parts that are commodity and hard to run well (model serving, vector storage, basic guardrails), and build the parts that make your product different or that you need to inspect closely (prompts, retrieval logic for tricky data, evaluation, business rules).",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash used managed pieces (a contact centre service, Bedrock knowledge bases over its help-centre content, and hosted models) and built its own test and evaluation framework, which it credits for running thousands of tests per hour.",
        source: DOORDASH_BEDROCK,
      },
      {
        who: "Uber",
        what: "Uber built its own gateway because separate team-by-team integrations had caused duplicated work, and needed company-specific features such as PII redaction against its own data standards and cost attribution per team.",
        source: UBER,
      },
    ],
    scenario: {
      title: "Build or buy for a knowledge assistant",
      context:
        "A mid-size company wants an internal knowledge assistant in two months. The team has three engineers and no ML infrastructure.",
      architecture:
        "Buy: hosted models, a managed vector store or knowledge base, and the platform's content filters. Build: ingestion that handles the company's messy document formats, the prompt and citation logic, permission filtering, and the evaluation suite. A gateway keeps model choice flexible.",
      tools: ["a cloud platform's knowledge base or a managed vector database", "hosted models", "custom ingestion code", "an eval suite", "a decision matrix"],
      steps: [
        "List each component and score it on differentiation, difficulty to run, and lock-in risk.",
        "Prototype the managed option for the hardest commodity parts and test it on real documents.",
        "Build the parts where the managed option fails your tests or hides what you need to see.",
        "Keep your data, prompts and evals portable regardless of what you buy.",
        "Revisit the decision when scale, cost or requirements change.",
      ],
    },
    example: {
      title: "A build-or-buy matrix",
      lang: "yaml",
      code: `components:
  model_serving:      { differentiating: no,  hard_to_run: yes, lock_in: low,    decision: buy }
  vector_store:       { differentiating: no,  hard_to_run: yes, lock_in: medium, decision: buy }
  document_ingestion: { differentiating: yes, hard_to_run: no,  lock_in: high,   decision: build,
                        why: "scanned PDFs and wiki exports broke the managed parser in tests" }
  retrieval_logic:    { differentiating: yes, hard_to_run: no,  lock_in: high,   decision: build }
  content_filters:    { differentiating: no,  hard_to_run: yes, lock_in: low,    decision: buy }
  evaluation:         { differentiating: yes, hard_to_run: no,  lock_in: high,   decision: build,
                        why: "must be portable across platforms and models" }
review_after: when monthly spend passes budget or a platform changes pricing`,
      notes:
        "Writing the scores and reasons down turns a debate into a decision that can be revisited. Each 'build' has a concrete reason from testing, not a preference.",
    },
    tradeoffs: [
      { issue: "Managed blocks hide behaviour that you may need to debug.", response: "Test them on your hardest data early and check what logs and controls they expose." },
      { issue: "Building everything delays launch and adds maintenance.", response: "Build only what differentiates the product or fails your tests when bought." },
      { issue: "Managed services can change pricing or be retired.", response: "Keep data and evals portable and keep an exit plan for each bought component." },
    ],
    junior: "Either builds everything from scratch or wires together every managed service without testing them on real data.",
    senior: "Buys commodity parts, builds what differentiates or fails tests, and keeps data, prompts and evals portable.",
    reading: [BEDROCK, GENAI_PLATFORM, VERTEX],
  },
  {
    moduleId: "M11.9",
    howItWorks:
      "Lock-in happens when prompts, data formats, tools and evaluation are tied to one provider's API, models or managed services. Models are replaced every few months, prices change, and providers have outages, so switching ability has real value. Portability comes from a few habits: call models through one internal interface or gateway, keep prompts and evals in your own repository, store data in standard formats, avoid provider-only features on critical paths unless they are worth it, and test migrations with the eval suite before moving traffic.",
    uses: [
      {
        who: "GitHub Copilot",
        what: "GitHub uses a proxy that lets its team change the model behind Copilot without changing clients, and runs the same offline and live tests on every candidate model, which makes switching models a routine, measured change.",
        source: GITHUB_EVALS,
      },
      {
        who: "Uber",
        what: "By putting an OpenAI-compatible gateway in front of external and in-house models, Uber lets teams move between models and providers behind the gateway without rewriting their applications.",
        source: UBER,
      },
    ],
    scenario: {
      title: "Migrating an assistant to a new provider",
      context:
        "A company's assistant uses one provider's API directly in twenty places. A cheaper provider with a better contract is available, and leadership wants to switch within a quarter.",
      architecture:
        "First, all model calls move behind an internal interface backed by a gateway. Prompts and evals move into the repository. The new provider is added as a second deployment, the eval suite is run on both, prompts are adjusted where scores drop, and traffic shifts gradually while metrics are watched.",
      tools: ["an internal model interface", "a gateway", "the eval suite", "traffic splitting", "a migration checklist"],
      steps: [
        "Replace direct SDK calls with one internal interface, without changing behaviour.",
        "Move prompts and eval data into version control.",
        "Run the eval suite on the new provider and fix prompts and parsing where it differs.",
        "Shift traffic in steps (5, 25, 100 percent) while watching quality, latency and cost.",
        "Keep the old provider configured as a fallback until the new one has run cleanly for a while.",
      ],
    },
    example: {
      title: "A provider-neutral interface",
      lang: "python",
      code: `from dataclasses import dataclass
from typing import Protocol

@dataclass
class Reply:
    text: str
    input_tokens: int
    output_tokens: int
    model: str

class ChatModel(Protocol):
    def chat(self, system: str, messages: list[dict], max_tokens: int) -> Reply: ...

class GatewayModel:
    def __init__(self, client, alias: str):
        self.client, self.alias = client, alias       # alias like "support-chat"
    def chat(self, system, messages, max_tokens):
        r = self.client.chat.completions.create(model=self.alias, max_tokens=max_tokens,
            messages=[{"role": "system", "content": system}, *messages])
        return Reply(r.choices[0].message.content, r.usage.prompt_tokens,
                     r.usage.completion_tokens, r.model)`,
      notes:
        "Application code depends on a small interface and an alias, not a vendor SDK. Changing provider becomes a gateway configuration change followed by an eval run.",
    },
    tradeoffs: [
      { issue: "A neutral interface can hide useful provider-specific features.", response: "Allow explicit, documented escape hatches for features that are worth the lock-in." },
      { issue: "Prompts tuned for one model often perform worse on another.", response: "Expect some prompt changes per model and measure them with the eval suite." },
      { issue: "Migrations stall halfway and leave two systems to maintain.", response: "Set a clear end date and remove the old path once the new one meets the bar." },
    ],
    junior: "Calls one vendor's SDK from every file and discovers how deep the dependency is when prices change.",
    senior: "Keeps model access behind one interface, owns prompts and evals, and treats switching models as a routine, measured change.",
    reading: [LITELLM_ROUTING, OPENROUTER_QUICK, GENAI_PLATFORM],
  },
];
