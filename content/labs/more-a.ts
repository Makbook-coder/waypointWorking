import type { LabSrc } from "./types";

// More build-along labs for modules that had none (M0.2, M2.4, M2.9, M4.2, M4.4). Same rules as the rest:
// tests/labs.test.ts proves each step's solution passes its checkpoint and its scaffold alone does not.
export const LABS_MORE_A: LabSrc[] = [
  {
    id: "http-request-parser",
    moduleId: "M0.2",
    title: "Parse a raw HTTP request",
    goal: "A parser that turns the raw text of an HTTP request into a method, path, query parameters, headers and body, the same job a web framework does before your route runs.",
    preamble: String.raw`# Lab: parse a raw HTTP request.
# A request is plain text: a request line, header lines, a blank line, then the body.
`,
    steps: [
      {
        title: "The request line",
        mode: "guided",
        instructions: "Finish `parse_request_line(line)`. For `\"GET /notes?limit=5 HTTP/1.1\"` return `(\"GET\", \"/notes?limit=5\", \"HTTP/1.1\")`. `str.split()` with no argument splits on spaces.",
        scaffold: String.raw`def parse_request_line(line):
    # TODO: split the line into three parts and return them as a tuple
    return None
`,
        solution: String.raw`def parse_request_line(line):
    method, target, version = line.strip().split()
    return method, target, version
`,
        tests: [
          ["get", String.raw`assert parse_request_line("GET /notes?limit=5 HTTP/1.1") == ("GET", "/notes?limit=5", "HTTP/1.1")`],
          ["post", String.raw`assert parse_request_line("POST /notes HTTP/1.1\r\n")[0] == "POST"`],
        ],
        hints: ["Unpack straight into three names: `method, target, version = line.strip().split()`.", "Return them as a tuple: `return method, target, version`."],
      },
      {
        title: "Headers",
        mode: "partial",
        instructions: "Write `parse_headers(lines)`. Each line looks like `Content-Type: application/json`. Return a dict with lower-case names and stripped values, because header names are case-insensitive. Skip blank lines.",
        scaffold: String.raw`def parse_headers(lines):
    """['Host: a.com', 'Content-Type: text/plain'] -> {'host': 'a.com', 'content-type': 'text/plain'}"""
    pass
`,
        solution: String.raw`def parse_headers(lines):
    headers = {}
    for line in lines:
        if not line.strip():
            continue
        name, _, value = line.partition(":")
        headers[name.strip().lower()] = value.strip()
    return headers
`,
        tests: [
          ["lowercases names", String.raw`assert parse_headers(["Host: a.com", "Content-Type: text/plain"]) == {"host": "a.com", "content-type": "text/plain"}`],
          ["value may contain a colon", String.raw`assert parse_headers(["Referer: http://x.com/a"])["referer"] == "http://x.com/a"`],
          ["skips blanks", String.raw`assert parse_headers(["", "A: 1"]) == {"a": "1"}`],
        ],
        hints: ["`line.partition(\":\")` splits at the first colon only, so a value with a colon survives.", "Lower-case the name and strip both parts: `headers[name.strip().lower()] = value.strip()`."],
      },
      {
        title: "The whole request",
        mode: "open",
        instructions: "Write `parse_request(raw)` that returns a dict with `method`, `path` (without the query), `query` (a dict of the `?a=1&b=2` parameters, empty if none), `headers` and `body`. Lines end in `\\r\\n`, and a blank line separates headers from the body. Reuse your two functions. `urllib.parse` is available.",
        scaffold: "",
        solution: String.raw`from urllib.parse import urlsplit, parse_qsl


def parse_request(raw):
    head, _, body = raw.partition("\r\n\r\n")
    request_line, *header_lines = head.split("\r\n")
    method, target, _version = parse_request_line(request_line)
    parts = urlsplit(target)
    return {
        "method": method,
        "path": parts.path,
        "query": dict(parse_qsl(parts.query)),
        "headers": parse_headers(header_lines),
        "body": body,
    }
`,
        tests: [
          ["get with query", String.raw`r = parse_request("GET /notes?limit=5&q=ai HTTP/1.1\r\nHost: a.com\r\n\r\n")
assert r["method"] == "GET" and r["path"] == "/notes"
assert r["query"] == {"limit": "5", "q": "ai"}
assert r["headers"] == {"host": "a.com"} and r["body"] == ""`],
          ["post with body", String.raw`r = parse_request('POST /notes HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"t": 1}')
assert r["method"] == "POST" and r["query"] == {}
assert r["body"] == '{"t": 1}'`],
        ],
        hints: ["Split once on `\"\\r\\n\\r\\n\"` into the head and the body, then split the head on `\"\\r\\n\"`.", "`urlsplit(target)` gives `.path` and `.query`; `parse_qsl` turns the query text into pairs for `dict(...)`."],
      },
    ],
    stretch: ["Return a 400 error value for a malformed request line instead of raising.", "Decode a JSON body when the content type says so.", "Handle `Content-Length` and ignore any extra bytes."],
  },
  {
    id: "validate-and-repair",
    moduleId: "M2.4",
    title: "Validate model JSON and repair it",
    goal: "A small pipeline that pulls JSON out of a model reply, checks it against a schema, and feeds the errors back for another try, which is the generate, validate, repair loop.",
    preamble: String.raw`# Lab: generate, validate, repair.
import json
`,
    steps: [
      {
        title: "Validate against a schema",
        mode: "guided",
        instructions: "Finish `validate(data, schema)`. `schema` maps field names to Python types, like `{\"name\": str, \"age\": int}`. Return a list of error strings: `\"missing: age\"` for an absent field and `\"wrong type: age\"` for the wrong type. No errors means an empty list.",
        scaffold: String.raw`def validate(data, schema):
    errors = []
    for field, expected in schema.items():
        if field not in data:
            errors.append(f"missing: {field}")
        # TODO: elif the value is not an instance of the expected type, add "wrong type: <field>"
    return errors
`,
        solution: String.raw`def validate(data, schema):
    errors = []
    for field, expected in schema.items():
        if field not in data:
            errors.append(f"missing: {field}")
        elif not isinstance(data[field], expected):
            errors.append(f"wrong type: {field}")
    return errors
`,
        tests: [
          ["valid", String.raw`assert validate({"name": "A", "age": 3}, {"name": str, "age": int}) == []`],
          ["missing", String.raw`assert validate({"name": "A"}, {"name": str, "age": int}) == ["missing: age"]`],
          ["wrong type", String.raw`assert validate({"name": "A", "age": "3"}, {"name": str, "age": int}) == ["wrong type: age"]`],
        ],
        hints: ["Use `isinstance(data[field], expected)` to check the type.", "Add an `elif not isinstance(...)` branch that appends `f\"wrong type: {field}\"`."],
      },
      {
        title: "Pull JSON out of a reply",
        mode: "partial",
        instructions: "Write `extract_json(text)`. Models wrap JSON in prose or code fences. Find the first `{` and the last `}`, parse that slice with `json.loads`, and return the dict. Return `None` if there is no JSON or it does not parse.",
        scaffold: String.raw`def extract_json(text):
    """'Sure! {"a": 1} Hope that helps' -> {'a': 1}; no JSON -> None"""
    pass
`,
        solution: String.raw`def extract_json(text):
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None
`,
        tests: [
          ["bare", String.raw`assert extract_json('{"a": 1}') == {"a": 1}`],
          ["prose around it", String.raw`assert extract_json('Sure! {"a": 1} Hope that helps') == {"a": 1}`],
          ["code fence", String.raw`assert extract_json("\x60\x60\x60json\n{\"a\": [1, 2]}\n\x60\x60\x60") == {"a": [1, 2]}`],
          ["no json", String.raw`assert extract_json("no braces here") is None`],
          ["broken json", String.raw`assert extract_json("{not json}") is None`],
        ],
        hints: ["`text.find(\"{\")` and `text.rfind(\"}\")` give the slice to parse.", "Wrap `json.loads` in `try/except json.JSONDecodeError` and return `None` on failure."],
      },
      {
        title: "The repair loop",
        mode: "open",
        instructions: "Write `generate_validated(model, prompt, schema, max_tries=3)`. `model(prompt)` returns text. Extract the JSON; if it is missing or `validate` reports errors, append a line like `\"Fix these problems: ...\"` (the errors joined with `; `) to the prompt and try again. Return `(data, tries)` on success and `(None, max_tries)` when every try fails. Never call the model more than `max_tries` times.",
        scaffold: "",
        solution: String.raw`def generate_validated(model, prompt, schema, max_tries=3):
    for tries in range(1, max_tries + 1):
        data = extract_json(model(prompt))
        errors = ["no JSON found"] if data is None else validate(data, schema)
        if not errors:
            return data, tries
        prompt += "\nFix these problems: " + "; ".join(errors)
    return None, max_tries
`,
        tests: [
          ["first try works", String.raw`data, n = generate_validated(lambda p: '{"a": 1}', "go", {"a": int})
assert data == {"a": 1} and n == 1`],
          ["repairs after feedback", String.raw`seen = []
def model(p):
    seen.append(p)
    return '{"a": "x"}' if len(seen) == 1 else '{"a": 2}'
data, n = generate_validated(model, "go", {"a": int})
assert data == {"a": 2} and n == 2
assert "wrong type: a" in seen[1]`],
          ["gives up", String.raw`calls = []
def model(p):
    calls.append(p)
    return "nope"
data, n = generate_validated(model, "go", {"a": int}, max_tries=2)
assert data is None and n == 2 and len(calls) == 2`],
        ],
        hints: ["Loop `for tries in range(1, max_tries + 1)`; `extract_json` returns `None` when there is no JSON.", "On failure add the errors to the prompt with `prompt += \"\\nFix these problems: \" + \"; \".join(errors)`."],
      },
    ],
    stretch: ["Check nested fields and lists of items.", "Count how many tries your loop needs over ten sample replies.", "Add a field-level range check, like age between 0 and 120."],
  },
  {
    id: "retry-with-backoff",
    moduleId: "M2.9",
    title: "Retries with backoff",
    goal: "A retry helper that waits longer after each failure, only retries errors worth retrying, and gives up cleanly after a fixed number of attempts.",
    preamble: String.raw`# Lab: retries with exponential backoff.
class RetryableError(Exception):
    """A failure worth trying again: a timeout, a 429, a 503."""
`,
    steps: [
      {
        title: "Backoff delay",
        mode: "guided",
        instructions: "Finish `backoff_delay(attempt, base=0.5, cap=8.0)`. Attempt 0 waits `base` seconds, attempt 1 waits twice that, attempt 2 four times, and so on, but never more than `cap`.",
        scaffold: String.raw`def backoff_delay(attempt, base=0.5, cap=8.0):
    # TODO: base * 2 ** attempt, but no larger than cap
    return 0
`,
        solution: String.raw`def backoff_delay(attempt, base=0.5, cap=8.0):
    return min(cap, base * 2 ** attempt)
`,
        tests: [
          ["doubles", String.raw`assert [backoff_delay(a) for a in range(4)] == [0.5, 1.0, 2.0, 4.0]`],
          ["capped", String.raw`assert backoff_delay(10) == 8.0`],
          ["custom base", String.raw`assert backoff_delay(2, base=1, cap=100) == 4`],
        ],
        hints: ["Doubling each time is `base * 2 ** attempt`.", "`min(cap, ...)` keeps it from growing past the cap."],
      },
      {
        title: "What is worth retrying?",
        mode: "partial",
        instructions: "Write `is_retryable(status)`. Retry `408`, `429` and any `5xx`. Do not retry other `4xx` errors (the request itself is wrong) or successes.",
        scaffold: String.raw`def is_retryable(status):
    """429 -> True, 503 -> True, 404 -> False, 200 -> False"""
    pass
`,
        solution: String.raw`def is_retryable(status):
    return status in (408, 429) or 500 <= status < 600
`,
        tests: [
          ["transient", String.raw`assert is_retryable(429) and is_retryable(503) and is_retryable(408)`],
          ["permanent", String.raw`assert not is_retryable(400) and not is_retryable(404) and not is_retryable(401)`],
          ["success", String.raw`assert not is_retryable(200)`],
        ],
        hints: ["Return a boolean expression, not an `if` chain: `status in (408, 429) or ...`.", "A 5xx check is `500 <= status < 600`."],
      },
      {
        title: "The retry loop",
        mode: "open",
        instructions: "Write `call_with_retries(fn, max_attempts=4, sleep=lambda s: None)`. Call `fn()`. If it raises `RetryableError`, call `sleep(backoff_delay(attempt))` and try again, where `attempt` counts from 0. Any other exception propagates at once. After the last attempt fails, raise the last `RetryableError`. Do not sleep after the final failure. Return the result of the first success.",
        scaffold: "",
        solution: String.raw`def call_with_retries(fn, max_attempts=4, sleep=lambda s: None):
    for attempt in range(max_attempts):
        try:
            return fn()
        except RetryableError:
            if attempt == max_attempts - 1:
                raise
            sleep(backoff_delay(attempt))
`,
        tests: [
          ["succeeds after failures", String.raw`calls, waits = [], []
def flaky():
    calls.append(1)
    if len(calls) < 3:
        raise RetryableError("slow")
    return "ok"
assert call_with_retries(flaky, sleep=waits.append) == "ok"
assert len(calls) == 3 and waits == [0.5, 1.0]`],
          ["gives up and raises", String.raw`waits = []
def down():
    raise RetryableError("down")
try:
    call_with_retries(down, max_attempts=3, sleep=waits.append)
    assert False, "should have raised"
except RetryableError:
    pass
assert waits == [0.5, 1.0]`],
          ["other errors are not retried", String.raw`calls = []
def bad():
    calls.append(1)
    raise ValueError("bug")
try:
    call_with_retries(bad)
    assert False
except ValueError:
    pass
assert len(calls) == 1`],
        ],
        hints: ["Use `for attempt in range(max_attempts)` with `try: return fn()` inside.", "In `except RetryableError:` re-raise with a bare `raise` on the last attempt, otherwise `sleep(backoff_delay(attempt))`."],
      },
    ],
    stretch: ["Add random jitter so many clients do not retry together.", "Stop after a total time budget as well as an attempt count.", "Honour a `Retry-After` value when the server sends one."],
  },
  {
    id: "document-chunker",
    moduleId: "M4.2",
    title: "Build a document chunker",
    goal: "A chunker that splits a document into overlapping pieces with metadata, so a fact on a boundary still lands whole in one chunk and every chunk says where it came from.",
    preamble: String.raw`# Lab: chunking for retrieval.
`,
    steps: [
      {
        title: "Fixed-size chunks",
        mode: "guided",
        instructions: "Finish `chunk_fixed(text, size)`: cut the text into pieces of `size` characters (the last one may be shorter). Notice what this does to words at the cuts.",
        scaffold: String.raw`def chunk_fixed(text, size):
    chunks = []
    # TODO: step through the text size characters at a time and append each slice
    return chunks
`,
        solution: String.raw`def chunk_fixed(text, size):
    chunks = []
    for i in range(0, len(text), size):
        chunks.append(text[i:i + size])
    return chunks
`,
        tests: [
          ["splits evenly", String.raw`assert chunk_fixed("abcdef", 2) == ["ab", "cd", "ef"]`],
          ["short tail", String.raw`assert chunk_fixed("abcdefg", 3) == ["abc", "def", "g"]`],
          ["empty", String.raw`assert chunk_fixed("", 5) == []`],
        ],
        hints: ["`range(0, len(text), size)` gives the start of every chunk.", "Append `text[i:i + size]` for each start `i`."],
      },
      {
        title: "Word chunks with overlap",
        mode: "partial",
        instructions: "Write `chunk_words(text, size, overlap)`. Split on whitespace into words and return chunks of `size` words joined by spaces, where each chunk starts `size - overlap` words after the previous one. Stop once a chunk reaches the end of the text. Raise `ValueError` if `overlap >= size`.",
        scaffold: String.raw`def chunk_words(text, size, overlap):
    """'a b c d e' with size=3, overlap=1 -> ['a b c', 'c d e']"""
    pass
`,
        solution: String.raw`def chunk_words(text, size, overlap):
    if overlap >= size:
        raise ValueError("overlap must be smaller than size")
    words = text.split()
    step = size - overlap
    chunks = []
    for start in range(0, len(words), step):
        chunks.append(" ".join(words[start:start + size]))
        if start + size >= len(words):
            break
    return chunks
`,
        tests: [
          ["overlap", String.raw`assert chunk_words("a b c d e", 3, 1) == ["a b c", "c d e"]`],
          ["no overlap", String.raw`assert chunk_words("a b c d", 2, 0) == ["a b", "c d"]`],
          ["no extra tail chunk", String.raw`assert chunk_words("a b c", 3, 1) == ["a b c"]`],
          ["bad overlap", String.raw`try:
    chunk_words("a b", 2, 2)
    assert False
except ValueError:
    pass`],
        ],
        hints: ["The start of each chunk moves forward by `step = size - overlap` words.", "Break out of the loop when `start + size >= len(words)`, so you do not emit a chunk that is only overlap."],
      },
      {
        title: "Chunks with metadata",
        mode: "open",
        instructions: "Write `make_chunks(text, source, size=8, overlap=2)` that returns a list of dicts with `id` (`\"<source>#<n>\"` counting from 0), `source`, `text` and `start` (the index of the chunk's first word in the document). Use the same windowing as `chunk_words`. A retrieval system uses `source` and `start` to cite where an answer came from.",
        scaffold: "",
        solution: String.raw`def make_chunks(text, source, size=8, overlap=2):
    texts = chunk_words(text, size, overlap)
    step = size - overlap
    return [{"id": f"{source}#{n}", "source": source, "text": t, "start": n * step} for n, t in enumerate(texts)]
`,
        tests: [
          ["shape", String.raw`c = make_chunks("a b c d e", "doc.md", size=3, overlap=1)
assert c == [
    {"id": "doc.md#0", "source": "doc.md", "text": "a b c", "start": 0},
    {"id": "doc.md#1", "source": "doc.md", "text": "c d e", "start": 2},
]`],
          ["start index matches", String.raw`words = ("w%d " % i for i in range(30))
text = "".join(words).split()
c = make_chunks(" ".join(text), "x", size=10, overlap=4)
for ch in c:
    assert ch["text"].split()[0] == text[ch["start"]]`],
        ],
        hints: ["Reuse `chunk_words` for the text of each chunk.", "Chunk number `n` starts at word `n * (size - overlap)`."],
      },
    ],
    stretch: ["Split on paragraph breaks first and only fall back to words for paragraphs that are too long.", "Count tokens instead of words using a rough 4-characters-per-token rule.", "Measure how many chunks a fact spanning 6 words lands whole in, for overlap 0 and overlap 4."],
  },
  {
    id: "semantic-search-mini",
    moduleId: "M4.4",
    title: "Semantic search from scratch",
    goal: "A working search index in about thirty lines: embed documents, compare with cosine similarity and return the top results for a query.",
    preamble: String.raw`# Lab: search from scratch with a toy embedding (word counts).
import math
from collections import Counter
`,
    steps: [
      {
        title: "Embed text",
        mode: "guided",
        instructions: "Finish `embed(text)`. Lower-case the text, split it on whitespace, strip the punctuation `.,?!` from each word, and return a `Counter` of the words. Real embeddings are dense vectors from a neural network, but this has the same job: text in, comparable numbers out.",
        scaffold: String.raw`def embed(text):
    words = []
    for w in text.lower().split():
        # TODO: strip the characters .,?! from both ends of w, and keep it if it is not empty
        pass
    return Counter(words)
`,
        solution: String.raw`def embed(text):
    words = []
    for w in text.lower().split():
        w = w.strip(".,?!")
        if w:
            words.append(w)
    return Counter(words)
`,
        tests: [
          ["counts words", String.raw`assert embed("The cat, the hat.") == Counter({"the": 2, "cat": 1, "hat": 1})`],
          ["ignores bare punctuation", String.raw`assert embed("hi !") == Counter({"hi": 1})`],
        ],
        hints: ["`w.strip(\".,?!\")` removes those characters from both ends.", "Only `words.append(w)` when the stripped word is not empty."],
      },
      {
        title: "Cosine similarity",
        mode: "partial",
        instructions: "Write `cosine(a, b)` for two `Counter` vectors: the dot product over words they share, divided by the product of their lengths (square root of the sum of squares). Return `0.0` if either vector is empty.",
        scaffold: String.raw`def cosine(a, b):
    """identical -> 1.0, nothing in common -> 0.0"""
    pass
`,
        solution: String.raw`def cosine(a, b):
    dot = sum(a[w] * b[w] for w in a if w in b)
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)
`,
        tests: [
          ["identical", String.raw`assert abs(cosine(embed("a b c"), embed("a b c")) - 1.0) < 1e-9`],
          ["nothing shared", String.raw`assert cosine(embed("a b"), embed("c d")) == 0.0`],
          ["partial overlap", String.raw`assert abs(cosine(embed("a b"), embed("a c")) - 0.5) < 1e-9`],
          ["empty", String.raw`assert cosine(embed(""), embed("a")) == 0.0`],
        ],
        hints: ["The dot product only needs words in both: `sum(a[w] * b[w] for w in a if w in b)`.", "Each length is `math.sqrt(sum(v * v for v in x.values()))`."],
      },
      {
        title: "Index and search",
        mode: "open",
        instructions: "Write `build_index(docs)` where `docs` is a dict of id to text, returning a dict of id to embedding, and `search(index, query, k=3)` returning the ids of the `k` most similar documents, best first. Leave out documents with a similarity of `0` so a query never returns unrelated text.",
        scaffold: "",
        solution: String.raw`def build_index(docs):
    return {doc_id: embed(text) for doc_id, text in docs.items()}


def search(index, query, k=3):
    q = embed(query)
    scored = [(cosine(q, vec), doc_id) for doc_id, vec in index.items()]
    scored = [s for s in scored if s[0] > 0]
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [doc_id for _, doc_id in scored[:k]]
`,
        tests: [
          ["ranks the closest first", String.raw`idx = build_index({"d1": "refunds go to the original card", "d2": "shipping is free over fifty dollars", "d3": "reset your password in settings"})
assert search(idx, "how do refunds work", k=1) == ["d1"]`],
          ["respects k", String.raw`idx = build_index({"a": "red apple", "b": "red car", "c": "red sky"})
assert len(search(idx, "red", k=2)) == 2`],
          ["no match means no results", String.raw`idx = build_index({"a": "red apple"})
assert search(idx, "quantum") == []`],
        ],
        hints: ["Score every document, drop the zeros, sort by score high to low.", "Sort with `key=lambda s: (-s[0], s[1])` so ties come out in a stable order."],
      },
    ],
    stretch: ["Remove stop words like the and of before embedding and see which rankings change.", "Weight rare words more (TF-IDF).", "Add a minimum score so weak matches are dropped."],
  },
];
