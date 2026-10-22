import type { AppliedModule } from "./types";

const AIR_CANADA = { label: "CX Today: Court orders Air Canada to pay out for chatbot's bad advice", url: "https://www.cxtoday.com/conversational-ai/court-orders-air-canada-to-pay-out-for-chatbots-bad-advice/", kind: "news" } as const;
const CODE_EXEC_MCP = { label: "Anthropic: Code execution with MCP", url: "https://anthropic.com/engineering/code-execution-with-mcp", kind: "blog" } as const;
const CONTEXTUAL = { label: "Anthropic: Introducing Contextual Retrieval", url: "https://www.anthropic.com/news/contextual-retrieval", kind: "blog" } as const;
const DOORDASH_BEDROCK = { label: "AWS case study: DoorDash builds a generative AI contact center with Amazon Bedrock", url: "https://aws.amazon.com/solutions/case-studies/doordash-bedrock-case-study", kind: "case-study" } as const;
const EU_AI_ACT = { label: "EU AI Act: High-level summary", url: "https://artificialintelligenceact.eu/high-level-summary/", kind: "docs" } as const;
const EVALS_FAQ = { label: "Hamel Husain and Shreya Shankar: AI evals FAQ", url: "https://hamel.dev/blog/posts/evals-faq/", kind: "blog" } as const;
const FASTAPI = { label: "FastAPI tutorial and user guide", url: "https://fastapi.tiangolo.com/tutorial/", kind: "docs" } as const;
const GITHUB_EVALS = { label: "GitHub Blog: How we evaluate AI models for GitHub Copilot", url: "https://github.blog/ai-and-ml/generative-ai/how-we-evaluate-models-for-github-copilot/", kind: "case-study" } as const;
const GRAFANA = { label: "Grafana docs: Get started with Grafana and Prometheus", url: "https://grafana.com/docs/grafana/latest/fundamentals/getting-started/first-dashboards/get-started-grafana-prometheus/", kind: "docs" } as const;
const HARNESS = { label: "Anthropic: Effective harnesses for long-running agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents", kind: "case-study" } as const;
const HARNESS_DESIGN = { label: "Anthropic: Harness design for long-running apps", url: "https://anthropic.com/engineering/harness-design-long-running-apps", kind: "case-study" } as const;
const HONEYCOMB = { label: "Honeycomb: All the hard stuff nobody talks about when building products with LLMs", url: "https://www.honeycomb.io/blog/hard-stuff-nobody-talks-about-llm", kind: "case-study" } as const;
const LANGFUSE = { label: "Langfuse docs: Observability and tracing", url: "https://langfuse.com/docs/observability/overview", kind: "docs" } as const;
const LINKEDIN = { label: "Xu et al. (LinkedIn): RAG with Knowledge Graphs for Customer Service QA", url: "https://arxiv.org/abs/2404.17723", kind: "paper" } as const;
const MANUS = { label: "Manus: Context engineering for AI agents, lessons from building Manus", url: "https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus", kind: "case-study" } as const;
const RECHAT = { label: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "case-study" } as const;
const RESEARCH = { label: "Anthropic: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" } as const;
const TRIFECTA = { label: "Simon Willison: The lethal trifecta (Bay Area AI Security Meetup)", url: "https://simonwillison.net/2025/Aug/9/bay-area-ai/", kind: "blog" } as const;
const WRITING_TOOLS = { label: "Anthropic: Writing effective tools for AI agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", kind: "blog" } as const;
const MCP_BUILD = { label: "Model Context Protocol docs: Build an MCP server", url: "https://modelcontextprotocol.io/docs/develop/build-server", kind: "docs" } as const;
const PITFALLS = { label: "Chip Huyen: Common pitfalls when building generative AI applications", url: "https://huyenchip.com/2025/01/16/ai-engineering-pitfalls.html", kind: "blog" } as const;
const PRODUCT_EVALS = { label: "Eugene Yan: Product evals in three simple steps", url: "https://eugeneyan.com/writing/product-evals/", kind: "blog" } as const;
const DUOLINGO = { label: "Tech Brew: Duolingo debuts AI video chats", url: "https://www.techbrew.com/stories/2024/09/25/duolingo-debuts-ai-video-chats", kind: "news" } as const;
const VOICE_AGENTS = { label: "OpenAI docs: Voice agents", url: "https://developers.openai.com/api/docs/guides/voice-agents", kind: "docs" } as const;
const LIVEKIT = { label: "LiveKit docs: Agents framework", url: "https://docs.livekit.io/agents/", kind: "docs" } as const;

export const APPLIED_L14: AppliedModule[] = [
  {
    moduleId: "M14.1",
    howItWorks:
      "A document Q&A platform lets people upload files and ask questions in plain language, getting answers that point back to the source. The core is the RAG pipeline: parse and chunk documents, embed and index them, retrieve the best passages for a question, and have a model answer only from those passages with citations. What separates a portfolio-worthy build from a tutorial is evidence: an eval set of real questions, retrieval and answer metrics, citations that open the exact page, and honest handling of questions the documents do not answer.",
    uses: [
      {
        who: "LinkedIn customer service",
        what: "LinkedIn's support team used RAG over a knowledge graph built from past tickets. After about six months in use they reported much better retrieval and a noticeable cut in median time to resolve an issue.",
        source: LINKEDIN,
      },
      {
        who: "Anthropic (Contextual Retrieval)",
        what: "Anthropic prepended a short, model-written context to each chunk before embedding and keyword indexing. On their tests this cut top-20 retrieval failures by about a third with embeddings alone, about half when combined with contextual BM25, and about two thirds with reranking added.",
        source: CONTEXTUAL,
      },
      {
        who: "AnkiHub (via Hamel Husain)",
        what: "Hamel Husain and Shreya Shankar describe AnkiHub using fourth-year medical students, rather than generic annotators, to judge its RAG system's medical answers, because only domain experts can tell whether an answer is correct and supported.",
        source: EVALS_FAQ,
      },
    ],
    scenario: {
      title: "Q&A over a company's HR policy documents",
      context:
        "An HR team has 60 policy PDFs. Employees keep asking the same questions, and the team wants answers with the exact policy page cited, plus a clear 'not found' when the policies are silent.",
      architecture:
        "Ingestion parses PDFs into chunks with page numbers and indexes them for both keyword and vector search. A query retrieves candidates, reranks them, and the model answers only from them with page citations. An eval harness runs on every change.",
      tools: ["a PDF parser", "Postgres with pgvector or another vector store", "keyword search", "an LLM API", "a small web UI", "an eval script"],
      steps: [
        "Write 50 real questions with the correct page and answer, including 10 the documents do not answer.",
        "Build ingestion and a baseline retrieval, and measure whether the right page is in the top 5.",
        "Add hybrid search or reranking and keep the change only if the retrieval numbers improve.",
        "Generate answers with citations and measure faithfulness, including the not-found cases.",
        "Build the UI so each citation opens the page, then write the README with your numbers.",
      ],
    },
    example: {
      title: "An eval file for a document Q&A project",
      lang: "yaml",
      code: `# evals/questions.yaml: checked in, run on every change
- id: q007
  question: "How many days of notice do I need to give before resigning?"
  expected_doc: hr-handbook.pdf
  expected_pages: [14]
  expected_answer_contains: ["60 days"]
- id: q031
  question: "Does the company reimburse home-office furniture?"
  expected_doc: null            # policies are silent: the right answer is "not found"
  expected_behaviour: abstain
metrics:
  - retrieval_hit_at_5          # right page among the top 5 chunks
  - answer_contains_expected
  - citation_points_to_expected_page
  - correct_abstention_rate
report: README.md               # paste the table here`,
      notes:
        "The questions the documents cannot answer matter as much as the ones they can: they test that the system says so instead of inventing a policy. Putting the numbers in the README is what makes the project convincing.",
    },
    tradeoffs: [
      { issue: "Chunking and parsing choices change quality a lot and are easy to get wrong.", response: "Change one thing at a time and re-run the eval set." },
      { issue: "Tables and scanned pages parse badly.", response: "Inspect parsed output by hand for a sample and consider page-image models for those documents." },
      { issue: "Answers that sound sure but cite nothing useful.", response: "Require citations, verify them against the retrieved text, and measure abstention." },
    ],
    junior: "Builds the pipeline from a tutorial, tries three questions, and shows a demo with no numbers.",
    senior: "Starts from an eval set, improves retrieval with measured changes, handles the not-found case, and reports the results.",
    reading: [CONTEXTUAL, LINKEDIN, EVALS_FAQ],
  },
  {
    moduleId: "M14.2",
    howItWorks:
      "A resume and job-description screening agent extracts skills and experience from a resume, compares them with a role's requirements, and produces a scored summary with evidence from the text. It is a good project for structured extraction and scoring, and for responsible-AI thinking, because hiring is a sensitive area. A defensible design keeps a person making the decision, shows evidence for every score, removes details that should not influence the result, and measures whether results differ across groups.",
    uses: [
      {
        who: "EU AI Act",
        what: "The EU AI Act bans some practices such as social scoring, requires high-risk systems in areas like employment and credit to have risk management, data governance, logging and human oversight, and requires chatbots to tell people they are talking to AI.",
        source: EU_AI_ACT,
      },
      {
        who: "Air Canada",
        what: "A Canadian tribunal held Air Canada responsible for its chatbot's wrong advice about bereavement fares and ordered it to pay. Accountability for AI output stays with the company that deploys it.",
        source: AIR_CANADA,
      },
    ],
    scenario: {
      title: "Screening support for a small recruiting team",
      context:
        "A recruiter receives 300 applications for each role and spends days reading them. They want a first-pass summary against the job's must-have requirements, but they will make every decision.",
      architecture:
        "A parser extracts structured fields from each resume. The JD is turned into a list of must-have and nice-to-have requirements. For each requirement the model returns met, partly met or not found, with a quote from the resume. Code computes the score, and the recruiter sees evidence and can override.",
      tools: ["a document parser", "an LLM with structured output", "a scoring function in code", "a review UI", "a labelled set of resumes"],
      steps: [
        "Collect 40 resumes (public or synthetic) with a recruiter's per-requirement labels.",
        "Extract requirements from the JD and have the recruiter confirm them before scoring.",
        "Make the model return a status and a quote for each requirement, and compute the score in code.",
        "Check that every quote really appears in the resume, and discard any that do not.",
        "Test whether scores change when names, gender hints or school names are swapped, and report the results.",
      ],
    },
    example: {
      title: "A per-requirement result with evidence",
      lang: "json",
      code: `{
  "candidate_id": "c-1042",
  "requirements": [
    {"requirement": "3+ years of Python", "status": "met",
     "evidence": "Backend engineer, Python and FastAPI, 2021-2025"},
    {"requirement": "Experience with vector databases", "status": "partly_met",
     "evidence": "Built a semantic search demo using FAISS"},
    {"requirement": "Led a team", "status": "not_found", "evidence": null}
  ],
  "score": 0.67,
  "score_computed_by": "code (met=1, partly_met=0.5, not_found=0, averaged)",
  "decision": "recruiter",
  "notes": "Evidence quotes verified against resume text"
}`,
      notes:
        "The model gives statuses and quotes, but the score and the decision are not the model's. Requiring a quote that can be checked against the resume stops invented qualifications, and leaving the decision to the recruiter keeps a person accountable.",
    },
    tradeoffs: [
      { issue: "Models can reflect biases about names, schools or gaps in careers.", response: "Remove identifying details before scoring and test for differences across groups with swapped inputs." },
      { issue: "Hiring decisions fall under strict rules in many places.", response: "Keep a human decision-maker, log reasons, and read the local law before using it on real candidates." },
      { issue: "Plausible but invented evidence.", response: "Verify every quote against the source text in code." },
    ],
    junior: "Asks the model for a 1–10 fit score and shows it as the answer, with no evidence or bias testing.",
    senior: "Splits the work into checked extraction and code-computed scoring, keeps the human decision, and tests for bias and reports it.",
    reading: [EU_AI_ACT, AIR_CANADA, PRODUCT_EVALS],
  },
  {
    moduleId: "M14.3",
    howItWorks:
      "A multi-agent research report system takes a question, plans sub-questions, has several agents search and read in parallel, and combines their findings into a cited report. It shows orchestration, parallelism, context management and verification. The honest version of this project compares itself with a simpler single-agent baseline, because multi-agent designs cost much more and are only worth it when the question benefits from breadth.",
    uses: [
      {
        who: "Anthropic research agent",
        what: "Anthropic's research feature uses a lead agent that plans and spawns sub-agents to search in parallel. They report it used far more tokens than a single agent and found early versions spawned too many sub-agents for simple queries, which they fixed with explicit effort rules in the prompts.",
        source: RESEARCH,
      },
      {
        who: "Anthropic (planner, generator, evaluator)",
        what: "In a later experiment, a planner wrote a spec, a generator built the app and a separate evaluator tested it in a browser. A solo run took 20 minutes and produced a broken core feature, while the full harness took about six hours and cost over 20 times more but produced a working app.",
        source: HARNESS_DESIGN,
      },
    ],
    scenario: {
      title: "A weekly market-landscape report",
      context:
        "A product team wants a weekly report on three competitors with sources. A single long prompt gives shallow summaries and some claims with no source.",
      architecture:
        "A lead agent splits the topic into one sub-question per competitor. Sub-agents search and read in parallel and write claims with source links into notes. A writer drafts the report from the notes, and a checker verifies each claim against its source.",
      tools: ["an agent framework or plain code", "web search and fetch tools", "a notes store", "a citation checker", "cost tracking"],
      steps: [
        "Write a single-agent baseline first and save five reports as a reference.",
        "Build the lead and sub-agent version with effort and budget rules.",
        "Save claims with source URLs in notes so the writer does not rely on a full context.",
        "Add the citation checker and measure the share of claims that are supported.",
        "Compare baseline and multi-agent on quality, time and cost, and report honestly which is worth it.",
      ],
    },
    example: {
      title: "A comparison table for the README",
      lang: "text",
      code: `Question set: 10 competitor questions, judged blind by two reviewers

                      single agent   multi-agent (lead + 3 workers)
quality (1-5 avg)         3.4              4.1
claims with valid source  71%              93%
avg wall time             2m 10s           3m 40s
avg cost per report       $0.31            $1.85

Conclusion: multi-agent is better on broad questions (4.4 vs 3.2),
no better on single-fact questions (3.9 vs 3.8) at 6x the cost.
Rule used in production: route broad questions to multi-agent only.`,
      notes:
        "The table shows the trade-off rather than just claiming that more agents are better. A rule for when to use each design is the kind of finding that makes this project stand out.",
    },
    tradeoffs: [
      { issue: "Multi-agent runs cost many times more than one agent.", response: "Route only broad questions to them and cap budgets per run." },
      { issue: "Sub-agents can duplicate work or drift off topic.", response: "Give each a precise question, a boundary and an output format." },
      { issue: "Claims can be unsupported by their citations.", response: "Verify claims against the cited pages before the report is written." },
    ],
    junior: "Builds a multi-agent demo and assumes it is better because it uses more agents.",
    senior: "Compares against a simple baseline, sets budgets and effort rules, verifies citations, and states when the extra cost is justified.",
    reading: [RESEARCH, HARNESS_DESIGN, HARNESS],
  },
  {
    moduleId: "M14.4",
    howItWorks:
      "An MCP server exposes a real tool, such as a ticketing system, database or calendar, to any MCP-capable assistant through a standard protocol. You define tools with names, typed inputs and clear descriptions, and the assistant discovers and calls them. The quality of the project depends on tool design (a few well-named tools with concise results), safety (validate inputs, confirm anything that changes data, limit what the server can reach), and care with the transport, for example never printing to stdout on a stdio server.",
    uses: [
      {
        who: "Model Context Protocol docs",
        what: "The official MCP server tutorial builds a weather server in Python whose tools are plain functions: type hints and docstrings generate the tool definitions, and the server runs over stdio. It warns that writing to stdout corrupts the protocol messages, so logging must go to stderr or files.",
        source: MCP_BUILD,
      },
      {
        who: "Anthropic (tool design)",
        what: "Anthropic's tool-writing guide says Claude Code caps tool responses at 25,000 tokens by default, and shows a Slack tool where a concise response format used about a third of the tokens of the detailed one.",
        source: WRITING_TOOLS,
      },
      {
        who: "GitHub MCP server attack",
        what: "Simon Willison describes a reported attack on the GitHub MCP server: an instruction planted in a public issue led an assistant with access to private repositories to open a public pull request revealing private details. All three dangerous capabilities were present at once.",
        source: TRIFECTA,
      },
    ],
    scenario: {
      title: "An MCP server for a team's helpdesk",
      context:
        "A support team wants an assistant to search tickets and draft replies, and to create tickets, from inside their chat client, without giving the assistant broad access to the helpdesk.",
      architecture:
        "A small server wraps the helpdesk API with three tools: search_tickets and get_ticket (read-only) and create_ticket (write, with a confirmation step). It runs over stdio for local use, validates inputs, and returns short summaries instead of raw API payloads.",
      tools: ["the MCP Python SDK", "the helpdesk's REST API", "an API token with limited scope", "a test client or MCP inspector", "logging to a file"],
      steps: [
        "List the two or three jobs the assistant should do and design one tool per job.",
        "Write clear names, typed inputs and docstrings, and return concise results.",
        "Make the API token read-only for the read tools, and require explicit confirmation for create_ticket.",
        "Test with an MCP client, including bad inputs, empty results and long outputs.",
        "Write the README with install steps, example prompts and the permissions the server needs.",
      ],
    },
    example: {
      title: "A small MCP server with a read tool and a guarded write tool",
      lang: "python",
      code: `import os, sys

import httpx2 as httpx   # the HTTP client the mcp package already depends on
from mcp.server import MCPServer

mcp = MCPServer("helpdesk")
API = "https://helpdesk.example.com/api"
HEADERS = {"Authorization": f"Bearer {os.environ['HELPDESK_TOKEN']}"}

@mcp.tool()
async def search_tickets(query: str, limit: int = 5) -> str:
    """Search open tickets by keyword.

    Args:
        query: Words to search for in the title and body
        limit: Maximum tickets to return (1-10)
    """
    limit = max(1, min(limit, 10))
    async with httpx.AsyncClient() as c:
        r = await c.get(f"{API}/tickets", params={"q": query, "limit": limit}, headers=HEADERS)
    if r.status_code != 200:
        print(f"helpdesk error {r.status_code}", file=sys.stderr)   # never print to stdout
        return "Could not search tickets right now."
    return "\\n".join(f"#{t['id']} [{t['status']}] {t['title']}" for t in r.json()) or "No tickets found."

@mcp.tool()
async def create_ticket(title: str, body: str, confirmed: bool = False) -> str:
    """Create a ticket. First call with confirmed=false to preview, then confirmed=true."""
    if not confirmed:
        return f"Preview only. Would create ticket '{title}'. Call again with confirmed=true after the user agrees."
    async with httpx.AsyncClient() as c:
        r = await c.post(f"{API}/tickets", json={"title": title, "body": body}, headers=HEADERS)
    return f"Created ticket #{r.json()['id']}" if r.status_code == 201 else "Creation failed."

if __name__ == "__main__":
    mcp.run(transport="stdio")`,
      notes:
        "Types and docstrings become the tool definitions the assistant sees. The read tool clamps its input and returns short lines, and the write tool refuses to act until a second call confirms it. Errors go to stderr because stdout belongs to the protocol.",
    },
    tradeoffs: [
      { issue: "Too many tools, or overlapping ones, confuse the assistant.", response: "Offer a few well-named tools built around real jobs." },
      { issue: "Write tools combined with untrusted content can be abused.", response: "Require confirmation, use least-privilege tokens, and avoid giving one server private data, untrusted input and the ability to send it out." },
      { issue: "Large raw API responses waste context.", response: "Return concise summaries and offer a detail option only when needed." },
    ],
    junior: "Wraps every API endpoint as a tool and returns the raw JSON.",
    senior: "Designs a few task-shaped tools, limits permissions, confirms writes, keeps results short, and tests with a real client.",
    reading: [MCP_BUILD, WRITING_TOOLS, CODE_EXEC_MCP],
  },
  {
    moduleId: "M14.5",
    howItWorks:
      "A monitored production API is an AI service that is deployed, has logging and traces, tracks latency, cost and errors, and has alerts you have seen fire. This project proves you can run AI in production, not just build a demo. A complete version has an HTTP endpoint with validation, structured logs and traces per request, a dashboard for the numbers that matter (latency percentiles, tokens and cost per feature, error rate, quality samples), alerts with thresholds, and a short runbook describing what to do when one fires.",
    uses: [
      {
        who: "Honeycomb",
        what: "Before launching its query assistant, Honeycomb added per-user daily rate limits, limited input and output size, validated outputs, kept outputs non-destructive, and updated its terms and in-product disclosures after legal and security review, which took about a month.",
        source: HONEYCOMB,
      },
      {
        who: "Manus",
        what: "Manus reports that its agent reads about 100 tokens for every token it writes, so input dominates both cost and latency. That is why they track the cache hit rate on that input as their single most important production metric.",
        source: MANUS,
      },
      {
        who: "GitHub Copilot",
        what: "GitHub runs its Copilot test suite daily against production models, and a drop in results triggers an audit. In production it tracks acceptance rate, retained characters, time to first token and latency.",
        source: GITHUB_EVALS,
      },
    ],
    scenario: {
      title: "A deployed summarisation API with a dashboard",
      context:
        "You have a summarisation endpoint that works locally. To show production skills, you deploy it, add monitoring, and deliberately cause problems to see the alerts work.",
      architecture:
        "A FastAPI service calls a model through a gateway, writes a trace for every request (latency, tokens, cost, model, version) to a tracing tool, and exposes metrics to Prometheus and a Grafana dashboard. Alerts fire on error rate, p95 latency and daily cost.",
      tools: ["FastAPI", "Docker and a cloud host", "Langfuse or similar tracing", "Prometheus and Grafana", "an alerting channel", "a load-test script"],
      steps: [
        "Build the endpoint with input validation, size limits, timeouts and a rate limit.",
        "Log every request with latency, token counts, cost and prompt version.",
        "Build a dashboard with p50 and p95 latency, error rate, cost per day and cache hit rate.",
        "Add alerts and trigger each one on purpose (slow model, errors, a cost spike) to prove they work.",
        "Write a runbook and put the dashboard screenshots and a short incident write-up in the README.",
      ],
    },
    example: {
      title: "Alert rules and what each one means",
      lang: "yaml",
      code: `groups:
  - name: summariser-api
    rules:
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        annotations:
          runbook: "Check the provider status, then switch to the fallback model (runbook.md#errors)"
      - alert: SlowResponses
        expr: histogram_quantile(0.95, sum(rate(request_seconds_bucket[5m])) by (le)) > 8
        for: 10m
        annotations:
          runbook: "Look at the slowest traces; check input size and provider latency"
      - alert: CostSpike
        expr: sum(increase(llm_cost_usd_total[1h])) > 3 * avg_over_time(sum(increase(llm_cost_usd_total[1h]))[7d:1h])
        for: 15m
        annotations:
          runbook: "Break cost down by feature and prompt version, then check retries and cache hits"`,
      notes:
        "Each alert links to a runbook entry, so whoever is paged knows the first step. Cost has its own alert because AI services can fail by becoming expensive while still returning correct answers.",
    },
    tradeoffs: [
      { issue: "Logging prompts and outputs may capture personal data.", response: "Redact or sample, set retention limits and restrict who can view traces." },
      { issue: "Dashboards nobody looks at do not protect you.", response: "Add alerts with thresholds and test that they fire." },
      { issue: "Quality drops silently while latency and errors look fine.", response: "Run a daily eval set or a reviewed sample and chart it beside the other metrics." },
    ],
    junior: "Deploys an endpoint and adds a dashboard, but has no alerts and never tests failure.",
    senior: "Instruments cost, latency, errors and quality, triggers failures on purpose to prove the alerts work, and writes the runbook.",
    reading: [LANGFUSE, GRAFANA, FASTAPI],
  },
  {
    moduleId: "M14.6",
    howItWorks:
      "A voice or multimodal build shows range beyond text and attention to latency. Typical projects are a voice agent that completes a task such as booking an appointment, or a vision tool that reads documents or photos. What makes it strong is measurement: time per stage for voice, accuracy on real recordings or images rather than clean demos, and a clear note on what the system cannot handle. Choose a narrow task you can test properly rather than a broad assistant that only works in a quiet room.",
    uses: [
      {
        who: "DoorDash",
        what: "DoorDash designed its driver voice-support system around a hard requirement of answering within 2.5 seconds, because drivers call while driving, and built automated testing that ran thousands of tests per hour before rollout.",
        source: DOORDASH_BEDROCK,
      },
      {
        who: "OpenAI voice agents guide",
        what: "OpenAI's voice agents guide compares speech-to-speech models with chained STT, agent and TTS pipelines, noting that chaining gives the most control and transcripts, and recommends measuring median and 95th-percentile time to audible response.",
        source: VOICE_AGENTS,
      },
      {
        who: "Duolingo",
        what: "Duolingo found its AI video-call character worked best in English, and needed extra instructions for Japanese, Korean and Chinese, showing that voice agent quality has to be tested separately for each language.",
        source: DUOLINGO,
      },
    ],
    scenario: {
      title: "A voice agent that books clinic appointments",
      context:
        "A small clinic wants a phone agent to book, move and cancel appointments. Callers have different accents, background noise and ways of saying dates.",
      architecture:
        "Audio streams to a voice pipeline with voice activity detection, streaming STT, an LLM that calls a booking tool, and streaming TTS. Every turn logs stage timings and the transcript, and a test set of recorded calls runs after each change.",
      tools: ["a voice framework such as LiveKit Agents", "streaming STT and TTS", "an LLM with tool calling", "a calendar API", "a set of recorded test calls"],
      steps: [
        "Record 30 realistic test calls with different accents, noise and interruptions.",
        "Build the pipeline end to end with streaming at every stage and log stage timings.",
        "Measure task success, word error rate on key terms (names, dates) and p50 and p95 latency.",
        "Fix the worst failures, such as date parsing and interruptions, and measure again.",
        "Write the README with a table of results and a list of known limits.",
      ],
    },
    example: {
      title: "A results table for a voice agent",
      lang: "text",
      code: `Test set: 30 recorded calls (10 quiet, 10 street noise, 10 non-native speakers)

metric                         v1       v2 (after fixes)
booking success                63%      87%
date understood correctly      71%      94%
p50 response time              1.9s     1.1s
p95 response time              4.8s     2.3s
  of which stt_final           0.4s     0.3s
  of which llm_first_token     1.2s     0.5s
  of which tts_first_audio     0.5s     0.3s

Known limits: fails on calls with two speakers talking at once,
and on very heavy background noise (3 of 30 calls).`,
      notes:
        "Splitting latency by stage shows what was fixed, and listing known limits is what makes the numbers believable. The test set deliberately includes noise and accents instead of only clean speech.",
    },
    tradeoffs: [
      { issue: "Demos in a quiet room hide real-world failures.", response: "Test on recorded calls with noise, accents and interruptions." },
      { issue: "Voice latency is the sum of many stages.", response: "Log each stage and fix the largest first." },
      { issue: "Recording callers raises consent and privacy duties.", response: "Use synthetic or consented recordings for the project and say so in the README." },
    ],
    junior: "Builds a voice demo that works on their own microphone and describes it as fast.",
    senior: "Measures success and per-stage latency on a realistic test set, fixes the worst failures, and documents the limits.",
    reading: [VOICE_AGENTS, LIVEKIT, DOORDASH_BEDROCK],
  },
  {
    moduleId: "M14.7",
    howItWorks:
      "Portfolio and positioning means presenting your projects so an employer understands what you can do in about a minute. For each project, lead with the problem and the result, show a demo or screenshots, state your key decisions and the numbers behind them, and be honest about limits. A few finished projects with measured results beat many half-finished ones. Hiring managers for AI roles look for evidence of judgement: evals, cost and latency awareness, handling failure, and knowing when not to use AI.",
    uses: [
      {
        who: "Chip Huyen",
        what: "Chip Huyen lists common pitfalls in AI engineering, including using generative AI where simpler methods work, starting with complex tools before simple ones, treating an early demo as nearly done, and relying only on AI judges without human review. A portfolio that shows you avoided these shows judgement.",
        source: PITFALLS,
      },
      {
        who: "Eugene Yan",
        what: "Eugene Yan's three-step approach to product evals starts with labelling a small dataset of real inputs and outputs, aims for 200 or more samples with at least 50 to 100 failures, aligns an LLM evaluator with human labels, and runs the harness on every change. Showing this in a project demonstrates production habits.",
        source: PRODUCT_EVALS,
      },
      {
        who: "Rechat",
        what: "Rechat moved from ad-hoc prompt tweaking to a test-driven loop: hundreds of fast assertion tests run on every change, logged traces reviewed by humans and a calibrated model critic, and A/B tests once the product matured. That ended the cycle of fixing one failure and breaking another.",
        source: RECHAT,
      },
    ],
    scenario: {
      title: "Turning three projects into a portfolio that gets read",
      context:
        "A candidate has six repositories, most unfinished, with README files that say little. They are applying for AI engineer roles and recruiters spend a minute on each profile.",
      architecture:
        "Three projects are chosen and finished: a RAG app, an agent with tools, and a monitored API. Each has a one-page README with the problem, a result in numbers, a demo link, an architecture picture, and a short 'what I would do next'. The profile README links to them.",
      tools: ["GitHub profile README", "short demo videos or hosted demos", "an architecture diagram", "a results table per project", "a short write-up of one decision"],
      steps: [
        "Pick the three projects that show the most different skills and archive the rest.",
        "For each, run a final eval and record two or three numbers worth showing.",
        "Write the README top-down: one-line result, demo, architecture, decisions, limits.",
        "Pin the three projects and write the profile README in a few lines.",
        "Ask someone outside AI to read each in one minute and say what the project does.",
      ],
    },
    example: {
      title: "A project README that shows judgement",
      lang: "text",
      code: `# DocsQA: answers from HR policies, with page citations

Result: 86% of answers correct and cited to the right page on a 50-question
test set (baseline vector search only: 71%). Costs about $0.004 per question.

Demo: https://example.com/docsqa  (2-minute video: link)

What I decided and why
- Hybrid search (keyword + vector): exact policy codes failed with vectors alone;
  recall@5 went from 71% to 89%.
- Abstain when no policy matches: 9 of 10 unanswerable questions handled correctly.
- Did NOT fine-tune: prompt + retrieval met the target.

Known limits: scanned tables parse badly; no multi-document comparison.
Next: add page-image retrieval for charts.`,
      notes:
        "The first two lines give a reader the answer in seconds. Stating what you chose not to do, and the limits, shows more judgement than listing every tool you used.",
    },
    tradeoffs: [
      { issue: "Polishing projects takes time away from building new ones.", response: "Finish three and stop adding new ones until they are documented." },
      { issue: "Numbers from a tiny eval can overstate quality.", response: "State the size of the test set and the limits plainly." },
      { issue: "Projects built from one popular tutorial look the same as everyone's.", response: "Choose a real problem, your own data, and measure something the tutorial did not." },
    ],
    junior: "Lists many repositories with no results and README files that only say how to install.",
    senior: "Shows a few finished projects with a result up front, the reasoning behind decisions, and honest limits.",
    reading: [PITFALLS, PRODUCT_EVALS, RECHAT],
  },
];
