import type { AppliedModule } from "./types";

const CONTEXT_ENG = { label: "Anthropic: Effective context engineering for AI agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", kind: "blog" } as const;
const MANUS = { label: "Manus: Context engineering for AI agents, lessons from building Manus", url: "https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus", kind: "case-study" } as const;
const HARNESS = { label: "Anthropic: Effective harnesses for long-running agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents", kind: "case-study" } as const;
const HARNESS_DESIGN = { label: "Anthropic: Harness design for long-running apps", url: "https://anthropic.com/engineering/harness-design-long-running-apps", kind: "case-study" } as const;
const CODE_EXEC_MCP = { label: "Anthropic: Code execution with MCP", url: "https://anthropic.com/engineering/code-execution-with-mcp", kind: "blog" } as const;
const WRITING_TOOLS = { label: "Anthropic: Writing effective tools for AI agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", kind: "blog" } as const;
const CC_BEST = { label: "Claude Code docs: Best practices", url: "https://code.claude.com/docs/en/best-practices", kind: "docs" } as const;
const CONTEXT_WINDOWS = { label: "Claude docs: Context windows", url: "https://platform.claude.com/docs/en/build-with-claude/context-windows", kind: "docs" } as const;
const LOST_MIDDLE = { label: "Liu et al.: Lost in the Middle, how language models use long contexts", url: "https://arxiv.org/abs/2307.03172", kind: "paper" } as const;
const RESEARCH = { label: "Anthropic: How we built our multi-agent research system", url: "https://www.anthropic.com/engineering/multi-agent-research-system", kind: "blog" } as const;
const PROMPT_CACHING = { label: "Claude docs: Prompt caching", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", kind: "docs" } as const;
const LANGGRAPH_PERSIST = { label: "LangGraph docs: Persistence", url: "https://docs.langchain.com/oss/python/langgraph/persistence", kind: "docs" } as const;

export const APPLIED_L6: AppliedModule[] = [
  {
    moduleId: "M6.1",
    howItWorks:
      "Every call to a model sends the whole context again: system prompt, tool definitions, retrieved documents, conversation history and tool results. That space is limited, it costs money on every turn, and quality drops as it fills, because the model has to spread its attention across more tokens. Teams therefore treat the context window like memory in a small device: they measure what is in it, budget each part, and remove anything that does not help the next decision. The question is never \"does it fit?\" but \"is this the smallest set of tokens that gets the right answer?\"",
    uses: [
      {
        who: "Manus",
        what: "Manus reports that its agent reads about 100 tokens for every token it writes, so input dominates both cost and latency. That is why they track the cache hit rate on that input as their single most important production metric.",
        source: MANUS,
      },
      {
        who: "Claude Code",
        what: "Claude Code's own guidance is built around one constraint: the context window fills quickly during debugging or exploration, and performance degrades as it fills, so users are told to clear it between tasks and push exploration into sub-agents.",
        source: CC_BEST,
      },
    ],
    scenario: {
      title: "Putting a support agent on a context budget",
      context:
        "A support agent's answers got worse and its bill doubled over three months. Nobody changed the model; the prompt simply grew as people added policies, examples, tools and longer histories.",
      architecture:
        "A context assembler builds every request from named blocks (system, policies, tools, retrieved docs, history, tool results). Each block has a token budget, and every request logs the token count per block so the team can see what is actually in the window.",
      tools: ["a tokenizer or the API's token counting endpoint", "structured logging per block", "a dashboard of tokens per block over time", "an eval set to check quality after cuts"],
      steps: [
        "Log the token count of each block on every request for a week and chart the distribution.",
        "Find the biggest blocks and ask what each contributes; usually old tool results and unused tool definitions dominate.",
        "Set a budget per block and trim history and tool results to fit, keeping the newest and most relevant.",
        "Run the eval set before and after each cut to check quality did not drop.",
        "Alert when any block exceeds its budget so the prompt cannot silently grow again.",
      ],
    },
    example: {
      title: "Measure and budget each block of the context",
      lang: "python",
      code: `BUDGET = {"system": 1500, "tools": 2500, "docs": 6000, "history": 4000, "tool_results": 3000}

def assemble(blocks: dict[str, list[str]], count_tokens) -> tuple[str, dict]:
    used, parts = {}, []
    for name, limit in BUDGET.items():
        kept, total = [], 0
        for item in reversed(blocks.get(name, [])):   # newest first
            n = count_tokens(item)
            if total + n > limit:
                break
            kept.append(item)
            total += n
        used[name] = total
        parts.extend(reversed(kept))
    return "\\n\\n".join(parts), used           # log 'used' with every request`,
      notes:
        "The point is not the exact numbers but that every block has a budget and the usage is logged. Once you can see where tokens go, most of the waste is obvious.",
    },
    tradeoffs: [
      { issue: "Cutting context too hard removes information the model needed.", response: "Change one budget at a time and check it against an eval set rather than trimming by intuition." },
      { issue: "Bigger windows tempt teams to stop managing context at all.", response: "Treat the window size as a ceiling, not a target, and track quality as context grows." },
      { issue: "Token counts differ between models and tokenizers.", response: "Count with the provider's own tokenizer or token counting API and leave a safety margin." },
    ],
    junior: "Adds every policy, example and tool to the prompt because the window is large, and only notices when cost or quality drops.",
    senior: "Logs tokens per block, sets budgets, and asks of each block whether the next decision actually needs it.",
    reading: [CONTEXT_ENG, CONTEXT_WINDOWS, LOST_MIDDLE],
  },
  {
    moduleId: "M6.2",
    howItWorks:
      "Context selection decides which pieces of information go into a request; assembly decides their order and format. Good systems mix two strategies: a small amount of stable context loaded up front (role, rules, project conventions) and everything else fetched just in time by the agent through search and file tools. Order matters too: models attend best to the start and the end of the context, so instructions and the most relevant evidence go there, and long documents are wrapped in clear tags so the model can tell them apart.",
    uses: [
      {
        who: "Claude Code",
        what: "Anthropic describes Claude Code as a hybrid: project notes in CLAUDE.md are loaded at the start, while code is found on demand with glob and grep, and large files are inspected with head and tail rather than loaded whole.",
        source: CONTEXT_ENG,
      },
      {
        who: "Lost in the Middle (research)",
        what: "Researchers found that models answered multi-document questions best when the relevant document was at the beginning or end of the context, and noticeably worse when it sat in the middle, even for models built for long inputs.",
        source: LOST_MIDDLE,
      },
    ],
    scenario: {
      title: "A coding assistant that finds its own context",
      context:
        "An internal coding assistant pasted the 30 most similar files into every prompt. It was slow, expensive, and often edited the wrong file because the right one was buried.",
      architecture:
        "A short, stable preamble (repo conventions, build and test commands) is always loaded. The agent gets search, list and read tools that return paths and small excerpts, and pulls full files only when it decides to edit them. The final prompt puts instructions first and the files being edited last.",
      tools: ["a repository search tool (grep or code search)", "a file read tool with line ranges", "a conventions file kept by the team", "tracing to see what was loaded"],
      steps: [
        "Write a short conventions file with only what the agent cannot infer from the code.",
        "Replace the bulk file paste with search and read tools that return paths and short excerpts.",
        "Order the final context: instructions, conventions, then the specific files being changed.",
        "Trace 50 tasks and check which loaded files were actually used in the answer.",
        "Compare task success, tokens and latency with the old bulk-paste approach.",
      ],
    },
    example: {
      title: "Assemble context in a deliberate order",
      lang: "python",
      code: `def build_prompt(task: str, conventions: str, evidence: list[dict]) -> str:
    # evidence: [{"path": ..., "text": ..., "score": ...}] from search tools
    ranked = sorted(evidence, key=lambda e: e["score"], reverse=True)[:5]
    docs = "\\n".join(
        f'<document path="{e["path"]}">\\n{e["text"]}\\n</document>' for e in ranked
    )
    return (
        f"<conventions>\\n{conventions}\\n</conventions>\\n"
        f"<documents>\\n{docs}\\n</documents>\\n"
        f"<task>\\n{task}\\n</task>"            # the ask goes last, next to the answer
    )`,
      notes:
        "Tags make each source distinct and citable, the top few items beat many weak ones, and the task sits at the end where the model's attention is strongest.",
    },
    tradeoffs: [
      { issue: "Just-in-time retrieval adds tool calls and latency.", response: "Preload the small, stable context every task needs and fetch only the rest on demand." },
      { issue: "An agent can search badly and miss the right file.", response: "Give tools clear descriptions and examples, and trace which files were loaded to spot misses." },
      { issue: "Too many retrieved items dilute attention.", response: "Rank and cap the evidence, and measure whether adding more items actually improves answers." },
    ],
    junior: "Dumps every similar document into the prompt in whatever order the search returned them.",
    senior: "Splits context into always-loaded and fetched-on-demand, caps the evidence, and orders it so the task and key facts sit where the model reads best.",
    reading: [CONTEXT_ENG, LOST_MIDDLE],
  },
  {
    moduleId: "M6.3",
    howItWorks:
      "Long tasks eventually fill the window. Compaction summarises older history into a short state description and continues in a fresh context with that summary. The lightest form simply clears old tool results that have already been used. A good compaction keeps decisions, open problems, file and task state, and drops repeated tool output and chatter. Because a bad summary silently loses information, teams test compaction prompts the same way they test any prompt: by checking what the agent can still do after it.",
    uses: [
      {
        who: "Claude Code",
        what: "Anthropic says Claude Code compacts by summarising the history when it nears the limit, keeping architectural decisions, unresolved bugs and implementation details, then continuing with that summary plus the five most recently used files.",
        source: CONTEXT_ENG,
      },
      {
        who: "Claude API",
        what: "Anthropic's docs describe server-side compaction for long conversations and a lighter option, tool result clearing, that removes old tool results in agent workflows. They note that caching saves cost but does not free context space.",
        source: CONTEXT_WINDOWS,
      },
    ],
    scenario: {
      title: "Compaction for a data-analysis agent",
      context:
        "An analysis agent runs for 80+ tool calls over large query results. Around call 50 it hits the window limit and either fails or forgets which tables it already checked.",
      architecture:
        "After each tool call the agent checks its token usage. Above 60 percent, old tool results are replaced with one-line stubs. Above 80 percent, a compaction prompt writes a structured summary (goal, findings, tables checked, open questions, next step) and the agent restarts with the system prompt, that summary and the last few turns.",
      tools: ["the provider's token counting", "a compaction prompt with a fixed output schema", "tracing", "a long-task eval set"],
      steps: [
        "Collect ten long tasks that currently fail on context limits and keep them as an eval set.",
        "Add tool-result clearing first and measure how far it extends the tasks.",
        "Write a compaction prompt with a fixed schema of what must survive and test it on saved transcripts.",
        "Check after compaction that the agent can still answer questions about earlier findings.",
        "Ship with thresholds as config and log every compaction event with before and after sizes.",
      ],
    },
    example: {
      title: "Clear old tool results, then compact",
      lang: "python",
      code: `COMPACT_PROMPT = """Summarise this work session for a fresh agent. Keep:
- goal, decisions made and why
- findings with numbers
- what was already checked (so it is not repeated)
- open questions and the next step
Drop raw tool output and small talk."""

def manage(messages: list[dict], used: int, limit: int, llm) -> list[dict]:
    if used > 0.6 * limit:                       # light: stub old tool results
        for m in messages[:-6]:
            if m["role"] == "tool":
                m["content"] = "[result cleared; see summary or re-run tool]"
    if used > 0.8 * limit:                       # heavy: summarise and restart
        summary = llm(COMPACT_PROMPT, messages)
        return [messages[0], {"role": "user", "content": summary}] + messages[-4:]
    return messages`,
      notes:
        "Clearing tool results is cheap and safe because the agent can re-run the tool. Full compaction is lossy, so the schema spells out what must survive and the last few turns are kept verbatim.",
    },
    tradeoffs: [
      { issue: "Summaries lose details the agent later needs.", response: "Use a fixed schema of what must survive, keep recent turns verbatim, and let the agent re-fetch data rather than remember it." },
      { issue: "Compaction itself costs a model call and adds latency.", response: "Trigger it on thresholds rather than every turn, and try cheap tool-result clearing first." },
      { issue: "Repeated compactions can drift from the original goal.", response: "Always carry the original goal and constraints forward unchanged, outside the summary." },
    ],
    junior: "Lets the agent crash at the limit, or truncates the oldest messages and loses the original task.",
    senior: "Clears stale tool output first, compacts with a tested schema, keeps the goal fixed, and checks what the agent can still do afterwards.",
    reading: [CONTEXT_ENG, HARNESS, LANGGRAPH_PERSIST],
  },
  {
    moduleId: "M6.4",
    howItWorks:
      "Instead of holding everything in the context, agents write state to places outside it: a progress file, a to-do list, a feature checklist, a database row, or git commits. On each new turn or session they read back only what they need. This makes work survive context resets and crashes, lets a different agent pick up the task, and keeps the window for the current step. Short-term state (this task) and long-term memory (facts about the user or project across tasks) are usually stored separately, with different rules for what gets written and when it expires.",
    uses: [
      {
        who: "Anthropic long-running coding harness",
        what: "Anthropic's harness has a first agent create a setup script, a progress file and a JSON list of features all marked failing. Each later session reads the progress file and git log, picks one feature, finishes it and commits, so no session needs the full history in its context.",
        source: HARNESS,
      },
      {
        who: "Manus",
        what: "Manus treats the file system as unlimited, persistent context: the agent writes large observations to files and keeps only paths in the window, and it rewrites a todo.md during long tasks to keep the goal in recent attention.",
        source: MANUS,
      },
    ],
    scenario: {
      title: "A migration agent that survives restarts",
      context:
        "A team wants an agent to migrate 200 API endpoints to a new framework over several hours. Runs crash, hit context limits, or get restarted, and the agent repeats work or skips endpoints.",
      architecture:
        "A setup step writes a JSON checklist of endpoints with status and a progress log. Each session reads the checklist and the last log entries, migrates one endpoint, runs its tests, marks it done, commits, and appends a log line. The context only ever holds one endpoint's work.",
      tools: ["a JSON checklist file", "git", "the test suite", "a progress log", "a checkpointer such as LangGraph persistence for agent state"],
      steps: [
        "Write the setup step that generates the checklist from the codebase and marks every item pending.",
        "Write the session start routine: read the checklist, the log tail and the git log; pick the next pending item.",
        "Require tests to pass before an item can be marked done, and commit after each item.",
        "Kill the run mid-task on purpose and check the next session resumes without repeating or skipping work.",
        "Report progress from the checklist, not from the agent's own claims.",
      ],
    },
    example: {
      title: "A session start routine that reads state from disk",
      lang: "python",
      code: `import json, subprocess
from pathlib import Path

def start_session(root: Path) -> dict:
    items = json.loads((root / "checklist.json").read_text())
    todo = [i for i in items if i["status"] != "done"]
    log_tail = (root / "progress.log").read_text().splitlines()[-10:]
    commits = subprocess.run(["git", "log", "--oneline", "-5"], cwd=root,
                             capture_output=True, text=True).stdout
    return {
        "next_item": todo[0] if todo else None,
        "remaining": len(todo),
        "recent_progress": log_tail,
        "recent_commits": commits,
    }`,
      notes:
        "The agent's context starts from a few hundred tokens of state instead of the whole history. The checklist, not the model's memory, is the source of truth for what is finished.",
    },
    tradeoffs: [
      { issue: "The agent may mark items done that are not really done.", response: "Only allow status changes after an automated check passes, and let the harness, not the model, write the final status." },
      { issue: "Long-term memory can store wrong or stale facts that then mislead every future task.", response: "Store facts with dates and sources, let users see and delete them, and expire or re-check old entries." },
      { issue: "State files can get out of sync with the real world.", response: "Re-derive state from the source (tests, git, database) at session start when possible." },
    ],
    junior: "Keeps all progress in the conversation and hopes the run never restarts.",
    senior: "Puts task state in files or a database the harness controls, verifies status with checks, and keeps long-term memory small, dated and reviewable.",
    reading: [HARNESS, LANGGRAPH_PERSIST, CONTEXT_ENG],
  },
  {
    moduleId: "M6.5",
    howItWorks:
      "Long-context models can take whole books or codebases, but using all that space well is a separate skill. Recall drops as context grows (\"context rot\"), facts in the middle are used less, and every token costs money and latency on every turn. Practical strategies are: retrieve instead of pasting when you can, put key material at the start or end, ask the model to quote relevant passages before answering, split a big job across sub-agents that each read part and return a short summary, and test with your real long inputs rather than trusting the advertised window size.",
    uses: [
      {
        who: "Anthropic research system",
        what: "Anthropic's research agent splits a question across sub-agents that each search in their own fresh context and return condensed findings to a lead agent, rather than putting every source into one huge window.",
        source: RESEARCH,
      },
      {
        who: "Claude API",
        what: "Anthropic's docs note that current models accept up to a million tokens but that accuracy and recall degrade as token count grows, so curating what goes in matters as much as how much fits.",
        source: CONTEXT_WINDOWS,
      },
    ],
    scenario: {
      title: "Answering questions over 400-page contracts",
      context:
        "A legal team wants to ask questions over long supply contracts. Pasting the whole contract works for some questions but misses clauses buried in the middle and costs a lot per question.",
      architecture:
        "The contract is split by section with section headers kept. For each question, a retrieval step picks candidate sections; the prompt asks the model to first quote the exact clauses it relies on, then answer. For whole-document questions (\"list all termination rights\"), a map step reads each section in parallel and a reduce step merges the findings.",
      tools: ["a long-context model", "section-aware chunking", "a retriever", "a map-reduce job runner", "a test set of questions with known clause answers"],
      steps: [
        "Build 40 questions with lawyer-verified answers and clause references, including clauses deep in the document.",
        "Test full-document prompting and record accuracy by clause position.",
        "Add the quote-then-answer instruction and retest.",
        "Add retrieval for targeted questions and map-reduce for whole-document ones; compare cost and accuracy.",
        "Pick per question type, and show quoted clauses to the lawyer with every answer.",
      ],
    },
    example: {
      title: "Quote first, then answer",
      lang: "text",
      code: `<contract>
... full or retrieved sections, each wrapped as <section id="12.3"> ... </section> ...
</contract>

Question: Can the buyer terminate if the supplier misses two deliveries in a quarter?

Instructions:
1. Find the clauses relevant to the question. Copy them word for word inside
   <quotes> tags, with their section ids.
2. If no clause covers the question, say so and stop.
3. Then answer inside <answer> tags, using only the quoted clauses,
   and cite the section ids you relied on.`,
      notes:
        "Asking for quotes first makes the model find the evidence before reasoning, which helps with long inputs, and the quotes give the lawyer something to check quickly.",
    },
    tradeoffs: [
      { issue: "Full-context prompts are simple but expensive on every question.", response: "Use retrieval for targeted questions, keep full context for whole-document tasks, and cache the shared document prefix." },
      { issue: "Map-reduce can lose links between sections that refer to each other.", response: "Keep definitions and cross-referenced sections together and include the definitions section in every map call." },
      { issue: "Advertised window sizes overstate useful recall.", response: "Measure accuracy by position and length on your own documents before choosing an approach." },
    ],
    junior: "Pastes the whole document because it fits, and trusts the answer.",
    senior: "Measures recall on real long inputs, uses retrieval or map-reduce where it wins, and makes the model show the passages it used.",
    reading: [LOST_MIDDLE, CONTEXT_WINDOWS],
  },
  {
    moduleId: "M6.6",
    howItWorks:
      "Tools take context in two ways: their definitions are loaded on every call, and their results land in the history. Large tool sets confuse the model and burn tokens, and verbose results crowd out everything else. Teams manage this by keeping tool sets small and clearly named, returning concise results with pagination and filtering, offering a short or detailed response format, truncating with a hint on how to narrow the query, and, for very large tool sets, letting the agent discover tools or write code that calls them so intermediate data never enters the context.",
    uses: [
      {
        who: "Anthropic (MCP code execution)",
        what: "Anthropic describes exposing MCP tools as code files that the agent imports and calls from a sandbox. Loading only the tools needed and filtering data in code cut one example workflow from about 150,000 tokens to about 2,000.",
        source: CODE_EXEC_MCP,
      },
      {
        who: "Claude Code",
        what: "Anthropic's tool-writing guide says Claude Code caps tool responses at 25,000 tokens by default, and shows a Slack tool where a concise response format used about a third of the tokens of the detailed one.",
        source: WRITING_TOOLS,
      },
    ],
    scenario: {
      title: "Taming a CRM agent with 60 tools",
      context:
        "A sales-ops agent was connected to CRM, email, calendar and billing servers, about 60 tools in total. It often picked the wrong tool, and one customer search could return 40,000 tokens of JSON.",
      architecture:
        "Tools are namespaced by service and resource, the agent sees only the tool groups relevant to the request type, search tools return ten concise rows with a cursor, and every tool accepts a response_format of concise or detailed. Errors explain how to fix the call.",
      tools: ["an MCP server or tool registry", "namespaced tool names", "pagination and filtering in each tool", "an eval set of realistic multi-step tasks", "tracing of tool calls and token use"],
      steps: [
        "Trace 100 real tasks and count tokens spent on tool definitions versus tool results.",
        "Rename tools with service and resource prefixes and merge near-duplicates.",
        "Add pagination, filtering and a concise response format to the three tools with the biggest outputs.",
        "Load tool groups based on the request type instead of all 60 at once.",
        "Re-run the eval set and compare accuracy, tool errors, tool calls and tokens.",
      ],
    },
    example: {
      title: "A tool that keeps its output small",
      lang: "python",
      code: `def crm_search_contacts(query: str, limit: int = 10, cursor: str | None = None,
                        response_format: str = "concise") -> dict:
    """Search CRM contacts by name, email or company. Returns at most 'limit' rows.
    Use response_format='detailed' only when you need contact ids for a follow-up call."""
    rows, next_cursor = crm.search(query, limit=min(limit, 25), cursor=cursor)
    if response_format == "concise":
        rows = [{"name": r.name, "company": r.company, "email": r.email} for r in rows]
    else:
        rows = [r.to_dict() for r in rows]
    result = {"results": rows, "next_cursor": next_cursor}
    if next_cursor:
        result["hint"] = "More results exist. Narrow the query or pass next_cursor."
    return result`,
      notes:
        "The name says which service and resource it touches, the default output is small, and truncation tells the agent how to get more instead of silently dropping data.",
    },
    tradeoffs: [
      { issue: "Concise results can omit ids the agent needs for the next call.", response: "Offer a detailed format and say in the description when to use it." },
      { issue: "Dynamic tool loading can hide the tool the agent actually needs.", response: "Route by request type with a fallback that lists all tool groups, and watch traces for missing-tool failures." },
      { issue: "Code execution moves work into a sandbox you must secure and monitor.", response: "Run it in an isolated sandbox with resource limits and log what code was run." },
    ],
    junior: "Connects every available server and returns raw API responses from every tool.",
    senior: "Keeps tool sets small and namespaced, designs results for the model to read, and measures token use per tool.",
    reading: [WRITING_TOOLS, CODE_EXEC_MCP],
  },
  {
    moduleId: "M6.7",
    howItWorks:
      "Prompt caching lets the provider reuse the processed prefix of a prompt when the next request starts with exactly the same tokens. Cached reads are much cheaper and faster, which matters for agents that resend a long system prompt, tool list and history on every step. Caching only works if the prefix is stable, so the design rules are: put stable content first, never insert changing data (like a timestamp) near the top, append to history instead of editing it, and keep tool definitions fixed during a session. Cached tokens still occupy the context window, so caching saves money and time, not space.",
    uses: [
      {
        who: "Manus",
        what: "Manus says the cache hit rate is its most important production metric. With cached input about ten times cheaper than uncached on the model they cite, they keep the prompt prefix stable, make context append-only, and avoid timestamps at the top of the prompt.",
        source: MANUS,
      },
      {
        who: "Manus (tool masking)",
        what: "To avoid breaking the cache, Manus does not add or remove tools mid-task. It keeps the tool list fixed and instead restricts which tools the model may choose at each step.",
        source: MANUS,
      },
    ],
    scenario: {
      title: "Cutting an agent's input bill with caching",
      context:
        "A document-review agent sends a 12,000-token system prompt and tool list on every step, about 20 steps per task. Input tokens are most of the bill.",
      architecture:
        "The request is ordered system prompt, tool definitions, the shared document, then conversation. A cache breakpoint is placed after the stable prefix. The date moved from the top of the system prompt to the latest user turn. The team logs cache read and write tokens per request.",
      tools: ["the provider's prompt caching", "usage fields in the API response", "a cost dashboard", "a regression eval"],
      steps: [
        "Log cache read, cache write and uncached input tokens for every request.",
        "Find everything in the prefix that changes between requests (timestamps, user ids, reordered tools) and move it later.",
        "Add a cache breakpoint after the stable prefix and confirm reads in the usage fields.",
        "Make history append-only so earlier turns never change.",
        "Compare cost per task and latency before and after, and alert if the cache hit rate drops.",
      ],
    },
    example: {
      title: "A cache-friendly request layout",
      lang: "python",
      code: `request = {
    "model": MODEL,
    "system": [
        {"type": "text", "text": SYSTEM_PROMPT},             # never changes
        {"type": "text", "text": REVIEW_GUIDELINES,
         "cache_control": {"type": "ephemeral"}},           # cache up to here
    ],
    "tools": TOOLS,                                          # fixed order, fixed set
    "messages": history + [                                 # append-only
        {"role": "user", "content": f"Today is {today}. {user_turn}"},  # changing data goes last
    ],
}
resp = client.messages.create(**request)
log(resp.usage.cache_read_input_tokens, resp.usage.cache_creation_input_tokens,
    resp.usage.input_tokens)`,
      notes:
        "The stable content is first and marked for caching, and the date that used to sit in the system prompt now goes in the latest turn so it does not break the cached prefix. Logging the usage fields shows whether caching works.",
    },
    tradeoffs: [
      { issue: "A tiny change near the top of the prompt silently disables caching.", response: "Keep changing data at the end and alert on drops in the cache hit rate." },
      { issue: "Caches expire after a short time, so infrequent requests rarely hit.", response: "Check the provider's cache lifetime and choose a longer one when the traffic pattern needs it, after checking its cost." },
      { issue: "Fixed tool sets limit flexibility.", response: "Keep the full list stable and restrict choices per step instead of editing the list." },
    ],
    junior: "Puts the current time and user name at the top of the system prompt and wonders why caching never hits.",
    senior: "Designs the prompt layout around a stable prefix, logs cache hits, and treats cache hit rate as a production metric.",
    reading: [PROMPT_CACHING, MANUS],
  },
  {
    moduleId: "M6.8",
    howItWorks:
      "A harness is everything around the model that turns it into a working agent: the loop, tools, context management, state files, checks, permissions, limits and how sessions start and end. For long tasks the harness often matters more than the prompt. Common patterns are an initial setup step, one unit of work per session, automated verification after each unit, a separate evaluator that is harder to fool than the worker grading itself, and clear handoff files between sessions. Each part encodes an assumption about what the model cannot do alone, so harnesses are re-tested when the model changes.",
    uses: [
      {
        who: "Anthropic (long-running coding)",
        what: "Anthropic found that agents tried to do too much at once or declared the job done early. Their harness fixed this with a setup agent, one feature per session, a startup routine that reads progress files, and browser-based testing before a feature counts as passing.",
        source: HARNESS,
      },
      {
        who: "Anthropic (planner, generator, evaluator)",
        what: "In a later experiment, a planner wrote a spec, a generator built the app and a separate evaluator tested it in a browser. A solo run took 20 minutes and produced a broken core feature, while the full harness took about six hours and cost over 20 times more but produced a working app.",
        source: HARNESS_DESIGN,
      },
    ],
    scenario: {
      title: "A harness for overnight bug-fix runs",
      context:
        "A team wants an agent to work through a backlog of small bugs overnight and open pull requests. Early tries produced pull requests that looked done but failed tests or touched unrelated files.",
      architecture:
        "A queue feeds one issue per session. Each session runs in a fresh sandboxed checkout, reads the issue and a short conventions file, must write a failing test first, then fix it. The harness runs the full test suite and a separate reviewer agent on the diff; only if both pass does it open a pull request. Every step is logged.",
      tools: ["an agent SDK or coding agent in headless mode", "sandboxed checkouts", "the test suite and linters", "a reviewer agent with its own prompt", "an issue queue and logs"],
      steps: [
        "Pick 20 closed issues with known fixes as a replay set.",
        "Build the one-issue-per-session loop with a fixed time and cost limit.",
        "Add the gates: failing test first, full test suite, linter, then the reviewer agent.",
        "Replay the 20 issues and measure how many produce correct, mergeable pull requests.",
        "Review failures, change one harness component at a time, and re-run the replay set after each change.",
      ],
    },
    example: {
      title: "The skeleton of a gated work session",
      lang: "python",
      code: `def run_session(issue, workspace, agent, reviewer, limits) -> dict:
    ws = workspace.fresh_checkout()
    result = agent.run(
        task=f"Fix issue #{issue.id}. Write a failing test first, then fix it.\\n{issue.body}",
        cwd=ws.path, max_turns=limits.turns, max_cost=limits.cost,
    )
    if result.status != "done":
        return {"issue": issue.id, "outcome": "gave_up", "log": result.log}
    tests = ws.run("make test")
    if tests.exit_code != 0:
        return {"issue": issue.id, "outcome": "tests_failed", "log": tests.output}
    review = reviewer.check(diff=ws.diff(), issue=issue.body)
    if not review.approved:
        return {"issue": issue.id, "outcome": "review_failed", "notes": review.notes}
    return {"issue": issue.id, "outcome": "pr_opened", "pr": ws.open_pr()}`,
      notes:
        "The model never decides on its own that the work is finished: the harness runs the tests and a separate reviewer, and every outcome is a logged state that can be counted.",
    },
    tradeoffs: [
      { issue: "Elaborate harnesses cost far more time and tokens than a single run.", response: "Use them for tasks the model cannot do reliably alone, and measure whether each part earns its cost." },
      { issue: "An evaluator agent can be talked into approving bad work.", response: "Tune the evaluator's prompt against human judgments and back it with deterministic checks like tests." },
      { issue: "Harness parts become unnecessary as models improve.", response: "Re-run the replay set on each new model and remove parts that no longer change the outcome." },
    ],
    junior: "Gives the agent a big task and a long prompt and trusts its own report that it finished.",
    senior: "Designs the loop, state, gates and evaluator around the model's known weaknesses, measures each part, and simplifies when a new model makes parts redundant.",
    reading: [HARNESS, HARNESS_DESIGN, CC_BEST],
  },
];
