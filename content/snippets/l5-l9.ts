import type { SnippetSrc } from "./types";

export const SNIPPETS_L5_L9: SnippetSrc[] = [
  {
    topicId: "m5-2-stopping-conditions-and-loop-protection",
    title: "An agent loop that cannot run forever",
    intro: "Three stops: the model finished, a step limit was hit, or it repeated the same action. Without them a confused agent loops until your budget is gone.",
    code: String.raw`def agent(actions, max_steps=6):
    seen = set()
    for step, action in enumerate(actions, 1):
        if step > max_steps:
            return f"stopped: step limit ({max_steps})"
        if action == "FINISH":
            return f"done in {step} steps"
        if action in seen:
            return f"stopped: repeated action {action!r}"
        seen.add(action)
    return "stopped: ran out of actions"

print(agent(["search A", "read doc", "FINISH"]))
print(agent(["search A", "search A", "search A"]))
print(agent([f"try {i}" for i in range(20)]))`,
    expect: "stopped: repeated action 'search A'",
  },
  {
    topicId: "m5-5-write-retrieve-update-forget",
    title: "A tiny long-term memory",
    intro: "Memory needs four operations: write a fact, retrieve only the relevant ones, update when it changes, and forget when it should go.",
    code: String.raw`memory = {}

def remember(key, value):  memory[key] = value
def forget(key):           memory.pop(key, None)
def recall(query):
    words = set(query.lower().split())
    return {k: v for k, v in memory.items() if words & set(k.split("_"))}

remember("favourite_language", "python")
remember("home_city", "pune")
remember("diet", "vegetarian")
print("recall 'language':", recall("which language"))

remember("home_city", "mumbai")        # update
forget("diet")                         # forget
print("all now:", memory)`,
    expect: "recall 'language': {'favourite_language': 'python'}",
  },
  {
    topicId: "m5-9-idempotent-operations",
    title: "Make a retry safe with an idempotency key",
    intro: "If the agent retries after a timeout, a second charge would be a disaster. The key makes the second call a harmless no-op.",
    code: String.raw`charges = []
done = {}

def charge(key, amount):
    if key in done:
        return done[key] + " (replayed, no new charge)"
    charges.append(amount)
    done[key] = f"charged {amount}"
    return done[key]

print(charge("order-17", 500))
print(charge("order-17", 500))   # retry after a timeout
print(charge("order-18", 120))
print("total charges made:", len(charges))`,
    expect: "total charges made: 2",
  },
  {
    topicId: "m6-1-context-as-a-budget",
    title: "Fit the context to a token budget",
    intro: "Keep the most recent messages that fit and drop the oldest. Never drop the system prompt.",
    code: String.raw`def tokens(text):
    return len(text.split())

def fit(system, history, budget):
    kept, used = [], tokens(system)
    for msg in reversed(history):
        if used + tokens(msg) > budget:
            break
        kept.append(msg)
        used += tokens(msg)
    return [system] + list(reversed(kept)), used

history = [f"message {i} " + "word " * 10 for i in range(1, 9)]
window, used = fit("You are a helpful assistant.", history, budget=50)
print("kept", len(window) - 1, "of", len(history), "messages, using", used, "tokens")
print("oldest kept:", window[1][:10])`,
    expect: "kept 3 of 8 messages",
  },
  {
    topicId: "m6-3-compacting-large-tool-outputs",
    title: "Compact a big tool result",
    intro: "Keep the head, the tail and a count of what was dropped. The model usually needs the shape, not every row.",
    code: String.raw`def compact(lines, head=2, tail=2):
    if len(lines) <= head + tail:
        return "\n".join(lines)
    dropped = len(lines) - head - tail
    return "\n".join(lines[:head] + [f"... {dropped} lines omitted ..."] + lines[-tail:])

rows = [f"row {i}: value={i * 7 % 13}" for i in range(1, 501)]
out = compact(rows)
print(out)
print("characters:", sum(map(len, rows)), "->", len(out))`,
    expect: "... 496 lines omitted ...",
  },
  {
    topicId: "m7-1-deterministic-vs-probabilistic-testing",
    title: "Test an unpredictable function by its properties",
    intro: "You cannot assert an exact output from a model, but you can assert what must always hold: format, range, required fields.",
    code: String.raw`import json, random

def fake_model(seed):
    rng = random.Random(seed)
    label = rng.choice(["positive", "negative", "neutral"])
    return json.dumps({"label": label, "confidence": round(rng.random(), 2)})

failures = 0
for seed in range(200):
    out = json.loads(fake_model(seed))
    ok = out["label"] in {"positive", "negative", "neutral"} and 0 <= out["confidence"] <= 1
    failures += not ok
print("runs: 200, property failures:", failures)`,
    expect: "runs: 200, property failures: 0",
  },
  {
    topicId: "m7-8-retrieval-metrics",
    title: "Recall@k and MRR",
    intro: "Recall@k asks whether the right document appears in the top k. MRR rewards putting it first.",
    code: String.raw`cases = [
    {"relevant": "d1", "results": ["d1", "d4", "d9"]},
    {"relevant": "d2", "results": ["d7", "d2", "d5"]},
    {"relevant": "d3", "results": ["d8", "d6", "d4"]},
]

def recall_at(k):
    return sum(c["relevant"] in c["results"][:k] for c in cases) / len(cases)

def mrr():
    total = 0.0
    for c in cases:
        if c["relevant"] in c["results"]:
            total += 1 / (c["results"].index(c["relevant"]) + 1)
    return total / len(cases)

for k in (1, 2, 3):
    print(f"recall@{k}: {recall_at(k):.2f}")
print(f"MRR: {mrr():.2f}")`,
    expect: "MRR: 0.50",
  },
  {
    topicId: "m7-9-tool-selection",
    title: "Did the agent pick the right tool?",
    intro: "Compare the tool the agent chose with the tool you expected for each task. The mismatches are your bug list.",
    code: String.raw`cases = [
    ("what is the weather in Pune", "weather", "weather"),
    ("email Priya the report", "send_email", "send_email"),
    ("how many days until Diwali", "calendar", "search"),
    ("convert 5 miles to km", "calculator", "calculator"),
]

correct = 0
for task, expected, chosen in cases:
    ok = expected == chosen
    correct += ok
    print("ok  " if ok else "MISS", f"{task!r}: expected {expected}, got {chosen}")
print(f"tool selection accuracy: {correct}/{len(cases)}")`,
    expect: "tool selection accuracy: 3/4",
  },
  {
    topicId: "m8-4-validating-tool-use-outside-the-llm",
    title: "An allowlist the model cannot talk its way past",
    intro: "Permission checks live in code, outside the model. Whatever the model asks for, only allowed calls run.",
    code: String.raw`ALLOWED = {"read_file": {"max_size": 1000}, "search": {}}
NEEDS_APPROVAL = {"delete_file", "send_email"}

def authorize(tool, args):
    if tool in NEEDS_APPROVAL:
        return "needs human approval"
    if tool not in ALLOWED:
        return "denied: unknown tool"
    if tool == "read_file" and not str(args.get("path", "")).startswith("docs/"):
        return "denied: path outside docs/"
    return "allowed"

for tool, args in [("search", {}), ("read_file", {"path": "docs/a.md"}),
                   ("read_file", {"path": "/etc/passwd"}), ("delete_file", {"path": "docs/a.md"}),
                   ("run_shell", {})]:
    print(f"{tool:10} {authorize(tool, args)}")`,
    expect: "delete_file needs human approval",
  },
  {
    topicId: "m8-6-redaction-and-minimization",
    title: "Redact personal data before it is logged",
    intro: "Mask emails and phone numbers before text reaches logs or a third-party model. Real systems use stronger detectors, but the step looks like this.",
    code: String.raw`import re

RULES = [
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "[EMAIL]"),
    (re.compile(r"\b\d{10}\b"), "[PHONE]"),
]

def redact(text):
    for pattern, label in RULES:
        text = pattern.sub(label, text)
    return text

print(redact("Contact asha.rao@example.com or call 9876543210 about order 4417."))`,
    expect: "Contact [EMAIL] or call [PHONE] about order 4417.",
    tryThis: "Add a rule that masks 12-digit Aadhaar-style numbers.",
  },
  {
    topicId: "m9-3-model-cascades",
    title: "Try the cheap model first",
    intro: "Send each request to the small model, and only escalate to the big one when the small one is unsure. Count how much you save.",
    code: String.raw`COST = {"small": 1, "large": 20}

requests = [("hi", 0.95), ("summarise this", 0.9), ("tricky legal question", 0.4),
            ("translate hello", 0.97), ("multi-step plan", 0.5)]

total = 0
for text, small_confidence in requests:
    total += COST["small"]
    used = "small"
    if small_confidence < 0.7:
        total += COST["large"]
        used = "small -> large"
    print(f"{text:24} {used}")

print("cascade cost:", total, "| always large:", len(requests) * COST["large"])`,
    expect: "cascade cost: 45 | always large: 100",
  },
  {
    topicId: "m9-5-semantic-caching",
    title: "Exact cache vs semantic cache",
    intro: "An exact cache only hits on identical text. A semantic cache also hits on paraphrases, with a risk of serving a wrong answer if the threshold is too loose.",
    code: String.raw`def words(q): return set(q.lower().replace("?", "").split())
def similarity(a, b): return len(words(a) & words(b)) / len(words(a) | words(b))

cache = {"how do i reset my password": "Use the Forgot password link."}

def lookup(q, threshold=0.6):
    if q in cache:
        return "exact hit"
    for k in cache:
        if similarity(q, k) >= threshold:
            return f"semantic hit ({similarity(q, k):.2f})"
    return "miss"

for q in ("how do i reset my password", "how can i reset my password?", "how do i delete my account"):
    print(f"{q:32} {lookup(q)}")`,
    expect: "semantic hit (0.71)",
  },
  {
    topicId: "m9-6-timeouts-circuit-breakers-and-queues",
    title: "A circuit breaker",
    intro: "After several failures in a row the breaker opens and fails fast instead of hammering a broken service.",
    code: String.raw`class Breaker:
    def __init__(self, limit=3):
        self.limit, self.failures = limit, 0

    @property
    def open(self):
        return self.failures >= self.limit

    def call(self, fn):
        if self.open:
            return "fast-fail: circuit open"
        try:
            result = fn()
            self.failures = 0
            return result
        except Exception:
            self.failures += 1
            return f"error #{self.failures}"

def broken():
    raise ConnectionError("down")

b = Breaker()
for _ in range(5):
    print(b.call(broken))`,
    expect: "fast-fail: circuit open",
  },
];
