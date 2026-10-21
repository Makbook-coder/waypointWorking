import type { AppliedModule } from "./types";

export const APPLIED_L0: AppliedModule[] = [
  {
    moduleId: "M0.1",
    howItWorks:
      "In a real AI team, Python is rarely one script. It is a package with modules, a locked environment, typed data models at every boundary (API input, LLM output, database rows), and a test suite that runs on every pull request. Notebooks are used to explore, but anything that serves users is moved into importable functions with type hints, so a type checker and tests can catch mistakes before they reach production. Async code shows up as soon as the service waits on networks, because an LLM call can take seconds and you do not want one slow request to block everyone else.",
    uses: [
      {
        who: "Dropbox",
        what: "Dropbox type-checked its main back-end Python codebase with mypy as it grew to roughly 4 million annotated lines. They rolled it out gradually: annotations were optional at first, then required for new files, with coverage reports sent to teams and work on fast incremental checks so it stayed usable at that size.",
        source: { label: "Dropbox Tech: Our journey to type checking 4 million lines of Python", url: "https://dropbox.tech/application/our-journey-to-type-checking-4-million-lines-of-python", kind: "blog" },
      },
      {
        who: "Microsoft, Uber and Netflix (via FastAPI)",
        what: "Engineers from these companies are quoted on the FastAPI site describing Python services built on typed models: Uber serving predictions for its Ludwig ML toolkit, a Microsoft team running ML services, and Netflix open-sourcing its Dispatch incident tool.",
        source: { label: "FastAPI home page, Opinions section", url: "https://fastapi.tiangolo.com/", kind: "docs" },
      },
    ],
    scenario: {
      title: "Turning a summarisation notebook into a shippable package",
      context:
        "A data scientist has a notebook that summarises support tickets with an LLM. The team wants the same logic inside an API and a nightly batch job, and it keeps breaking when someone edits a cell out of order.",
      architecture:
        "A `ticket_ai` package with a `models.py` (Pydantic types), `summarise.py` (pure logic plus one LLM client call), and `cli.py` for the batch job. The API and the batch job both import the package instead of copying code.",
      tools: ["uv", "Pydantic", "pytest", "mypy or pyright", "ruff"],
      steps: [
        "Create the project with `uv init`, add dependencies with `uv add`, and commit the lock file so every machine gets the same versions.",
        "Move logic out of notebook cells into small functions with type hints, keeping the LLM call behind one function so it can be faked in tests.",
        "Define a Pydantic model for the input ticket and the summary output, so bad data fails loudly at the edge rather than deep inside the code.",
        "Write pytest tests for the pure functions and a test that fakes the LLM client, then add a test for the empty-ticket and very-long-ticket cases.",
        "Run ruff and the type checker in CI on every pull request, and only then wire the package into the API and the batch job.",
      ],
    },
    example: {
      title: "A typed, testable unit with the LLM call injected",
      lang: "python",
      code: `from dataclasses import dataclass
from typing import Protocol
from pydantic import BaseModel, Field

class Ticket(BaseModel):
    id: str
    body: str = Field(min_length=1)

class Summary(BaseModel):
    ticket_id: str
    text: str

class LLM(Protocol):
    def complete(self, prompt: str) -> str: ...

def summarise(ticket: Ticket, llm: LLM, max_chars: int = 4000) -> Summary:
    body = ticket.body[:max_chars]  # keep cost bounded
    text = llm.complete(f"Summarise this support ticket in 2 sentences:\\n{body}")
    return Summary(ticket_id=ticket.id, text=text.strip())

# test_summarise.py
@dataclass
class FakeLLM:
    reply: str
    def complete(self, prompt: str) -> str:
        return self.reply

def test_summarise_strips_and_keeps_id():
    out = summarise(Ticket(id="T1", body="Printer on fire"), FakeLLM("  Fire.  "))
    assert out == Summary(ticket_id="T1", text="Fire.")`,
      notes:
        "The LLM is passed in as a `Protocol`, so the test needs no network and no API key. Pydantic rejects an empty body before any money is spent, and truncating the input keeps one huge ticket from blowing the token budget.",
    },
    tradeoffs: [
      { issue: "Type hints and tests slow down the first prototype.", response: "Teams keep a notebook for exploring, then require types and tests only for code that is imported by a service. The rule is about what ships, not what is tried." },
      { issue: "Async code is easy to get subtly wrong, for example calling a blocking library inside an async function.", response: "Use async only where the code waits on the network, use the async version of each client, and add a test that runs several calls at once to catch blocking." },
      { issue: "Dependency drift: a library update changes behaviour and nobody knows why.", response: "Commit the lock file, update dependencies on purpose in their own pull request, and let CI run the full test suite on that change." },
    ],
    junior: "Writes everything in one file or notebook, installs packages globally, and checks the result by running it once and reading the output.",
    senior: "Designs the package so the risky parts (LLM calls, I/O) sit behind small interfaces, pins the environment, and makes the test suite the proof that a change works, so others can change the code safely too.",
    reading: [
      { label: "uv documentation", url: "https://docs.astral.sh/uv/", kind: "docs" },
      { label: "pytest: Get started", url: "https://docs.pytest.org/en/stable/getting-started.html", kind: "docs" },
      { label: "A conceptual overview of asyncio (Python docs)", url: "https://docs.python.org/3/howto/a-conceptual-overview-of-asyncio.html", kind: "docs" },
    ],
  },
  {
    moduleId: "M0.2",
    howItWorks:
      "Every LLM provider, payment system and internal service you will call is an HTTP API. In practice the work is less about sending a request and more about handling what comes back: reading the status code to decide whether to retry, reading headers such as `retry-after` and rate-limit counters to slow down, and making sure a retried request cannot do the same thing twice. Production clients set timeouts on every call, log a request id for every failure, and treat 4xx and 5xx responses very differently.",
    uses: [
      {
        who: "Stripe",
        what: "Stripe lets clients send an `Idempotency-Key` header on POST requests. If the network drops and the client retries with the same key, Stripe returns the stored result instead of charging the card twice. It is the standard example of making retries safe on a non-idempotent method.",
        source: { label: "Stripe blog: Designing robust and predictable APIs with idempotency", url: "https://stripe.com/blog/idempotency", kind: "blog" },
      },
      {
        who: "GitHub REST API",
        what: "GitHub documents a per-user hourly request budget, reports what is left in `x-ratelimit-remaining`, and asks clients that hit secondary limits to honour `retry-after` and back off exponentially. It warns that clients that keep hammering while limited can be banned.",
        source: { label: "GitHub Docs: Rate limits for the REST API", url: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api", kind: "docs" },
      },
      {
        who: "Anthropic Claude API",
        what: "The Claude API maps failures to status codes (400 bad request, 401 bad key, 429 rate limited, 529 overloaded) and returns a `request-id` header on every response so a specific failing call can be traced with support.",
        source: { label: "Claude docs: Errors", url: "https://platform.claude.com/docs/en/api/errors", kind: "docs" },
      },
    ],
    scenario: {
      title: "A reliable client for a third-party LLM API",
      context:
        "Your app calls an LLM provider for every chat message. Users report random failures at busy times, and finance notices a few duplicated paid jobs after network blips.",
      architecture:
        "One shared HTTP client module wraps the provider. It sets connect and read timeouts, classifies responses by status code, retries only safe failures with backoff, attaches an idempotency key to anything that creates a paid job, and logs the provider's request id.",
      tools: ["httpx", "curl", "Postman or Bruno", "structured logging"],
      steps: [
        "Reproduce one call with curl and read the full response, including headers, so you know exactly what the provider sends on success and on failure.",
        "Write a status-code table: which codes are retryable (429, 500, 503, 529), which are your bug (400, 422), and which are configuration (401, 403).",
        "Build the client wrapper with a timeout on every call and retries with exponential backoff and jitter for the retryable codes only, honouring `retry-after` when present.",
        "Add an idempotency key, generated once per logical job, to POST requests that create something you pay for.",
        "Log method, URL path, status, latency and the provider request id for each failure, then load-test against a mock that returns 429s to check the client slows down instead of hammering.",
      ],
    },
    example: {
      title: "Status-aware retries with retry-after",
      lang: "python",
      code: `import random, time, uuid
import httpx

RETRYABLE = {429, 500, 502, 503, 504, 529}

def post_json(url: str, body: dict, key: str, attempts: int = 4) -> dict:
    headers = {"authorization": f"Bearer {key}",
               "idempotency-key": str(uuid.uuid4())}  # same key on every retry
    with httpx.Client(timeout=httpx.Timeout(30.0, connect=5.0)) as client:
        for attempt in range(attempts):
            r = client.post(url, json=body, headers=headers)
            if r.status_code < 400:
                return r.json()
            if r.status_code not in RETRYABLE or attempt == attempts - 1:
                rid = r.headers.get("request-id", "?")
                raise RuntimeError(f"{r.status_code} from {url} (request {rid}): {r.text[:200]}")
            wait = float(r.headers.get("retry-after", 2 ** attempt))
            time.sleep(wait + random.uniform(0, 0.5))  # jitter
    raise AssertionError("unreachable")`,
      notes:
        "The idempotency key is created once, outside the loop, so every retry is the same logical request. A 400 or 401 fails immediately because retrying a bad request or a bad key can never succeed. Jitter stops many clients from retrying in the same instant.",
    },
    tradeoffs: [
      { issue: "Retries hide failures and can multiply load on a struggling service.", response: "Cap attempts, retry at one layer only, and alert on the retry rate, not just on final failures." },
      { issue: "Long timeouts hold connections and threads; short ones cut off slow but valid LLM responses.", response: "Use a short connect timeout and a read timeout sized from real latency percentiles, and stream long generations instead of waiting for the whole body." },
      { issue: "Logging full request bodies leaks user data and API keys.", response: "Log ids, sizes, status and timing by default, redact the authorization header, and keep full payloads only in a secured trace store." },
    ],
    junior: "Wraps the call in `try/except Exception: retry()`, so bad API keys and malformed requests are retried forever and real outages look like slowness.",
    senior: "Classifies failures by status code, makes writes idempotent before adding retries, sets explicit timeouts and budgets, and makes sure each failure can be traced to one provider request id.",
    reading: [
      { label: "Overview of HTTP (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview", kind: "docs" },
      { label: "HTTP reference: methods, status codes, headers (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference", kind: "docs" },
      { label: "Timeouts, retries and backoff with jitter (AWS Builders' Library)", url: "https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter", kind: "blog" },
    ],
  },
  {
    moduleId: "M0.3",
    howItWorks:
      "Most AI features reach users as an HTTP endpoint that a web or mobile app calls. FastAPI is popular for this because the request and response are Pydantic models: invalid input is rejected with a clear 422 before your code runs, the response is filtered to the fields you declared, and OpenAPI docs are generated for the frontend team. In production the endpoint is thin. It validates, pulls shared things (database session, settings, current user) through dependency injection, calls a service function, and maps known errors to clean status codes.",
    uses: [
      {
        who: "Uber (Ludwig)",
        what: "Uber engineers say on the FastAPI site that they used it to build the REST server that serves predictions for Ludwig, their open-source ML toolkit. This is the classic pattern of a model hidden behind a small typed HTTP API.",
        source: { label: "FastAPI home page, Opinions section", url: "https://fastapi.tiangolo.com/", kind: "docs" },
      },
      {
        who: "Netflix (Dispatch)",
        what: "Netflix released Dispatch, its incident-management orchestration tool, as open source, and the team states it was built with FastAPI. It shows FastAPI used for an internal service with many integrations, not only for ML.",
        source: { label: "FastAPI home page, Opinions section", url: "https://fastapi.tiangolo.com/", kind: "docs" },
      },
    ],
    scenario: {
      title: "A `/summarize` endpoint in front of an LLM",
      context:
        "The product team wants a button that summarises a long document. The mobile and web apps both need it, and the API must stay up when the LLM provider is slow.",
      architecture:
        "FastAPI app with a `POST /summarize` route. Request and response are Pydantic models. A dependency provides the LLM client and settings. The route calls an async service function that talks to the provider with a timeout, and an exception handler maps provider errors to 502 or 503.",
      tools: ["FastAPI", "Pydantic", "httpx (async)", "pytest with TestClient", "uvicorn"],
      steps: [
        "Write the request and response models first, including limits such as maximum text length, and share the generated OpenAPI docs with the app developers.",
        "Create the route as `async def` and call the provider with the async client so one slow call does not block the worker.",
        "Inject settings and the LLM client with `Depends`, so tests can override them with fakes.",
        "Add exception handlers: validation errors stay 422, provider timeouts become 503 with a friendly message, and unexpected errors become 500 with a logged id.",
        "Write tests with `TestClient` for the happy path, the too-long input, and a provider timeout, then run it with uvicorn behind the platform's load balancer.",
      ],
    },
    example: {
      title: "Thin route, typed models, injected client",
      lang: "python",
      code: `from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
import httpx

app = FastAPI()

class SummarizeIn(BaseModel):
    text: str = Field(min_length=20, max_length=50_000)

class SummarizeOut(BaseModel):
    summary: str
    model: str

async def get_llm() -> httpx.AsyncClient:
    return httpx.AsyncClient(base_url="https://llm.example.com", timeout=20.0)

@app.post("/summarize", response_model=SummarizeOut)
async def summarize(body: SummarizeIn, llm: httpx.AsyncClient = Depends(get_llm)):
    try:
        r = await llm.post("/v1/complete", json={"prompt": f"Summarise:\\n{body.text}"})
        r.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(503, "Summary service is busy, try again shortly")
    data = r.json()
    return SummarizeOut(summary=data["text"], model=data["model"])`,
      notes:
        "Input limits live in the model, so a 2 MB paste is rejected before any tokens are paid for. In tests, `app.dependency_overrides[get_llm]` swaps in a fake client. A real app would reuse one client created at startup instead of making one per request.",
    },
    tradeoffs: [
      { issue: "Calling a blocking SDK inside `async def` freezes every request on that worker.", response: "Use async clients in async routes, or declare the route with plain `def` so FastAPI runs it in a thread pool." },
      { issue: "LLM calls are slow, so HTTP requests time out at the load balancer.", response: "Stream the response, or return a job id and let the client poll for results when work takes longer than a few seconds." },
      { issue: "Returning raw model output leaks internal fields and makes the contract unstable.", response: "Always declare a `response_model`, version the API, and treat the OpenAPI schema as a contract with the frontend." },
    ],
    junior: "Puts the prompt, the HTTP call, database access and error handling all inside the route function, with no input limits and no tests.",
    senior: "Keeps routes thin, puts limits and contracts in models, injects dependencies so everything is testable, and decides upfront how the endpoint behaves when the model is slow or down.",
    reading: [
      { label: "FastAPI tutorial / user guide", url: "https://fastapi.tiangolo.com/tutorial/", kind: "docs" },
      { label: "FastAPI: Response model", url: "https://fastapi.tiangolo.com/tutorial/response-model/", kind: "docs" },
    ],
  },
  {
    moduleId: "M0.4",
    howItWorks:
      "Almost every AI product keeps its real state in a relational database: users, conversations, documents, permissions, usage and evaluation results. In practice that means designing tables around how the app reads data, adding indexes for the columns you filter and sort by, using parameterised queries, pooling connections, and keeping credentials out of code. The same Postgres often also stores vectors (with pgvector), so the basics here carry straight into RAG later.",
    uses: [
      {
        who: "OpenAI (ChatGPT)",
        what: "OpenAI describes running a single primary PostgreSQL for writes with close to fifty read replicas behind ChatGPT. They added PgBouncer connection pooling, moved write-heavy workloads to sharded stores, rate-limited at several layers, and guarded against cache-miss storms that overloaded the database.",
        source: { label: "OpenAI: Scaling PostgreSQL to power 800 million ChatGPT users", url: "https://openai.com/index/scaling-postgresql/", kind: "blog" },
      },
      {
        who: "Notion",
        what: "Notion split one overloaded Postgres into 480 logical shards over 32 physical databases, keyed by workspace id because almost every query stays inside one workspace. They migrated with double writes, a backfill, verification and a switch-over.",
        source: { label: "Notion: Lessons learned from sharding Postgres at Notion", url: "https://www.notion.com/blog/sharding-postgres-at-notion", kind: "blog" },
      },
    ],
    scenario: {
      title: "Storing chat history for an assistant",
      context:
        "A chat assistant must show each user their past conversations, reload a conversation quickly, and record token usage per message for billing.",
      architecture:
        "PostgreSQL with `users`, `conversations` and `messages` tables. The API connects through a connection pool, reads the database URL from an environment variable, and uses parameterised queries through a driver or ORM. Schema changes go through migrations.",
      tools: ["PostgreSQL", "psycopg or SQLAlchemy", "Alembic migrations", "EXPLAIN ANALYZE", "a connection pooler"],
      steps: [
        "List the queries the app must run (recent conversations for a user, all messages in a conversation in order) before designing tables.",
        "Create tables with foreign keys and timestamps, and write the first migration so the schema is versioned like code.",
        "Add indexes that match those queries, for example `(user_id, updated_at DESC)` on conversations and `(conversation_id, created_at)` on messages.",
        "Connect the API through a pool, read credentials from the environment, and use parameters for every value in every query.",
        "Load realistic data (thousands of conversations), run `EXPLAIN ANALYZE` on the slow queries, and fix them before launch rather than after.",
      ],
    },
    example: {
      title: "Schema and the index that makes the main screen fast",
      lang: "sql",
      code: `CREATE TABLE conversations (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id),
  title       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id              BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  input_tokens    INT,
  output_tokens   INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- "My recent chats" screen
CREATE INDEX conversations_user_recent ON conversations (user_id, updated_at DESC);
CREATE INDEX messages_by_conversation ON messages (conversation_id, created_at);

-- From Python, always with parameters:
-- cur.execute("SELECT id, title FROM conversations WHERE user_id = %s
--              ORDER BY updated_at DESC LIMIT 20", (user_id,))`,
      notes:
        "The composite index matches the exact filter and sort of the busiest query, so Postgres reads 20 rows instead of scanning every conversation. Storing token counts per message makes billing and cost dashboards a simple `SUM` later.",
    },
    tradeoffs: [
      { issue: "Too many connections: each app worker opens its own and the database runs out.", response: "Put a pooler such as PgBouncer in front, or size the app's pool so workers times pool size stays under the database limit." },
      { issue: "Indexes speed reads but slow writes and use disk.", response: "Index for real queries found in logs or `EXPLAIN`, not for every column, and drop indexes no query uses." },
      { issue: "One database becomes a bottleneck as traffic grows.", response: "Add read replicas and caching first, move write-heavy or easily partitioned data elsewhere, and shard by a key such as tenant only when that is not enough." },
    ],
    junior: "Builds SQL with f-strings, adds no indexes, and finds out about slow queries when users complain.",
    senior: "Designs tables from the queries the product needs, versions schema changes with migrations, measures queries with `EXPLAIN`, and plans connection limits and growth before they become incidents.",
    reading: [
      { label: "PostgreSQL tutorial (official)", url: "https://www.postgresql.org/docs/current/tutorial.html", kind: "docs" },
      { label: "FastAPI: SQL (relational) databases", url: "https://fastapi.tiangolo.com/tutorial/sql-databases/", kind: "docs" },
    ],
  },
  {
    moduleId: "M0.5",
    howItWorks:
      "On a team, Git is the system of record for every change and the place where quality is enforced. Work happens on short-lived branches, each change becomes a pull request, automated checks (tests, lint, type checks) run on it, and at least one other person reviews it before it can merge into a protected main branch. For AI projects the same flow covers prompts, evaluation sets and config, so a quality drop can be traced to the exact change that caused it.",
    uses: [
      {
        who: "GitHub flow",
        what: "GitHub documents the lightweight flow most teams use: branch, commit, open a pull request, respond to review with more commits, merge once approved and checks pass, then delete the branch. Branch protection can require reviews and passing checks before merge.",
        source: { label: "GitHub Docs: GitHub flow", url: "https://docs.github.com/en/get-started/using-github/github-flow", kind: "docs" },
      },
      {
        who: "Google",
        what: "Google's public engineering practices say every change is reviewed by someone other than the author, checking design, tests, naming and complexity. They argue for small changes because they are reviewed faster and more carefully and are easier to roll back.",
        source: { label: "Google eng-practices: Small CLs", url: "https://google.github.io/eng-practices/review/developer/small-cls.html", kind: "docs" },
      },
    ],
    scenario: {
      title: "Changing a production prompt safely",
      context:
        "Support says the assistant has become too wordy. You want to change the system prompt, but the last prompt change quietly broke JSON output and nobody knew which commit did it.",
      architecture:
        "Prompts live as files in the repo next to the code. A GitHub Actions workflow runs unit tests and a small evaluation script on every pull request. `main` is protected, so merges need one approval and green checks.",
      tools: ["Git", "GitHub pull requests", "GitHub Actions", "branch protection", "a small eval script"],
      steps: [
        "Create a branch named for the change, such as `prompt/shorter-answers`.",
        "Edit only the prompt file and its tests, and commit with a message that says what changed and why.",
        "Open a pull request that includes before and after outputs from the eval script for a handful of real examples.",
        "Let CI run the tests and evals; address review comments with new commits on the same branch.",
        "Merge when approved and green, delete the branch, and if a regression appears later use `git log` and `git revert` on that one commit.",
      ],
    },
    example: {
      title: "A CI check that blocks merges when tests fail",
      lang: "yaml",
      code: `# .github/workflows/ci.yml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5
      - run: uv sync --locked
      - run: uv run ruff check .
      - run: uv run pytest -q
      - run: uv run python evals/run.py --max-regressions 0`,
      notes:
        "Mark this job as a required check in branch protection and nobody, including you on a deadline, can merge a change that fails tests or regresses the eval set. `--locked` makes CI fail if someone forgot to update the lock file.",
    },
    tradeoffs: [
      { issue: "Long-lived feature branches drift from main and end in painful merge conflicts.", response: "Keep branches small and short-lived, merge main into them often, and hide unfinished features behind flags instead of holding them on a branch." },
      { issue: "Required reviews slow teams down when reviewers are busy.", response: "Keep pull requests small, name a code owner per area, and agree on a response-time norm such as one working day." },
      { issue: "Secrets committed by mistake stay in history even after deletion.", response: "Use `.gitignore` and secret scanning; if a key is pushed, rotate it immediately rather than relying on rewriting history." },
    ],
    junior: "Commits straight to main with messages like `fix`, mixes unrelated changes in one commit, and resolves conflicts by deleting the other person's code.",
    senior: "Keeps each pull request focused and reviewable, writes commit messages that explain why, relies on CI and protection rules rather than memory, and can find and revert the change that broke something in minutes.",
    reading: [
      { label: "Pro Git (free book)", url: "https://git-scm.com/book/en/v2", kind: "docs" },
      { label: "Google eng-practices: How to do a code review", url: "https://google.github.io/eng-practices/review/", kind: "docs" },
    ],
  },
  {
    moduleId: "M0.6",
    howItWorks:
      "Teams now use coding assistants and agents for real engineering work: exploring an unfamiliar codebase, drafting changes, writing tests, and debugging from logs. The part that makes it engineering rather than vibe coding is the verification loop. You give the agent a small, clear task with the right context, let it run tests or the app to check itself, and then review the diff yourself as if a colleague wrote it. Project memory files (such as CLAUDE.md) hold the commands, conventions and gotchas so the agent does not have to rediscover them each time.",
    uses: [
      {
        who: "Google",
        what: "Google reported that engineers accept about 37% of AI code-completion suggestions, that AI now helps with roughly half of code characters written, and that AI-suggested changes resolve a meaningful share of code-review comments. Humans still review and own every change.",
        source: { label: "Google Research: AI in software engineering at Google", url: "https://research.google/blog/ai-in-software-engineering-at-google-progress-and-the-path-ahead/", kind: "blog" },
      },
      {
        who: "Anthropic teams",
        what: "Anthropic describes teams using Claude Code to onboard onto data pipelines by having it read project memory files, to trace control flow from stack traces during security incidents, and to diagnose a Kubernetes outage from dashboard screenshots.",
        source: { label: "How Anthropic teams use Claude Code", url: "https://claude.com/resources/articles/how-anthropic-teams-use-claude-code", kind: "case-study" },
      },
      {
        who: "GitHub Copilot study",
        what: "In a controlled experiment, developers using Copilot finished an HTTP-server task about 55% faster on average than those without it, though with a wide confidence range. It measures speed on one bounded task, not overall code quality.",
        source: { label: "GitHub: Quantifying Copilot's impact on productivity", url: "https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/", kind: "blog" },
      },
    ],
    scenario: {
      title: "Adding a retry feature with a coding agent",
      context:
        "You need to add timeouts and retries to an existing HTTP client in a codebase you did not write, with tests, by the end of the day.",
      architecture:
        "A repo with a CLAUDE.md that lists the test command, the lint command and code conventions. The agent works on a branch, can run tests, and you review its diff before opening a pull request.",
      tools: ["Claude Code or a similar agent", "CLAUDE.md project memory", "pytest", "git diff", "pull request review"],
      steps: [
        "Ask the agent to explore first: where is the HTTP client, who calls it, and how are tests run. Read its summary and correct anything wrong.",
        "Write a short spec in the prompt: which errors retry, how many attempts, the timeout value, and that tests must cover a 429 and a 400.",
        "Let the agent implement and run the tests itself, and ask it to show the failing test before the fix and the passing run after.",
        "Read the whole diff line by line, check it did not touch unrelated files or invent APIs, and run the tests yourself.",
        "Open the pull request with a human-written summary, and add any new convention you discovered to CLAUDE.md for next time.",
      ],
    },
    example: {
      title: "A project memory file that makes the agent's work checkable",
      lang: "text",
      code: `# CLAUDE.md

## Commands
- Install: uv sync
- Test: uv run pytest -q          # must pass before any commit
- Lint: uv run ruff check . --fix
- Type check: uv run pyright

## Conventions
- All HTTP calls go through app/http_client.py; never call httpx directly.
- Retries: only 429 and 5xx, max 4 attempts, honour retry-after.
- New behaviour needs a test in tests/ that fails without the change.

## Gotchas
- tests/test_live.py hits a real API; it is skipped unless LIVE=1.
- Do not edit migrations that are already on main.`,
      notes:
        "The file is short and concrete: exact commands, the few rules that matter, and traps that wasted time before. That is the minimum useful context, and it gives the agent a way to verify its own work instead of guessing.",
    },
    tradeoffs: [
      { issue: "Generated code can look right while hiding subtle bugs or invented library calls.", response: "Require tests that fail before and pass after, run them yourself, and review diffs as carefully as a human colleague's." },
      { issue: "Agents given vague tasks wander and change too much.", response: "Ask for small, specific changes, have the agent explore and plan before editing, and keep each change to one pull request." },
      { issue: "Over time, nobody on the team understands code they did not write.", response: "Ask the agent to explain its change, write the pull request summary yourself, and keep design decisions in docs that humans read." },
    ],
    junior: "Pastes an error into the assistant, accepts whatever comes back, and commits it without running tests or reading the diff.",
    senior: "Gives the agent a clear spec and the commands to verify itself, reviews every diff, keeps project memory current, and stays the person accountable for what ships.",
    reading: [
      { label: "Best practices for Claude Code", url: "https://code.claude.com/docs/en/best-practices", kind: "docs" },
      { label: "Using CLAUDE.md files", url: "https://claude.com/blog/using-claude-md-files", kind: "blog" },
    ],
  },
  {
    moduleId: "M0.7",
    howItWorks:
      "A container image is the unit that gets deployed. The team writes a Dockerfile once, CI builds the image on every merge, tags it with the commit, pushes it to a registry, and a platform such as Cloud Run, Fly.io, Render, ECS or Kubernetes runs it. Configuration and secrets are injected as environment variables at run time, never baked into the image. Logs go to standard output, and a health check endpoint lets the platform restart the container if it hangs.",
    uses: [
      {
        who: "Google Cloud Run",
        what: "Cloud Run runs a container you build (or one it builds from source with buildpacks), scales it with traffic and down to zero when idle, and bills compute in 100 ms steps. A cold start after scaling to zero adds latency to the first request, which is why many teams keep a minimum instance.",
        source: { label: "Google Cloud: What is Cloud Run", url: "https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run", kind: "docs" },
      },
      {
        who: "uv in Docker (Astral)",
        what: "The uv docs show the production pattern for Python images: copy the lock file first, install dependencies in a cached layer, then copy the app code, so a code-only change rebuilds in seconds instead of reinstalling everything.",
        source: { label: "uv docs: Using uv in Docker", url: "https://docs.astral.sh/uv/guides/integration/docker/", kind: "docs" },
      },
    ],
    scenario: {
      title: "Shipping the FastAPI summariser to a public URL",
      context:
        "Your `/summarize` API works on your laptop. You need a public URL for the frontend team, with the API key kept secret and new versions deployed on every merge.",
      architecture:
        "A slim Python base image, dependencies installed with uv from the lock file, the app run by uvicorn on the port the platform provides. CI builds and pushes the image to a registry, then deploys it to a managed container service with the API key stored in its secret manager.",
      tools: ["Docker", "uv", "a container registry", "GitHub Actions", "Cloud Run, Render or Fly.io"],
      steps: [
        "Write the Dockerfile with dependency layers before code layers, and add a `.dockerignore` that excludes `.env`, `.git` and caches.",
        "Build and run locally with `docker run -p 8000:8000 -e LLM_API_KEY=...` and hit the health and summarise endpoints.",
        "Make the app read its port and settings from environment variables and log to stdout, so the platform can configure and observe it.",
        "Add a CI job that builds the image, tags it with the commit SHA and pushes it to the registry.",
        "Deploy that tag, set the secret in the platform, check logs for startup errors, and call the public URL from a test script before telling the frontend team.",
      ],
    },
    example: {
      title: "A cache-friendly Dockerfile for a uv project",
      lang: "dockerfile",
      code: `FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app

# 1) dependencies only: cached until the lock file changes
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project

# 2) application code: changes often, rebuilds fast
COPY . .
RUN uv sync --locked --no-dev

ENV PORT=8000
EXPOSE 8000
CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT"]`,
      notes:
        "Layer order is the main trick: the slow dependency install only reruns when `uv.lock` changes. There are no secrets in the file; the API key arrives as an environment variable when the container starts. Pin the uv image tag in a real project rather than `latest`.",
    },
    tradeoffs: [
      { issue: "Images grow huge when build tools, caches and test data are shipped.", response: "Use slim base images, a `.dockerignore`, and multi-stage builds that copy only what runs in production." },
      { issue: "Scale-to-zero saves money but the first request after idle is slow.", response: "Keep one minimum instance for user-facing services, and allow scale to zero for internal tools and batch jobs." },
      { issue: "Secrets end up in image layers or in logs.", response: "Inject secrets at run time from the platform's secret manager, never `COPY .env`, and scan images in CI." },
    ],
    junior: "Copies the whole project including `.env` into the image, runs as root, and debugs a crashing container by rebuilding it repeatedly without reading the logs.",
    senior: "Writes small reproducible images with cached layers, separates config from code, builds and deploys from CI by commit tag, and makes the service observable with logs and a health check from day one.",
    reading: [
      { label: "Docker: Get started", url: "https://docs.docker.com/get-started/", kind: "docs" },
      { label: "Docker workshop", url: "https://docs.docker.com/get-started/workshop/", kind: "docs" },
    ],
  },
];
