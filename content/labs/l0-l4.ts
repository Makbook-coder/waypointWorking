import type { LabSrc } from "./types";

export const LABS_L0_L4: LabSrc[] = [
  {
    id: "notes-api",
    moduleId: "M0.3",
    title: "Build the core of a notes REST API",
    goal: "A request handler for a small notes service: create, read, search and delete notes, with proper status codes and validation. It is the same logic you would put behind FastAPI routes, without the framework, so you can see every decision.",
    preamble: `# Lab: the core of a notes REST API.
# Each step adds to this file. Run the checkpoint after each step.
`,
    steps: [
      {
        title: "Store notes in memory",
        mode: "guided",
        instructions:
          "Finish `NoteStore`. `add(title, body)` gives each note the next id (starting at 1), stores it as a dict `{\"id\", \"title\", \"body\"}` and returns it. `get(note_id)` returns the note or `None`.",
        scaffold: `class NoteStore:
    def __init__(self):
        self.notes = {}
        self.next_id = 1

    def add(self, title, body):
        note = {"id": self.next_id, "title": title, "body": body}
        # TODO: save the note under its id, move next_id on, return the note

    def get(self, note_id):
        # TODO: return the note, or None if there is no such id
        pass
`,
        solution: `class NoteStore:
    def __init__(self):
        self.notes = {}
        self.next_id = 1

    def add(self, title, body):
        note = {"id": self.next_id, "title": title, "body": body}
        self.notes[note["id"]] = note
        self.next_id += 1
        return note

    def get(self, note_id):
        return self.notes.get(note_id)
`,
        tests: [
          ["ids start at 1 and count up", "s = NoteStore()\nassert s.add('a', 'x')['id'] == 1\nassert s.add('b', 'y')['id'] == 2"],
          ["get returns the note", "s = NoteStore()\ns.add('a', 'x')\nassert s.get(1) == {'id': 1, 'title': 'a', 'body': 'x'}"],
          ["missing note is None", "assert NoteStore().get(99) is None"],
        ],
        hints: [
          "`self.notes` is a dict, so saving is `self.notes[note[\"id\"]] = note`.",
          "After saving, add 1 to `self.next_id` and `return note`. For `get`, `dict.get` already returns None for a missing key.",
        ],
      },
      {
        title: "Route GET and POST requests",
        mode: "guided",
        instructions:
          "Write `handle(store, method, path, body=None)` returning `(status, response)`. `POST /notes` creates a note from `body[\"title\"]` and `body[\"body\"]` and returns `201`. `GET /notes/<id>` returns `200` with the note, or `404` with `{\"error\": \"not found\"}`. Any other path is `404` too.",
        scaffold: `def handle(store, method, path, body=None):
    parts = path.strip("/").split("/")
    if method == "POST" and parts == ["notes"]:
        # TODO: create the note and return 201 with it
        pass
    if method == "GET" and len(parts) == 2 and parts[0] == "notes" and parts[1].isdigit():
        # TODO: look the note up; 200 if found, 404 if not
        pass
    return 404, {"error": "not found"}
`,
        solution: `def handle(store, method, path, body=None):
    parts = path.strip("/").split("/")
    if method == "POST" and parts == ["notes"]:
        return 201, store.add(body["title"], body["body"])
    if method == "GET" and len(parts) == 2 and parts[0] == "notes" and parts[1].isdigit():
        note = store.get(int(parts[1]))
        return (200, note) if note else (404, {"error": "not found"})
    return 404, {"error": "not found"}
`,
        tests: [
          ["POST creates", "s = NoteStore()\nassert handle(s, 'POST', '/notes', {'title': 't', 'body': 'b'}) == (201, {'id': 1, 'title': 't', 'body': 'b'})"],
          ["GET finds it", "s = NoteStore()\nhandle(s, 'POST', '/notes', {'title': 't', 'body': 'b'})\nassert handle(s, 'GET', '/notes/1')[0] == 200"],
          ["GET missing is 404", "assert handle(NoteStore(), 'GET', '/notes/7') == (404, {'error': 'not found'})"],
          ["unknown path is 404", "assert handle(NoteStore(), 'GET', '/users')[0] == 404"],
        ],
        hints: [
          "For POST, call `store.add(...)` with the two fields from `body` and return `201` with what it gives back.",
          "The id in the path is a string: convert it with `int(parts[1])` before calling `store.get`.",
        ],
      },
      {
        title: "Validate input with 422 errors",
        mode: "partial",
        instructions:
          "Bad input is the client's fault, so it must be a 4xx, never a crash. Write `validate(body)` returning a list of `{\"field\", \"msg\"}` errors: `title` must be a non-empty string of at most 80 characters, and `body` must be a string (it may be empty). A body that isn't a dict is one error on field `\"body\"`. Then change `handle` so `POST /notes` returns `422` with `{\"errors\": [...]}` when there are any. Redefine `handle` below; the later definition wins.",
        scaffold: `def validate(body):
    """Return a list of {"field", "msg"} dicts. Empty means valid."""
    errors = []
    # your code here
    return errors


# Redefine handle here so POST validates first.
`,
        solution: `def validate(body):
    if not isinstance(body, dict):
        return [{"field": "body", "msg": "must be a JSON object"}]
    errors = []
    title = body.get("title")
    if not isinstance(title, str) or not title.strip():
        errors.append({"field": "title", "msg": "required"})
    elif len(title) > 80:
        errors.append({"field": "title", "msg": "at most 80 characters"})
    if not isinstance(body.get("body"), str):
        errors.append({"field": "body", "msg": "must be a string"})
    return errors


def handle(store, method, path, body=None):
    parts = path.strip("/").split("/")
    if method == "POST" and parts == ["notes"]:
        errors = validate(body)
        if errors:
            return 422, {"errors": errors}
        return 201, store.add(body["title"].strip(), body["body"])
    if method == "GET" and len(parts) == 2 and parts[0] == "notes" and parts[1].isdigit():
        note = store.get(int(parts[1]))
        return (200, note) if note else (404, {"error": "not found"})
    return 404, {"error": "not found"}
`,
        tests: [
          ["valid body has no errors", "assert validate({'title': 'ok', 'body': ''}) == []"],
          ["reports every problem", "errs = validate({'title': '', 'body': 5})\nassert {e['field'] for e in errs} == {'title', 'body'}"],
          ["title too long", "assert validate({'title': 'x' * 81, 'body': ''})[0]['field'] == 'title'"],
          ["not a dict", "assert validate(None) == [{'field': 'body', 'msg': 'must be a JSON object'}]"],
          ["POST returns 422", "status, resp = handle(NoteStore(), 'POST', '/notes', {'body': 'no title'})\nassert status == 422 and resp['errors'][0]['field'] == 'title'"],
        ],
        hints: [
          "Check the type first: if `body` isn't a dict, return the single error straight away. Otherwise check `title` and `body` separately and append an error for each problem.",
          "In the new `handle`, call `validate(body)` at the top of the POST branch and return `422, {\"errors\": errors}` if the list isn't empty.",
        ],
      },
      {
        title: "Search, delete and 405",
        mode: "open",
        instructions:
          "Finish the API. `GET /notes?q=word` returns `200` with a list of notes whose title or body contains the word (case-insensitive), in id order; `GET /notes` with no query returns all notes. `DELETE /notes/<id>` returns `204` with `None`, or `404`. A known path with the wrong method (for example `PUT /notes/1`) returns `405` with `{\"error\": \"method not allowed\"}`. Keep everything from earlier steps working.",
        scaffold: "",
        solution: `def handle(store, method, path, body=None):
    path, _, query = path.partition("?")
    parts = path.strip("/").split("/")
    params = dict(p.split("=", 1) for p in query.split("&") if "=" in p)
    if parts == ["notes"]:
        if method == "POST":
            errors = validate(body)
            if errors:
                return 422, {"errors": errors}
            return 201, store.add(body["title"].strip(), body["body"])
        if method == "GET":
            q = params.get("q", "").lower()
            notes = [n for _, n in sorted(store.notes.items())]
            return 200, [n for n in notes if q in n["title"].lower() or q in n["body"].lower()]
        return 405, {"error": "method not allowed"}
    if len(parts) == 2 and parts[0] == "notes" and parts[1].isdigit():
        note_id = int(parts[1])
        if method == "GET":
            note = store.get(note_id)
            return (200, note) if note else (404, {"error": "not found"})
        if method == "DELETE":
            if store.notes.pop(note_id, None) is None:
                return 404, {"error": "not found"}
            return 204, None
        return 405, {"error": "method not allowed"}
    return 404, {"error": "not found"}
`,
        tests: [
          ["search is case-insensitive", "s = NoteStore()\nhandle(s, 'POST', '/notes', {'title': 'Groceries', 'body': 'milk'})\nhandle(s, 'POST', '/notes', {'title': 'Work', 'body': 'Ship the API'})\nstatus, found = handle(s, 'GET', '/notes?q=api')\nassert status == 200 and [n['id'] for n in found] == [2]"],
          ["list all", "s = NoteStore()\nhandle(s, 'POST', '/notes', {'title': 'a', 'body': ''})\nhandle(s, 'POST', '/notes', {'title': 'b', 'body': ''})\nassert [n['title'] for n in handle(s, 'GET', '/notes')[1]] == ['a', 'b']"],
          ["delete", "s = NoteStore()\nhandle(s, 'POST', '/notes', {'title': 'a', 'body': ''})\nassert handle(s, 'DELETE', '/notes/1') == (204, None)\nassert handle(s, 'GET', '/notes/1')[0] == 404\nassert handle(s, 'DELETE', '/notes/1')[0] == 404"],
          ["wrong method is 405", "assert handle(NoteStore(), 'PUT', '/notes/1') == (405, {'error': 'method not allowed'})"],
        ],
        hints: [
          "Split the query string off first with `path.partition(\"?\")`, then parse `q=...` into a dict. Route on the path, then on the method, so you can return 405 when the path matched but the method didn't.",
          "Search over `sorted(store.notes.items())` to keep id order. Delete with `store.notes.pop(note_id, None)`, which returns None when the id wasn't there.",
        ],
      },
    ],
    stretch: [
      "Port the handler to FastAPI routes with a Pydantic model and compare how much code disappears.",
      "Persist notes to SQLite with parameterized queries.",
      "Add pagination with `limit` and `offset` query parameters.",
    ],
  },
  {
    id: "tiny-bpe",
    moduleId: "M1.2",
    title: "Train a tiny BPE tokenizer",
    goal: "A byte-pair-encoding tokenizer trained on a few sentences, so you can see exactly why common words become one token and rare words split into pieces.",
    preamble: `# Lab: a tiny byte-pair-encoding (BPE) tokenizer.
# Tokens here are strings. We start from single characters and merge frequent pairs.
from collections import Counter
`,
    steps: [
      {
        title: "Count adjacent pairs",
        mode: "guided",
        instructions:
          "Finish `pair_counts(words)`. `words` is a list of token lists, like `[[\"l\", \"o\", \"w\"], [\"l\", \"o\"]]`. Return a `Counter` of every adjacent pair, like `(\"l\", \"o\"): 2`.",
        scaffold: `def pair_counts(words):
    counts = Counter()
    for tokens in words:
        # TODO: count each adjacent pair (tokens[i], tokens[i + 1])
        pass
    return counts
`,
        solution: `def pair_counts(words):
    counts = Counter()
    for tokens in words:
        for a, b in zip(tokens, tokens[1:]):
            counts[(a, b)] += 1
    return counts
`,
        tests: [
          ["counts pairs across words", "c = pair_counts([['l', 'o', 'w'], ['l', 'o']])\nassert c[('l', 'o')] == 2 and c[('o', 'w')] == 1"],
          ["single tokens have no pairs", "assert pair_counts([['a']]) == Counter()"],
        ],
        hints: [
          "`zip(tokens, tokens[1:])` gives you each token paired with the one after it.",
          "Inside the loop, `counts[(a, b)] += 1`. A Counter starts every missing key at 0.",
        ],
      },
      {
        title: "Merge a pair everywhere",
        mode: "guided",
        instructions:
          "Finish `merge(tokens, pair)`: return a new list where every occurrence of the two tokens in `pair`, side by side, is replaced by one joined token. Scan left to right and don't overlap: merging `(\"a\", \"a\")` in `[\"a\", \"a\", \"a\"]` gives `[\"aa\", \"a\"]`.",
        scaffold: `def merge(tokens, pair):
    out = []
    i = 0
    while i < len(tokens):
        if i + 1 < len(tokens) and (tokens[i], tokens[i + 1]) == pair:
            # TODO: append the joined token (both tokens stuck together)
            i += 2
        else:
            # TODO: keep this token as it is
            i += 1
    return out
`,
        solution: `def merge(tokens, pair):
    out = []
    i = 0
    while i < len(tokens):
        if i + 1 < len(tokens) and (tokens[i], tokens[i + 1]) == pair:
            out.append(tokens[i] + tokens[i + 1])
            i += 2
        else:
            out.append(tokens[i])
            i += 1
    return out
`,
        tests: [
          ["merges every occurrence", "assert merge(['l', 'o', 'w', 'l', 'o'], ('l', 'o')) == ['lo', 'w', 'lo']"],
          ["doesn't overlap", "assert merge(['a', 'a', 'a'], ('a', 'a')) == ['aa', 'a']"],
          ["leaves others alone", "assert merge(['x', 'y'], ('a', 'b')) == ['x', 'y']"],
        ],
        hints: [
          "When the pair matches, append `tokens[i] + tokens[i + 1]`. The `i += 2` already skips both.",
          "Otherwise append `tokens[i]` unchanged. Moving `i` by 2 after a merge is what stops the merges overlapping.",
        ],
      },
      {
        title: "Train: learn the merges",
        mode: "partial",
        instructions:
          "Write `train(text, num_merges)`. Split the text on whitespace and turn each word into a list of characters. Then repeat up to `num_merges` times: find the most frequent pair (ties: the alphabetically smallest pair), merge it in every word, and record it. Stop early if no pair appears at least twice. Return the list of merged pairs in the order learned.",
        scaffold: `def train(text, num_merges):
    """Return the list of pairs merged, in the order they were learned."""
    words = [list(w) for w in text.split()]
    merges = []
    # your code here
    return merges
`,
        solution: `def train(text, num_merges):
    words = [list(w) for w in text.split()]
    merges = []
    for _ in range(num_merges):
        counts = pair_counts(words)
        if not counts:
            break
        pair, n = min(counts.items(), key=lambda kv: (-kv[1], kv[0]))
        if n < 2:
            break
        words = [merge(w, pair) for w in words]
        merges.append(pair)
    return merges
`,
        tests: [
          ["learns the most common pair first", "assert train('low low low lower', 1) == [('l', 'o')]"],
          ["builds on earlier merges", "assert train('low low low lower', 2) == [('l', 'o'), ('lo', 'w')]"],
          ["stops when nothing repeats", "assert train('abc', 5) == []"],
        ],
        hints: [
          "Each round: `counts = pair_counts(words)`, pick the best pair, then `words = [merge(w, pair) for w in words]`.",
          "To pick the most frequent pair with alphabetical ties, use `min(counts.items(), key=lambda kv: (-kv[1], kv[0]))`. Stop if its count is below 2.",
        ],
      },
      {
        title: "Encode new text",
        mode: "open",
        instructions:
          "Write `encode(text, merges)` that tokenizes new text: split it into words, start each word as characters, and apply every learned merge in order. Return one flat list of tokens for the whole text. Then write `compare(text, merges)` returning `(characters, tokens)`: the number of non-space characters and the number of tokens, so you can see the compression.",
        scaffold: "",
        solution: `def encode(text, merges):
    out = []
    for word in text.split():
        tokens = list(word)
        for pair in merges:
            tokens = merge(tokens, pair)
        out.extend(tokens)
    return out


def compare(text, merges):
    return sum(len(w) for w in text.split()), len(encode(text, merges))
`,
        tests: [
          ["common words become one token", "m = train('low low low lower lowest', 3)\nassert encode('low', m) == ['low']"],
          ["rare words split", "m = train('low low low lower lowest', 3)\nassert encode('slow', m) == ['s', 'low']"],
          ["merges apply in order", "assert encode('aaa', [('a', 'a')]) == ['aa', 'a']"],
          ["compression", "m = train('low low low lower lowest', 3)\nassert compare('low low', m) == (6, 2)"],
        ],
        hints: [
          "Reuse `merge`: for each word, start with `list(word)` and loop over `merges`, merging each pair in turn.",
          "Collect every word's tokens into one list with `out.extend(tokens)`. `compare` counts characters per word and calls `encode`.",
        ],
      },
    ],
    stretch: [
      "Train on a page of text in another language and see how many more tokens the same meaning needs.",
      "Compare your token counts with a real tokenizer such as tiktoken.",
      "Add an end-of-word marker so merges can't cross word boundaries in a joined string.",
    ],
  },
  {
    id: "tool-assistant",
    moduleId: "M2.5",
    title: "Build a tool-calling assistant loop",
    goal: "The loop every tool-using assistant runs: describe tools, let the model ask for one, run it safely, feed back the result, and stop at a limit. The model is a fake so it runs offline, but the loop is the real thing.",
    preamble: `# Lab: a tool-calling assistant loop.
# A "model" here is any function that takes the message list and returns a dict.
import inspect
`,
    steps: [
      {
        title: "Register tools with a decorator",
        mode: "guided",
        instructions:
          "Finish the `tool` decorator. It stores each function in `TOOLS` under its name, together with a schema: `{\"name\", \"description\", \"params\"}` where `description` is the docstring and `params` is the list of parameter names. Return the function unchanged so it can still be called directly.",
        scaffold: `TOOLS = {}

def tool(fn):
    schema = {
        "name": fn.__name__,
        "description": (fn.__doc__ or "").strip(),
        "params": [],  # TODO: list the parameter names, e.g. with inspect.signature(fn).parameters
    }
    # TODO: store {"fn": fn, "schema": schema} in TOOLS under the name
    return fn


@tool
def add(a, b):
    """Add two numbers."""
    return a + b
`,
        solution: `TOOLS = {}

def tool(fn):
    schema = {
        "name": fn.__name__,
        "description": (fn.__doc__ or "").strip(),
        "params": list(inspect.signature(fn).parameters),
    }
    TOOLS[fn.__name__] = {"fn": fn, "schema": schema}
    return fn


@tool
def add(a, b):
    """Add two numbers."""
    return a + b
`,
        tests: [
          ["registers the tool", "assert 'add' in TOOLS and TOOLS['add']['fn'](2, 3) == 5"],
          ["builds a schema", "assert TOOLS['add']['schema'] == {'name': 'add', 'description': 'Add two numbers.', 'params': ['a', 'b']}"],
          ["still callable", "assert add(1, 1) == 2"],
        ],
        hints: [
          "`inspect.signature(fn).parameters` is an ordered mapping of parameter names; `list(...)` of it gives just the names.",
          "Store it with `TOOLS[fn.__name__] = {\"fn\": fn, \"schema\": schema}`.",
        ],
      },
      {
        title: "Call a tool safely",
        mode: "guided",
        instructions:
          "Finish `call_tool(name, args)`. It must never raise: an unknown tool returns `\"error: unknown tool <name>\"`, a missing argument returns `\"error: missing <param>\"` (first missing one, in order), and an exception inside the tool returns `\"error: <ExceptionType>: <message>\"`. On success return `str(result)`, because results go back to the model as text.",
        scaffold: `def call_tool(name, args):
    entry = TOOLS.get(name)
    if entry is None:
        return f"error: unknown tool {name}"
    for p in entry["schema"]["params"]:
        # TODO: return "error: missing <p>" if p isn't in args
        pass
    try:
        # TODO: call the tool with **args and return the result as a string
        pass
    except Exception as e:
        return f"error: {type(e).__name__}: {e}"
`,
        solution: `def call_tool(name, args):
    entry = TOOLS.get(name)
    if entry is None:
        return f"error: unknown tool {name}"
    for p in entry["schema"]["params"]:
        if p not in args:
            return f"error: missing {p}"
    try:
        return str(entry["fn"](**args))
    except Exception as e:
        return f"error: {type(e).__name__}: {e}"
`,
        tests: [
          ["calls the tool", "assert call_tool('add', {'a': 2, 'b': 3}) == '5'"],
          ["unknown tool", "assert call_tool('nope', {}) == 'error: unknown tool nope'"],
          ["missing argument", "assert call_tool('add', {'a': 1}) == 'error: missing b'"],
          ["tool errors become text", "assert call_tool('add', {'a': 1, 'b': 'x'}).startswith('error: TypeError')"],
        ],
        hints: [
          "In the loop, `if p not in args: return f\"error: missing {p}\"`.",
          "Inside the `try`, `return str(entry[\"fn\"](**args))`. The `except` below already turns errors into text.",
        ],
      },
      {
        title: "Run the loop",
        mode: "partial",
        instructions:
          "Write `run(model, user_msg, max_steps=4)`. Start the messages with `{\"role\": \"user\", \"content\": user_msg}`. Each step, call `model(messages)`. If it returns `{\"type\": \"text\", \"text\": ...}`, return that text. If it returns `{\"type\": \"tool\", \"name\", \"args\"}`, append `{\"role\": \"assistant\", \"tool\": name, \"args\": args}` and then `{\"role\": \"tool\", \"name\": name, \"content\": call_tool(name, args)}`, and loop. After `max_steps` model calls, return `\"[stopped: step limit]\"`.",
        scaffold: `def run(model, user_msg, max_steps=4):
    """Return the model's final text, or "[stopped: step limit]"."""
    messages = [{"role": "user", "content": user_msg}]
    # your code here
`,
        solution: `def run(model, user_msg, max_steps=4):
    messages = [{"role": "user", "content": user_msg}]
    for _ in range(max_steps):
        out = model(messages)
        if out["type"] == "text":
            return out["text"]
        messages.append({"role": "assistant", "tool": out["name"], "args": out["args"]})
        messages.append({"role": "tool", "name": out["name"], "content": call_tool(out["name"], out["args"])})
    return "[stopped: step limit]"
`,
        tests: [
          ["answers directly", "assert run(lambda m: {'type': 'text', 'text': 'hi'}, 'hello') == 'hi'"],
          [
            "uses a tool, then answers",
            "def model(messages):\n    if messages[-1]['role'] == 'user':\n        return {'type': 'tool', 'name': 'add', 'args': {'a': 2, 'b': 2}}\n    return {'type': 'text', 'text': 'It is ' + messages[-1]['content']}\nassert run(model, 'what is 2+2?') == 'It is 4'",
          ],
          ["stops at the limit", "assert run(lambda m: {'type': 'tool', 'name': 'add', 'args': {'a': 1, 'b': 1}}, 'loop') == '[stopped: step limit]'"],
        ],
        hints: [
          "Loop `for _ in range(max_steps)`. Return as soon as the model gives text; otherwise append the two messages and go round again.",
          "The tool message's content is `call_tool(out[\"name\"], out[\"args\"])`, so errors reach the model as text instead of crashing the loop.",
        ],
      },
      {
        title: "Record a trace",
        mode: "open",
        instructions:
          "Make the loop observable. Write `run_traced(model, user_msg, max_steps=4)` that works like `run` but returns `{\"answer\": ..., \"steps\": n, \"tools\": [names in call order], \"errors\": n, \"stopped\": bool}`: `steps` is the number of model calls, `errors` counts tool results starting with `\"error:\"`, and `stopped` is True only when the step limit was hit. This is what you'd log for every request.",
        scaffold: "",
        solution: `def run_traced(model, user_msg, max_steps=4):
    messages = [{"role": "user", "content": user_msg}]
    tools, errors = [], 0
    for step in range(1, max_steps + 1):
        out = model(messages)
        if out["type"] == "text":
            return {"answer": out["text"], "steps": step, "tools": tools, "errors": errors, "stopped": False}
        result = call_tool(out["name"], out["args"])
        tools.append(out["name"])
        errors += result.startswith("error:")
        messages.append({"role": "assistant", "tool": out["name"], "args": out["args"]})
        messages.append({"role": "tool", "name": out["name"], "content": result})
    return {"answer": "[stopped: step limit]", "steps": max_steps, "tools": tools, "errors": errors, "stopped": True}
`,
        tests: [
          [
            "traces tools and errors",
            "def model(messages):\n    n = sum(1 for m in messages if m['role'] == 'tool')\n    if n == 0:\n        return {'type': 'tool', 'name': 'nope', 'args': {}}\n    if n == 1:\n        return {'type': 'tool', 'name': 'add', 'args': {'a': 1, 'b': 2}}\n    return {'type': 'text', 'text': 'done'}\nassert run_traced(model, 'x') == {'answer': 'done', 'steps': 3, 'tools': ['nope', 'add'], 'errors': 1, 'stopped': False}",
          ],
          ["marks the step limit", "t = run_traced(lambda m: {'type': 'tool', 'name': 'add', 'args': {'a': 1, 'b': 1}}, 'x', max_steps=2)\nassert t['stopped'] is True and t['steps'] == 2 and t['tools'] == ['add', 'add']"],
        ],
        hints: [
          "Copy `run` and add three things you update as you go: a `tools` list, an `errors` count, and the step number from `enumerate` or `range(1, max_steps + 1)`.",
          "`result.startswith(\"error:\")` is True or False, and `errors += True` adds 1. Return the dict in both exits, with `stopped` True only after the loop.",
        ],
      },
    ],
    stretch: [
      "Swap the fake model for a real API call with tool definitions built from `TOOLS` schemas.",
      "Add a per-tool timeout and a cost counter.",
      "Stream the final answer while still recording the trace.",
    ],
  },
  {
    id: "prompt-test-harness",
    moduleId: "M3.6",
    title: "Build a prompt test harness",
    goal: "A small harness that renders a prompt template, runs it against a test set, compares two versions and picks the better one. This is how you stop prompt changes from breaking things that used to work.",
    preamble: `# Lab: a prompt test harness.
# A "model" is any function prompt -> text, so the harness runs offline.
import re
`,
    steps: [
      {
        title: "Render templates safely",
        mode: "guided",
        instructions:
          "Finish `render(template, **values)`. Replace each `{name}` placeholder with its value. If the template uses a name you didn't pass, raise `KeyError` naming it, so a typo never sends a prompt with a literal `{question}` in it.",
        scaffold: `def render(template, **values):
    names = re.findall(r"\\{(\\w+)\\}", template)
    for n in names:
        # TODO: raise KeyError(n) if n is missing from values
        pass
    # TODO: replace every {name} with str(values[name]) and return the result
`,
        solution: `def render(template, **values):
    names = re.findall(r"\\{(\\w+)\\}", template)
    for n in names:
        if n not in values:
            raise KeyError(n)
    return re.sub(r"\\{(\\w+)\\}", lambda m: str(values[m.group(1)]), template)
`,
        tests: [
          ["fills placeholders", "assert render('Q: {q} A:', q='2+2?') == 'Q: 2+2? A:'"],
          ["repeats work", "assert render('{x}-{x}', x=1) == '1-1'"],
          ["missing names fail loudly", "try:\n    render('Hi {name}')\n    assert False\nexcept KeyError as e:\n    assert 'name' in str(e)"],
        ],
        hints: [
          "`if n not in values: raise KeyError(n)` inside the loop.",
          "`re.sub` can take a function: `re.sub(r\"\\{(\\w+)\\}\", lambda m: str(values[m.group(1)]), template)`.",
        ],
      },
      {
        title: "Run a test suite",
        mode: "guided",
        instructions:
          "Finish `run_suite(template, model, cases)`. Each case is `{\"id\", \"vars\", \"expect\"}`. Render the template with the case's vars, call the model, and mark the case passed if `expect` appears in the output (case-insensitive). Return a dict id → True/False.",
        scaffold: `def run_suite(template, model, cases):
    results = {}
    for case in cases:
        prompt = render(template, **case["vars"])
        output = model(prompt)
        # TODO: results[case["id"]] = whether case["expect"] is in output, ignoring case
    return results
`,
        solution: `def run_suite(template, model, cases):
    results = {}
    for case in cases:
        prompt = render(template, **case["vars"])
        output = model(prompt)
        results[case["id"]] = case["expect"].lower() in output.lower()
    return results
`,
        tests: [
          ["marks passes and fails", "cases = [{'id': 'a', 'vars': {'q': 'capital of France'}, 'expect': 'paris'}, {'id': 'b', 'vars': {'q': 'capital of Peru'}, 'expect': 'lima'}]\nmodel = lambda p: 'Paris' if 'France' in p else 'unsure'\nassert run_suite('Q: {q}', model, cases) == {'a': True, 'b': False}"],
          ["case-insensitive", "assert run_suite('{q}', lambda p: 'YES', [{'id': 'x', 'vars': {'q': ''}, 'expect': 'yes'}]) == {'x': True}"],
        ],
        hints: [
          "Lowercase both sides before comparing: `case[\"expect\"].lower() in output.lower()`.",
          "Store the boolean under the case id: `results[case[\"id\"]] = ...`.",
        ],
      },
      {
        title: "Compare two versions",
        mode: "partial",
        instructions:
          "Write `compare_versions(old, new, model, cases)` that runs both templates on the same cases and returns `{\"old_rate\", \"new_rate\", \"fixed\", \"broken\"}`: pass rates rounded to 2 decimals, and sorted lists of case ids the new version fixed (old failed, new passed) and broke (old passed, new failed).",
        scaffold: `def compare_versions(old, new, model, cases):
    """Run both templates on the same cases and report what changed."""
    a = run_suite(old, model, cases)
    b = run_suite(new, model, cases)
    # your code here
`,
        solution: `def compare_versions(old, new, model, cases):
    a = run_suite(old, model, cases)
    b = run_suite(new, model, cases)
    ids = sorted(a)
    rate = lambda r: round(sum(r.values()) / len(r), 2) if r else 0.0
    return {
        "old_rate": rate(a),
        "new_rate": rate(b),
        "fixed": [i for i in ids if not a[i] and b[i]],
        "broken": [i for i in ids if a[i] and not b[i]],
    }
`,
        tests: [
          [
            "finds fixes and breaks",
            "cases = [{'id': '1', 'vars': {'q': 'a'}, 'expect': 'ok'}, {'id': '2', 'vars': {'q': 'b'}, 'expect': 'ok'}]\nmodel = lambda p: 'ok' if ('v1' in p and 'a' in p) or ('v2' in p and 'b' in p) else 'no'\nr = compare_versions('v1 {q}', 'v2 {q}', model, cases)\nassert r == {'old_rate': 0.5, 'new_rate': 0.5, 'fixed': ['2'], 'broken': ['1']}",
          ],
          ["same results, nothing changed", "cases = [{'id': '1', 'vars': {}, 'expect': 'x'}]\nr = compare_versions('a', 'b', lambda p: 'x', cases)\nassert r['fixed'] == [] and r['broken'] == [] and r['new_rate'] == 1.0"],
        ],
        hints: [
          "`sum(r.values())` counts the True results, so the pass rate is that divided by `len(r)`.",
          "Fixed means `not a[i] and b[i]`; broken is the opposite. Loop over sorted ids so both lists come out sorted.",
        ],
      },
      {
        title: "Pick the best version",
        mode: "open",
        instructions:
          "Write `pick_best(templates, model, cases)` where `templates` maps a version name to a template. Return `(name, rate)` for the version with the highest pass rate; break ties by the shorter template (fewer characters, which is cheaper), then by name. Rate is rounded to 2 decimals.",
        scaffold: "",
        solution: `def pick_best(templates, model, cases):
    scored = []
    for name, t in templates.items():
        r = run_suite(t, model, cases)
        rate = round(sum(r.values()) / len(r), 2) if r else 0.0
        scored.append((-rate, len(t), name, rate))
    best = min(scored)
    return best[2], best[3]
`,
        tests: [
          ["highest rate wins", "cases = [{'id': '1', 'vars': {}, 'expect': 'ok'}]\nm = lambda p: 'ok' if 'please' in p else 'no'\nassert pick_best({'v1': 'answer', 'v2': 'answer please'}, m, cases) == ('v2', 1.0)"],
          ["ties go to the shorter prompt", "cases = [{'id': '1', 'vars': {}, 'expect': 'ok'}]\nassert pick_best({'long': 'a much longer prompt', 'short': 'brief'}, lambda p: 'ok', cases) == ('short', 1.0)"],
        ],
        hints: [
          "Score each version with `run_suite`, then build a sort key that puts the best first: highest rate, then shortest template, then name.",
          "A tuple like `(-rate, len(template), name)` sorts in exactly that order, so `min` of those tuples is the winner.",
        ],
      },
    ],
    stretch: [
      "Run each case three times with a real model and treat a case as passed only if it passes at least twice.",
      "Add an LLM-as-judge check for cases where a substring match isn't enough.",
      "Save every run to a JSON file so you can see the history of each prompt version.",
    ],
  },
  {
    id: "rag-from-scratch",
    moduleId: "M4.9",
    title: "Build a baseline RAG pipeline from scratch",
    goal: "Chunk, embed, retrieve, assemble a grounded prompt, and answer with citations, or abstain when the sources don't cover the question. Embeddings are simple word counts so it runs anywhere, but every stage is the real one.",
    preamble: `# Lab: baseline RAG from scratch.
# "Embeddings" are word-count vectors so this runs offline. Swap in a real model later.
import math
import re
from collections import Counter
`,
    steps: [
      {
        title: "Chunk documents with overlap",
        mode: "guided",
        instructions:
          "Finish `chunk(doc_id, text, size=40, overlap=10)`. Split on whitespace into words and return chunks of `size` words, each starting `size - overlap` words after the last. Each chunk is `{\"id\": \"<doc_id>#<n>\", \"text\": ...}` with n starting at 0. Stop once a chunk reaches the end of the text.",
        scaffold: `def chunk(doc_id, text, size=40, overlap=10):
    words = text.split()
    step = size - overlap
    chunks = []
    for n, start in enumerate(range(0, len(words), step)):
        piece = " ".join(words[start:start + size])
        # TODO: append {"id": f"{doc_id}#{n}", "text": piece}
        # TODO: stop if this chunk reached the end of the words
    return chunks
`,
        solution: `def chunk(doc_id, text, size=40, overlap=10):
    words = text.split()
    step = size - overlap
    chunks = []
    for n, start in enumerate(range(0, len(words), step)):
        piece = " ".join(words[start:start + size])
        chunks.append({"id": f"{doc_id}#{n}", "text": piece})
        if start + size >= len(words):
            break
    return chunks
`,
        tests: [
          ["ids and overlap", "c = chunk('d', ' '.join(str(i) for i in range(10)), size=4, overlap=2)\nassert [x['id'] for x in c] == ['d#0', 'd#1', 'd#2', 'd#3']\nassert c[1]['text'] == '2 3 4 5'"],
          ["short docs are one chunk", "assert chunk('d', 'just a few words') == [{'id': 'd#0', 'text': 'just a few words'}]"],
        ],
        hints: [
          "Append the chunk dict on every iteration: `chunks.append({\"id\": f\"{doc_id}#{n}\", \"text\": piece})`.",
          "Then `if start + size >= len(words): break`, otherwise the next chunk would only repeat words you already have.",
        ],
      },
      {
        title: "Embed and retrieve",
        mode: "guided",
        instructions:
          "Finish `embed(text)` (a Counter of lowercase words, ignoring punctuation and these stop words: the, a, an, is, of, to, and, in, what, how) and `retrieve(question, chunks, k=2)`, which scores every chunk by cosine similarity with the question and returns the top `k` as `(score, chunk)` pairs, best first, dropping zero scores.",
        scaffold: `STOP = {"the", "a", "an", "is", "of", "to", "and", "in", "what", "how"}

def embed(text):
    words = re.findall(r"[a-z0-9]+", text.lower())
    # TODO: return a Counter of the words that aren't stop words


def cosine(a, b):
    dot = sum(a[w] * b[w] for w in a)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na and nb else 0.0


def retrieve(question, chunks, k=2):
    q = embed(question)
    scored = [(cosine(q, embed(c["text"])), c) for c in chunks]
    # TODO: drop zero scores, sort by score (highest first), return the top k
`,
        solution: `STOP = {"the", "a", "an", "is", "of", "to", "and", "in", "what", "how"}

def embed(text):
    words = re.findall(r"[a-z0-9]+", text.lower())
    return Counter(w for w in words if w not in STOP)


def cosine(a, b):
    dot = sum(a[w] * b[w] for w in a)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na and nb else 0.0


def retrieve(question, chunks, k=2):
    q = embed(question)
    scored = [(cosine(q, embed(c["text"])), c) for c in chunks]
    scored = [s for s in scored if s[0] > 0]
    scored.sort(key=lambda s: s[0], reverse=True)
    return scored[:k]
`,
        tests: [
          ["embed drops stop words", "assert embed('What is the refund policy?') == Counter({'refund': 1, 'policy': 1})"],
          [
            "retrieves the relevant chunk first",
            "chunks = [{'id': 'a#0', 'text': 'Shipping takes five days.'}, {'id': 'b#0', 'text': 'Refunds are allowed within 30 days. The refund policy covers all items.'}]\ntop = retrieve('What is the refund policy?', chunks)\nassert [c['id'] for _, c in top] == ['b#0']",
          ],
        ],
        hints: [
          "`Counter(w for w in words if w not in STOP)` builds the vector in one line.",
          "Filter with `[s for s in scored if s[0] > 0]`, sort with `key=lambda s: s[0], reverse=True`, then slice `[:k]`.",
        ],
      },
      {
        title: "Assemble a grounded prompt",
        mode: "partial",
        instructions:
          "Write `build_prompt(question, hits, min_score=0.2)`. Keep hits with score ≥ `min_score`. If none are left, return `None` so the caller can say \"I don't know\" without calling the model. Otherwise return a prompt that tells the model to answer only from the sources, cite source ids in square brackets, and say \"I don't know\" if the sources don't contain the answer, followed by each source as `[id] text` on its own line and then `Question: <question>`.",
        scaffold: `def build_prompt(question, hits, min_score=0.2):
    """Return a grounded prompt, or None if no source is good enough."""
    # your code here
`,
        solution: `def build_prompt(question, hits, min_score=0.2):
    good = [c for s, c in hits if s >= min_score]
    if not good:
        return None
    sources = "\\n".join(f"[{c['id']}] {c['text']}" for c in good)
    return (
        "Answer only from the sources below. Cite source ids in square brackets, like [doc#0]. "
        "If the sources don't contain the answer, say \\"I don't know\\".\\n\\n"
        f"Sources:\\n{sources}\\n\\nQuestion: {question}"
    )
`,
        tests: [
          ["abstains with no good sources", "assert build_prompt('q', [(0.1, {'id': 'x', 'text': 't'})]) is None"],
          ["labels sources and instructs", "p = build_prompt('Can I get a refund?', [(0.8, {'id': 'b#0', 'text': 'Refunds within 30 days.'})])\nassert '[b#0] Refunds within 30 days.' in p\nassert \"I don't know\" in p and p.rstrip().endswith('Question: Can I get a refund?')"],
        ],
        hints: [
          "Filter first: `good = [c for s, c in hits if s >= min_score]`, and `return None` if it's empty.",
          "Join the sources with newlines as `f\"[{c['id']}] {c['text']}\"`, and put the instructions before them and the question last.",
        ],
      },
      {
        title: "Answer end to end, with citations",
        mode: "open",
        instructions:
          "Write `answer(question, docs, llm)` where `docs` maps doc id → text and `llm(prompt)` returns text. Chunk every doc, retrieve the top 2, build the prompt, and return `{\"answer\", \"citations\", \"abstained\"}`. If `build_prompt` returns None, don't call the model: answer `\"I don't know\"` with no citations and `abstained=True`. Otherwise `citations` is the list of chunk ids the answer cites in `[...]` that were actually in the prompt (in order, no duplicates).",
        scaffold: "",
        solution: `def answer(question, docs, llm):
    chunks = [c for doc_id, text in docs.items() for c in chunk(doc_id, text)]
    hits = retrieve(question, chunks, k=2)
    prompt = build_prompt(question, hits)
    if prompt is None:
        return {"answer": "I don't know", "citations": [], "abstained": True}
    text = llm(prompt)
    given = {c["id"] for _, c in hits}
    cited = [i for i in dict.fromkeys(re.findall(r"\\[([^\\[\\]]+)\\]", text)) if i in given]
    return {"answer": text, "citations": cited, "abstained": False}
`,
        tests: [
          [
            "answers with real citations only",
            "docs = {'policy': 'Refunds are allowed within 30 days of purchase. The refund policy covers all items.', 'ship': 'Shipping takes five days.'}\nllm = lambda p: 'Within 30 days [policy#0] [made-up#9].'\nr = answer('What is the refund policy?', docs, llm)\nassert r == {'answer': 'Within 30 days [policy#0] [made-up#9].', 'citations': ['policy#0'], 'abstained': False}",
          ],
          [
            "abstains without calling the model",
            "def llm(p):\n    raise AssertionError('should not be called')\nr = answer('Who won the 1998 World Cup?', {'ship': 'Shipping takes five days.'}, llm)\nassert r['abstained'] is True and r['answer'] == \"I don't know\"",
          ],
        ],
        hints: [
          "Chain what you've built: `chunk` every doc into one list, `retrieve`, then `build_prompt`. If the prompt is None, return the abstain dict before calling `llm`.",
          "Find cited ids with `re.findall(r\"\\[([^\\[\\]]+)\\]\", text)`, keep only ids that were in the hits, and remove duplicates with `dict.fromkeys`.",
        ],
      },
    ],
    stretch: [
      "Replace `embed` with a real embedding model and compare which chunks come back.",
      "Add BM25 and fuse both rankings with reciprocal rank fusion.",
      "Write ten questions with known answers and measure recall@2 and how often the pipeline abstains correctly.",
    ],
  },
];
