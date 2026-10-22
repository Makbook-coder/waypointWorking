import type { AppliedModule } from "./types";

const SYCOPHANCY = { label: "OpenAI: Expanding on what we missed with sycophancy", url: "https://openai.com/index/expanding-on-sycophancy/", kind: "case-study" } as const;
const OPENAI_OUTAGE = { label: "OpenAI status: December 11, 2024 incident write-up", url: "https://status.openai.com/incidents/ctrsv3lwd797/write-up", kind: "case-study" } as const;
const GITHUB_EVALS = { label: "GitHub Blog: How we evaluate AI models for GitHub Copilot", url: "https://github.blog/ai-and-ml/generative-ai/how-we-evaluate-models-for-github-copilot/", kind: "case-study" } as const;
const COPILOT_MODEL = { label: "GitHub Blog: Building a faster, smarter Copilot with a new custom model", url: "https://github.blog/ai-and-ml/github-copilot/the-road-to-better-completions-building-a-faster-smarter-github-copilot-with-a-new-custom-model/", kind: "case-study" } as const;
const UBER = { label: "Uber Engineering: Navigating the LLM landscape with GenAI Gateway", url: "https://www.uber.com/blog/genai-gateway", kind: "case-study" } as const;
const HONEYCOMB = { label: "Honeycomb: All the hard stuff nobody talks about when building products with LLMs", url: "https://www.honeycomb.io/blog/hard-stuff-nobody-talks-about-llm", kind: "case-study" } as const;
const DOORDASH = { label: "DoorDash: Path to high-quality LLM-based Dasher support automation", url: "https://careersatdoordash.com/blog/large-language-modules-based-dasher-support-automation/", kind: "case-study" } as const;
const DOORDASH_BEDROCK = { label: "AWS case study: DoorDash builds a generative AI contact center with Amazon Bedrock", url: "https://aws.amazon.com/solutions/case-studies/doordash-bedrock-case-study", kind: "case-study" } as const;
const RECHAT = { label: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "case-study" } as const;
const VLLM = { label: "vLLM blog: Easy, fast and cheap LLM serving with PagedAttention", url: "https://vllm.ai/blog/2023-06-20-vllm", kind: "blog" } as const;
const GENAI_PLATFORM = { label: "Chip Huyen: Building a generative AI platform", url: "https://huyenchip.com/2024/07/25/genai-platform.html", kind: "blog" } as const;
const LLM_ENGINEERING = { label: "Chip Huyen: Building LLM applications for production", url: "https://huyenchip.com/2023/04/11/llm-engineering.html", kind: "blog" } as const;
const MLOPS_GUIDE = { label: "Chip Huyen: MLOps guide", url: "https://huyenchip.com/mlops/", kind: "blog" } as const;
const MLFLOW_VERSIONS = { label: "MLflow docs: Version tracking for GenAI apps", url: "https://mlflow.org/docs/latest/genai/version-tracking/", kind: "docs" } as const;
const MLFLOW_START = { label: "MLflow docs: Getting started with MLflow for GenAI", url: "https://mlflow.org/docs/3.5.1/genai/getting-started/", kind: "docs" } as const;
const LANGFUSE_PROMPTS = { label: "Langfuse docs: Prompt management", url: "https://langfuse.com/docs/prompt-management/get-started", kind: "docs" } as const;
const LANGFUSE_LINK = { label: "Langfuse docs: Link prompts to traces", url: "https://langfuse.com/docs/prompt-management/features/link-to-traces", kind: "docs" } as const;
const LANGFUSE = { label: "Langfuse docs: Observability and tracing", url: "https://langfuse.com/docs/observability/overview", kind: "docs" } as const;
const DEEPEVAL_INTRO = { label: "DeepEval docs: Introduction", url: "https://deepeval.com/docs/introduction", kind: "docs" } as const;
const GHA = { label: "GitHub docs: Quickstart for GitHub Actions", url: "https://docs.github.com/en/actions/get-started/quickstart", kind: "docs" } as const;
const GHA_PYTHON = { label: "GitHub docs: Building and testing Python", url: "https://docs.github.com/en/actions/tutorials/build-and-test-code/python", kind: "docs" } as const;
const GUARDRAILS_AI = { label: "Guardrails AI docs: Validators", url: "https://guardrailsai.com/guardrails/docs/concepts/validators", kind: "docs" } as const;
const NEMO = { label: "NVIDIA NeMo Guardrails overview", url: "https://docs.nvidia.com/nemo/guardrails/latest/index.html", kind: "docs" } as const;
const PRESIDIO = { label: "microsoft/presidio: PII detection and anonymization", url: "https://github.com/microsoft/presidio", kind: "docs" } as const;
const FASTAPI = { label: "FastAPI tutorial and user guide", url: "https://fastapi.tiangolo.com/tutorial/", kind: "docs" } as const;
const SSE = { label: "MDN: Server-sent events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events", kind: "docs" } as const;
const COMPOSE = { label: "Docker docs: Compose quickstart", url: "https://docs.docker.com/compose/gettingstarted/", kind: "docs" } as const;
const CODEDEPLOY = { label: "AWS docs: What is CodeDeploy?", url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html", kind: "docs" } as const;
const CODEDEPLOY_ASG = { label: "AWS docs: CodeDeploy with EC2 Auto Scaling", url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-aws-auto-scaling.html", kind: "docs" } as const;
const BEDROCK = { label: "AWS docs: What is Amazon Bedrock?", url: "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html", kind: "docs" } as const;
const GRAFANA = { label: "Grafana docs: Get started with Grafana and Prometheus", url: "https://grafana.com/docs/grafana/latest/fundamentals/getting-started/first-dashboards/get-started-grafana-prometheus/", kind: "docs" } as const;
const LITELLM_FALLBACKS = { label: "LiteLLM docs: Fallbacks and reliability", url: "https://docs.litellm.ai/docs/proxy/reliability", kind: "docs" } as const;

export const APPLIED_L10: AppliedModule[] = [
  {
    moduleId: "M10.1",
    howItWorks:
      "LLMOps is the set of practices that keep LLM features working after launch. It borrows from DevOps and MLOps (version control, CI/CD, monitoring, incident response) and adds what is new: prompts and model choices are versioned like code, quality is measured with evals rather than unit tests alone, outputs are checked at runtime by guardrails, cost per request is tracked, and behaviour can change without any code change when a provider updates a model. The goal is to make every change traceable, testable and reversible.",
    uses: [
      {
        who: "OpenAI (GPT-4o sycophancy)",
        what: "In April 2025 an update made GPT-4o overly agreeable. Offline evals and a small A/B test looked fine, so it shipped; OpenAI rolled it back within days and changed its launch process to block on behaviour issues even when metrics look good.",
        source: SYCOPHANCY,
      },
      {
        who: "Uber",
        what: "Uber built one gateway for all LLM traffic so that authentication, PII redaction, logging, cost attribution and use-case review are handled once, centrally, instead of separately by each of its many teams.",
        source: UBER,
      },
    ],
    scenario: {
      title: "From prototype to an operated service",
      context:
        "A startup's AI summary feature began as a notebook and a hard-coded prompt in the web app. It now has paying customers, and nobody can say which prompt is live, what it costs, or whether last week's change made it worse.",
      architecture:
        "Prompts move to a prompt registry with versions and labels. Every request is traced with prompt version, model and cost. An eval suite runs in CI and gates releases. Guardrails check outputs at runtime. Dashboards track quality, latency, cost and errors, and there is a written rollback procedure.",
      tools: ["a prompt registry (Langfuse or MLflow)", "tracing", "an eval suite in CI", "guardrails", "dashboards and alerts", "a runbook"],
      steps: [
        "List everything that can change behaviour: code, prompts, model version, retrieval data, settings.",
        "Put each under version control or a registry, and log the versions with every request.",
        "Add an eval suite and run it on every change to any of them.",
        "Add runtime guardrails and dashboards for quality, latency, cost and errors.",
        "Write the rollback steps for each kind of change and practise them once.",
      ],
    },
    example: {
      title: "Log every version that shapes a response",
      lang: "python",
      code: `import os, time

RELEASE = {
    "app_commit": os.environ.get("GIT_SHA", "local"),
    "prompt": "summary-v14",
    "model": "provider/model-2026-05",
    "retrieval_index": "kb-2026-10-20",
}

def summarise(text: str, llm, tracer) -> str:
    start = time.perf_counter()
    out = llm(prompt_name=RELEASE["prompt"], model=RELEASE["model"], text=text)
    tracer.log(**RELEASE, latency_s=time.perf_counter() - start,
               input_tokens=out.input_tokens, output_tokens=out.output_tokens,
               cost_usd=out.cost_usd)
    return out.text`,
      notes:
        "When quality drops, the first question is what changed. Logging code, prompt, model and data versions on every request answers it in minutes instead of days.",
    },
    tradeoffs: [
      { issue: "Full LLMOps tooling is heavy for a small team.", response: "Start with versioned prompts, tracing and a small eval suite, and add tools as the number of features grows." },
      { issue: "Provider model updates can change behaviour without any change on your side.", response: "Pin model versions where possible and run evals when providers announce changes." },
      { issue: "Good metrics can hide behaviour problems.", response: "Keep human spot checks and qualitative review as part of the release process." },
    ],
    junior: "Edits the prompt string in production code and checks a few outputs by hand.",
    senior: "Versions every input that affects behaviour, gates changes with evals, monitors live quality and cost, and can roll back any change.",
    reading: [GENAI_PLATFORM, MLOPS_GUIDE, SYCOPHANCY],
  },
  {
    moduleId: "M10.2",
    howItWorks:
      "Preparing an LLM app for production means removing the shortcuts that were fine in a demo: hard-coded prompts and keys, no timeouts, no limits, unhandled errors, unbounded inputs, no logging, and no plan for abuse or provider outages. Production readiness covers configuration and secrets, input and output limits, timeouts and retries, rate limits per user, structured logging and tracing, privacy and terms of use, a fallback experience, and load testing at expected peak.",
    uses: [
      {
        who: "Honeycomb",
        what: "Before launching its query assistant, Honeycomb added per-user daily rate limits, limited input and output size, validated outputs, kept outputs non-destructive, and updated its terms and in-product disclosures after legal and security review, which took about a month.",
        source: HONEYCOMB,
      },
      {
        who: "DoorDash (voice support on Bedrock)",
        what: "DoorDash built an automated test framework running thousands of tests per hour before putting its voice support system in front of drivers, a large increase over manual testing by agents.",
        source: DOORDASH_BEDROCK,
      },
    ],
    scenario: {
      title: "A production checklist for a chat feature",
      context:
        "A SaaS company's in-app assistant works well in demos. Launch is in three weeks and the team needs to know what is missing.",
      architecture:
        "Settings and prompts move out of code into configuration and a prompt registry. Keys come from a secrets manager. The API has input size limits, timeouts, retries, per-user rate limits and a daily budget. Requests are traced. A clear fallback message appears when the model is unavailable.",
      tools: ["a secrets manager", "a prompt registry", "rate limiting middleware", "tracing", "a load testing tool", "a launch checklist"],
      steps: [
        "Walk the request path and list every place it can hang, fail, cost too much or be abused.",
        "Move keys to a secrets manager and prompts to a registry with versions.",
        "Add limits on input size, output tokens, requests per user and spend per day.",
        "Add timeouts, retries, a fallback message and tracing on every call.",
        "Load-test at twice expected peak and run the eval suite on the final configuration.",
      ],
    },
    example: {
      title: "Limits and timeouts at the API edge",
      lang: "python",
      code: `from fastapi import FastAPI, HTTPException, Request

app = FastAPI()
MAX_INPUT_CHARS, MAX_OUTPUT_TOKENS, DAILY_LIMIT = 8_000, 600, 200

@app.post("/assist")
async def assist(req: Request, body: dict):
    user = req.state.user_id
    if len(body.get("text", "")) > MAX_INPUT_CHARS:
        raise HTTPException(413, "Text is too long. Please shorten it.")
    if usage.count_today(user) >= DAILY_LIMIT:
        raise HTTPException(429, "Daily limit reached. It resets at midnight UTC.")
    try:
        out = await llm.generate(body["text"], max_tokens=MAX_OUTPUT_TOKENS, timeout=25)
    except llm.Unavailable:
        return {"status": "unavailable", "message": "The assistant is busy. Your text is saved."}
    usage.record(user, out.cost_usd)
    return {"status": "ok", "text": out.text}`,
      notes:
        "Every limit has a clear, user-facing message, and a provider failure returns a normal response the interface can show rather than a server error.",
    },
    tradeoffs: [
      { issue: "Strict limits can frustrate heavy users.", response: "Set limits from real usage data, show remaining quota, and offer higher limits on paid plans." },
      { issue: "Launch checklists grow long and slow teams down.", response: "Keep a short required list (secrets, limits, timeouts, tracing, fallback, evals) and treat the rest as follow-ups." },
      { issue: "Legal and privacy review can take longer than the engineering.", response: "Start it early, in parallel with building." },
    ],
    junior: "Launches the demo code with the API key in an environment file and no limits.",
    senior: "Treats limits, timeouts, secrets, tracing, fallbacks, legal review and load tests as launch requirements.",
    reading: [LLM_ENGINEERING, LANGFUSE_PROMPTS, MLFLOW_VERSIONS],
  },
  {
    moduleId: "M10.3",
    howItWorks:
      "Experiment tracking records what was tried and how it scored: prompt version, model, parameters, dataset version and eval results for every run. Prompt versioning treats prompts as deployable artifacts with history, labels such as production and staging, and the ability to roll back. Linking traces in production to the prompt version that produced them closes the loop, so a quality change can be traced to the exact prompt edit that caused it.",
    uses: [
      {
        who: "GitHub Copilot",
        what: "GitHub routes Copilot traffic through a proxy that lets the team swap the backend model without changing clients, and runs the same offline tests against every candidate so model and prompt changes can be compared on equal terms.",
        source: GITHUB_EVALS,
      },
      {
        who: "Langfuse",
        what: "Langfuse stores prompts by name with numbered versions and labels; applications fetch the version labelled production, cached on the client so a registry outage does not stop the app, and traces can be linked back to the prompt version used.",
        source: LANGFUSE_PROMPTS,
      },
    ],
    scenario: {
      title: "Prompt versioning for a contract-review tool",
      context:
        "Three people edit the contract-review prompt. Last month an edit improved one clause type and broke another, and nobody could tell which version was live when the complaints started.",
      architecture:
        "Prompts live in a registry with versions and labels. Editors create new versions and label them staging; an eval run is recorded for each. Promotion to production happens only after the eval passes. Every production trace records the prompt name and version.",
      tools: ["Langfuse or MLflow prompt registry", "an eval dataset", "experiment tracking", "trace linking", "a promotion checklist"],
      steps: [
        "Move the prompt from code into the registry and fetch it by label at runtime.",
        "Record an eval run for every new version with its scores per clause type.",
        "Promote to production only when no clause type drops beyond an agreed margin.",
        "Link traces to prompt versions and chart quality by version.",
        "Roll back by moving the production label to the previous version.",
      ],
    },
    example: {
      title: "Fetch the production prompt and record its version",
      lang: "python",
      code: `from langfuse import get_client

langfuse = get_client()

def review(contract_text: str, clause_type: str, llm) -> str:
    prompt = langfuse.get_prompt("contract-review")      # version labelled production
    messages = prompt.compile(clause_type=clause_type, contract=contract_text)
    out = llm(messages)
    # store prompt name and version on the trace so quality can be compared by version
    log_trace(prompt_name=prompt.name, prompt_version=prompt.version,
              clause_type=clause_type, output=out)
    return out

# releasing a new version: create it, evaluate it, then move the production label
langfuse.create_prompt(name="contract-review", type="text",
                       prompt=NEW_PROMPT_TEXT, labels=["staging"])`,
      notes:
        "The application never hard-codes prompt text. Releasing and rolling back become label moves in the registry, and every trace says which version produced it.",
    },
    tradeoffs: [
      { issue: "Prompts outside the codebase can drift from the code that uses them.", response: "Keep variable names checked by tests and review prompt changes like code." },
      { issue: "Fetching prompts at runtime adds a dependency.", response: "Rely on client-side caching and keep a bundled fallback version for cold starts." },
      { issue: "Experiment logs pile up without decisions.", response: "Record the decision and reason with each promoted version." },
    ],
    junior: "Edits the live prompt directly and keeps old versions in a chat thread.",
    senior: "Versions prompts with labels, evaluates every version, links traces to versions, and rolls back by moving a label.",
    reading: [MLFLOW_START, LANGFUSE_LINK, MLFLOW_VERSIONS],
  },
  {
    moduleId: "M10.4",
    howItWorks:
      "An evaluation release gate means no change to prompts, models or retrieval reaches users unless it passes agreed evals. The gate usually has blocking checks (safety, format, critical accuracy) and informational ones. It runs in CI on every change, again on the release candidate, and the decision is recorded. Good gates also include qualitative review by people for behaviour that metrics miss, and a staged rollout (internal users, then a small share of traffic) before full release.",
    uses: [
      {
        who: "OpenAI (GPT-4o sycophancy)",
        what: "After the sycophantic GPT-4o update, OpenAI said it would treat behaviour issues such as sycophancy and hallucination as launch-blocking even when A/B results look positive, add sycophancy evaluations to deployment review, and give more weight to expert spot checks.",
        source: SYCOPHANCY,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub ships Copilot completion model changes only when A/B tests on real developer workloads show statistically significant improvement, after offline tests and internal trials have passed.",
        source: COPILOT_MODEL,
      },
    ],
    scenario: {
      title: "A release gate for a support model upgrade",
      context:
        "A provider releases a new model that is cheaper and faster. The support team wants to switch, but a previous switch caused a rise in wrong refund answers.",
      architecture:
        "The candidate model runs the full eval suite in CI. Blocking checks include refund-policy accuracy, safety and format. If they pass, support leads review 50 sampled conversations side by side. Then the model goes to 5 percent of traffic with monitoring, and to everyone only if online metrics hold for a week.",
      tools: ["an eval suite with blocking thresholds", "CI", "a side-by-side review sheet", "a traffic-splitting gateway", "online dashboards"],
      steps: [
        "Agree the blocking checks and thresholds with the support and policy owners in advance.",
        "Run the eval suite on the candidate and compare with the current model per check.",
        "Hold a short side-by-side human review for tone and behaviour.",
        "Release to a small share of traffic and watch escalations, complaints and judge scores.",
        "Record the decision and keep the old model ready for instant rollback.",
      ],
    },
    example: {
      title: "A gate that blocks on critical checks",
      lang: "python",
      code: `BLOCKING = {"refund_policy_accuracy": 0.95, "safety_pass": 0.99, "valid_format": 1.0}
MAX_DROP = 0.02   # allowed drop versus the current production model

def gate(candidate: dict, production: dict) -> tuple[bool, list[str]]:
    reasons = []
    for check, floor in BLOCKING.items():
        c, p = candidate[check], production[check]
        if c < floor:
            reasons.append(f"{check} {c:.3f} below floor {floor}")
        if p - c > MAX_DROP:
            reasons.append(f"{check} dropped {p - c:.3f} versus production")
    return (not reasons, reasons)

ok, why = gate(run_suite("candidate"), run_suite("production"))
if not ok:
    raise SystemExit("Release blocked:\\n" + "\\n".join(why))`,
      notes:
        "Each blocking check has an absolute floor and a maximum drop versus production, so a cheaper model cannot quietly lose accuracy just because it still clears the floor.",
    },
    tradeoffs: [
      { issue: "Strict gates slow down every release.", response: "Keep blocking checks few and critical, run them fast, and report the rest as information." },
      { issue: "Evals miss behaviour that users notice.", response: "Add human side-by-side review and staged rollout to the gate." },
      { issue: "Teams override gates under deadline pressure.", response: "Require a named owner and written reason for any override, and review overrides afterwards." },
    ],
    junior: "Switches models because the provider's announcement says the new one is better.",
    senior: "Gates every change on blocking evals, human review and a staged rollout, and records why each release was approved.",
    reading: [DEEPEVAL_INTRO, GHA, SYCOPHANCY],
  },
  {
    moduleId: "M10.5",
    howItWorks:
      "Runtime guardrails are checks that run on live traffic around every model call. Input checks catch prompt injection attempts, off-topic or abusive requests and personal data that should not be sent. Output checks validate format, block unsafe or off-policy content, check grounding against sources and mask sensitive data. Each check has a defined action: block with a message, repair and retry, redact, or hand off to a person. Guardrails are monitored like any service: how often each fires, false positives, and the latency they add.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash runs a guardrail on every reply its driver support bot generates, checking grounding and policy compliance, and hands failing conversations to human agents. They report large drops in hallucinated and non-compliant replies.",
        source: DOORDASH,
      },
      {
        who: "Uber",
        what: "Uber's GenAI Gateway redacts personal data before requests go to external model providers and restores it in the responses, so every team gets the same privacy protection without building its own.",
        source: UBER,
      },
    ],
    scenario: {
      title: "Guardrails for a health insurance assistant",
      context:
        "An insurer's member assistant explains benefits. It must not give medical advice, must not reveal other members' data, and must answer only from the member's plan documents.",
      architecture:
        "Input: PII detection masks identifiers before external calls; a topic check routes medical questions to a nurse line. Output: a grounding check compares claims with the plan documents; a policy check blocks advice-like wording; a format validator checks the response schema. Each failure has a fallback and is logged.",
      tools: ["Presidio for PII", "a topic classifier", "Guardrails AI or NeMo Guardrails", "a grounding judge", "metrics per guardrail"],
      steps: [
        "Write the policy as a list of rules, each with its check and action.",
        "Implement input checks and measure false positives on real member questions.",
        "Implement output checks, with one repair attempt where possible.",
        "Emit a metric every time a guardrail fires, with the rule name.",
        "Review fired guardrails weekly and tune rules with high false positive rates.",
      ],
    },
    example: {
      title: "Rules with explicit actions",
      lang: "python",
      code: `RULES = [
    ("pii_in_input",   "input",  detect_pii,        "redact"),
    ("medical_advice", "input",  is_medical_advice, "route_nurse_line"),
    ("ungrounded",     "output", not_grounded,      "retry_once_then_handoff"),
    ("bad_schema",     "output", invalid_schema,    "repair"),
]

def apply(stage: str, payload: dict, metrics) -> dict:
    for name, when, check, action in RULES:
        if when == stage and check(payload):
            metrics.increment("guardrail_fired", tags={"rule": name, "action": action})
            payload = ACTIONS[action](payload)
            if payload.get("stop"):
                break
    return payload`,
      notes:
        "Keeping rules as data makes the policy reviewable and every firing countable. The action per rule is decided in advance, not improvised by the model.",
    },
    tradeoffs: [
      { issue: "Each guardrail adds latency and cost.", response: "Use fast classifiers or code checks first, run independent checks in parallel, and keep model-based checks for what needs them." },
      { issue: "Over-eager rules block legitimate users.", response: "Track false positive rates per rule and tune or remove noisy rules." },
      { issue: "Output checks are hard to apply to streamed responses.", response: "Buffer the start, check in chunks, or disable streaming for high-risk flows." },
    ],
    junior: "Adds one moderation call before launch, never measures what it blocks, and assumes the app is safe.",
    senior: "Turns the policy into specific checks with defined actions, measures each one in production, and tunes them over time.",
    reading: [GUARDRAILS_AI, NEMO, PRESIDIO],
  },
  {
    moduleId: "M10.6",
    howItWorks:
      "Serving an LLM app means wrapping the pipeline in an API that handles many users at once: async request handling so slow model calls do not block others, streaming responses so users see text early (often with server-sent events), health checks, and graceful shutdown. Containerising the app with Docker makes it run the same way locally, in CI and in production. If you host the model yourself, an inference server such as vLLM handles batching and memory so one GPU can serve many requests.",
    uses: [
      {
        who: "LMSYS (Vicuna and Chatbot Arena)",
        what: "LMSYS moved its Vicuna demo and Chatbot Arena serving to vLLM, whose PagedAttention memory management let it serve much higher throughput while roughly halving the GPUs it needed.",
        source: VLLM,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub's newer Copilot completion model tripled tokens per second and cut latency by 35 percent, showing how much serving speed matters for a feature users experience as they type.",
        source: COPILOT_MODEL,
      },
    ],
    scenario: {
      title: "Containerising a streaming RAG API",
      context:
        "A team's RAG prototype runs as a script on one laptop. It needs to serve a web app with streaming answers and run identically in staging and production.",
      architecture:
        "A FastAPI service exposes a streaming endpoint using server-sent events, async calls to the retriever and model, and a health endpoint. It runs in a Docker image with a non-root user. Docker Compose starts the API, the vector database and Redis together for local development and CI.",
      tools: ["FastAPI", "server-sent events", "Docker and Docker Compose", "a vector database container", "a health check"],
      steps: [
        "Wrap the pipeline in async functions and expose a streaming endpoint.",
        "Add a health endpoint that checks dependencies are reachable.",
        "Write a small Dockerfile with pinned dependencies and a non-root user.",
        "Add a Compose file with the API and its dependencies for local runs and CI.",
        "Load-test concurrent streams and tune worker count and timeouts.",
      ],
    },
    example: {
      title: "A streaming endpoint with server-sent events",
      lang: "python",
      code: `import json
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/health")
async def health():
    return {"ok": await vector_db.ping()}

@app.post("/ask")
async def ask(body: dict):
    async def events():
        docs = await retriever.search(body["question"], k=5)
        async for token in llm.stream(body["question"], docs):
            yield f"data: {json.dumps({'token': token})}\\n\\n"
        yield f"data: {json.dumps({'done': True, 'sources': [d.id for d in docs]})}\\n\\n"
    return StreamingResponse(events(), media_type="text/event-stream")`,
      notes:
        "Each token is sent as a server-sent event as soon as it arrives, and a final event carries the sources. Async calls let one worker serve many waiting users.",
    },
    tradeoffs: [
      { issue: "Streaming complicates error handling once part of an answer is sent.", response: "Send a final event with status, and design the client to show partial answers with an error note." },
      { issue: "Self-hosting models needs GPUs and serving expertise.", response: "Use hosted APIs until volume, cost or data rules justify self-hosting with a server like vLLM." },
      { issue: "Long-lived streaming connections strain proxies and load balancers.", response: "Set timeouts and keep-alive settings explicitly at every hop and test through the real proxy." },
    ],
    junior: "Runs the app with a development server and blocking calls, so one slow request stalls everyone.",
    senior: "Serves async and streaming behind health checks, ships a small reproducible container, and load-tests concurrent streams.",
    reading: [FASTAPI, SSE, COMPOSE],
  },
  {
    moduleId: "M10.7",
    howItWorks:
      "CI/CD automates the path from a commit to production. For LLM apps, CI runs linting, unit tests and a fast eval suite on every pull request, plus a fuller eval run when prompts, models or retrieval change. CD builds a container image, deploys it to staging, runs smoke tests, then promotes to production, ideally gradually. Secrets such as API keys come from the CI system's secret store. Every deployed version is tagged so it can be identified in traces and rolled back.",
    uses: [
      {
        who: "GitHub Copilot",
        what: "GitHub runs most of its 4,000+ offline Copilot tests as part of an automated CI pipeline built mainly on GitHub Actions, so every proposed change is tested the same way before it reaches users.",
        source: GITHUB_EVALS,
      },
      {
        who: "Rechat",
        what: "Rechat ran a large set of fast assertion tests on every code change to its AI assistant, catching regressions from prompt and code edits immediately rather than after release.",
        source: RECHAT,
      },
    ],
    scenario: {
      title: "A pipeline from pull request to production",
      context:
        "A small team deploys its AI API by hand from a laptop. Two recent deploys shipped untested prompt edits.",
      architecture:
        "GitHub Actions runs lint, unit tests and fast evals on every pull request, plus the judged eval suite when prompts or retrieval change. Merging to main builds an image tagged with the commit, deploys to staging, runs smoke tests, then deploys to production after approval.",
      tools: ["GitHub Actions", "Docker", "a container registry", "repository secrets", "an eval suite", "environment protection rules"],
      steps: [
        "Add a workflow that runs lint and unit tests on every pull request.",
        "Add the fast eval suite, and the judged suite for changes under prompts and retrieval.",
        "Build and push an image tagged with the commit on merge to main.",
        "Deploy to staging automatically and run smoke tests against it.",
        "Require approval for production, and record the deployed commit in traces.",
      ],
    },
    example: {
      title: "Build, test and deploy with GitHub Actions",
      lang: "yaml",
      code: `name: ci-cd
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r requirements.txt
      - run: ruff check . && pytest -q && pytest evals/fast -q
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment: production          # requires approval in repository settings
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t registry.example.com/ai-api:\${{ github.sha }} .
      - run: ./deploy.sh staging \${{ github.sha }} && ./smoke_test.sh staging
      - run: ./deploy.sh production \${{ github.sha }}`,
      notes:
        "The image tag is the commit, so any trace or bug report can be tied to exact code. Production deploys wait for an approval configured on the environment.",
    },
    tradeoffs: [
      { issue: "Eval suites with model calls make CI slow and costly.", response: "Run fast checks on every pull request and the full suite only for relevant changes or nightly." },
      { issue: "Automated deploys can ship a bad change quickly.", response: "Deploy to staging first, run smoke tests, and roll out to production gradually." },
      { issue: "API keys in CI can leak.", response: "Use the CI secret store, limit which workflows can read secrets, and use separate low-limit keys for testing." },
    ],
    junior: "Deploys from a laptop and tests by chatting with the bot afterwards.",
    senior: "Automates tests, evals, builds and staged deploys, tags every release by commit, and keeps secrets in the CI secret store.",
    reading: [GHA, GHA_PYTHON],
  },
  {
    moduleId: "M10.8",
    howItWorks:
      "Deploying on AWS usually means choosing between calling models through a managed service such as Bedrock and hosting the app on compute such as EC2, ECS or Lambda. The app itself is deployed like any service: images in a registry, instances in an Auto Scaling group behind a load balancer, and a deployment tool such as CodeDeploy rolling out new versions with health checks and automatic rollback. IAM roles give the app access to models and data without long-lived keys, and logs go to CloudWatch.",
    uses: [
      {
        who: "DoorDash (voice support on Bedrock)",
        what: "DoorDash built its driver voice-support system on AWS with Amazon Connect, Lex, Bedrock knowledge bases and a model served through Bedrock, built and tested in about eight weeks, and now handling hundreds of thousands of calls a day.",
        source: DOORDASH_BEDROCK,
      },
      {
        who: "AWS CodeDeploy",
        what: "CodeDeploy automates deployments to EC2, Lambda and ECS. It can update a fleet a few instances at a time, shift traffic in canary or linear steps, run blue/green deployments using an Auto Scaling group as the template, and roll back automatically when a deployment fails.",
        source: CODEDEPLOY,
      },
    ],
    scenario: {
      title: "Deploying a document Q&A service on AWS",
      context:
        "A team wants to deploy its document Q&A API on AWS for a client who requires data to stay within their AWS account.",
      architecture:
        "The API runs on EC2 instances in an Auto Scaling group behind an Application Load Balancer. Models are called through Bedrock in the client's region using the instance's IAM role. Documents live in S3 and a vector index in the same VPC. CodeDeploy rolls out new versions with health checks and rolls back on failure. Logs and metrics go to CloudWatch.",
      tools: ["Amazon Bedrock", "EC2 with Auto Scaling and an ALB", "CodeDeploy", "IAM roles", "S3", "CloudWatch"],
      steps: [
        "Enable the required Bedrock models in the target region and test access with an IAM role.",
        "Create the Auto Scaling group and load balancer with a health check endpoint.",
        "Write the CodeDeploy configuration with lifecycle hooks and automatic rollback.",
        "Connect CI to trigger deployments with the commit-tagged build.",
        "Add CloudWatch dashboards and alarms for errors, latency and Bedrock throttling.",
      ],
    },
    example: {
      title: "A CodeDeploy appspec with health checks",
      lang: "yaml",
      code: `version: 0.0
os: linux
files:
  - source: /
    destination: /opt/docqa
hooks:
  ApplicationStop:
    - location: scripts/stop.sh
      timeout: 60
  AfterInstall:
    - location: scripts/install_deps.sh
      timeout: 300
  ApplicationStart:
    - location: scripts/start.sh
      timeout: 120
  ValidateService:
    - location: scripts/health_check.sh    # fails the deploy if /health is not OK
      timeout: 120`,
      notes:
        "The ValidateService hook makes the deploy fail, and roll back if configured, when the new version does not pass its health check, instead of leaving a broken version serving traffic.",
    },
    tradeoffs: [
      { issue: "Managed model services limit which models and features you can use.", response: "Check model and region availability early and keep a gateway so you can switch if needed." },
      { issue: "EC2 fleets need patching and capacity planning.", response: "Consider containers on ECS or serverless where the workload fits, and automate patching." },
      { issue: "Throttling limits on managed models can cause failures at peak.", response: "Monitor throttling, request quota increases ahead of launches, and add retries and fallbacks." },
    ],
    junior: "Copies the app onto one EC2 instance with an access key in a config file.",
    senior: "Uses IAM roles, an auto-scaled fleet behind a load balancer, staged deploys with health checks and rollback, and monitors model quotas.",
    reading: [CODEDEPLOY_ASG, BEDROCK, CODEDEPLOY],
  },
  {
    moduleId: "M10.9",
    howItWorks:
      "Monitoring an LLM app combines normal service metrics (request rate, errors, latency percentiles, saturation) with AI-specific ones: time to first token, tokens and cost per request, cache hit rate, guardrail firings, fallback rate, judge scores on sampled traffic and user feedback. Metrics go to a system such as Prometheus with Grafana dashboards and alerts; detailed traces of prompts, retrieved documents and outputs go to an LLM tracing tool. Everything is tagged with release and prompt version so changes can be compared.",
    uses: [
      {
        who: "GitHub Copilot",
        what: "GitHub runs its Copilot test suite daily against production models, and a drop in results triggers an audit. In production it tracks acceptance rate, retained characters, time to first token and latency.",
        source: GITHUB_EVALS,
      },
      {
        who: "Uber",
        what: "Uber's GenAI Gateway provides metrics, alerting and audit logs for every LLM call across the company, which it uses for cost attribution, security audits and quality evaluation.",
        source: UBER,
      },
    ],
    scenario: {
      title: "Dashboards and alerts for an AI support bot",
      context:
        "A support bot's costs and complaints spike now and then, and the team finds out from finance or angry customers days later.",
      architecture:
        "The app exports Prometheus metrics for requests, errors, latency, time to first token, tokens, cost, guardrail firings and fallbacks, all labelled with release and prompt version. Grafana dashboards show them, and alerts fire on error rate, p95 latency, cost per hour and guardrail spikes. Langfuse holds full traces for investigation.",
      tools: ["Prometheus", "Grafana", "Langfuse tracing", "an alerting channel", "a runbook per alert"],
      steps: [
        "Choose the ten metrics that matter most and add them to the code with release labels.",
        "Build one overview dashboard and one per-release comparison view.",
        "Set alerts with thresholds based on a week of normal data.",
        "Link each alert to a runbook and to filtered traces for quick investigation.",
        "Review alerts monthly and remove or retune noisy ones.",
      ],
    },
    example: {
      title: "Export AI-specific metrics to Prometheus",
      lang: "python",
      code: `from prometheus_client import Counter, Histogram

LATENCY = Histogram("llm_latency_seconds", "End-to-end latency", ["route", "release"])
TTFT = Histogram("llm_ttft_seconds", "Time to first token", ["route", "release"])
TOKENS = Counter("llm_tokens_total", "Tokens used", ["direction", "model"])
COST = Counter("llm_cost_usd_total", "Spend in USD", ["route", "model"])
GUARD = Counter("guardrail_fired_total", "Guardrail firings", ["rule"])

def record(route, release, model, r):
    LATENCY.labels(route, release).observe(r.latency_s)
    TTFT.labels(route, release).observe(r.ttft_s)
    TOKENS.labels("input", model).inc(r.input_tokens)
    TOKENS.labels("output", model).inc(r.output_tokens)
    COST.labels(route, model).inc(r.cost_usd)
    for rule in r.guardrails_fired:
        GUARD.labels(rule).inc()`,
      notes:
        "Labels for route, release and model let one dashboard answer which part of the product, which version and which model is responsible for a change in latency or cost.",
    },
    tradeoffs: [
      { issue: "Too many labels create too many time series and slow the metrics system.", response: "Keep labels to a few low-cardinality values and put user or request details in traces instead." },
      { issue: "Alert fatigue makes teams ignore real problems.", response: "Alert only on user-facing symptoms and spend, and review alert quality regularly." },
      { issue: "Metrics cannot show why an answer was wrong.", response: "Pair metrics with traces and sampled human review." },
    ],
    junior: "Watches the provider's billing page and the server's CPU graph.",
    senior: "Monitors quality, latency, cost and guardrails by release, alerts on user-facing symptoms, and links alerts to traces and runbooks.",
    reading: [GRAFANA, LANGFUSE],
  },
  {
    moduleId: "M10.10",
    howItWorks:
      "Incidents in LLM systems include outages and errors but also quality incidents: the model starts giving worse or harmful answers after a prompt, model, data or provider change. Good practice is the same as for any service, adapted: detect quickly with monitoring and user reports, mitigate first (roll back the prompt label, switch the model alias, disable the feature), then investigate with traces, and write a blameless review with concrete prevention steps. Change management makes rollback easy by keeping every change small, versioned and reversible.",
    uses: [
      {
        who: "OpenAI (GPT-4o sycophancy)",
        what: "OpenAI saw the sycophancy problem within two days of a GPT-4o update, first changed the system prompt to reduce harm, then rolled back to the previous model over about 24 hours and published what it missed and what it would change.",
        source: SYCOPHANCY,
      },
      {
        who: "OpenAI (December 2024 outage)",
        what: "OpenAI's outage was hard to fix because removing the faulty telemetry service needed the same overloaded Kubernetes control plane. Their review committed to phased rollouts, emergency access paths, fault-injection tests and decoupling service discovery from the control plane.",
        source: OPENAI_OUTAGE,
      },
    ],
    scenario: {
      title: "A quality incident after a prompt change",
      context:
        "On Monday a prompt change was released. By Wednesday, complaints show the assistant is recommending discontinued products. Nothing is down; answers are just wrong.",
      architecture:
        "Monitoring flags a drop in judge scores for the new prompt version. The on-call engineer moves the production prompt label back to the previous version, confirms scores recover, then investigates traces. A blameless review adds a product-status check to the eval suite and the guardrails.",
      tools: ["a prompt registry with labels", "dashboards by prompt version", "tracing", "an incident channel and template", "a review document"],
      steps: [
        "Declare the incident, assign an owner and post status updates on a schedule.",
        "Mitigate first: roll back the prompt label, model alias or feature flag.",
        "Confirm recovery with the same metrics that showed the problem.",
        "Find the cause from traces and the change log, without blaming people.",
        "Add the failing cases to the eval suite and fix the gap in the release process.",
      ],
    },
    example: {
      title: "A one-command rollback runbook",
      lang: "bash",
      code: `#!/usr/bin/env bash
# rollback.sh: undo the most recent AI change of a given kind
set -euo pipefail
kind="$1"     # prompt | model | feature
case "$kind" in
  prompt)  python -m ops.prompts promote --name support-answer --to-previous ;;
  model)   python -m ops.gateway set-alias --alias chat-default --target chat-previous ;;
  feature) python -m ops.flags disable --flag ai-answers ;;
  *) echo "usage: rollback.sh prompt|model|feature"; exit 1 ;;
esac
python -m ops.verify --window 15m      # compares quality and error metrics with the baseline
echo "Rolled back $kind. Post in the incident channel and start the review."`,
      notes:
        "Because prompts, model aliases and features are each versioned or flagged, every common rollback is one command that anyone on call can run under pressure.",
    },
    tradeoffs: [
      { issue: "Quality incidents are slow to detect because nothing is down.", response: "Monitor judge scores and user signals by version, and treat sudden drops as incidents." },
      { issue: "Rolling back a model can bring back older bugs or cost more.", response: "Keep the previous configuration evaluated and ready, and roll back first, then fix forward." },
      { issue: "Incident reviews become blame sessions and people hide mistakes.", response: "Use a blameless format focused on how the system allowed the failure and what changes prevent it." },
    ],
    junior: "Debugs the root cause live while users keep getting wrong answers.",
    senior: "Mitigates first with a rehearsed rollback, confirms recovery, then investigates and turns the lessons into evals and process changes.",
    reading: [LITELLM_FALLBACKS, LANGFUSE_PROMPTS, MLOPS_GUIDE],
  },
];
