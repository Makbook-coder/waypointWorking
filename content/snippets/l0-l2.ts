import type { SnippetSrc } from "./types";

export const SNIPPETS_L0_L2: SnippetSrc[] = [
  {
    topicId: "m0-1-core-data-structures",
    title: "Dedupe while keeping order",
    intro: "A `dict` remembers insertion order and looks keys up in one step, so it dedupes faster than checking a list.",
    code: String.raw`from collections import Counter

docs = ["a", "b", "a", "c", "b", "a"]

unique = list(dict.fromkeys(docs))   # keeps first-seen order
counts = Counter(docs)

print("unique:", unique)
print("counts:", dict(counts))
print("most common:", counts.most_common(1))`,
    expect: "unique: ['a', 'b', 'c']",
    tryThis: "Replace `dict.fromkeys(docs)` with `set(docs)` and run it a few times. What happens to the order?",
  },
  {
    topicId: "m0-1-mutability-scope-and-failure-modes",
    title: "The mutable default argument trap",
    intro: "A default `[]` is created once, when the function is defined, and shared by every call. Watch the first function leak.",
    code: String.raw`def add_bad(item, items=[]):
    items.append(item)
    return items

def add_good(item, items=None):
    if items is None:
        items = []          # a fresh list on every call
    items.append(item)
    return items

print("bad :", add_bad(1), add_bad(2), add_bad(3))
print("good:", add_good(1), add_good(2), add_good(3))`,
    expect: "bad : [1, 2, 3] [1, 2, 3] [1, 2, 3]",
    tryThis: "Print `add_bad.__defaults__` after the calls to see the shared list.",
  },
  {
    topicId: "m0-1-files-paths-env-vars-and-serialization",
    title: "Write, read and round-trip JSON",
    intro: "Save a dict to a temporary file as JSON, read it back, and read a setting from the environment with a default.",
    code: String.raw`import json, os, tempfile
from pathlib import Path

config = {"model": "small", "top_k": 3, "tags": ["rag", "demo"]}

with tempfile.TemporaryDirectory() as tmp:
    path = Path(tmp) / "config.json"
    path.write_text(json.dumps(config, indent=2))
    loaded = json.loads(path.read_text())

print("same after round trip:", loaded == config)
print("timeout:", os.environ.get("REQUEST_TIMEOUT", "30"), "(default used when unset)")`,
    expect: "same after round trip: True",
  },
  {
    topicId: "m0-1-sync-vs-async-execution",
    title: "Three waits, one after another or together",
    intro: "Each fake request waits 0.2 seconds. Run them one by one and they add up. Run them together and they overlap.",
    code: String.raw`import asyncio, time

async def fake_request(n):
    await asyncio.sleep(0.2)
    return n * 10

async def sequential():
    return [await fake_request(n) for n in (1, 2, 3)]

async def concurrent():
    return await asyncio.gather(*(fake_request(n) for n in (1, 2, 3)))

for name, fn in (("one by one", sequential), ("together", concurrent)):
    start = time.perf_counter()
    result = await fn()
    print(f"{name}: {result} in about {time.perf_counter() - start:.1f}s")`,
    expect: "together: [10, 20, 30]",
    tryThis: "Change the number of requests to 6. Which version grows?",
  },
  {
    topicId: "m0-1-type-hints-and-typed-models",
    title: "Hints are not enforced, validation is",
    intro: "Python ignores type hints at runtime. A small model class that checks its own fields is what stops bad data.",
    code: String.raw`from dataclasses import dataclass

def double(x: int) -> int:
    return x * 2

print("hints ignored:", double("ab"))   # no error, wrong type

@dataclass
class Query:
    text: str
    top_k: int = 5

    def __post_init__(self):
        if not isinstance(self.top_k, int) or self.top_k < 1:
            raise ValueError(f"top_k must be a positive int, got {self.top_k!r}")

print(Query("rag", 3))
try:
    Query("rag", "x")
except ValueError as e:
    print("rejected:", e)`,
    expect: "rejected: top_k must be a positive int, got 'x'",
  },
  {
    topicId: "m0-1-unit-tests-and-debugging",
    title: "A passing and a failing test",
    intro: "`unittest` is built in. Read the failure message: it tells you the expected and actual values.",
    code: String.raw`import sys, unittest

def clean(text):
    return " ".join(text.split()).lower()

class CleanTests(unittest.TestCase):
    def test_collapses_whitespace(self):
        self.assertEqual(clean("  Hello   World "), "hello world")

    def test_bug_on_purpose(self):
        self.assertEqual(clean("A\tB"), "a  b")   # wrong expectation

suite = unittest.defaultTestLoader.loadTestsFromTestCase(CleanTests)
unittest.TextTestRunner(stream=sys.stdout, verbosity=1).run(suite)`,
    expect: "FAILED (failures=1)",
    tryThis: "Fix the wrong expectation so both tests pass.",
  },
  {
    topicId: "m0-2-the-http-request-response-cycle",
    title: "An HTTP request is just text",
    intro: "Build a raw request, then split a raw response into its status line, headers and body.",
    code: String.raw`request = "\r\n".join([
    "POST /v1/notes HTTP/1.1",
    "Host: api.example.com",
    "Content-Type: application/json",
    "",
    '{"title": "hello"}',
])
print(request)
print("---")

response = "HTTP/1.1 201 Created\r\nContent-Type: application/json\r\nLocation: /v1/notes/7\r\n\r\n{\"id\": 7}"
head, body = response.split("\r\n\r\n", 1)
status_line, *header_lines = head.split("\r\n")
headers = dict(line.split(": ", 1) for line in header_lines)
print("status:", status_line.split(" ", 2)[1:])
print("headers:", headers)
print("body:", body)`,
    expect: "status: ['201', 'Created']",
  },
  {
    topicId: "m0-2-methods-and-idempotency",
    title: "PUT is idempotent, POST is not",
    intro: "Repeat each call three times. `PUT` to the same id leaves one record. `POST` creates a new record every time.",
    code: String.raw`store = {}
next_id = 1

def post(data):
    global next_id
    store[next_id] = data
    next_id += 1

def put(item_id, data):
    store[item_id] = data

for _ in range(3):
    post({"title": "hi"})
print("after 3 POSTs:", len(store), "records")

store.clear()
for _ in range(3):
    put(1, {"title": "hi"})
print("after 3 PUTs :", len(store), "record")`,
    expect: "after 3 POSTs: 3 records",
  },
  {
    topicId: "m0-2-status-codes",
    title: "Read a status code like a client",
    intro: "The first digit tells you who is at fault and whether a retry makes sense.",
    code: String.raw`def explain(code):
    if 200 <= code < 300:
        return "success"
    if code in (408, 429) or code >= 500:
        return "retry later (transient)"
    if 400 <= code < 500:
        return "fix the request, do not retry"
    return "other"

for code in (200, 201, 400, 401, 404, 429, 500, 503):
    print(code, "->", explain(code))`,
    expect: "429 -> retry later (transient)",
    tryThis: "Add 409 and decide which bucket it belongs in.",
  },
  {
    topicId: "m0-2-working-with-json",
    title: "JSON in, JSON out, and bad JSON",
    intro: "`json.loads` turns text into dicts and lists. Malformed text raises an error you should catch.",
    code: String.raw`import json

text = '{"user": {"name": "Asha", "langs": ["python", "sql"]}, "active": true, "score": null}'
data = json.loads(text)
print(data["user"]["langs"][0], data["active"], data["score"])

print(json.dumps(data, indent=2, sort_keys=True)[:60], "...")

try:
    json.loads("{'single': 'quotes'}")
except json.JSONDecodeError as e:
    print("bad JSON:", e.msg, "at char", e.pos)`,
    expect: "bad JSON:",
  },
  {
    topicId: "m0-3-dependency-injection",
    title: "Pass dependencies in so tests can fake them",
    intro: "The handler never creates its own database. A test hands it a fake one, which is what FastAPI's `Depends` automates.",
    code: String.raw`class RealDB:
    def get_user(self, user_id):
        raise RuntimeError("would hit the network")

class FakeDB:
    def get_user(self, user_id):
        return {"id": user_id, "name": "Test User"}

def handler(user_id, db):
    user = db.get_user(user_id)
    return f"Hello, {user['name']}"

print(handler(1, FakeDB()))
try:
    handler(1, RealDB())
except RuntimeError as e:
    print("real db:", e)`,
    expect: "Hello, Test User",
  },
  {
    topicId: "m0-3-startup-config-and-middleware",
    title: "Middleware is functions wrapping a handler",
    intro: "Each layer runs before and after the next one. This is the idea behind logging, auth and timing middleware.",
    code: String.raw`def handler(request):
    return f"handled {request}"

def logging_mw(next_fn):
    def wrapped(request):
        print("-> request in:", request)
        response = next_fn(request)
        print("<- response out:", response)
        return response
    return wrapped

def auth_mw(next_fn):
    def wrapped(request):
        if "token" not in request:
            return "401 unauthorized"
        return next_fn(request)
    return wrapped

app = logging_mw(auth_mw(handler))
app("GET /notes token=abc")
app("GET /notes")`,
    expect: "<- response out: 401 unauthorized",
  },
  {
    topicId: "m0-4-credentials-outside-source-code",
    title: "Load config from the environment and fail fast",
    intro: "Secrets come from environment variables, never from the code. Missing ones should stop the app at startup with a clear message.",
    code: String.raw`import os

def load_settings(env):
    missing = [k for k in ("DATABASE_URL", "API_KEY") if not env.get(k)]
    if missing:
        raise SystemExit(f"Missing environment variables: {', '.join(missing)}")
    return {"db": env["DATABASE_URL"], "key": env["API_KEY"][:4] + "…"}

print(load_settings({"DATABASE_URL": "postgres://db/app", "API_KEY": "sk-secret-123"}))
try:
    load_settings({"DATABASE_URL": "postgres://db/app"})
except SystemExit as e:
    print("startup stopped:", e)`,
    expect: "startup stopped: Missing environment variables: API_KEY",
  },
  {
    topicId: "m0-5-keeping-secrets-out-with-gitignore",
    title: "Which files would .gitignore skip?",
    intro: "A tiny version of how ignore patterns match file names. Check that `.env` is covered before you commit.",
    code: String.raw`from fnmatch import fnmatch

patterns = [".env", "*.pyc", "__pycache__", "node_modules"]
files = ["app.py", ".env", "app.cpython-312.pyc", "README.md", "config/.env"]

for f in files:
    ignored = any(fnmatch(f.split("/")[-1], p) for p in patterns)
    print(f"{f:22} {'IGNORED' if ignored else 'tracked'}")`,
    expect: ".env                   IGNORED",
  },
  {
    topicId: "m1-1-next-token-prediction",
    title: "A tiny next-word predictor",
    intro: "Count which word follows which, then always pick the most likely next word. A real LLM does this with far richer context.",
    code: String.raw`from collections import Counter, defaultdict

text = "the cat sat on the mat the cat ate the fish the cat sat"
words = text.split()

follows = defaultdict(Counter)
for a, b in zip(words, words[1:]):
    follows[a][b] += 1

print("after 'the':", dict(follows["the"]))

word = "the"
out = [word]
for _ in range(4):
    word = follows[word].most_common(1)[0][0]
    out.append(word)
print(" ".join(out))`,
    expect: "the cat sat on the",
  },
  {
    topicId: "m1-2-characters-words-and-tokens",
    title: "Characters, words and tokens",
    intro: "A tokenizer splits text into pieces from a fixed vocabulary. This greedy longest-match splitter shows why rare words become several tokens.",
    code: String.raw`vocab = {"un", "believ", "able", "the", "cat", " ", "s", "at"}

def tokenize(text):
    tokens, i = [], 0
    while i < len(text):
        for size in range(len(text) - i, 0, -1):
            if text[i:i + size] in vocab:
                tokens.append(text[i:i + size])
                i += size
                break
        else:
            tokens.append(text[i])   # unknown character
            i += 1
    return tokens

for t in ("the cat", "unbelievable", "cats"):
    print(f"{t!r}: {len(t)} chars, {len(tokenize(t))} tokens -> {tokenize(t)}")`,
    expect: "'unbelievable': 12 chars, 3 tokens",
    tryThis: "Remove `believ` from the vocabulary. How many tokens does `unbelievable` need now?",
  },
  {
    topicId: "m1-2-why-tokens-drive-cost-and-latency",
    title: "Estimate what a request costs",
    intro: "Cost is tokens times price. Output tokens usually cost more than input tokens. The prices here are made up for the exercise.",
    code: String.raw`PRICE_IN = 1.00    # dollars per million input tokens (example number)
PRICE_OUT = 4.00   # dollars per million output tokens (example number)

def rough_tokens(text):
    return max(1, len(text) // 4)   # about 4 characters per token in English

def cost(prompt, answer_tokens, calls=1):
    t_in = rough_tokens(prompt)
    return calls * (t_in * PRICE_IN + answer_tokens * PRICE_OUT) / 1_000_000

prompt = "Summarise this support ticket in two sentences. " + "x" * 2000
print("one call   : $%.5f" % cost(prompt, 150))
print("100k calls : $%.2f" % cost(prompt, 150, calls=100_000))`,
    expect: "100k calls :",
    tryThis: "Halve the prompt length and see how the monthly number moves.",
  },
  {
    topicId: "m1-3-from-token-ids-to-embeddings",
    title: "Token ids become vectors",
    intro: "An embedding table is just a lookup: each token id picks one row of numbers. Similar words end up with similar rows.",
    code: String.raw`import math

table = {
    "king":  [0.9, 0.8, 0.1],
    "queen": [0.9, 0.7, 0.2],
    "apple": [0.1, 0.2, 0.9],
}
ids = {"king": 0, "queen": 1, "apple": 2}
print("token ids:", [ids[w] for w in ("king", "apple")])

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.hypot(*a) * math.hypot(*b))

print("king~queen: %.3f" % cosine(table["king"], table["queen"]))
print("king~apple: %.3f" % cosine(table["king"], table["apple"]))`,
    expect: "king~queen: 0.99",
  },
  {
    topicId: "m1-3-the-intuition-behind-attention",
    title: "Attention is a weighted average",
    intro: "A query scores each word, `softmax` turns the scores into weights that sum to 1, and the output blends the values by those weights.",
    code: String.raw`import math

words = ["the", "bank", "river", "money"]
keys = [[0.1, 0.1], [0.7, 0.7], [1.0, 0.1], [0.1, 1.0]]
values = [[0, 0], [1, 1], [10, 0], [0, 10]]
query = [1.0, 0.0]                       # "a water-related word?"

scores = [sum(q * k for q, k in zip(query, key)) for key in keys]
exps = [math.exp(s) for s in scores]
weights = [e / sum(exps) for e in exps]
for w, a in zip(words, weights):
    print(f"{w:6} {a:.2f}")

out = [sum(a * v[i] for a, v in zip(weights, values)) for i in range(2)]
print("blended output:", [round(x, 2) for x in out])`,
    expect: "river  0.",
    tryThis: "Change `query` to [0.0, 1.0]. Which word gets the most weight now?",
  },
  {
    topicId: "m1-5-kv-caching",
    title: "Why a KV cache saves work",
    intro: "Without a cache, every new token re-reads all earlier tokens. With one, each token is processed once. Count the work.",
    code: String.raw`def work_without_cache(n_tokens):
    return sum(range(1, n_tokens + 1))   # token i re-processes i tokens

def work_with_cache(n_tokens):
    return n_tokens                      # each token processed once

for n in (10, 100, 1000):
    a, b = work_without_cache(n), work_with_cache(n)
    print(f"{n:5} tokens: {a:7} vs {b:5} steps  ({a / b:.0f}x more without cache)")`,
    expect: "1000 tokens:  500500 vs  1000 steps",
  },
  {
    topicId: "m1-6-temperature-top-p-top-k-and-penalties",
    title: "Temperature, top-k and top-p on one distribution",
    intro: "Low temperature sharpens the distribution, high flattens it. Top-k and top-p cut the tail before sampling.",
    code: String.raw`import math

logits = {"Paris": 5.0, "Lyon": 3.0, "Rome": 2.0, "banana": 0.0}

def probs(temp):
    exps = {w: math.exp(v / temp) for w, v in logits.items()}
    total = sum(exps.values())
    return {w: e / total for w, e in exps.items()}

for temp in (0.5, 1.0, 2.0):
    print(f"T={temp}:", {w: round(p, 2) for w, p in probs(temp).items()})

def top_p(p_dist, p):
    kept, total = [], 0.0
    for w, pr in sorted(p_dist.items(), key=lambda x: -x[1]):
        kept.append(w)
        total += pr
        if total >= p:
            break
    return kept

print("top_p 0.9 at T=1:", top_p(probs(1.0), 0.9))`,
    expect: "top_p 0.9 at T=1: ['Paris', 'Lyon']",
  },
  {
    topicId: "m1-6-from-probabilities-to-a-chosen-token",
    title: "Greedy vs sampled choice",
    intro: "Greedy always picks the most likely token. Sampling picks by probability, so the same prompt can give different answers.",
    code: String.raw`import random

dist = {"blue": 0.6, "grey": 0.25, "green": 0.15}

greedy = max(dist, key=dist.get)
print("greedy, every time:", [greedy for _ in range(5)])

rng = random.Random(7)   # seeded so this run is repeatable
picks = rng.choices(list(dist), weights=dist.values(), k=10)
print("sampled:", picks)
print("share blue:", picks.count("blue") / len(picks))`,
    expect: "greedy, every time: ['blue', 'blue', 'blue', 'blue', 'blue']",
  },
  {
    topicId: "m1-8-what-occupies-the-context-window",
    title: "Where does the window go?",
    intro: "The window holds more than your question: instructions, history, retrieved text and the room you reserve for the answer.",
    code: String.raw`WINDOW = 8000

parts = {
    "system prompt": 600,
    "tool definitions": 1400,
    "chat history": 3200,
    "retrieved chunks": 2000,
    "user question": 80,
}
reserved_for_answer = 1000

used = sum(parts.values())
for name, n in parts.items():
    print(f"{name:18}{n:6}  {n / WINDOW:5.0%}")
print(f"{'room left':18}{WINDOW - used - reserved_for_answer:6}")`,
    expect: "room left",
    tryThis: "Double the chat history. Does the room left go negative?",
  },
  {
    topicId: "m2-1-apis-are-stateless",
    title: "The model remembers nothing, you resend the history",
    intro: "This fake model only sees the messages you pass. Drop the history and it forgets the name.",
    code: String.raw`def fake_model(messages):
    text = " ".join(m["content"] for m in messages)
    if "my name is" in text.lower() and messages[-1]["content"] == "What is my name?":
        name = text.lower().split("my name is ")[1].split(".")[0]
        return f"Your name is {name.title()}."
    return "I don't know yet."

history = [{"role": "user", "content": "My name is Asha."}]
history.append({"role": "assistant", "content": "Nice to meet you."})
history.append({"role": "user", "content": "What is my name?"})

print("with history   :", fake_model(history))
print("without history:", fake_model(history[-1:]))`,
    expect: "with history   : Your name is Asha.",
  },
  {
    topicId: "m2-2-accumulating-and-interrupting-streams",
    title: "Accumulate a stream and stop early",
    intro: "A stream arrives in small pieces. Show each piece as it comes, keep the total, and stop when the user cancels.",
    code: String.raw`def fake_stream():
    for piece in ["Streaming ", "lets ", "users ", "read ", "while ", "it ", "is ", "written."]:
        yield piece

full = ""
for i, piece in enumerate(fake_stream()):
    full += piece
    print(f"chunk {i}: {piece!r}")
    if i == 3:
        print("user pressed stop")
        break

print("kept so far:", full)`,
    expect: "kept so far: Streaming lets users read ",
  },
  {
    topicId: "m2-4-generate-validate-repair",
    title: "Generate, validate, repair",
    intro: "Never trust model JSON. Parse it, check the fields, and if it fails send the error back for one more try.",
    code: String.raw`import json

replies = iter([
    '{"name": "Asha", "age": "thirty"}',   # wrong type
    '{"name": "Asha", "age": 30}',         # fixed after feedback
])

def fake_model(prompt):
    return next(replies)

def validate(text):
    data = json.loads(text)
    if not isinstance(data.get("name"), str):
        return None, "name must be a string"
    if not isinstance(data.get("age"), int):
        return None, "age must be an integer"
    return data, None

prompt = "Extract the person as JSON."
for attempt in (1, 2):
    data, error = validate(fake_model(prompt))
    if data:
        print(f"attempt {attempt}: ok ->", data)
        break
    print(f"attempt {attempt}: rejected ({error})")
    prompt += f" Previous output was invalid: {error}."`,
    expect: "attempt 2: ok -> {'name': 'Asha', 'age': 30}",
  },
  {
    topicId: "m2-5-the-full-tool-calling-loop",
    title: "The tool-calling loop by hand",
    intro: "The model asks for a tool, your code runs it, the result goes back, and the model writes the final answer. The model never runs anything itself.",
    code: String.raw`def get_weather(city):
    return {"Pune": "31C sunny", "Oslo": "-2C snow"}.get(city, "unknown")

TOOLS = {"get_weather": get_weather}

def fake_model(messages):
    last = messages[-1]
    if last["role"] == "user":
        return {"tool": "get_weather", "args": {"city": "Pune"}}
    return {"final": f"It is {last['content']} in Pune."}

messages = [{"role": "user", "content": "Weather in Pune?"}]
while True:
    reply = fake_model(messages)
    if "final" in reply:
        print("ASSISTANT:", reply["final"])
        break
    result = TOOLS[reply["tool"]](**reply["args"])
    print("tool call :", reply["tool"], reply["args"], "->", result)
    messages.append({"role": "tool", "content": result})`,
    expect: "ASSISTANT: It is 31C sunny in Pune.",
  },
  {
    topicId: "m2-5-tool-failures-and-malformed-arguments",
    title: "Turn tool failures into messages",
    intro: "Bad arguments from the model are normal. Catch them and return the error as text so the model can correct itself.",
    code: String.raw`def divide(a, b):
    return a / b

def call_tool(fn, args):
    try:
        return {"ok": True, "result": fn(**args)}
    except TypeError as e:
        return {"ok": False, "error": f"bad arguments: {e}"}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}

print(call_tool(divide, {"a": 6, "b": 3}))
print(call_tool(divide, {"a": 6}))
print(call_tool(divide, {"a": 6, "b": 0}))`,
    expect: "ZeroDivisionError: division by zero",
  },
  {
    topicId: "m2-6-treating-arguments-as-untrusted",
    title: "Check tool arguments before using them",
    intro: "A model can be tricked into asking for `../../secrets`. Resolve the path and make sure it stays inside the allowed folder.",
    code: String.raw`from pathlib import PurePosixPath

ROOT = PurePosixPath("/srv/docs")

def safe_path(user_value):
    parts = []
    for p in PurePosixPath(user_value).parts:
        if p == "..":
            if not parts:
                raise ValueError("path escapes the docs folder")
            parts.pop()
        elif p != "/":
            parts.append(p)
    return ROOT.joinpath(*parts)

for value in ("guide/intro.md", "a/../b.md", "../../etc/passwd"):
    try:
        print(f"{value:20} ->", safe_path(value))
    except ValueError as e:
        print(f"{value:20} -> BLOCKED ({e})")`,
    expect: "BLOCKED (path escapes the docs folder)",
  },
  {
    topicId: "m2-7-sequential-routed-and-fan-out-patterns",
    title: "Sequential, routed and fan-out",
    intro: "Three ways to wire steps together. Each step here is a plain function standing in for a model call.",
    code: String.raw`def classify(q):   return "math" if any(c.isdigit() for c in q) else "chat"
def calc(q):       return f"calculator({q})"
def chat(q):       return f"chat-model({q})"
def upper(t):      return t.upper()
def count(t):      return len(t.split())

q = "what is 2+2"

# routed: pick one branch
handler = {"math": calc, "chat": chat}[classify(q)]
print("routed    :", handler(q))

# sequential: output of one step feeds the next
print("sequential:", upper(handler(q)))

# fan-out: independent steps on the same input, then combine
print("fan-out   :", {"upper": upper(q), "words": count(q)})`,
    expect: "routed    : calculator(what is 2+2)",
  },
  {
    topicId: "m2-8-running-requests-concurrently",
    title: "Limit how many run at once",
    intro: "Ten fake requests, but a `Semaphore` lets only three run at a time, which is how you stay under a rate limit.",
    code: String.raw`import asyncio

running = 0
peak = 0

async def call(i, sem):
    global running, peak
    async with sem:
        running += 1
        peak = max(peak, running)
        await asyncio.sleep(0.05)
        running -= 1
        return i

sem = asyncio.Semaphore(3)
results = await asyncio.gather(*(call(i, sem) for i in range(10)))
print("results:", results)
print("most at once:", peak)`,
    expect: "most at once: 3",
    tryThis: "Change `Semaphore(3)` to 10. What does the peak become?",
  },
  {
    topicId: "m2-9-backoff-jitter-timeouts-and-degradation",
    title: "Exponential backoff with jitter",
    intro: "Wait longer after each failure, and add randomness so many clients do not retry at the same instant. Then see a flaky call recover.",
    code: String.raw`import random

rng = random.Random(1)

def delay(attempt, base=0.5, cap=8.0):
    return min(cap, base * 2 ** attempt) * rng.uniform(0.5, 1.0)

print("waits:", [round(delay(a), 2) for a in range(6)])

calls = {"n": 0}
def flaky():
    calls["n"] += 1
    if calls["n"] < 3:
        raise TimeoutError("upstream slow")
    return "ok"

for attempt in range(5):
    try:
        print("result:", flaky(), "after", calls["n"], "calls")
        break
    except TimeoutError as e:
        print(f"attempt {attempt + 1} failed ({e}); would wait {delay(attempt):.2f}s")`,
    expect: "result: ok after 3 calls",
  },
  {
    topicId: "m2-10-interactions-as-traces",
    title: "A decorator that records a trace",
    intro: "Wrap each step so it records its name, inputs, output and duration. A list of those records is a trace.",
    code: String.raw`import functools

trace = []

def traced(fn):
    @functools.wraps(fn)
    def wrapper(*args):
        try:
            out = fn(*args)
            trace.append({"step": fn.__name__, "in": args, "out": out})
            return out
        except Exception as e:
            trace.append({"step": fn.__name__, "in": args, "error": repr(e)})
            raise
    return wrapper

@traced
def retrieve(q): return ["doc1", "doc2"]

@traced
def answer(q, docs): return f"{q} -> using {len(docs)} docs"

answer("refund policy?", retrieve("refund policy?"))
for step in trace:
    print(step)`,
    expect: "{'step': 'retrieve'",
  },
];
