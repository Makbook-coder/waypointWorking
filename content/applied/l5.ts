import type { AppliedModule } from "./types";

const RESEARCH = { label: "Anthropic: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" } as const;
const SHOPIFY = { label: "Shopify Engineering: Building production-ready agentic systems", url: "https://shopify.engineering/building-production-ready-agentic-systems", kind: "case-study" } as const;
const KLARNA = { label: "LangChain: How Klarna's AI assistant redefined customer support", url: "https://www.langchain.com/blog/customers-klarna", kind: "case-study" } as const;
const AGENT_SDK = { label: "Building agents with the Claude Agent SDK", url: "https://claude.com/resources/articles/building-agents-with-the-claude-agent-sdk", kind: "blog" } as const;
const CC_TEAMS = { label: "How Anthropic teams use Claude Code", url: "https://claude.com/resources/articles/how-anthropic-teams-use-claude-code", kind: "case-study" } as const;

export const APPLIED_L5: AppliedModule[] = [
  {
    moduleId: "M5.1",
    howItWorks:
      "An agent is a model in a loop: it decides the next action, calls a tool, looks at the result, and repeats until the goal is met or a limit is hit. In production, teams use agents where the steps cannot be known in advance (debugging, research, multi-step support cases) and use fixed workflows where they can. A real agent has more than a model and tools: it has instructions, memory of what it has done, limits on steps and cost, a way to check its own work, and a human escalation path.",
    uses: [
      {
        who: "Shopify Sidekick",
        what: "Shopify's merchant assistant evolved from simple tool calling into an agent that analyses customer segments, fills product forms and navigates admin pages for the merchant, with dedicated evaluation and a merchant simulator to test it before release.",
        source: SHOPIFY,
      },
      {
        who: "Anthropic teams (Claude Code)",
        what: "Anthropic describes teams using a coding agent to trace incidents through a codebase from stack traces, diagnose a Kubernetes outage from screenshots, and run marketing workflows over CSV files, tasks where the path depends on what each step reveals.",
        source: CC_TEAMS,
      },
    ],
    scenario: {
      title: "Workflow or agent for refund handling?",
      context:
        "An e-commerce company wants to automate refund requests. Most are simple (item not delivered, within 30 days); some involve partial shipments, damaged goods photos and disputes.",
      architecture:
        "Simple, rule-checkable cases run through a fixed workflow: classify, look up order, apply policy, draft response. Complex cases go to an agent with read tools (orders, shipments, photos) and one gated write tool (propose refund), a step limit, and handoff to a human for anything above a set amount.",
      tools: ["an LLM with tool calling", "order and shipment APIs", "a policy rules engine", "a human review queue", "tracing"],
      steps: [
        "Sample 200 past refund cases and sort them by how predictable their steps were.",
        "Automate the predictable majority with a workflow and measure accuracy against human decisions.",
        "For the rest, design the agent's tools, instructions, step and cost limits, and escalation rules.",
        "Run the agent in shadow mode, proposing actions that humans approve, and compare with human decisions.",
        "Gradually allow it to act alone on low-value cases where its agreement with humans is high.",
      ],
    },
    example: {
      title: "The core agent loop with limits",
      lang: "python",
      code: `def run_agent(goal: str, llm, tools: dict, max_steps: int = 8, max_cost_usd: float = 0.50) -> dict:
    messages = [{"role": "user", "content": goal}]
    cost = 0.0
    for step in range(max_steps):
        reply = llm(messages, tools=list(tools))            # model decides the next action
        cost += reply.cost_usd
        messages.append(reply.message)
        if reply.tool_calls == []:
            return {"status": "done", "answer": reply.text, "steps": step + 1, "cost": cost}
        for call in reply.tool_calls:
            result = tools[call.name](**call.args) if call.name in tools else {"error": "unknown tool"}
            messages.append({"role": "tool", "id": call.id, "content": result})
        if cost > max_cost_usd:
            return {"status": "escalated", "reason": "cost budget", "transcript": messages}
    return {"status": "escalated", "reason": "step limit", "transcript": messages}`,
      notes:
        "This is the whole idea: decide, act, observe, repeat. The parts that make it production-worthy are the step and cost limits and the escalation result that hands a full transcript to a human instead of looping forever.",
    },
    tradeoffs: [
      { issue: "Agents are less predictable and harder to test than workflows.", response: "Use workflows for predictable paths and agents only for the cases that need flexibility, with traces and evals for both." },
      { issue: "Each loop step costs a model call, so costs and latency vary widely.", response: "Set step, time and cost budgets per task, and monitor their distribution." },
      { issue: "An agent with write access can do damage when it is wrong.", response: "Start read-only or in shadow mode, gate consequential tools behind approval, and widen autonomy as measured agreement grows." },
    ],
    junior: "Builds an autonomous agent for a task that is really five fixed steps, with no step limit and full write access.",
    senior: "Chooses a workflow where the path is known and an agent where it is not, and gives agents budgets, verification, limited permissions and a clear escalation path.",
    reading: [
      { label: "Agents (Chip Huyen)", url: "https://huyenchip.com/2025/01/07/agents.html", kind: "blog" },
      { label: "Building effective agents (Anthropic)", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "blog" },
    ],
  },
  {
    moduleId: "M5.2",
    howItWorks:
      "ReAct-style agents alternate between short reasoning and actions: think about what is needed, call a tool, read the result, decide again. For longer tasks, agents first write a plan, execute it, and revise it when results surprise them. Reflection adds a check after an attempt, writing down what went wrong so the next attempt avoids it. In production, each of these is bounded with stopping conditions, because planning and reflection loops are the most common source of runaway cost.",
    uses: [
      {
        who: "ReAct (research)",
        what: "The ReAct paper interleaved reasoning steps with actions such as Wikipedia lookups, which reduced made-up facts compared with reasoning alone on question answering, and beat imitation and reinforcement learning baselines on interactive tasks with only one or two examples.",
        source: { label: "Yao et al.: ReAct: Synergizing Reasoning and Acting in Language Models", url: "https://arxiv.org/abs/2210.03629", kind: "paper" },
      },
      {
        who: "Anthropic research system",
        what: "Anthropic's lead research agent writes a plan and saves it to memory so it survives context limits, spawns sub-agents for parts of it, and refines its approach as results arrive. They found they had to add explicit rules for how much effort to spend, because early versions overspent on easy questions.",
        source: RESEARCH,
      },
    ],
    scenario: {
      title: "A plan-first agent for competitor research",
      context:
        "A strategy team wants a one-page brief on a competitor's pricing, recent launches and hiring. A single search-and-summarise call misses things and repeats itself.",
      architecture:
        "The agent writes a short plan (sub-questions and sources), executes each step with search and fetch tools in a ReAct loop, checks off completed steps in a scratchpad, revises the plan if a source is missing, then runs one reflection pass against a checklist before writing the brief.",
      tools: ["an LLM with tool calling", "web search and fetch tools", "a scratchpad stored outside the context", "a brief checklist"],
      steps: [
        "Write the loop by hand first with one tool, and print every thought and action to see how the model behaves.",
        "Add the planning step and store the plan in a scratchpad the agent updates after each step.",
        "Set stopping conditions: all plan items done, a step limit, or no new information for two steps.",
        "Add one reflection pass that compares the draft with the checklist and lists gaps, then fills them once.",
        "Evaluate on ten companies against analyst-written briefs, tracking accuracy, coverage, steps and cost.",
      ],
    },
    example: {
      title: "Plan, act, reflect with explicit stopping rules",
      lang: "python",
      code: `def research(company: str, llm, act, max_steps: int = 15) -> str:
    plan = llm(f"List 4-6 sub-questions to brief a strategy team on {company}: pricing, launches, hiring.").splitlines()
    notes, stale = {}, 0
    for step in range(max_steps):
        todo = [q for q in plan if q not in notes]
        if not todo:
            break                                        # plan complete
        q = todo[0]
        found = act(q)                                   # ReAct inner loop: search, fetch, read
        if found:
            notes[q] = found; stale = 0
        else:
            stale += 1
            if stale >= 2:
                plan = llm(f"Sources for {q!r} are missing. Revise this plan:\\n{plan}").splitlines()
                stale = 0
    draft = llm(f"Write a one-page brief on {company} from these notes, citing sources:\\n{notes}")
    gaps = llm(f"Check the brief against: pricing, 3 recent launches, hiring trend, sources cited. List gaps or 'none'.\\n{draft}")
    if gaps.strip().lower() != "none":
        draft = llm(f"Fix these gaps using only the notes; say 'unknown' if notes lack it.\\nGaps: {gaps}\\nNotes: {notes}\\nBrief: {draft}")
    return draft`,
      notes:
        "The plan lives outside the model's context in `notes`, so progress is tracked even in long runs. Stopping conditions are explicit (plan done, step limit, repeated dead ends trigger a revision), and reflection runs once, not in an open loop.",
    },
    tradeoffs: [
      { issue: "Planning and reflection add calls and can loop indefinitely.", response: "Cap steps and reflection rounds, and stop when no new information arrives." },
      { issue: "A wrong plan makes every later step efficiently wrong.", response: "Let the agent revise the plan on surprises, and review plans in evals, not just final outputs." },
      { issue: "Self-critique can approve its own mistakes.", response: "Reflect against concrete checks (checklists, tests, source counts) rather than asking whether the answer looks good." },
    ],
    junior: "Lets the agent think and act without a step limit and adds 'reflect on your answer' in a loop until it says it is satisfied.",
    senior: "Writes the loop by hand first, adds planning and reflection where they measurably help, grounds reflection in concrete checks, and bounds every loop.",
    reading: [
      { label: "ReAct: Synergizing Reasoning and Acting", url: "https://arxiv.org/abs/2210.03629", kind: "paper" },
      { label: "Reflexion: Language Agents with Verbal Reinforcement Learning", url: "https://arxiv.org/abs/2303.11366", kind: "paper" },
    ],
  },
  {
    moduleId: "M5.3",
    howItWorks:
      "Agent tools are designed for the model as the user. Teams give agents a small number of task-shaped tools with clear names and descriptions, return compact results with the fields the agent needs, paginate or truncate large outputs with guidance on how to get more, and make errors explain what to try next. They separate read-only tools from consequential ones, run independent calls in parallel, and evaluate tools by watching agents attempt realistic multi-step tasks.",
    uses: [
      {
        who: "SWE-agent (Princeton)",
        what: "The SWE-agent researchers argued that agents need interfaces designed for them, much as developers need IDEs. Custom commands for searching, viewing and editing files with concise feedback let a model fix real GitHub issues far more often than earlier non-interactive approaches.",
        source: { label: "Yang et al.: SWE-agent: Agent-Computer Interfaces", url: "https://arxiv.org/abs/2405.15793", kind: "paper" },
      },
      {
        who: "Anthropic research system",
        what: "Anthropic found tool descriptions mattered so much that letting a model rewrite flawed descriptions, after watching agents fail with them, cut task completion time substantially for later agents using the improved tools.",
        source: RESEARCH,
      },
    ],
    scenario: {
      title: "Tools for a log-investigation agent",
      context:
        "An on-call assistant helps engineers investigate incidents. The first version had one `run_query(sql)` tool over the log warehouse; the agent wrote huge queries, hit timeouts and flooded its context with rows.",
      architecture:
        "Three focused tools: `search_logs(service, text, since, limit)` returning a compact summary plus top matches, `error_rate(service, window)` returning a small time series, and `get_trace(trace_id)` returning one request's spans. All read-only, with limits enforced server-side and errors that suggest narrower filters.",
      tools: ["tool definitions with strict schemas", "the logging and metrics backends", "an eval set of past incidents", "transcript review"],
      steps: [
        "Collect five past incidents and record which questions an expert asked to solve them.",
        "Design tools around those questions instead of exposing raw query access.",
        "Return summaries first (counts, top patterns) and let the agent ask for detail, with server-side limits on size.",
        "Write errors that teach: when a search is too broad, say how many matches there were and suggest a filter.",
        "Replay the incidents, read the transcripts, and refine names, descriptions and outputs where the agent stumbled.",
      ],
    },
    example: {
      title: "A tool that keeps results small and errors useful",
      lang: "python",
      code: `MAX_ROWS = 20

def search_logs(service: str, text: str, since_minutes: int = 60, limit: int = 10) -> dict:
    """Search one service's logs. Returns a summary and at most \`limit\` example lines."""
    limit = min(limit, MAX_ROWS)
    total = log_backend.count(service=service, text=text, since=since_minutes)
    if total == 0:
        return {"matches": 0, "hint": f"No '{text}' in {service} for {since_minutes} min. "
                                      "Try a longer window or check the service name with list_services."}
    if total > 5000:
        return {"matches": total, "hint": "Too broad. Add a more specific text filter or shorten since_minutes."}
    rows = log_backend.search(service=service, text=text, since=since_minutes, limit=limit)
    return {
        "matches": total,
        "top_messages": log_backend.top_patterns(service=service, text=text, since=since_minutes, n=5),
        "examples": [{"time": r.time, "level": r.level, "msg": r.msg[:300], "trace_id": r.trace_id} for r in rows],
    }`,
      notes:
        "The agent always gets a count and the most common patterns first, so it can decide whether to dig further. Size limits are enforced in the tool, not left to the model, and every dead end comes with a concrete next step.",
    },
    tradeoffs: [
      { issue: "Narrow tools are safer but may not cover unusual questions.", response: "Cover the common investigations with focused tools and keep a guarded general tool for rare cases." },
      { issue: "Large tool outputs fill the context and degrade later steps.", response: "Summarise by default, paginate, truncate long fields, and offer a detail tool." },
      { issue: "Agents misuse tools in ways unit tests do not reveal.", response: "Evaluate with realistic multi-step tasks and read transcripts regularly." },
    ],
    junior: "Gives the agent raw SQL or shell access because it is flexible, and lets tools return thousands of rows.",
    senior: "Designs focused, read-only-by-default tools around real tasks, controls output size in the tool, writes errors as guidance, and improves tools from agent transcripts.",
    reading: [
      { label: "Writing effective tools for AI agents (Anthropic)", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", kind: "blog" },
      { label: "Claude docs: Tool use overview", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview", kind: "docs" },
    ],
  },
  {
    moduleId: "M5.4",
    howItWorks:
      "The Model Context Protocol (MCP) standardises how AI applications connect to tools and data. An MCP server exposes tools, resources and prompts; an AI host (an IDE, chat app or agent) creates a client per server and makes those capabilities available to its model. Teams build one MCP server for an internal system and reuse it across every MCP-capable host instead of writing a separate integration for each. Local servers usually talk over stdio; remote ones use HTTP with proper authentication.",
    uses: [
      {
        who: "Anthropic (MCP launch)",
        what: "Anthropic released MCP as an open standard with ready-made servers for Google Drive, Slack, GitHub, Git, Postgres and Puppeteer. At launch, Block and Apollo had integrated it and developer-tool companies including Zed, Replit, Codeium and Sourcegraph were working with it.",
        source: { label: "Anthropic: Introducing the Model Context Protocol", url: "https://www.anthropic.com/news/model-context-protocol", kind: "blog" },
      },
      {
        who: "Sentry and VS Code (MCP architecture docs)",
        what: "The MCP docs use VS Code as an example host that creates a separate client for each server it connects to, such as Sentry's remote MCP server over HTTP and a local filesystem server over stdio. The same server works in any host that speaks MCP.",
        source: { label: "MCP docs: Architecture overview", url: "https://modelcontextprotocol.io/docs/learn/architecture", kind: "docs" },
      },
    ],
    scenario: {
      title: "One MCP server for an internal ticketing system",
      context:
        "Engineers want to query and update internal tickets from their IDE assistant, their chat assistant and a planning agent. Building three separate integrations would triple the work and the security review.",
      architecture:
        "A remote MCP server over HTTP in front of the ticketing API, with OAuth so each user acts with their own permissions. It exposes read tools (`tickets_search`, `tickets_get`), one write tool (`tickets_comment`) that hosts can require approval for, and a resource for the team's triage guide.",
      tools: ["an MCP SDK (Python or TypeScript)", "the ticketing API", "OAuth", "MCP Inspector for testing"],
      steps: [
        "List the tasks users want, and design a few task-shaped tools rather than mirroring every API endpoint.",
        "Build the server with the SDK, starting with stdio locally and testing with the MCP Inspector.",
        "Add authentication so the server calls the ticketing API with the user's own permissions, never a shared admin token.",
        "Deploy it remotely over HTTP, register it in each host, and mark the write tool as needing confirmation.",
        "Log every tool call with the user and host, and review which tools are used and where agents get stuck.",
      ],
    },
    example: {
      title: "A small MCP server",
      lang: "python",
      code: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("tickets")

@mcp.tool()
def tickets_search(query: str, status: str = "open", limit: int = 10) -> list[dict]:
    """Search tickets by text. Use for 'find tickets about X'. Returns id, title, status, owner."""
    rows = ticket_api.search(query=query, status=status, limit=min(limit, 25))
    return [{"id": r.id, "title": r.title, "status": r.status, "owner": r.owner} for r in rows]

@mcp.tool()
def tickets_comment(ticket_id: str, comment: str) -> str:
    """Add a comment to a ticket. This is visible to the whole team; confirm with the user first."""
    ticket_api.comment(ticket_id, comment)
    return f"Comment added to {ticket_id}."

@mcp.resource("guide://triage")
def triage_guide() -> str:
    """The team's triage rules, for context."""
    return open("docs/triage.md").read()

if __name__ == "__main__":
    mcp.run()          # stdio for local use; serve over HTTP for remote hosts`,
      notes:
        "Tools are ordinary functions with docstrings that become descriptions. Any MCP host can now use them without new integration code. The write tool's description tells hosts and models it has side effects, and real permission checks belong in `ticket_api` with the user's own credentials.",
    },
    tradeoffs: [
      { issue: "Third-party MCP servers can be malicious or carry injected instructions in tool descriptions or results.", response: "Install servers only from trusted sources, review their tools, and limit what each host may call without approval." },
      { issue: "Connecting many servers floods the model with tools.", response: "Enable only the servers needed for a task, and prefer hosts that load tools on demand." },
      { issue: "Remote servers need real auth and per-user permissions.", response: "Use OAuth or per-user tokens, never a shared admin key, and log calls per user." },
    ],
    junior: "Connects every MCP server they can find to their assistant and gives a home-made server an admin API key.",
    senior: "Builds one well-designed server per internal system, authenticates per user, keeps write tools gated, and treats every server's tools and outputs as untrusted input.",
    reading: [
      { label: "What is the Model Context Protocol?", url: "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro", kind: "docs" },
      { label: "MCP specification", url: "https://modelcontextprotocol.io/specification/2026-07-28", kind: "docs" },
    ],
  },
  {
    moduleId: "M5.5",
    howItWorks:
      "Agents need two kinds of memory. Short-term memory is the current conversation or task state, managed by trimming, summarising and checkpointing. Long-term memory is facts and preferences kept across sessions, stored outside the model (a database or vector store) and retrieved only when relevant. Production systems decide deliberately what is worth remembering, let users see and delete it, update or expire stale memories, and keep memory per user so nothing leaks between people.",
    uses: [
      {
        who: "OpenAI (ChatGPT memory)",
        what: "ChatGPT remembers details across chats either when asked or on its own, and gives users controls to view and delete memories, tell it to forget something, turn memory off, or use a temporary chat that neither reads nor writes memory. Deleting a chat does not delete memories taken from it.",
        source: { label: "OpenAI: Memory and new controls for ChatGPT", url: "https://openai.com/index/memory-and-new-controls-for-chatgpt/", kind: "blog" },
      },
      {
        who: "MemGPT (research)",
        what: "MemGPT borrowed the operating-system idea of virtual memory: the model manages a small fast tier in its context and a larger slower tier outside it, moving information between them, which let it handle documents and multi-session chats far beyond its context window.",
        source: { label: "Packer et al.: MemGPT: Towards LLMs as Operating Systems", url: "https://arxiv.org/abs/2310.08560", kind: "paper" },
      },
    ],
    scenario: {
      title: "Memory for a personal fitness coach app",
      context:
        "Users chat with a coach across weeks. They expect it to remember injuries, goals and equipment, but not to bring up every old message, and they must be able to see and delete what it knows.",
      architecture:
        "Short-term: the current session's recent turns plus a running summary. Long-term: a `memories` table per user with typed facts (goal, injury, equipment, preference), timestamps and source message id, plus embeddings for retrieval. After each session an extraction step proposes new or updated memories; at the start of each session the most relevant ones are loaded.",
      tools: ["a database table for memories", "an embedding model for retrieval", "an extraction prompt", "a memory settings screen"],
      steps: [
        "Decide which memory types matter and which must never be stored (for example health details beyond what the user shares for coaching).",
        "After each session, extract candidate memories and resolve them against existing ones: add, update or mark outdated.",
        "At session start, retrieve memories relevant to the user's first message plus always-on essentials such as injuries.",
        "Build a settings screen where users see, edit and delete memories, and a way to chat without memory.",
        "Test for stale or wrong memories (a healed injury still mentioned) and add expiry or confirmation for them.",
      ],
    },
    example: {
      title: "Write, retrieve, update and forget",
      lang: "python",
      code: `from datetime import datetime, timedelta

EXTRACT = """From this session, list durable facts about the user worth remembering for coaching
(goal, injury, equipment, schedule, preference). Return JSON: [{"type", "fact", "replaces_id"|null}].
Ignore small talk and one-off details.
<existing>{existing}</existing>
<session>{session}</session>"""

def update_memories(user_id: str, session: str, db, llm) -> None:
    existing = db.memories(user_id)
    for m in llm.json(EXTRACT.format(existing=existing, session=session)):
        if m["replaces_id"]:
            db.mark_outdated(user_id, m["replaces_id"])
        db.add_memory(user_id, type=m["type"], fact=m["fact"], created=datetime.utcnow())

def load_memories(user_id: str, first_message: str, db, embed, k: int = 5) -> list[str]:
    always = db.memories(user_id, types=["injury", "goal"], active=True)
    relevant = db.search_memories(user_id, embed(first_message), k=k, active=True)
    cutoff = datetime.utcnow() - timedelta(days=180)
    return [m.fact for m in {*always, *relevant} if m.created > cutoff or m.type == "goal"]`,
      notes:
        "Memories are typed, scoped to one user, and resolved against what is already known so the store does not fill with contradictions. Loading combines always-relevant facts with retrieved ones, and old memories age out unless they are long-lived goals.",
    },
    tradeoffs: [
      { issue: "Remembering too much fills context with irrelevant or outdated facts.", response: "Extract only durable facts, retrieve by relevance, and expire or confirm old memories." },
      { issue: "Wrong memories are worse than no memory, because they persist.", response: "Let users see and correct memories, and keep the source message so a memory can be checked." },
      { issue: "Memory stores personal data, with privacy and legal duties.", response: "Store per user with access controls, avoid sensitive categories unless needed, support deletion, and offer memory-free sessions." },
    ],
    junior: "Stuffs the entire chat history from every session into each new prompt and calls it memory.",
    senior: "Separates short-term and long-term memory, writes only durable facts, retrieves them selectively, handles updates and forgetting, and gives users control.",
    reading: [
      { label: "LangGraph: Persistence", url: "https://docs.langchain.com/oss/python/langgraph/persistence", kind: "docs" },
      { label: "Effective context engineering for AI agents (Anthropic)", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", kind: "blog" },
    ],
  },
  {
    moduleId: "M5.6",
    howItWorks:
      "Multi-agent systems split work across several model instances, most often an orchestrator that plans and delegates to workers that each have their own context and tools. They pay off when a task breaks into genuinely independent parts that can run in parallel, such as researching several directions at once. They cost far more tokens and add coordination failures, so experienced teams start with one capable agent and move to multiple agents only when parallelism or context isolation clearly helps.",
    uses: [
      {
        who: "Anthropic research system",
        what: "Anthropic's research feature uses a lead agent that plans and spawns parallel sub-agents, each searching in its own context. On their internal eval it beat a single agent by a wide margin on broad questions, but used roughly fifteen times the tokens of a chat, so they reserve it for high-value tasks.",
        source: RESEARCH,
      },
      {
        who: "Cognition (the counter-argument)",
        what: "Cognition argues against splitting work across agents that do not share full context, because each sub-agent makes implicit decisions the others cannot see. Their example is two sub-agents building parts of a game in mismatched styles that the final agent cannot reconcile.",
        source: { label: "Cognition: Don't Build Multi-Agents", url: "https://cognition.com/blog/dont-build-multi-agents", kind: "blog" },
      },
      {
        who: "Klarna",
        what: "Klarna's support assistant is described as a multi-agent system on LangGraph that routes each request to a task-specific handler, which the case study credits with lower latency and cost than a single general agent.",
        source: KLARNA,
      },
    ],
    scenario: {
      title: "Due-diligence reports on many companies at once",
      context:
        "An investment team needs a short risk report on 20 companies by tomorrow. Each report needs financials, news and litigation checks. One agent doing all 20 sequentially is slow and its context overflows.",
      architecture:
        "An orchestrator reads the request, creates one detailed brief per company, and starts worker agents in parallel, each with search and filings tools and its own context. Workers return a fixed-format summary with sources. The orchestrator checks each summary for required fields, retries failed workers once, and assembles the report.",
      tools: ["an orchestrator agent", "worker agents with search and filings tools", "a fixed output schema", "bounded concurrency", "tracing per worker"],
      steps: [
        "Check the work really is independent per company; here it is, so parallel workers fit.",
        "Write a detailed worker brief template: scope, sources to check, output schema, and what not to do.",
        "Run workers in parallel with a concurrency limit, a per-worker step and cost budget, and a timeout.",
        "Validate every worker's output against the schema; retry once with the error, then mark as incomplete.",
        "Compare quality and cost against a single-agent run on five companies before relying on it.",
      ],
    },
    example: {
      title: "Orchestrator with briefed, bounded workers",
      lang: "python",
      code: `import asyncio, json

BRIEF = """You are researching {company} for a risk report.
Check: last 2 years of revenue trend, major news in 12 months, open litigation.
Use only the provided tools. Cite every source URL.
Return JSON: {{"company", "revenue_trend", "news": [..], "litigation": [..], "sources": [..]}}
Do not research other companies or give investment advice."""

async def worker(company: str, run_agent, limit: asyncio.Semaphore) -> dict:
    async with limit:
        for attempt in range(2):
            out = await run_agent(BRIEF.format(company=company), max_steps=12, max_cost_usd=0.40)
            try:
                data = json.loads(out)
                if all(k in data for k in ("revenue_trend", "news", "litigation", "sources")):
                    return data
            except json.JSONDecodeError:
                pass
        return {"company": company, "status": "incomplete"}

async def orchestrate(companies: list[str], run_agent) -> list[dict]:
    limit = asyncio.Semaphore(5)
    return await asyncio.gather(*(worker(c, run_agent, limit) for c in companies))`,
      notes:
        "Each worker gets a detailed brief with scope, output format and boundaries, which Anthropic found prevents duplicated or drifting work. Budgets and the concurrency limit keep the total cost predictable, and incomplete results are reported honestly instead of being silently dropped.",
    },
    tradeoffs: [
      { issue: "Multi-agent runs use many times more tokens than a single agent.", response: "Use them only for high-value tasks that parallelise well, and track cost per task." },
      { issue: "Workers without shared context make conflicting assumptions.", response: "Give detailed briefs and fixed output schemas, or keep tightly coupled work in one agent." },
      { issue: "Failures multiply: any worker can stall, loop or return junk.", response: "Give each worker budgets and timeouts, validate outputs, retry once, and surface incomplete parts." },
    ],
    junior: "Builds a team of agents with job titles for a task one agent could do, and debugging becomes impossible.",
    senior: "Starts with one agent, splits only truly independent work, writes precise worker briefs and schemas, and measures whether the extra cost buys real quality or speed.",
    reading: [
      { label: "How we built our multi-agent research system (Anthropic)", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" },
      { label: "Agent2Agent (A2A) protocol specification", url: "https://a2a-protocol.org/latest/specification/", kind: "docs" },
    ],
  },
  {
    moduleId: "M5.7",
    howItWorks:
      "LangGraph models an agent or workflow as a graph: shared typed state, nodes that update it, and edges (including conditional ones) that decide what runs next. Its practical value is in production concerns: a checkpointer saves state after each step, so long runs can resume after a crash, conversations continue by thread id, and a run can pause for human approval and continue hours later. Teams reach for it when a plain loop starts needing branching, retries, persistence and human-in-the-loop all at once.",
    uses: [
      {
        who: "Klarna",
        what: "Klarna built its customer-support assistant on LangGraph, using graph routing to send each request to the right handler, and LangSmith to trace each step, evaluate and improve prompts.",
        source: KLARNA,
      },
      {
        who: "LangGraph persistence",
        what: "LangGraph's docs describe checkpointers that save a thread's state as snapshots, enabling conversation continuity, human-in-the-loop pauses, going back to earlier states and recovery after failures, with in-memory, SQLite and Postgres implementations for development and production.",
        source: { label: "LangGraph docs: Persistence", url: "https://docs.langchain.com/oss/python/langgraph/persistence", kind: "docs" },
      },
    ],
    scenario: {
      title: "An expense-approval agent that waits for managers",
      context:
        "Employees submit expenses by chat. The agent checks receipts and policy, auto-approves small compliant claims, and asks a manager for anything else. Managers may respond days later, and the service restarts in the meantime.",
      architecture:
        "A graph with nodes for extract, policy check, decide, request approval (an interrupt), and file. Conditional edges route by amount and policy result. A Postgres checkpointer stores state per claim, using the claim id as the thread id, so the run resumes when the manager answers.",
      tools: ["LangGraph", "PostgresSaver checkpointer", "the expenses API", "a manager notification channel", "tracing"],
      steps: [
        "Draw the flow on paper first: steps, decisions and where a human must approve.",
        "Define the state type with every field the steps need, then implement each node as a small function.",
        "Add conditional edges for auto-approve versus manager approval, and an interrupt in the approval node.",
        "Use a database checkpointer with the claim id as thread id, and test killing the process mid-run and resuming.",
        "Add retries for flaky API nodes and inspect saved state when debugging stuck claims.",
      ],
    },
    example: {
      title: "Conditional routing, an interrupt and durable state",
      lang: "python",
      code: `from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.postgres import PostgresSaver

class Claim(TypedDict, total=False):
    amount: float
    compliant: bool
    approved: bool

def check(state: Claim) -> dict:
    return {"compliant": policy_ok(state)}                # your policy rules

def route(state: Claim) -> str:
    return "file" if state["compliant"] and state["amount"] < 100 else "ask_manager"

def ask_manager(state: Claim) -> dict:
    answer = interrupt({"amount": state["amount"], "compliant": state["compliant"]})
    return {"approved": answer == "approve"}

def file(state: Claim) -> dict:
    if state.get("approved", True):
        expenses_api.file(state)
    return {}

g = StateGraph(Claim)
g.add_node("check", check); g.add_node("ask_manager", ask_manager); g.add_node("file", file)
g.add_edge(START, "check"); g.add_conditional_edges("check", route); g.add_edge("ask_manager", "file"); g.add_edge("file", END)

with PostgresSaver.from_conn_string(DB_URL) as saver:
    app = g.compile(checkpointer=saver)
    cfg = {"configurable": {"thread_id": "claim-8812"}}
    app.invoke({"amount": 240.0}, cfg)                 # pauses at ask_manager
    app.invoke(Command(resume="approve"), cfg)         # days later, after a restart`,
      notes:
        "The routing rule is plain code, the pause is one `interrupt` call, and the Postgres checkpointer means the second `invoke` can happen in a different process days later with the same thread id. Code before the interrupt in a node runs again on resume, so keep side effects after it.",
    },
    tradeoffs: [
      { issue: "Graphs add concepts and boilerplate compared with a simple loop.", response: "Use a plain loop until you need persistence, branching, retries or human pauses, then move to a graph." },
      { issue: "Nodes re-run from the start on resume, which can repeat side effects.", response: "Keep side effects after interrupts and make external calls idempotent." },
      { issue: "In-memory checkpointers lose everything on restart.", response: "Use a database checkpointer in production and test crash-and-resume explicitly." },
    ],
    junior: "Uses LangGraph for a two-step chain and the in-memory checkpointer in production.",
    senior: "Adopts a graph when the flow needs durability and human pauses, keeps nodes small and idempotent, uses a durable checkpointer, and tests resume after failure.",
    reading: [
      { label: "LangGraph: Interrupts (human-in-the-loop)", url: "https://docs.langchain.com/oss/python/langgraph/interrupts", kind: "docs" },
      { label: "LangGraph overview", url: "https://docs.langchain.com/oss/python/langgraph/overview", kind: "docs" },
    ],
  },
  {
    moduleId: "M5.8",
    howItWorks:
      "When an agent writes and runs code (data analysis, tests, scripts), that code must not run inside your application process or on a machine with secrets. Teams run it in a sandbox: a container or micro-VM with a restricted filesystem, limited or proxied network access, CPU, memory and time limits, and no credentials. Output is captured and size-limited, files come back through a defined channel, and the sandbox is thrown away after use. The goal is that even malicious or broken code can only damage a disposable box.",
    uses: [
      {
        who: "Anthropic (Claude Code sandboxing)",
        what: "Claude Code's sandbox restricts writes to the working directory and sends network traffic through a proxy that only allows approved domains, enforced by OS-level tools (bubblewrap on Linux, seatbelt on macOS) that also cover any subprocess. Anthropic reports this cut permission prompts by a large margin while improving safety.",
        source: { label: "Anthropic: Making Claude Code more secure and autonomous", url: "https://www.anthropic.com/engineering/claude-code-sandboxing", kind: "blog" },
      },
      {
        who: "E2B",
        what: "E2B provides on-demand Linux VMs for agents to run code, with SDKs to start a sandbox, run commands and read output, templates for the environment, and pause and resume that saves the filesystem and memory.",
        source: { label: "E2B documentation", url: "https://docs.e2b.dev/", kind: "docs" },
      },
    ],
    scenario: {
      title: "A data-analysis agent that runs Python on uploaded spreadsheets",
      context:
        "Users upload CSV files and ask questions. The agent writes pandas code to answer. A user could upload a file crafted to make the agent run harmful code, and the agent itself sometimes writes infinite loops.",
      architecture:
        "Each analysis runs in a fresh sandbox (managed VM service or a locked-down container) with the uploaded file copied in, no network, no secrets, a 30-second timeout and memory cap. Stdout, stderr and generated charts are returned with size limits. The sandbox is destroyed after the session.",
      tools: ["E2B, Modal or a hardened container runtime", "resource limits", "output size limits", "audit logs"],
      steps: [
        "List what the code needs (Python, pandas, the uploaded file) and remove everything else, especially network and credentials.",
        "Start a fresh sandbox per session and copy in only the user's file.",
        "Set time, memory and output limits, and return clear errors to the agent when they are hit.",
        "Return results through a defined channel (stdout and specific output files), never by mounting host directories.",
        "Test with hostile inputs: code that tries to read environment variables, call the internet, fork-bomb or write huge outputs.",
      ],
    },
    example: {
      title: "Running agent code in a disposable sandbox",
      lang: "python",
      code: `from e2b_code_interpreter import Sandbox

MAX_OUTPUT = 10_000

def run_analysis(code: str, csv_bytes: bytes) -> dict:
    sbx = Sandbox(timeout=120)                       # fresh VM, no app secrets inside
    try:
        sbx.files.write("/home/user/data.csv", csv_bytes)
        execution = sbx.run_code(code, timeout=30)   # hard per-run limit
        out = "".join(execution.logs.stdout)[:MAX_OUTPUT]
        err = "".join(execution.logs.stderr)[:MAX_OUTPUT]
        return {"stdout": out, "stderr": err,
                "error": execution.error.name if execution.error else None,
                "charts": [r.png for r in execution.results if getattr(r, "png", None)][:3]}
    finally:
        sbx.kill()                                   # always destroy it`,
      notes:
        "The agent's code never touches your servers: it runs in a throwaway VM with only the user's file. Limits on time and output size stop runaway code from hanging the agent or flooding its context, and `finally` guarantees cleanup even when the code fails.",
    },
    tradeoffs: [
      { issue: "Sandboxes add startup latency and cost per run.", response: "Reuse a sandbox within one user's session, pre-build templates with dependencies, and destroy it at session end." },
      { issue: "Allowing network access makes data exfiltration possible.", response: "Default to no network; if needed, use an allow-list proxy limited to specific domains." },
      { issue: "Too-strict limits break legitimate analyses on large files.", response: "Set limits from real workloads, return clear limit errors so the agent can sample data, and raise limits per plan if needed." },
    ],
    junior: "Runs model-written code with `exec()` in the API server process, which has database credentials in its environment.",
    senior: "Treats generated code as untrusted, runs it in disposable sandboxes without secrets or open network, enforces limits, and tests the sandbox with hostile code.",
    reading: [
      { label: "E2B sandbox quickstart", url: "https://docs.e2b.dev/quickstart", kind: "docs" },
      { label: "Code execution with MCP (Anthropic)", url: "https://anthropic.com/engineering/code-execution-with-mcp", kind: "blog" },
    ],
  },
  {
    moduleId: "M5.9",
    howItWorks:
      "Agents fail in ways chat apps do not: loops, wrong tool arguments, partial progress, runaway cost and long silences. Production agents have budgets (steps, time, retries, money), persist state so a crash does not restart the task, make actions idempotent so retries do not double-act, verify their own work with concrete checks, and escalate to a human with context when stuck. For users, they show progress, let people pause, cancel or redirect, and summarise what was done rather than exposing raw reasoning.",
    uses: [
      {
        who: "Anthropic (Claude Agent SDK)",
        what: "Anthropic describes the agent loop as gather context, take action, verify work, repeat. For verification it recommends concrete rules such as linting, visual checks like screenshots of rendered output, and, with caution, a model as judge; for long runs it uses automatic compaction and sub-agents with isolated context.",
        source: AGENT_SDK,
      },
      {
        who: "Anthropic research system",
        what: "Anthropic found that restarting long-running agents after errors was too costly, so they checkpoint and resume, use full tracing to diagnose failures, and roll out updates gradually so in-flight agents are not broken mid-task.",
        source: RESEARCH,
      },
    ],
    scenario: {
      title: "A reliable data-migration agent",
      context:
        "An agent migrates customer records from an old CRM to a new one over several hours, fixing format issues as it goes. A crash, a duplicate write or a silent stall would all be costly.",
      architecture:
        "Work is split into batches with a durable progress record. Each write uses an idempotency key derived from the record id. After each batch the agent verifies counts and samples against the source. Budgets cap retries per batch and total cost. A progress view shows batches done, errors and estimated time, with pause and cancel buttons, and stuck batches go to a human queue.",
      tools: ["a checkpointed agent runtime", "idempotent write APIs", "verification queries", "a progress UI", "a human review queue"],
      steps: [
        "Split the job into batches and store progress durably after each one.",
        "Make every write idempotent so a retried batch cannot create duplicates.",
        "Add verification after each batch (row counts, field checks on samples) and stop the batch on mismatch.",
        "Set retry and cost budgets, and escalate a batch to a human with the error and sample records when exhausted.",
        "Build the progress view with pause, cancel and resume, and test by killing the process mid-batch.",
      ],
    },
    example: {
      title: "Budgets, idempotency, verification and resume",
      lang: "python",
      code: `def migrate(job_id: str, batches, agent, store, budget_usd: float = 25.0) -> dict:
    state = store.load(job_id) or {"done": [], "failed": [], "cost": 0.0}
    for batch in batches:
        if batch.id in state["done"] or store.is_paused(job_id):
            continue
        for attempt in range(3):
            result = agent.fix_and_write(batch, idem_key=lambda rec: f"{job_id}:{rec.id}")
            state["cost"] += result.cost_usd
            ok = verify(batch, target_count=result.written)   # counts + sampled field checks
            if ok:
                state["done"].append(batch.id); break
        else:
            state["failed"].append(batch.id)
            escalate(job_id, batch, reason=result.last_error)  # human queue with context
        store.save(job_id, state)                              # durable after every batch
        if state["cost"] > budget_usd:
            return {"status": "paused", "reason": "cost budget", **state}
    return {"status": "complete", **state}`,
      notes:
        "A restart reloads `state` and skips finished batches; idempotency keys make retried writes safe; verification catches silent errors; and both budget exhaustion and repeated failure end in an explicit, explainable state rather than a hung process.",
    },
    tradeoffs: [
      { issue: "Verification and checkpointing slow the agent down.", response: "Verify per batch with cheap checks and sample deeper ones, and checkpoint at natural boundaries." },
      { issue: "Strict budgets can stop legitimate long tasks.", response: "Set budgets from observed distributions and let users approve extensions with context." },
      { issue: "Showing raw reasoning confuses users and can leak internals.", response: "Show progress, actions taken and results in plain language, and keep detailed traces for engineers." },
    ],
    junior: "Lets the agent run in one long process with no saved progress, so a crash at hour three restarts everything and duplicates records.",
    senior: "Designs for failure from the start: budgets, durable progress, idempotent actions, concrete verification, human escalation and a user-facing progress view.",
    reading: [
      { label: "LangGraph: Interrupts (human-in-the-loop)", url: "https://docs.langchain.com/oss/python/langgraph/interrupts", kind: "docs" },
      { label: "Agents (Chip Huyen)", url: "https://huyenchip.com/2025/01/07/agents.html", kind: "blog" },
    ],
  },
  {
    moduleId: "M5.10",
    howItWorks:
      "Agent frameworks package the agent loop with tools, memory, handoffs between agents, guardrails, tracing and deployment helpers. They differ mostly in style: LangGraph is explicit graphs and state, the OpenAI Agents SDK is a few primitives (agents, handoffs, guardrails), Google's ADK adds workflow agents and Google Cloud deployment, CrewAI organises role-based crews and flows, and Agno focuses on lightweight agents. Teams pick by trying the hardest part of their use case in two candidates, and by checking provider lock-in, observability and how much the framework hides.",
    uses: [
      {
        who: "OpenAI Agents SDK",
        what: "OpenAI's Agents SDK is built on three primitives: agents with instructions and tools, handoffs that let one agent delegate to another, and guardrails that validate inputs and outputs in parallel with the run. Sessions and tracing are built in.",
        source: { label: "OpenAI Agents SDK documentation", url: "https://openai.github.io/openai-agents-python/", kind: "docs" },
      },
      {
        who: "Klarna (LangGraph)",
        what: "Klarna chose LangGraph and LangSmith for its large-scale support assistant, relying on graph-based routing and step-level tracing for debugging and evaluation, which shows how framework choice ties into observability.",
        source: KLARNA,
      },
      {
        who: "CrewAI",
        what: "CrewAI organises work into crews of agents with tools and memory, and flows that orchestrate steps with state, persistence and resumption, plus enterprise features such as triggers from email and chat tools.",
        source: { label: "CrewAI documentation", url: "https://docs.crewai.com/", kind: "docs" },
      },
    ],
    scenario: {
      title: "Choosing a framework for a customer-onboarding agent",
      context:
        "A fintech team is building an agent that guides business customers through onboarding: collecting documents, checking them, asking follow-up questions and handing off to compliance. It must pause for days, be auditable and run on their existing cloud.",
      architecture:
        "A two-week bake-off: the same slice (document check plus compliance handoff with a multi-day pause) built in two frameworks, compared on durability, tracing, testability, lock-in and how much behaviour is hidden. Business logic stays in plain functions shared by both.",
      tools: ["two candidate frameworks (for example LangGraph and the OpenAI Agents SDK)", "a shared eval set", "tracing in each", "a decision document"],
      steps: [
        "Write down must-haves: multi-day pauses, audit trail, model-provider flexibility, deployment target.",
        "Build the same thin slice in each candidate, keeping tools and business rules as shared plain functions.",
        "Run the eval set on both, and test crash and resume, tracing quality and how easy failures are to debug.",
        "Score each on the must-haves, plus team familiarity and community health.",
        "Record the decision and the reasons, and keep framework code at the edges so a later switch is feasible.",
      ],
    },
    example: {
      title: "The same agent idea in a framework: handoff plus guardrail",
      lang: "python",
      code: `from agents import Agent, GuardrailFunctionOutput, Runner, input_guardrail

compliance = Agent(
    name="Compliance reviewer",
    instructions="Review onboarding cases flagged as high risk. Ask for missing documents. Never approve on your own.",
)

@input_guardrail
async def no_card_numbers(ctx, agent, user_input):
    flagged = sum(ch.isdigit() for ch in str(user_input)) >= 13   # crude card-number check
    return GuardrailFunctionOutput(output_info={"pan_like": flagged}, tripwire_triggered=flagged)

onboarding = Agent(
    name="Onboarding assistant",
    instructions="Collect business documents, check them with the tools, and hand off high-risk cases to compliance.",
    tools=[check_registration, check_bank_letter],      # your plain-function tools
    handoffs=[compliance],
    input_guardrails=[no_card_numbers],
)

result = Runner.run_sync(onboarding, "Here is our registration certificate and bank letter.")
print(result.final_output)`,
      notes:
        "The framework supplies the loop, the handoff to a second agent and a guardrail that stops the run if input looks like a card number. The tools are ordinary functions, so the same business logic could be wired into another framework during the bake-off.",
    },
    tradeoffs: [
      { issue: "Frameworks speed up the first version but can hide prompts and control flow.", response: "Turn on tracing, read the prompts the framework sends, and keep business logic outside it." },
      { issue: "Some frameworks favour one model provider or cloud.", response: "Check provider support and deployment options against your requirements before committing." },
      { issue: "The field changes quickly and frameworks rise and fade.", response: "Choose on present needs with a small bake-off, pin versions, and keep the core portable." },
    ],
    junior: "Picks the framework from the most popular tutorial and builds everything inside its abstractions.",
    senior: "Defines must-haves, runs a small bake-off on the hardest slice, chooses with evidence, and keeps tools and rules portable across frameworks.",
    reading: [
      { label: "Agent Development Kit (Google ADK)", url: "https://adk.dev/", kind: "docs" },
      { label: "Agno: What are agents?", url: "https://docs.agno.com/agents/overview", kind: "docs" },
    ],
  },
];
