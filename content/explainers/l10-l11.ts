import type { ExplainerSrc } from "./types";

export const EXPLAINERS_L10_L11: ExplainerSrc[] = [
  {
    id: "M10.1",
    diagram: {
      kind: "loop",
      steps: ["Develop :: prompt, model, code", "Evaluate :: eval gate", "Deploy :: versioned release", "Monitor :: quality, cost, latency", "Respond :: incidents, rollback"],
      back: "learn and improve",
      caption: "LLMOps is the release cycle for LLM apps. Unlike normal code, prompts, models and data are all part of a release.",
    },
    example: {
      title: "What's in an LLM release?",
      problem: "List everything that must be versioned so you can reproduce Tuesday's behaviour.",
      steps: [
        ["Application code.", "git commit a1b2c3"],
        ["Prompt versions.", "answer_prompt v13, rewrite_prompt v4"],
        ["Model ids, pinned to a snapshot.", "gpt-4o-mini-2024-07-18"],
        ["Retrieval index and embedding model.", "index built 2026-10-19 with embed-v3"],
        ["Config: temperature, top_k, thresholds.", "config.yaml at release tag"],
      ],
      result: "With all five recorded, you can rebuild the exact system and know which change caused a regression.",
    },
    yourTurn: {
      task: "The provider silently updates a model alias you use (like `latest`). What problem does that cause?",
      hints: ["Did you change anything?", "Can you reproduce last week?"],
      answer: "Behaviour can change without any change on your side, so you can't reproduce or explain regressions. Pin snapshot versions and re-evaluate before moving.",
    },
  },
  {
    id: "M10.2",
    diagram: {
      kind: "flow",
      steps: ["Existing app :: L4/L5 build", "Config :: env vars, not code", "Pin versions :: model + packages", "Tracing :: from first request", "Eval set :: the yardstick"],
      caption: "Before deploying, make the app configurable, reproducible, traceable and measurable.",
    },
    example: {
      title: "Production-prep checklist in code",
      problem: "Your RAG app hard-codes the model name and API key. Fix it.",
      steps: [
        ["Move settings into a typed config read from the environment.", "class Settings(BaseSettings):\n    model: str = \"gpt-4o-mini-2024-07-18\"\n    top_k: int = 5\n    openai_api_key: SecretStr"],
        ["Pin dependencies with a lock file.", "uv lock"],
        ["Wrap every request in a trace.", "@observe()\ndef answer(q: str) -> str: ..."],
        ["Run the Level 7 eval set as a script.", "python evals/run.py --set golden.jsonl"],
      ],
      result: "Changing the model is now a config change you can test, and every request is traceable from day one.",
    },
    yourTurn: {
      task: "Why add tracing before launch rather than after the first incident?",
      hints: ["What do you need during an incident?", "Can you trace the past?"],
      answer: "You can't add traces to requests that already happened. When the first incident comes, you need the history to find the cause.",
    },
  },
  {
    id: "M10.3",
    diagram: {
      kind: "flow",
      steps: ["Run :: prompt v + model + params", "Log :: scores and outputs (MLflow)", "Compare :: against baseline", "Registry :: label as staging → production", "App :: fetches by label, with fallback"],
      caption: "Track every experiment, register prompt versions, and promote or roll back by moving a label.",
    },
    example: {
      title: "Track runs and promote a prompt",
      problem: "Try a new prompt, record its scores, and ship it without a code deploy.",
      steps: [
        ["Log the run.", "with mlflow.start_run():\n    mlflow.log_params({\"prompt\": \"answer-v14\", \"model\": MODEL})\n    mlflow.log_metrics({\"faithfulness\": 0.92, \"accuracy\": 0.88})"],
        ["Compare with the baseline run in the UI.", "v13: 0.89 / 0.86 -> v14: 0.92 / 0.88"],
        ["Register v14 and label it production.", "registry.set_alias(\"answer\", alias=\"production\", version=14)"],
        ["The app fetches the prompt by label, falling back to a bundled copy.", "prompt = registry.get(\"answer@production\") or BUNDLED_PROMPT"],
        ["Rollback = move the label back.", "registry.set_alias(\"answer\", alias=\"production\", version=13)"],
      ],
      result: "Prompt changes ship and roll back in seconds, and every production answer can be linked to the prompt version that made it.",
    },
    yourTurn: {
      task: "Why does the app need a fallback copy of the prompt?",
      hints: ["What if the registry is down?", "Should that break answers?"],
      answer: "So a registry outage doesn't take the whole app down; it keeps working with the last known good prompt.",
    },
  },
  {
    id: "M10.4",
    diagram: {
      kind: "flow",
      steps: ["Pull request", "Fast eval subset :: minutes", "Thresholds per metric", "Pass :: merge | Fail :: block with report", "Nightly :: full suite"],
      caption: "The eval suite becomes a gate: every code, prompt or model change must keep each metric above its threshold.",
    },
    example: {
      title: "DeepEval tests as a release gate",
      problem: "Write evals that run like unit tests and block bad releases.",
      steps: [
        ["Load reviewed test cases.", "cases = load_golden(\"golden.jsonl\")"],
        ["Define metrics with thresholds.", "from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric\nmetrics = [FaithfulnessMetric(threshold=0.85), AnswerRelevancyMetric(threshold=0.8)]"],
        ["Each case is a test.", "@pytest.mark.parametrize(\"case\", cases)\ndef test_rag(case):\n    out = answer(case.question)\n    assert_test(LLMTestCase(input=case.question, actual_output=out.text, retrieval_context=out.chunks), metrics)"],
        ["Run in CI.", "deepeval test run tests/test_rag.py"],
      ],
      result: "A pull request that makes answers less faithful fails CI with the failing questions listed.",
    },
    yourTurn: {
      task: "The full suite takes 40 minutes. How do you keep pull requests fast?",
      hints: ["Not everything needs to run every time.", "When does the full suite run?"],
      answer: "Run a small representative subset on each pull request and the full suite nightly and before production releases.",
    },
  },
  {
    id: "M10.5",
    diagram: {
      kind: "flow",
      steps: ["Input checks :: injection, topic", "Model", "Output checks :: schema, PII, policy", "Agent limits :: tools, steps, spend", "Log every block"],
      caption: "Runtime guardrails turn the threats from Level 8 into checks on every request, and log what they block.",
    },
    example: {
      title: "Schema check with re-ask",
      problem: "The model must return valid JSON for a ticket; sometimes it doesn't.",
      steps: [
        ["Validate the output.", "try:\n    t = Ticket.model_validate_json(out)"],
        ["On failure, re-ask once with the error.", "except ValidationError as e:\n    out = llm(prompt + f\"\\nYour last reply was invalid: {e}. Return valid JSON only.\")\n    t = Ticket.model_validate_json(out)"],
        ["Log every block or repair with a reason.", "log_guardrail(\"schema\", action=\"reask\", reason=str(e)[:200])"],
        ["Watch false positives and latency.", "blocks/day, re-ask rate 1.2%, +300 ms on re-ask"],
      ],
      result: "Invalid outputs are repaired or rejected cleanly, and the log shows how often guardrails fire and why.",
    },
    yourTurn: {
      task: "A new guardrail blocks 8% of normal questions. What's the problem and what do you do?",
      hints: ["Are those questions harmful?", "False positives annoy users."],
      answer: "Too many false positives. Review blocked samples, loosen or retrain the check, and test it against a set of normal questions before re-enabling.",
    },
  },
  {
    id: "M10.6",
    diagram: {
      kind: "flow",
      steps: ["Streamlit UI", "FastAPI :: /chat streams via SSE", "Health :: /healthz, /readyz", "Docker images", "Compose :: whole stack, secrets at runtime"],
      caption: "Serve the app as an API with streaming and health checks, package it in containers, and inject secrets when it runs.",
    },
    example: {
      title: "Stream an LLM reply with server-sent events",
      problem: "Make `/chat` stream tokens to the browser.",
      steps: [
        ["A generator yields SSE-formatted chunks.", "async def events(q):\n    async for tok in llm_stream(q):\n        yield f\"data: {json.dumps({'t': tok})}\\n\\n\"\n    yield \"data: [DONE]\\n\\n\""],
        ["Return it as a streaming response.", "@app.get(\"/chat\")\nasync def chat(q: str):\n    return StreamingResponse(events(q), media_type=\"text/event-stream\")"],
        ["A readiness check confirms dependencies are reachable.", "@app.get(\"/readyz\")\nasync def ready():\n    return {\"db\": await db_ok(), \"vector\": await vec_ok()}"],
        ["Compose starts API, UI and database together; secrets come from the environment.", "services:\n  api:\n    build: ./api\n    env_file: .env\n  ui:\n    build: ./ui\n    depends_on: [api]"],
      ],
      result: "`docker compose up` runs the full stack locally, the UI shows text as it streams, and no key is baked into an image.",
    },
    yourTurn: {
      task: "Users close the tab mid-answer. What should the server do?",
      hints: ["The model is still generating.", "Who pays for those tokens?"],
      answer: "Detect the disconnect and cancel the upstream model stream, so you stop paying for and computing tokens nobody will read.",
    },
  },
  {
    id: "M10.7",
    diagram: {
      kind: "flow",
      steps: ["Push", "Tests", "Eval gate", "Build image :: tagged with commit", "Approve :: then deploy to prod"],
      caption: "CI/CD runs tests and evals on every push, builds an image named by its commit, and asks a human before production.",
    },
    example: {
      title: "A GitHub Actions pipeline",
      problem: "Automate test → eval → build → manual approval → deploy.",
      steps: [
        ["Run on every push to main.", "on:\n  push:\n    branches: [main]"],
        ["Tests and the eval gate; secrets come from the repo's secret store.", "- run: pytest -q\n- run: python evals/run.py --subset fast\n  env:\n    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}"],
        ["Build and push an image tagged with the commit.", "- run: docker build -t $REGISTRY/app:${{ github.sha }} .\n- run: docker push $REGISTRY/app:${{ github.sha }}"],
        ["The production job waits for approval via a protected environment.", "deploy:\n  needs: build\n  environment: production"],
      ],
      result: "Every image maps to an exact commit, nothing reaches production without passing evals and a human approving, and rollback means redeploying an old tag.",
    },
    yourTurn: {
      task: "Why tag images with the commit SHA instead of `latest`?",
      hints: ["Which `latest` is running?", "How do you roll back?"],
      answer: "A SHA tag tells you exactly which code is running and lets you redeploy a known version; `latest` changes and can't be rolled back to reliably.",
    },
  },
  {
    id: "M10.8",
    diagram: {
      kind: "flow",
      steps: ["Load balancer :: long timeouts for streams", "Auto Scaling group :: EC2 instances", "IAM role :: no keys on disk", "Secrets Manager :: API keys", "CodeDeploy :: blue/green releases"],
      caption: "On AWS: instances get permissions from a role, read secrets at startup, sit behind a load balancer, and scale on load.",
    },
    example: {
      title: "Scale an LLM API correctly",
      problem: "CPU stays at 15% but users see slow responses at peak.",
      steps: [
        ["LLM apps mostly wait on the provider, so CPU isn't the bottleneck.", "CPU 15%, open connections per instance: 180"],
        ["Scale on concurrent requests instead.", "target: 50 in-flight requests per instance"],
        ["Raise the load balancer idle timeout so streams aren't cut.", "idle timeout: 60 s -> 300 s"],
        ["Check the real ceiling: the provider's rate limit.", "8 instances × 50 = 400 concurrent, provider allows 300 -> 429s"],
        ["Ask for a higher limit or add a second provider before adding servers.", "quota increase request + fallback"],
      ],
      result: "Scaling on concurrency fixes the slowdown, and you discover the provider's limit is the real cap, not your servers.",
    },
    yourTurn: {
      task: "Why use an IAM role rather than putting AWS keys in the instance's env vars?",
      hints: ["What if the instance is compromised?", "Do role credentials expire?"],
      answer: "Role credentials are short-lived and never stored on disk, and permissions are managed centrally. Static keys can leak and stay valid until someone rotates them.",
    },
  },
  {
    id: "M10.9",
    diagram: {
      kind: "flow",
      steps: ["Prometheus :: system metrics", "App metrics :: tokens, cost, errors", "Grafana :: dashboards + alerts", "Langfuse :: traces + online evals", "User feedback"],
      caption: "Watch system health, cost and answer quality together, and alert only on things a human must act on.",
    },
    example: {
      title: "Instrument cost and latency",
      problem: "Add metrics so a dashboard can show cost per hour and p95 latency.",
      steps: [
        ["Define metrics.", "from prometheus_client import Counter, Histogram\nTOKENS = Counter(\"llm_tokens_total\", \"tokens\", [\"model\", \"kind\"])\nLATENCY = Histogram(\"llm_latency_seconds\", \"latency\", [\"model\"])"],
        ["Record them per call.", "with LATENCY.labels(m).time():\n    r = call(m, msgs)\nTOKENS.labels(m, \"in\").inc(r.usage.prompt_tokens)\nTOKENS.labels(m, \"out\").inc(r.usage.completion_tokens)"],
        ["Graph p95 latency in Grafana.", "histogram_quantile(0.95, sum(rate(llm_latency_seconds_bucket[5m])) by (le))"],
        ["Alert on what needs action.", "alert if p95 > 8 s for 10 min, or hourly cost > 2× last week's"],
      ],
      result: "A dashboard with live cost and latency, and alerts that fire for real problems rather than every blip.",
    },
    yourTurn: {
      task: "Dashboards are green but answers are getting worse. What monitoring is missing?",
      hints: ["Green = system healthy.", "What measures quality?"],
      answer: "Quality monitoring: online eval scores on sampled traffic, user feedback rates and failure categories, tracked over time.",
    },
  },
  {
    id: "M10.10",
    diagram: {
      kind: "flow",
      steps: ["Detect :: alert or report", "Triage :: what changed?", "Pull the lever :: rollback prompt, model, index, config", "Recover :: verify with evals", "Review :: blameless, add tests"],
      caption: "For each cause of an LLM incident there's a lever. Runbooks say which one to pull, and reviews make sure it doesn't happen again.",
    },
    example: {
      title: "Handle a cost explosion",
      problem: "Spend tripled overnight. Respond.",
      steps: [
        ["Find what changed: deploys, traffic, prompt versions.", "no deploy; traffic normal; avg output tokens 180 -> 1,400"],
        ["Look at traces with huge outputs.", "agent looping: same tool call repeated 30 times"],
        ["Pull the lever: tighten the step limit via config, no deploy needed.", "max_steps: 25 -> 8"],
        ["Verify recovery.", "avg output tokens back to ~200; spend normal"],
        ["Blameless review: why wasn't this caught?", "add a budget alert and a loop-detection eval case"],
      ],
      result: "Fixed in under an hour with a config change, and two new safeguards so it's caught next time.",
    },
    yourTurn: {
      task: "Write the first three lines of a runbook for \"answers suddenly wrong\".",
      hints: ["Check what changed.", "Which versions are logged?"],
      answer: "1) Check recent changes: prompt, model, index and config versions. 2) Compare eval or judge scores before and after. 3) If a change lines up, roll it back and re-run evals.",
    },
  },

  // L11 Managed platforms
  {
    id: "M11.1",
    diagram: {
      kind: "flow",
      steps: ["Public API :: fastest start", "Cloud platform :: your cloud account, compliance", "Self-hosted :: full control, most work"],
      caption: "Three ways to use a model, from least to most control and effort. Regulated teams often need the middle or the last.",
    },
    example: {
      title: "Pick a path for a bank",
      problem: "A bank's compliance team says no customer data may leave its cloud account.",
      steps: [
        ["Public API: data goes to a third party's servers.", "ruled out by policy"],
        ["Cloud platform (Bedrock, Vertex, Foundry): the call stays within the bank's cloud, with private networking and audit logs.", "allowed, managed for you"],
        ["Self-hosting open weights: also allowed, but you run the GPUs.", "allowed, heavy ops work"],
        ["Compare quality on the bank's own test set.", "platform model 89%, self-hosted 84%"],
      ],
      result: "The managed platform meets compliance with the best quality and least ops work.",
    },
    yourTurn: {
      task: "When might you put a gateway in front of a managed platform?",
      hints: ["Several teams, several models.", "Who tracks cost per team?"],
      answer: "When many teams share it and you want one place for routing, budgets, keys and usage tracking, or to mix platforms and providers.",
    },
  },
  {
    id: "M11.2",
    diagram: {
      kind: "flow",
      steps: ["Model catalog :: pick a model", "Enable access :: in your account", "Invoke :: platform SDK, cloud credentials", "Logs + quotas :: in your cloud"],
      caption: "Bedrock, Vertex AI and Foundry share one shape: a catalog, access per account, invocation through the cloud SDK, and your cloud's logging.",
    },
    example: {
      title: "Call a model on Amazon Bedrock",
      problem: "Call a hosted model using cloud credentials, not an API key.",
      steps: [
        ["Create a client; credentials come from the instance's role.", "import boto3\nbr = boto3.client(\"bedrock-runtime\", region_name=\"ap-south-1\")"],
        ["Use the unified Converse API with a model id from the catalog.", "r = br.converse(\n    modelId=MODEL_ID,\n    messages=[{\"role\": \"user\", \"content\": [{\"text\": \"Summarise: ...\"}]}],\n)"],
        ["Read the reply and token usage.", "text = r[\"output\"][\"message\"][\"content\"][0][\"text\"]\nusage = r[\"usage\"]"],
        ["Swapping models in the catalog is a different id, same code.", "MODEL_ID = \"<another model in the catalog>\""],
      ],
      result: "A model call billed to and logged in your AWS account, with no provider API key anywhere.",
    },
    yourTurn: {
      task: "Name two things the platform does NOT give you.",
      hints: ["Does it know if answers are good?", "Does it design your prompts?"],
      answer: "For example: evals for your task, good prompts and retrieval, and your app's own guardrail logic. The platform hosts models; quality is still your job.",
    },
  },
  {
    id: "M11.3",
    diagram: {
      kind: "flow",
      steps: ["App role :: least privilege", "Private endpoint :: no public internet", "Model", "Audit log :: who called what", "Keys :: customer-managed encryption"],
      caption: "Enterprise setups replace API keys with cloud identity, keep traffic private, log every call and isolate tenants.",
    },
    example: {
      title: "Least-privilege model access",
      problem: "The app should call one model and nothing else.",
      steps: [
        ["Grant only the invoke action, only on that model.", "{\"Effect\": \"Allow\", \"Action\": \"bedrock:InvokeModel\", \"Resource\": \"arn:aws:bedrock:ap-south-1::foundation-model/<model-id>\"}"],
        ["Attach the policy to the app's role, not to people.", "role: app-prod-invoke"],
        ["Route calls through a private endpoint in the VPC.", "VPC endpoint for bedrock-runtime; no internet route needed"],
        ["Turn on invocation logging to an audit store.", "who, when, model, token counts"],
      ],
      result: "Even if the app is compromised, it can only call that one model, privately, and every call is recorded.",
    },
    yourTurn: {
      task: "Two customers share one deployment. Name one way to keep their data apart.",
      hints: ["Think at retrieval and logging.", "Tenant id everywhere."],
      answer: "Tag every record and request with a tenant id and enforce it in every query (retrieval filters, separate indexes or keys per tenant), and test cross-tenant access.",
    },
  },
  {
    id: "M11.4",
    diagram: {
      kind: "flow",
      steps: ["Data rule :: stay in India", "Region :: model available there?", "Yes :: use it | No :: other model or self-host", "Terms :: retention and training, in writing"],
      caption: "Models are offered per region. Residency rules decide where you can call them, and contract terms decide what happens to your data.",
    },
    example: {
      title: "Plan for a model that isn't in your region",
      problem: "Policy says data stays in India; the model you want is only in US regions.",
      steps: [
        ["Check the platform's model-by-region table.", "model X: us-east-1, us-west-2 only"],
        ["Calling the US region breaks residency.", "not allowed"],
        ["Options: another model offered in-region, or open weights hosted in-region.", "model Y in ap-south-1; or self-host in Mumbai"],
        ["Test the alternative on your eval set.", "X 91% (not usable), Y 88%"],
        ["Get retention and no-training terms in writing.", "contract: zero retention, not used for training"],
      ],
      result: "Model Y in-region, 3 points lower but compliant, with written terms you can show an auditor.",
    },
    yourTurn: {
      task: "What's the difference between data residency and data retention?",
      hints: ["Where vs how long.", "Both matter."],
      answer: "Residency is where data is stored and processed; retention is how long it's kept (and whether it's deleted).",
    },
  },
  {
    id: "M11.5",
    diagram: {
      kind: "flow",
      steps: ["Traffic forecast :: average and peak", "Quota :: tokens per minute", "On-demand :: pay per token | Provisioned :: reserved capacity", "Cost per request", "Budget alerts"],
      caption: "Plan capacity from peak traffic, compare on-demand with reserved pricing at your volume, and alert before spend runs away.",
    },
    example: {
      title: "Size a quota for peak traffic",
      problem: "Peak is 20 requests/s, each about 2,000 input and 300 output tokens. What tokens-per-minute quota do you need?",
      steps: [
        ["Tokens per request.", "2,000 + 300 = 2,300"],
        ["Tokens per second at peak.", "20 × 2,300 = 46,000"],
        ["Per minute.", "46,000 × 60 = 2,760,000 TPM"],
        ["Add headroom for bursts (say 30%).", "≈ 3.6M TPM"],
        ["Compare with your current quota and request an increase with these numbers.", "current 1M TPM -> request 3.6M with the calculation attached"],
      ],
      result: "About 3.6M tokens per minute, backed by numbers a cloud team can approve.",
    },
    yourTurn: {
      task: "When does provisioned throughput beat on-demand pricing?",
      hints: ["You pay for reserved capacity whether you use it or not.", "What usage pattern fills it?"],
      answer: "When traffic is high and steady enough to keep the reserved capacity busy, or when you need guaranteed speed. For spiky or low traffic, on-demand is cheaper.",
    },
  },
  {
    id: "M11.6",
    diagram: {
      kind: "flow",
      steps: ["Model hub :: download weights", "Serverless API :: pay per token", "GPU cloud :: pay per hour", "Self-serve :: vLLM on your GPUs"],
      caption: "Open-weight models can be used at many levels of effort. Per-token pricing suits light use; per-GPU-hour suits steady heavy use.",
    },
    example: {
      title: "Serve an open model with vLLM",
      problem: "Run an 8B instruct model with an OpenAI-compatible API.",
      steps: [
        ["Check memory: 8B parameters at 16-bit ≈ 16 GB, plus room for the KV cache.", "a 24 GB GPU works for modest traffic"],
        ["Start the server.", "vllm serve <org>/<8B-instruct-model> --max-model-len 8192"],
        ["Call it with the normal OpenAI client.", "client = OpenAI(base_url=\"http://localhost:8000/v1\", api_key=\"none\")\nclient.chat.completions.create(model=\"<org>/<8B-instruct-model>\", messages=msgs)"],
        ["Compare cost at your volume.", "GPU $1.20/h × 730 h ≈ $876/month vs serverless at your token volume ≈ $310/month"],
      ],
      result: "It works, but at this volume serverless is cheaper. Self-hosting pays off with heavy, steady traffic or strict control needs.",
    },
    yourTurn: {
      task: "What's a cold start, and when does it hurt?",
      hints: ["Scale to zero saves money...", "...but the first request after idle?"],
      answer: "The delay to load a model when no instance is running. It hurts user-facing apps with spiky traffic; keep one warm instance if latency matters.",
    },
  },
  {
    id: "M11.7",
    diagram: {
      kind: "hub",
      steps: ["Router / gateway", "Provider A", "Provider B", "Self-hosted model", "Virtual keys :: per team budgets"],
      caption: "A router gives one endpoint for many providers, with failover, budgets and one view of usage. It's also now on your critical path.",
    },
    example: {
      title: "Failover with a self-hosted proxy",
      problem: "Route to provider A, fail over to B, with a monthly budget per team.",
      steps: [
        ["Define model groups with fallbacks in the proxy config.", "model_list:\n  - model_name: chat\n    litellm_params: {model: provider-a/model-x}\n  - model_name: chat-backup\n    litellm_params: {model: provider-b/model-y}\nrouter_settings:\n  fallbacks: [{chat: [chat-backup]}]"],
        ["Issue each team a virtual key with a budget.", "team-search: $500/month; team-support: $1,200/month"],
        ["Apps call one endpoint with their virtual key.", "POST http://proxy/v1/chat/completions  model=chat"],
        ["Test failover by blocking provider A.", "requests continue on chat-backup"],
      ],
      result: "One endpoint, automatic failover, and spend tracked and capped per team.",
    },
    yourTurn: {
      task: "Failover switched to provider B and users noticed different answers. Why?",
      hints: ["Is model Y the same as model X?", "What can a router not hide?"],
      answer: "Different models behave differently (tone, format, quality, tool use). Evaluate the fallback model on your test set and adjust its prompt.",
    },
  },
  {
    id: "M11.8",
    diagram: {
      kind: "flow",
      steps: ["Layer :: retrieval, agents, guardrails, evals, tuning", "Buy :: managed service | Build :: your own", "Judge :: quality, cost, control, portability", "Decide per layer"],
      caption: "Build-or-buy is decided layer by layer. Buying is fast; building gives control. Measure the cost of moving away later.",
    },
    example: {
      title: "Decide on managed retrieval",
      problem: "Should you use the platform's managed knowledge base or keep your own RAG stack?",
      steps: [
        ["Run both on the same eval set.", "managed 82%, own stack 88% (has reranking and hybrid search)"],
        ["Compare total cost, including your engineers' time.", "managed $400/month; own $250/month + 1 day/month upkeep"],
        ["Check control: can you tune chunking, filters, reranking?", "managed: limited options"],
        ["Measure portability: how hard to leave?", "managed: re-ingest everything; own: already portable"],
      ],
      result: "Keep your own stack for retrieval (better and portable), but buying managed guardrails might still be the right call for that layer.",
    },
    yourTurn: {
      task: "When is buying \"the honest call\" even if you could build it?",
      hints: ["Is it your core product?", "Who maintains it?"],
      answer: "When it isn't your differentiator, the managed version is good enough on your evals, and your team's time is better spent elsewhere.",
    },
  },
  {
    id: "M11.9",
    diagram: {
      kind: "flow",
      steps: ["Your code", "Thin abstraction :: one interface", "Platform A | Platform B", "Evals :: prove the move works"],
      caption: "Keep a thin layer between your code and any one platform, and treat a migration as an evaluation exercise.",
    },
    example: {
      title: "Migrate from one platform to another",
      problem: "Move a RAG app between clouds without breaking quality.",
      steps: [
        ["List what travels and what doesn't.", "travels: prompts, code, eval set\nmust change: model ids, auth, managed services"],
        ["Code calls an interface, not a platform SDK directly.", "class Chat(Protocol):\n    def complete(self, messages: list[dict]) -> str: ..."],
        ["Run both platforms in parallel on a slice of traffic.", "10% shadow traffic to platform B, answers compared"],
        ["Compare on the eval set and live metrics.", "A 87%, B 86%; latency similar; cost -18%"],
        ["Cut over gradually and keep A as fallback for a while.", "10% -> 50% -> 100% over two weeks"],
      ],
      result: "A migration backed by evidence, with a way back if something goes wrong.",
    },
    yourTurn: {
      task: "Why is \"we'll just abstract everything for multi-cloud\" often a bad idea?",
      hints: ["What do you lose?", "Is there a cost to the abstraction itself?"],
      answer: "You lose each platform's best features, add work and complexity, and still can't hide model differences. Keep a thin layer where it matters, not everywhere.",
    },
  },
];
