import type { AppliedModule } from "./types";

const KLARNA = { label: "LangChain: How Klarna's AI assistant redefined customer support", url: "https://www.langchain.com/blog/customers-klarna", kind: "case-study" } as const;
const SHOPIFY = { label: "Shopify Engineering: Building production-ready agentic systems", url: "https://shopify.engineering/building-production-ready-agentic-systems", kind: "case-study" } as const;
const EFFECTIVE_AGENTS = { label: "Anthropic: Building effective agents", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "blog" } as const;

export const APPLIED_L2: AppliedModule[] = [
  {
    moduleId: "M2.1",
    howItWorks:
      "An LLM API call is a stateless HTTP request: you send a list of messages with roles, and you get back content plus metadata such as stop reason and token usage. The model remembers nothing between calls, so the application owns the conversation. It stores messages in its own database, decides which ones to send next time, and keeps facts about the user (plan, preferences, past sessions) as application state that it injects when relevant. API keys live on the server only, never in a browser or mobile app.",
    uses: [
      {
        who: "Anthropic Messages API",
        what: "Anthropic's docs say plainly that the Messages API is stateless, so every request must include the full conversation you want the model to see. Each response reports input and output token counts, which is what you log for cost.",
        source: { label: "Claude docs: Using the Messages API", url: "https://platform.claude.com/docs/en/build-with-claude/working-with-messages", kind: "docs" },
      },
      {
        who: "Duolingo Max Video Call",
        what: "Duolingo's Video Call character starts from topics the learner studied recently and remembers earlier calls. Since the model API keeps no memory, that continuity has to come from the app storing past sessions and feeding the relevant parts back in.",
        source: { label: "Duolingo blog: Introducing Duolingo Max", url: "https://blog.duolingo.com/duolingo-max/", kind: "blog" },
      },
    ],
    scenario: {
      title: "A chat backend that owns its conversation state",
      context:
        "You are building the backend for a web chat. Users can close the tab and come back tomorrow, and the product wants the assistant to remember their name and plan.",
      architecture:
        "The browser calls your API, never the provider. Your API loads the conversation and user profile from Postgres, builds the message list, calls the LLM with a server-side key, saves both the user message and the reply with usage numbers, and returns the reply.",
      tools: ["an LLM provider SDK", "FastAPI", "PostgreSQL", "a secrets manager or environment variables"],
      steps: [
        "Store the provider key as a server-side secret and confirm it never appears in frontend code or logs.",
        "Create tables for conversations and messages, plus a profile row for long-lived user facts.",
        "On each request, load the last N messages and the profile, and build a system prompt that includes only the relevant facts.",
        "Call the API, then save the new user and assistant messages with model id, token usage and the response id.",
        "Print and inspect the full response object during development so you know every field you could use (stop reason, usage, ids).",
      ],
    },
    example: {
      title: "The app, not the model, keeps the history",
      lang: "python",
      code: `from anthropic import Anthropic

client = Anthropic()  # reads ANTHROPIC_API_KEY from the server environment

def reply(db, conversation_id: str, user_text: str) -> str:
    history = db.load_messages(conversation_id, limit=20)   # [{"role", "content"}]
    profile = db.load_profile(conversation_id)
    messages = history + [{"role": "user", "content": user_text}]
    r = client.messages.create(
        model="your-model-id",
        max_tokens=800,
        system=f"You are a helpful assistant. The user's name is {profile['name']}.",
        messages=messages,
    )
    text = r.content[0].text
    db.save(conversation_id, "user", user_text)
    db.save(conversation_id, "assistant", text, usage=r.usage.model_dump(),
            stop_reason=r.stop_reason, response_id=r.id)
    return text`,
      notes:
        "Without `history`, every turn starts from zero. Saving `stop_reason` shows when answers were cut off by `max_tokens`, and saving usage per message gives cost per conversation for free.",
    },
    tradeoffs: [
      { issue: "Sending the whole history every time grows cost and latency with each turn.", response: "Send a window of recent messages plus a summary of older ones, and cache the stable system prompt." },
      { issue: "Putting the API key in a frontend lets anyone spend your money.", response: "Always proxy calls through your backend, add per-user rate limits there, and rotate keys if one leaks." },
      { issue: "Storing every conversation raises privacy and retention obligations.", response: "Define retention periods, let users delete chats, and avoid logging sensitive content outside the main store." },
    ],
    junior: "Calls the provider directly from the browser with the key in JavaScript and is confused when the model forgets the previous message.",
    senior: "Owns conversation state in the backend, decides deliberately what context each call gets, keeps keys server-side, and records usage and stop reasons per message.",
    reading: [
      { label: "Claude docs: Using the Messages API", url: "https://platform.claude.com/docs/en/build-with-claude/working-with-messages", kind: "docs" },
      { label: "100 Days of AI Engineering: building with LLM APIs", url: "https://ai-engineer-roadmap-2026.vercel.app/100-days/building-with-llm-apis/", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.2",
    howItWorks:
      "Streaming sends the answer as it is generated, usually over Server-Sent Events. The total time is the same, but users see the first words within a second instead of staring at a spinner, which is why every chat product streams. In practice the backend reads the provider's event stream, forwards text deltas to the browser, accumulates the full text to save afterwards, records usage from the final event, and handles a user pressing stop or a stream that fails halfway.",
    uses: [
      {
        who: "Anthropic streaming API",
        what: "Claude's stream is a fixed sequence of events: a message start, then for each content block a start, many deltas and a stop, then message-level deltas with the stop reason and cumulative usage, then a final stop. Ping events can appear anywhere, and errors such as overload can arrive mid-stream.",
        source: { label: "Claude docs: Streaming messages", url: "https://platform.claude.com/docs/en/build-with-claude/streaming", kind: "docs" },
      },
      {
        who: "The web platform (Server-Sent Events)",
        what: "SSE is a plain-text format served as `text/event-stream`: each message is one or more `data:` lines ending with a blank line, with optional event names and ids. Browsers read it natively with `EventSource`, which is why LLM backends commonly re-stream in this format.",
        source: { label: "MDN: Using server-sent events", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events", kind: "docs" },
      },
    ],
    scenario: {
      title: "Streaming answers from a FastAPI backend to a React chat",
      context:
        "Users complain the assistant feels slow. Answers take 8 seconds and nothing shows until the end.",
      architecture:
        "The browser opens a streaming request to your FastAPI endpoint. The endpoint streams from the provider, forwards each text delta as an SSE `data:` line, and after the stream ends saves the full text and usage. A stop button aborts the request, and the backend cancels the provider stream.",
      tools: ["provider SDK streaming", "FastAPI StreamingResponse", "fetch with ReadableStream or EventSource", "time-to-first-token metrics"],
      steps: [
        "Measure time to first token and total time before the change, so you can show the improvement.",
        "Switch the provider call to streaming and forward text deltas as SSE from your endpoint.",
        "Accumulate the full text on the server and save it with the final usage once the stream ends.",
        "Handle cancel (client disconnects) and mid-stream errors: stop the provider stream, save the partial answer marked incomplete, and show a retry button.",
        "Render incrementally in the UI and only parse Markdown or code blocks fully once the message completes, to avoid flicker.",
      ],
    },
    example: {
      title: "Forwarding a provider stream as SSE",
      lang: "python",
      code: `from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from anthropic import AsyncAnthropic
import json

app, client = FastAPI(), AsyncAnthropic()

@app.post("/chat/stream")
async def chat_stream(req: Request):
    body = await req.json()

    async def events():
        parts = []
        async with client.messages.stream(model="your-model-id", max_tokens=1000,
                                          messages=body["messages"]) as stream:
            async for text in stream.text_stream:
                if await req.is_disconnected():
                    break                      # user pressed stop
                parts.append(text)
                yield f"data: {json.dumps({'delta': text})}\\n\\n"
            final = await stream.get_final_message()
        save_message("".join(parts), final.usage)   # your persistence
        yield "data: [DONE]\\n\\n"

    return StreamingResponse(events(), media_type="text/event-stream")`,
      notes:
        "Each SSE message ends with a blank line, which is the `\\n\\n`. The server keeps its own copy of the text so the saved message matches what the user saw, and it stops reading when the client disconnects so you are not billed for text nobody reads.",
    },
    tradeoffs: [
      { issue: "Some proxies and load balancers buffer responses and break streaming.", response: "Disable buffering for the streaming route (for example the `X-Accel-Buffering: no` header on nginx) and test through the real infrastructure." },
      { issue: "Errors can arrive after you already sent a 200 status and part of the answer.", response: "Send an explicit error event in the stream, mark the saved message incomplete, and let the UI offer a retry." },
      { issue: "Streaming makes structured output and validation harder.", response: "Stream only user-facing text; for JSON, either validate after completion or use partial-object streaming from a library built for it." },
    ],
    junior: "Waits for the whole response, or streams to the browser but forgets to save the final message and usage.",
    senior: "Streams end to end, measures time to first token, handles cancel and mid-stream errors, and keeps a complete server-side record of what was generated and billed.",
    reading: [
      { label: "OpenAI docs: Streaming API responses", url: "https://developers.openai.com/api/docs/guides/streaming-responses", kind: "docs" },
      { label: "LangChain: Streaming", url: "https://docs.langchain.com/oss/python/langchain/streaming/overview", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.3",
    howItWorks:
      "LangChain gives you common building blocks over many providers: chat models with one interface, prompt templates, output parsers, and a way to pipe them together. Teams use it to switch providers with little code change, to reuse integrations (vector stores, loaders, tools), and to plug into tracing with LangSmith. The experienced approach is to know what raw API calls the framework makes, so you can debug it and drop to the SDK where the abstraction gets in the way.",
    uses: [
      {
        who: "Klarna",
        what: "Klarna's support assistant, serving a very large customer base, was built on LangGraph with LangSmith used to trace agent steps, run evaluations and iterate on prompts. The case study credits routing to task-specific handlers with lower latency and cost.",
        source: KLARNA,
      },
      {
        who: "Anthropic's advice on frameworks",
        what: "Anthropic recommends starting with direct API calls because many patterns are a few lines of code, and warns that frameworks can hide the actual prompts and responses. If you use one, understand the code underneath it.",
        source: EFFECTIVE_AGENTS,
      },
    ],
    scenario: {
      title: "A provider-agnostic summarisation pipeline",
      context:
        "Your company has contracts with two LLM providers and wants to switch between them per customer without rewriting features. You also want traces of each step.",
      architecture:
        "A LangChain pipeline of prompt template, chat model and output parser. The chat model is chosen from config with `init_chat_model`. Tracing is on in staging and production.",
      tools: ["LangChain", "langchain provider packages", "LangSmith or another tracer", "pytest"],
      steps: [
        "Write the feature once with the raw SDK to see the exact request and response shape.",
        "Rebuild it as template, model and parser composed with the pipe operator, and confirm the output matches.",
        "Load the model from config so you can switch providers per customer, and run the same tests on both.",
        "Turn on tracing and check that each step's input and output appear where your team will look for them.",
        "Keep a note of where you would drop back to the raw SDK, for example provider-only features like prompt caching settings.",
      ],
    },
    example: {
      title: "Template, model and parser as one runnable",
      lang: "python",
      code: `from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def build_summariser(provider_model: str):
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Summarise for a busy manager in {n} bullet points."),
        ("human", "{text}"),
    ])
    model = init_chat_model(provider_model, temperature=0)
    return prompt | model | StrOutputParser()

# Same chain, two providers, chosen from config per customer
for m in ["anthropic:your-model-id", "openai:your-model-id"]:
    chain = build_summariser(m)
    print(chain.invoke({"n": 3, "text": open("incident.txt").read()}))`,
      notes:
        "The chain is just a function from a dict to a string; the provider is a config value. Under the hood each run is still one Messages or Chat Completions call, which you can see in the trace.",
    },
    tradeoffs: [
      { issue: "Abstractions hide the real prompt and make bugs harder to find.", response: "Turn on tracing from day one and read the raw request in traces when something looks off." },
      { issue: "Framework updates can break code more often than provider SDKs.", response: "Pin versions, read changelogs before upgrading, and keep tests that run the chains end to end." },
      { issue: "Provider-specific features may lag in the common interface.", response: "Use the framework for the common path and call the SDK directly for features it does not expose well." },
    ],
    junior: "Copies a LangChain tutorial, cannot explain what request it sends, and is stuck when it fails.",
    senior: "Uses the framework where it saves time, can always point to the underlying API call in a trace, and drops to the SDK when the abstraction costs more than it gives.",
    reading: [
      { label: "LangChain quickstart", url: "https://docs.langchain.com/oss/python/langchain/quickstart", kind: "docs" },
      { label: "Runtimes, frameworks, and harnesses (LangChain docs)", url: "https://docs.langchain.com/oss/python/concepts/products", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.4",
    howItWorks:
      "Whenever model output feeds code (a database row, an API call, a UI form), teams ask for structured output against a schema instead of free text. The schema is usually a Pydantic model. Providers can enforce it during decoding, so the JSON always parses and matches the shape. Shape is not truth, though, so the app still validates business rules (dates in the future, totals that add up, ids that exist) and, if validation fails, asks the model to repair the output with the error message attached.",
    uses: [
      {
        who: "OpenAI Structured Outputs",
        what: "With strict mode on, OpenAI constrains decoding to the supplied JSON Schema and reported complete adherence on its complex-schema test, versus well under half for an older model with prompting alone. The model can still refuse, which arrives in a separate refusal field.",
        source: { label: "OpenAI: Introducing Structured Outputs in the API", url: "https://openai.com/index/introducing-structured-outputs-in-the-api/", kind: "blog" },
      },
      {
        who: "Instructor",
        what: "Instructor is a widely used open-source library that wraps many providers, takes a Pydantic model as the response type, validates the result, and automatically re-asks the model with the validation error when it fails.",
        source: { label: "Instructor documentation", url: "https://python.useinstructor.com/", kind: "docs" },
      },
    ],
    scenario: {
      title: "Extracting invoice data into an accounting system",
      context:
        "Finance receives hundreds of supplier invoices as text and PDF each week and wants vendor, dates, line items and totals entered into the accounting system automatically.",
      architecture:
        "Text is extracted from each invoice, the LLM fills a Pydantic `Invoice` schema with provider-enforced structured output, business-rule validators run, failures get one repair attempt with the error, and anything still failing goes to a human review queue.",
      tools: ["Pydantic", "provider structured outputs or Instructor", "a review queue", "an eval set of labelled invoices"],
      steps: [
        "Design the schema with types, enums and optional fields that match real invoices, including what to do when a field is missing.",
        "Turn on provider structured output so parsing never fails, and write validators for business rules such as line items summing to the total.",
        "On validation failure, send the error back to the model once for repair; if it fails again, queue for a human.",
        "Build an eval set of 50 labelled invoices and score field by field, not just whether the JSON is valid.",
        "Track how many invoices need repair or human review each week, and use the human corrections to grow the eval set.",
      ],
    },
    example: {
      title: "Schema, business rules and one repair attempt",
      lang: "python",
      code: `from datetime import date
from pydantic import BaseModel, ValidationError, model_validator

class Line(BaseModel):
    description: str
    amount: float

class Invoice(BaseModel):
    vendor: str
    invoice_date: date
    lines: list[Line]
    total: float

    @model_validator(mode="after")
    def totals_match(self):
        if abs(sum(l.amount for l in self.lines) - self.total) > 0.01:
            raise ValueError(f"lines sum to {sum(l.amount for l in self.lines)}, total is {self.total}")
        return self

def extract(text: str, llm) -> Invoice | None:
    raw = llm.structured(text, schema=Invoice.model_json_schema())   # provider-enforced shape
    try:
        return Invoice.model_validate_json(raw)
    except ValidationError as e:
        raw = llm.structured(f"{text}\\n\\nYour last answer failed: {e}. Fix it.", schema=Invoice.model_json_schema())
        try:
            return Invoice.model_validate_json(raw)
        except ValidationError:
            return None   # send to the human review queue`,
      notes:
        "Constrained decoding guarantees the JSON shape; the validator checks meaning. The repair message includes the exact error so the model knows what to fix, and there is a hard stop after one retry so costs stay bounded.",
    },
    tradeoffs: [
      { issue: "Valid JSON can still contain wrong values.", response: "Validate business rules, cross-check against known data (vendor list, order ids), and measure field-level accuracy on an eval set." },
      { issue: "Very strict schemas can force the model to invent values for missing fields.", response: "Make genuinely optional fields optional or nullable, and add an explicit 'not found' option for enums." },
      { issue: "Repair loops can repeat and cost money.", response: "Limit to one or two repairs, then escalate to a human or return a clear failure." },
    ],
    junior: "Asks for JSON in the prompt, parses it with `json.loads`, and crashes when the model adds a sentence before the brace.",
    senior: "Uses provider-enforced schemas for shape, validators for meaning, bounded repair for recoverable errors, and a human path plus metrics for the rest.",
    reading: [
      { label: "Claude docs: Structured outputs", url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs", kind: "docs" },
      { label: "OpenAI docs: Structured model outputs", url: "https://developers.openai.com/api/docs/guides/structured-outputs", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.5",
    howItWorks:
      "With tool calling, the model chooses an action and arguments, but your code executes it. The loop is: send the request with tool definitions, receive a tool-use block with an id and arguments, validate and run the tool, send the result back tagged with the same id, and repeat until the model answers in text. Production loops cap the number of rounds, run independent calls in parallel, return errors as tool results the model can react to, and never let the model trigger a consequential action without checks.",
    uses: [
      {
        who: "Shopify Sidekick",
        what: "Shopify's merchant assistant began as a tool-calling system and grew into an agent that analyses customer segments, fills product forms and navigates admin pages. They found reliability dropped as the number of tools grew past a few dozen, with overlapping tools causing confusion.",
        source: SHOPIFY,
      },
      {
        who: "Klarna",
        what: "Klarna's assistant handles payments, refunds and payment escalations, which means the model must call real back-end operations. The case study describes routing requests to task-specific handlers rather than one model with every capability.",
        source: KLARNA,
      },
    ],
    scenario: {
      title: "An order-status assistant with real lookups",
      context:
        "Customers ask where their order is and whether they can change the address. Answers must come from the order system, not the model's guess.",
      architecture:
        "Two tools: `get_order(order_id)` (read-only) and `request_address_change(order_id, new_address)` (consequential, needs confirmation). The backend runs the tool loop, validates arguments, checks that the order belongs to the logged-in user, and caps the loop at five rounds.",
      tools: ["provider tool-calling API", "JSON Schema tool definitions", "the order service API", "trace logging"],
      steps: [
        "Define each tool with a clear name, a description of when to use it, and a strict input schema.",
        "Write the loop: call the model, run any requested tools, append results with matching ids, and repeat until a text answer or the round cap.",
        "Validate arguments and permissions in your code before executing, and return errors as tool results instead of raising.",
        "Require an explicit user confirmation step before running the consequential tool.",
        "Test with tricky inputs: wrong order ids, other customers' orders, and messages asking for two orders at once to exercise parallel calls.",
      ],
    },
    example: {
      title: "The tool loop with a round cap",
      lang: "python",
      code: `import json
from anthropic import Anthropic

client = Anthropic()
TOOLS = [{
    "name": "get_order",
    "description": "Look up an order's status and delivery date by order id. Use for any 'where is my order' question.",
    "input_schema": {"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]},
}]

def run_tool(name: str, args: dict, user_id: str) -> str:
    if name == "get_order":
        order = orders.get(args["order_id"])            # your service
        if not order or order.user_id != user_id:
            return json.dumps({"error": "No order with that id on this account."})
        return json.dumps({"status": order.status, "eta": order.eta})
    return json.dumps({"error": f"Unknown tool {name}"})

def chat(messages: list, user_id: str, max_rounds: int = 5) -> str:
    for _ in range(max_rounds):
        r = client.messages.create(model="your-model-id", max_tokens=800, tools=TOOLS, messages=messages)
        messages.append({"role": "assistant", "content": r.content})
        if r.stop_reason != "tool_use":
            return "".join(b.text for b in r.content if b.type == "text")
        results = [{"type": "tool_result", "tool_use_id": b.id, "content": run_tool(b.name, b.input, user_id)}
                   for b in r.content if b.type == "tool_use"]
        messages.append({"role": "user", "content": results})
    return "Sorry, I could not finish that. A human agent will follow up."`,
      notes:
        "The model never touches the order database; your code does, after checking the order belongs to this user. Errors go back as tool results so the model can apologise or ask for the right id, and the round cap stops runaway loops.",
    },
    tradeoffs: [
      { issue: "The model can call a tool with wrong, missing or malicious arguments.", response: "Validate every argument against the schema and your permission rules before executing, exactly as for user input." },
      { issue: "Each tool round adds a full model call of latency and cost.", response: "Allow parallel tool calls for independent lookups, keep results small, and cap rounds." },
      { issue: "Consequential actions (refunds, emails, deletes) can be triggered by a misunderstanding or a prompt injection.", response: "Separate read-only and write tools, require confirmation for writes, and log every action with the conversation that caused it." },
    ],
    junior: "Lets the model call any function with whatever arguments it produces, and has no limit on how many times the loop can run.",
    senior: "Treats tool calls as untrusted requests, enforces permissions in code, caps and traces the loop, and puts a human or confirmation step in front of anything irreversible.",
    reading: [
      { label: "Claude docs: How to implement tool use", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use", kind: "docs" },
      { label: "OpenAI docs: Function calling", url: "https://developers.openai.com/api/docs/guides/function-calling", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.6",
    howItWorks:
      "Tool definitions are part of the prompt, so their names, descriptions and parameters decide how well the model picks and uses them. Good teams design fewer, higher-level tools around real tasks instead of wrapping every API endpoint, give each a distinct name and a description written for a new colleague, return concise human-readable results, and write error messages that tell the model how to recover. They then evaluate tools with realistic multi-step tasks and read the transcripts to see where the model got confused.",
    uses: [
      {
        who: "Anthropic",
        what: "Anthropic recommends building a few well-scoped tools for high-value workflows, namespacing related tools by service, returning meaningful names rather than raw ids, paginating and truncating large results with helpful messages, and testing tools with realistic evaluation tasks.",
        source: { label: "Anthropic: Writing effective tools for agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", kind: "blog" },
      },
      {
        who: "Shopify Sidekick",
        what: "Shopify observed that around 20 tools stayed manageable, 20 to 50 made boundaries blurry, and beyond 50 the same task could be done several ways, making behaviour hard to predict. They also moved situational guidance into tool results instead of a bloated system prompt.",
        source: SHOPIFY,
      },
    ],
    scenario: {
      title: "Redesigning a calendar agent's tools",
      context:
        "A scheduling assistant has 14 tools that mirror the calendar API one-to-one (`list_users`, `list_events`, `get_free_busy`, `create_event` and so on). It often picks the wrong one or calls five tools to book one meeting.",
      architecture:
        "Replace the thin wrappers with three task-shaped tools: `find_meeting_slots(attendee_emails, duration_minutes, within_days)`, `book_meeting(...)` and `cancel_meeting(event_id)`. Each returns a short summary with names and times, and errors explain what to change.",
      tools: ["tool definitions in JSON Schema", "an eval set of scheduling requests", "transcript review", "token usage per run"],
      steps: [
        "Collect 30 real scheduling requests and record which tools the current agent calls and where it fails.",
        "Group the low-level calls into tools that match what users actually ask for.",
        "Write descriptions that say when to use and when not to use each tool, with unambiguous parameter names like `attendee_emails`.",
        "Make results compact and readable, and make errors actionable, for example suggesting the nearest free slot.",
        "Re-run the eval set and compare success rate, tool calls per task and tokens per task against the old design.",
      ],
    },
    example: {
      title: "A task-shaped tool definition with a helpful error",
      lang: "json",
      code: `{
  "name": "calendar_find_meeting_slots",
  "description": "Find times when ALL listed people are free. Use this before booking. Do not use it to list someone's existing meetings. Returns at most 5 slots in the organiser's time zone.",
  "input_schema": {
    "type": "object",
    "properties": {
      "attendee_emails": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
      "duration_minutes": { "type": "integer", "enum": [15, 30, 45, 60, 90] },
      "within_days": { "type": "integer", "minimum": 1, "maximum": 14 }
    },
    "required": ["attendee_emails", "duration_minutes"]
  }
}

// Example error returned as the tool result:
// "No 60-minute slot in the next 3 days for all 4 people. Nearest options:
//  a 30-minute slot tomorrow 15:00, or 60 minutes on Monday 10:00.
//  Ask the user which they prefer, or retry with within_days=7."`,
      notes:
        "The name has a service prefix, the description says when not to use the tool, enums limit the arguments to sensible values, and the error tells the model exactly what to do next. That is all prompt engineering, just placed in the tool.",
    },
    tradeoffs: [
      { issue: "Higher-level tools are less flexible than raw API wrappers.", response: "Cover the common tasks with task-shaped tools and keep one carefully described general tool for rare cases." },
      { issue: "Many tools inflate every prompt and confuse selection.", response: "Load only the tools relevant to the current context or user role, and merge overlapping ones." },
      { issue: "Large tool results flood the context window.", response: "Return summaries by default, paginate, and offer a detail option the model can ask for." },
    ],
    junior: "Exposes every API endpoint as a tool with names like `get` and `update` and descriptions copied from the API reference.",
    senior: "Designs a small set of task-shaped, clearly named tools, writes descriptions and errors for the model as the reader, and proves the design with an eval of real tasks.",
    reading: [
      { label: "Writing effective tools for AI agents (Anthropic)", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", kind: "blog" },
      { label: "Claude docs: How to implement tool use", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.7",
    howItWorks:
      "Most production LLM features are workflows, not single prompts: fixed code paths where several model calls each do one clear job. Common shapes are a chain (extract, then draft, then check), a router (classify the request and send it to a specialised prompt or model) and fan-out (run independent pieces in parallel and merge). Splitting a task makes each step easier to test, cheaper (small steps can use small models) and easier to debug. Teams choose a workflow over an agent whenever the steps are known in advance.",
    uses: [
      {
        who: "Anthropic",
        what: "Anthropic distinguishes workflows, where code defines the path, from agents, where the model decides. It describes prompt chaining, routing, parallelisation, orchestrator-workers and evaluator-optimiser patterns, and advises using the simplest one that works.",
        source: EFFECTIVE_AGENTS,
      },
      {
        who: "Klarna",
        what: "Klarna routes each customer request to the right task handler with a tailored prompt, which the case study credits with lower latency, better reliability and lower cost than a single general prompt.",
        source: KLARNA,
      },
    ],
    scenario: {
      title: "Turning one giant prompt into a support-reply workflow",
      context:
        "A single long prompt classifies the ticket, looks up policy, drafts a reply and checks tone. It is slow, expensive and hard to fix because every change affects everything.",
      architecture:
        "Step 1, a small model classifies the ticket into billing, shipping or technical. Step 2, a route-specific prompt drafts the reply with retrieved policy for that category. Step 3, a cheap check verifies the reply cites policy and makes no forbidden promises; failures loop back once or go to a human.",
      tools: ["an LLM API with small and large models", "retrieval over help articles", "per-step eval sets", "tracing"],
      steps: [
        "Write down the stages the giant prompt is doing implicitly, and collect examples of where each one fails.",
        "Build the classifier first and evaluate it alone on labelled tickets; it is the cheapest step to get right.",
        "Write one drafting prompt per route, each with only the policy it needs.",
        "Add the checker step with simple rules plus a small model, and decide what happens on failure.",
        "Trace each run and compare end-to-end quality, latency and cost with the old single prompt.",
      ],
    },
    example: {
      title: "Route, draft, check",
      lang: "python",
      code: `ROUTES = {"billing": BILLING_PROMPT, "shipping": SHIPPING_PROMPT, "technical": TECH_PROMPT}

def handle(ticket: str, llm_small, llm_large, retrieve) -> dict:
    route = llm_small(f"Classify as billing, shipping or technical. One word.\\n{ticket}").strip().lower()
    if route not in ROUTES:
        return {"status": "human", "reason": f"unknown route {route!r}"}

    policy = retrieve(ticket, category=route, k=3)
    draft = llm_large(ROUTES[route].format(policy=policy, ticket=ticket))

    problems = []
    if "refund guaranteed" in draft.lower():
        problems.append("promises a refund")
    if "[policy:" not in draft:
        problems.append("no policy citation")
    if problems:
        return {"status": "human", "draft": draft, "problems": problems}
    return {"status": "sent", "route": route, "draft": draft}`,
      notes:
        "Each step has one job and can be tested on its own. The classifier uses a small model, only the drafting step uses the large one, and an unknown route or a failed check goes to a human instead of the customer.",
    },
    tradeoffs: [
      { issue: "More steps mean more calls and more places to fail.", response: "Use small models for simple steps, run independent steps in parallel, and trace every step so failures are easy to locate." },
      { issue: "Errors in an early step (a wrong route) carry through everything after it.", response: "Evaluate the early steps hardest, and add a fallback route for low-confidence classifications." },
      { issue: "Teams reach for autonomous agents when a fixed workflow would do.", response: "Use a workflow whenever the steps are known; reserve agents for open-ended tasks where the path cannot be planned." },
    ],
    junior: "Keeps adding instructions to one huge prompt until nobody can predict what a change will do.",
    senior: "Breaks the task into testable steps with clear contracts, uses the cheapest model per step, and chooses a workflow over an agent unless the task truly needs one.",
    reading: [
      { label: "Patterns for building LLM-based systems & products (Eugene Yan)", url: "https://eugeneyan.com/writing/llm-patterns/", kind: "blog" },
      { label: "Building effective agents (Anthropic)", url: "https://www.anthropic.com/engineering/building-effective-agents", kind: "blog" },
    ],
  },
  {
    moduleId: "M2.8",
    howItWorks:
      "LLM calls spend most of their time waiting on the network, so running many at once is the main way to process work faster. Teams use asyncio with a semaphore to cap how many requests are in flight, which keeps them under rate limits. For work that does not need an answer right away (nightly classification, backfills, eval runs), they use provider batch APIs, which accept large sets of requests, finish within a day, and cost about half as much.",
    uses: [
      {
        who: "Anthropic Message Batches API",
        what: "Anthropic's batch API takes up to 100,000 requests per batch, bills them at half the normal price, usually finishes within an hour and always within 24 hours, and returns results in any order matched by a `custom_id` you set on each request.",
        source: { label: "Claude docs: Batch processing", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing", kind: "docs" },
      },
      {
        who: "Anthropic rate limits",
        what: "Anthropic enforces requests, input tokens and output tokens per minute with a token-bucket algorithm, so bursts can hit limits even when the per-minute average is fine. Response headers report what remains, which clients can use to slow down before getting 429s.",
        source: { label: "Claude docs: Rate limits", url: "https://platform.claude.com/docs/en/api/rate-limits", kind: "docs" },
      },
    ],
    scenario: {
      title: "Classifying 200,000 support tickets for a quarterly report",
      context:
        "Analytics wants every ticket from last quarter tagged by topic and sentiment by next week. A simple loop would take days and might trip rate limits.",
      architecture:
        "Development and spot checks use async calls with bounded concurrency. The full run goes through the batch API in chunks, with each request's `custom_id` set to the ticket id, and results are written to the warehouse as they are downloaded.",
      tools: ["asyncio", "provider async SDK", "provider batch API", "a results table keyed by ticket id"],
      steps: [
        "Write the prompt and test it on 200 tickets with async calls and a semaphore of 10, checking quality before spending on the full run.",
        "Estimate cost with and without batch pricing, and confirm the deadline allows up to a day of batch latency.",
        "Split the tickets into batches under the size limit, using the ticket id as `custom_id`.",
        "Submit, poll until each batch ends, stream results, and write them to the table, logging errored and expired ids.",
        "Re-submit only the failed ids, then run a quick sample check on the final tags.",
      ],
    },
    example: {
      title: "Bounded concurrency for interactive-speed bulk work",
      lang: "python",
      code: `import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic()
limit = asyncio.Semaphore(10)          # at most 10 requests in flight

async def tag(ticket: dict) -> dict:
    async with limit:
        r = await client.messages.create(
            model="your-small-model-id", max_tokens=20,
            messages=[{"role": "user", "content": f"Topic in one word:\\n{ticket['text']}"}],
        )
    return {"id": ticket["id"], "topic": r.content[0].text.strip()}

async def tag_all(tickets: list[dict]) -> list[dict]:
    results = await asyncio.gather(*(tag(t) for t in tickets), return_exceptions=True)
    ok = [r for r in results if isinstance(r, dict)]
    failed = [t["id"] for t, r in zip(tickets, results) if isinstance(r, Exception)]
    print(f"{len(ok)} done, {len(failed)} failed; retry later: {failed[:5]}")
    return ok`,
      notes:
        "The semaphore is what keeps you under rate limits; without it `gather` would fire every request at once. `return_exceptions=True` lets one failure not cancel the whole run, and failed ids are kept for a retry pass. For the full 200,000, the same prompt goes through the batch API instead.",
    },
    tradeoffs: [
      { issue: "Unbounded concurrency triggers 429s and can get keys throttled.", response: "Cap in-flight requests with a semaphore, read rate-limit headers, and ramp up gradually." },
      { issue: "Batch APIs are cheaper but give no answer for up to a day.", response: "Use batch for offline work only, and real-time calls for anything a user is waiting on." },
      { issue: "Partial failures in large runs are easy to lose.", response: "Key every request by a stable id, record status per id, and re-run only the failures." },
    ],
    junior: "Loops over 200,000 items one call at a time, or fires them all at once with no limit and gets throttled.",
    senior: "Chooses between bounded async and batch based on deadline and cost, tracks every item by id, and plans retries for partial failures.",
    reading: [
      { label: "Python docs: Coroutines and tasks", url: "https://docs.python.org/3/library/asyncio-task.html", kind: "docs" },
      { label: "OpenAI docs: Batch API", url: "https://developers.openai.com/api/docs/guides/batch", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.9",
    howItWorks:
      "LLM APIs fail in normal operation: rate limits, overloads, timeouts and the occasional server error. Reliable apps set a timeout on every call, retry only transient errors with exponential backoff and jitter, honour `retry-after`, and retry at one layer only so retries do not multiply. When a provider or model stays unhealthy, they fall back to another model or provider, or degrade gracefully (a cached answer, a simpler feature, a clear message) instead of hanging.",
    uses: [
      {
        who: "AWS",
        what: "An AWS Builders' Library article explains that retries help with transient failures but add load during overload, that retrying at every layer multiplies traffic dramatically, and that capped exponential backoff with jitter and a retry budget are the standard defences.",
        source: { label: "AWS Builders' Library: Timeouts, retries and backoff with jitter", url: "https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter", kind: "blog" },
      },
      {
        who: "LiteLLM",
        what: "LiteLLM's proxy supports ordered model fallbacks for general errors, separate fallbacks for context-window and content-policy errors, a retry count per model, request timeouts, and cooldowns that take a failing model out of rotation for a while.",
        source: { label: "LiteLLM docs: Fallbacks (provider failover)", url: "https://docs.litellm.ai/docs/proxy/reliability", kind: "docs" },
      },
      {
        who: "Anthropic API errors",
        what: "Anthropic's error docs separate request problems (400, 401, 403) from rate limits (429) and overload (529), note that the official SDKs already retry some failures automatically, and say a monthly spend-cap 429 will keep failing however often you retry.",
        source: { label: "Claude docs: Errors", url: "https://platform.claude.com/docs/en/api/errors", kind: "docs" },
      },
    ],
    scenario: {
      title: "Keeping a chat product up during a provider incident",
      context:
        "Last month the main provider was overloaded for 40 minutes, the app hung, and retries from every layer made it worse. Leadership wants the app to stay usable next time.",
      architecture:
        "One reliability layer in the LLM client: per-call timeouts, a retry policy for 429, 5xx and 529 with jittered backoff, and a fallback chain of primary model, backup model on a second provider, then a graceful message. SDK auto-retries are turned off so retries happen in one place, and a circuit breaker skips a provider that keeps failing.",
      tools: ["provider SDKs", "LiteLLM or a small custom wrapper", "metrics on error codes and fallbacks", "a fault-injection test"],
      steps: [
        "List every error type you have seen and classify each as retry, fall back, or fail fast.",
        "Move all retry logic into one client layer and disable retries elsewhere so they cannot multiply.",
        "Add the fallback chain and run each feature's eval on the backup model, so you know its quality before you need it.",
        "Add metrics for retries, fallbacks and final failures per provider, with an alert on fallback rate.",
        "Inject failures in staging (force 529s and timeouts) and check that users get an answer or a clear message within your latency target.",
      ],
    },
    example: {
      title: "One reliability layer: retry, then fall back",
      lang: "python",
      code: `import random, time

RETRY = {429, 500, 502, 503, 504, 529}

class LLMError(Exception):
    def __init__(self, status: int, retry_after: float | None = None):
        self.status, self.retry_after = status, retry_after

def call_with_policy(providers, request, attempts=3, deadline_s=20.0):
    start = time.monotonic()
    for provider in providers:                       # e.g. [primary, backup]
        for attempt in range(attempts):
            try:
                return provider.complete(request, timeout=8.0)
            except LLMError as e:
                if e.status not in RETRY:
                    raise                            # 400/401/403: our bug, do not retry
                wait = e.retry_after or min(2 ** attempt, 8) * random.uniform(0.5, 1.0)
                if time.monotonic() - start + wait > deadline_s:
                    break                            # out of time: try the next provider
                time.sleep(wait)
    return {"text": "The assistant is busy right now. Please try again in a minute.", "degraded": True}`,
      notes:
        "Non-retryable errors surface immediately, retries respect `retry-after` and a total deadline, and when the primary keeps failing the request moves to the backup. The last resort is an honest message rather than a spinner.",
    },
    tradeoffs: [
      { issue: "Retries during an outage add load and slow recovery.", response: "Use a small retry budget with jitter, retry at one layer, and add a circuit breaker that stops calling a failing provider for a while." },
      { issue: "A backup model may give lower-quality or differently formatted answers.", response: "Run the same evals on the backup, adapt prompts per model if needed, and mark degraded responses in logs." },
      { issue: "Long hidden retries make the app feel frozen.", response: "Set a total deadline per user request and show progress or a clear message when it is exceeded." },
    ],
    junior: "Wraps every call in an unlimited retry loop and lets the SDK, the service and the gateway all retry the same request.",
    senior: "Defines one retry and fallback policy with deadlines, tests it with injected failures, monitors fallback rates, and knows how the backup model performs before an incident.",
    reading: [
      { label: "Building a generative AI platform (Chip Huyen)", url: "https://huyenchip.com/2024/07/25/genai-platform.html", kind: "blog" },
      { label: "LiteLLM: Fallbacks (provider failover)", url: "https://docs.litellm.ai/docs/proxy/reliability", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.10",
    howItWorks:
      "Teams record every LLM interaction as a trace: the exact prompt and model settings, the response, token usage, cost, latency, and the nested steps (retrieval, tool calls, sub-calls) that led to it, tagged with user, session and feature. That is what lets you answer why one answer was bad, which step is slow, and which feature is burning money. Traces also become the raw material for evals: bad traces turn into test cases.",
    uses: [
      {
        who: "Klarna",
        what: "Klarna used LangSmith traces to see agent behaviour step by step, find issues, run LLM evaluations and iterate on prompts for its support assistant.",
        source: KLARNA,
      },
      {
        who: "Rechat (Lucy assistant)",
        what: "Rechat's team logged full traces of conversations and reviewed them by hand and with a model critic, which became the second level of their evaluation system. Removing friction from reading traces was one of the main lessons.",
        source: { label: "Hamel Husain: Your AI product needs evals", url: "https://hamel.dev/blog/posts/evals/", kind: "case-study" },
      },
    ],
    scenario: {
      title: "Finding why a RAG chatbot got slow and expensive",
      context:
        "Costs doubled this month and users say answers are slower, but logs only show 'LLM call ok'. Nobody knows which step or feature changed.",
      architecture:
        "Every request creates a trace with spans for retrieval, prompt build, each model call and each tool call. Spans record model, tokens in and out, cached tokens, latency and computed cost, plus user, session and feature tags. Dashboards group cost and p95 latency by feature and step.",
      tools: ["Langfuse, LangSmith or an OpenTelemetry tracer", "a cost table per model", "dashboards", "trace search"],
      steps: [
        "Instrument the request path so each step is a span inside one trace, with consistent tags.",
        "Record token usage from the API response and compute cost from a per-model price table.",
        "Build two dashboards: cost by feature and step, and p95 latency by step.",
        "Find the outlier (for example, a retrieval change sending 20 chunks instead of 5) by sorting traces by cost.",
        "Fix it, confirm on the dashboard, and save a few bad traces as eval cases so the regression is caught next time.",
      ],
    },
    example: {
      title: "A minimal trace with spans and cost",
      lang: "python",
      code: `import time, uuid, json
from contextlib import contextmanager

PRICES = {"your-model-id": (3.00, 15.00)}  # USD per million tokens (in, out)

@contextmanager
def span(trace: dict, name: str, **attrs):
    s = {"name": name, "start": time.time(), **attrs}
    try:
        yield s
    finally:
        s["ms"] = round((time.time() - s["start"]) * 1000)
        trace["spans"].append(s)

def answer(question: str, user_id: str) -> str:
    trace = {"id": str(uuid.uuid4()), "user": user_id, "feature": "rag_chat", "spans": []}
    with span(trace, "retrieve", k=5) as s:
        docs = retrieve(question, k=5); s["n_docs"] = len(docs)
    with span(trace, "generate", model="your-model-id") as s:
        r = llm(question, docs)
        p_in, p_out = PRICES[s["model"]]
        s.update(tokens_in=r.usage.input_tokens, tokens_out=r.usage.output_tokens,
                 cost_usd=(r.usage.input_tokens * p_in + r.usage.output_tokens * p_out) / 1e6)
    print(json.dumps(trace))      # ship to your tracing backend instead
    return r.text`,
      notes:
        "Real tracers do this for you, but the shape is the same: one trace id per request, a span per step, and usage and cost on model spans. Tags like `feature` and `user` are what make cost dashboards possible.",
    },
    tradeoffs: [
      { issue: "Full prompts and responses in traces can contain personal data.", response: "Redact or hash sensitive fields, restrict access to the trace store, and set retention limits." },
      { issue: "Tracing every request at scale costs storage and money.", response: "Keep metrics for all requests but sample full traces, while always keeping errors and flagged conversations." },
      { issue: "Dashboards show symptoms but not quality.", response: "Pair traces with human review and evals so you can see whether answers are right, not just fast and cheap." },
    ],
    junior: "Logs 'request ok' with no prompt, tokens or timing, and estimates cost from the monthly invoice.",
    senior: "Instruments every step with traces and cost from day one, builds dashboards per feature, and turns bad traces into eval cases.",
    reading: [
      { label: "Langfuse: LLM observability & tracing", url: "https://langfuse.com/docs/observability/overview", kind: "docs" },
      { label: "MLflow: token usage and cost tracking", url: "https://mlflow.org/docs/latest/genai/tracing/token-usage-cost/", kind: "docs" },
    ],
  },
  {
    moduleId: "M2.11",
    howItWorks:
      "Different frameworks solve different problems. LlamaIndex is strongest at data: loading, indexing and querying documents for retrieval. LangGraph models an application as a graph of steps with shared state, which suits long-running, branching or human-in-the-loop flows. DSPy treats prompts as programs to be optimised against a metric. Teams pick based on the shape of their application and their team's skills, often mix one framework with plain SDK calls, and avoid adopting several heavy frameworks at once.",
    uses: [
      {
        who: "Klarna (LangGraph)",
        what: "Klarna built its multi-agent support assistant on LangGraph, using graph routing to send each request to the right handler, and LangSmith for tracing and evaluation.",
        source: KLARNA,
      },
      {
        who: "DSPy",
        what: "DSPy asks you to define each step by its inputs and outputs and compose steps into a program; it then generates and tunes the prompts against your metric, which can let a smaller model match a larger hand-prompted one.",
        source: { label: "DSPy: Program, don't prompt", url: "https://dspy.ai/current/getting-started/program-dont-prompt/", kind: "docs" },
      },
    ],
    scenario: {
      title: "Choosing a framework for a document assistant with approvals",
      context:
        "A legal-ops team wants an assistant that answers questions from contracts and drafts amendments, but every amendment needs a lawyer's approval before it is sent.",
      architecture:
        "LlamaIndex handles ingestion and retrieval over contracts. LangGraph runs the flow (retrieve, draft, wait for approval, send) with checkpointed state so it can pause for hours. Plain SDK calls are used where neither framework adds value.",
      tools: ["LlamaIndex", "LangGraph", "a comparison spike for each option", "tracing"],
      steps: [
        "Write down the application's shape: data-heavy retrieval, branching flow, long pauses for human approval.",
        "Build a one-day spike of the hardest part (pause and resume for approval) in each candidate framework.",
        "Compare the spikes on code clarity, debugging (can you see each step's state), and how much hidden behaviour there is.",
        "Pick the smallest combination that covers the needs, and document why so the choice can be revisited.",
        "Keep framework code at the edges, with business logic in plain functions, so switching later is possible.",
      ],
    },
    example: {
      title: "A graph that pauses for human approval",
      lang: "python",
      code: `from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt

class State(TypedDict):
    question: str
    draft: str
    approved: bool

def draft_amendment(state: State) -> dict:
    return {"draft": write_draft(state["question"])}        # your LLM call

def lawyer_review(state: State) -> dict:
    decision = interrupt({"draft": state["draft"]})         # pauses here until resumed
    return {"approved": decision == "approve"}

def send(state: State) -> dict:
    if state["approved"]:
        send_to_counterparty(state["draft"])
    return {}

g = StateGraph(State)
g.add_node("draft", draft_amendment); g.add_node("review", lawyer_review); g.add_node("send", send)
g.add_edge(START, "draft"); g.add_edge("draft", "review"); g.add_edge("review", "send"); g.add_edge("send", END)
app = g.compile(checkpointer=MemorySaver())   # use a database checkpointer in production`,
      notes:
        "The graph makes the steps and the pause explicit, and the checkpointer saves state so the run can resume hours later when the lawyer responds. The LLM call itself is ordinary code inside a node.",
    },
    tradeoffs: [
      { issue: "Each framework adds concepts, dependencies and upgrade work.", response: "Adopt one where it clearly solves a problem you have, and keep business logic in plain functions." },
      { issue: "Frameworks move fast and examples go stale quickly.", response: "Pin versions, prefer official docs over old blog posts, and keep end-to-end tests." },
      { issue: "Prompt optimisers like DSPy need a good metric and data to optimise against.", response: "Build the eval set and metric first; without them, optimisation has nothing to aim at." },
    ],
    junior: "Picks the framework with the most stars and rewrites the app whenever a new one trends.",
    senior: "Matches the framework to the application's shape, proves it with a small spike on the hardest part, and keeps the core logic portable.",
    reading: [
      { label: "LlamaIndex: High-level concepts", url: "https://developers.llamaindex.ai/python/framework/getting_started/concepts/", kind: "docs" },
      { label: "LangGraph overview", url: "https://docs.langchain.com/oss/python/langgraph/overview", kind: "docs" },
    ],
  },
];
