import type { LabSrc } from "./types";

// More build-along labs for modules that had none (M4.6, M5.5, M7.8, M9.5). See more-a.ts.
export const LABS_MORE_B: LabSrc[] = [
  {
    id: "hybrid-rank-fusion",
    moduleId: "M4.6",
    title: "Hybrid search with rank fusion",
    goal: "Two retrievers, one keyword based and one 'meaning' based, merged with reciprocal rank fusion so a document both like rises to the top.",
    preamble: String.raw`# Lab: hybrid retrieval.
`,
    steps: [
      {
        title: "Keyword ranking",
        mode: "guided",
        instructions: "Finish `keyword_rank(query, docs)`. `docs` is a dict of id to text. Score each document by how many distinct query words it contains (lower-case, split on whitespace). Return the ids with a score above 0, best first, ties broken by id.",
        scaffold: String.raw`def keyword_rank(query, docs):
    q = set(query.lower().split())
    scored = []
    for doc_id, text in docs.items():
        # TODO: score = how many query words appear in the document's words
        score = 0
        if score > 0:
            scored.append((score, doc_id))
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [doc_id for _, doc_id in scored]
`,
        solution: String.raw`def keyword_rank(query, docs):
    q = set(query.lower().split())
    scored = []
    for doc_id, text in docs.items():
        score = len(q & set(text.lower().split()))
        if score > 0:
            scored.append((score, doc_id))
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [doc_id for _, doc_id in scored]
`,
        tests: [
          ["ranks by matches", String.raw`docs = {"a": "red apple pie", "b": "red car", "c": "blue sky"}
assert keyword_rank("red apple", docs) == ["a", "b"]`],
          ["no match", String.raw`assert keyword_rank("zebra", {"a": "red"}) == []`],
        ],
        hints: ["Set intersection counts shared words: `len(q & set(text.lower().split()))`.", "Keep only documents whose score is above zero."],
      },
      {
        title: "Reciprocal rank fusion",
        mode: "partial",
        instructions: "Write `rrf(rankings, k=60)`. `rankings` is a list of ranked id lists. Each id earns `1 / (k + rank)` from every list it appears in, with rank starting at 1. Return the ids sorted by total score, best first (ties by id).",
        scaffold: String.raw`def rrf(rankings, k=60):
    """[['a', 'b'], ['b', 'a']] -> ['a', 'b'] (tie broken by id)"""
    pass
`,
        solution: String.raw`def rrf(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return [d for d, _ in sorted(scores.items(), key=lambda x: (-x[1], x[0]))]
`,
        tests: [
          ["both lists agree", String.raw`assert rrf([["a", "b"], ["a", "c"]]) == ["a", "b", "c"]`],
          ["appearing twice beats appearing once at the top", String.raw`assert rrf([["x", "b"], ["y", "b"]])[0] == "b"`],
          ["tie by id", String.raw`assert rrf([["b", "a"], ["a", "b"]]) == ["a", "b"]`],
        ],
        hints: ["Accumulate into a dict: `scores[doc] = scores.get(doc, 0) + 1 / (k + rank)`.", "`enumerate(ranking, start=1)` gives ranks that start at 1."],
      },
      {
        title: "Put it together",
        mode: "open",
        instructions: "Write `hybrid(query, docs, semantic_ranking, top=3)`. `semantic_ranking` is a ready-made ranked id list (pretend it came from a vector search). Fuse it with `keyword_rank(query, docs)` using `rrf` and return the best `top` ids. Then notice in the tests what each retriever alone would have missed.",
        scaffold: "",
        solution: String.raw`def hybrid(query, docs, semantic_ranking, top=3):
    return rrf([keyword_rank(query, docs), semantic_ranking])[:top]
`,
        tests: [
          ["combines both signals", String.raw`docs = {"d1": "refund policy card", "d2": "money back guarantee", "d3": "shipping times"}
# keyword search only finds d1 (shares 'refund'); the semantic ranking knows d2 means the same thing
assert hybrid("refund", docs, ["d2", "d1", "d3"], top=2) == ["d1", "d2"]`],
          ["respects top", String.raw`docs = {"a": "x", "b": "x", "c": "x"}
assert len(hybrid("x", docs, ["c", "b", "a"], top=2)) == 2`],
        ],
        hints: ["Call `keyword_rank(query, docs)` to get the first ranked list.", "Pass both lists to `rrf([...])` and slice the first `top` ids."],
      },
    ],
    stretch: ["Weight the two retrievers differently.", "Replace `keyword_rank` with BM25.", "Print which ids only one retriever found."],
  },
  {
    id: "agent-memory-store",
    moduleId: "M5.5",
    title: "Build an agent memory",
    goal: "A small long-term memory for an agent: write facts, recall only the relevant ones, update them, and forget the least recently used when it gets full.",
    preamble: String.raw`# Lab: agent memory.
`,
    steps: [
      {
        title: "Remember and forget",
        mode: "guided",
        instructions: "Finish the `Memory` class. `remember(key, value)` stores a fact (overwriting an old value is an update), `get(key)` returns it or `None`, and `forget(key)` removes it quietly even if it is not there.",
        scaffold: String.raw`class Memory:
    def __init__(self):
        self.facts = {}

    def remember(self, key, value):
        # TODO: store the value under the key
        pass

    def get(self, key):
        return self.facts.get(key)

    def forget(self, key):
        # TODO: remove the key if present, no error if it is missing
        pass
`,
        solution: String.raw`class Memory:
    def __init__(self):
        self.facts = {}

    def remember(self, key, value):
        self.facts[key] = value

    def get(self, key):
        return self.facts.get(key)

    def forget(self, key):
        self.facts.pop(key, None)
`,
        tests: [
          ["remember and get", String.raw`m = Memory(); m.remember("city", "Pune"); assert m.get("city") == "Pune"`],
          ["update overwrites", String.raw`m = Memory(); m.remember("city", "Pune"); m.remember("city", "Mumbai"); assert m.get("city") == "Mumbai"`],
          ["forget is quiet", String.raw`m = Memory(); m.remember("a", 1); m.forget("a"); m.forget("a"); assert m.get("a") is None`],
        ],
        hints: ["Storing is `self.facts[key] = value`.", "`self.facts.pop(key, None)` removes without raising when the key is missing."],
      },
      {
        title: "Recall what is relevant",
        mode: "partial",
        instructions: "Add a `recall(query, limit=3)` method to `Memory`. Split the query into lower-case words; a fact matches by the number of query words that appear in its key (split on `_`) or in its value (if it is a string, split on spaces). Return a list of `(key, value)` for the best `limit` matches, best first, leaving out facts with no match. Keep the class from step 1 and add the method to it.",
        scaffold: String.raw`def _recall(self, query, limit=3):
    """Matches by shared words between the query and a fact's key and value."""
    pass

Memory.recall = _recall
`,
        solution: String.raw`def _recall(self, query, limit=3):
    q = set(query.lower().split())
    scored = []
    for key, value in self.facts.items():
        words = set(key.lower().split("_"))
        if isinstance(value, str):
            words |= set(value.lower().split())
        score = len(q & words)
        if score > 0:
            scored.append((score, key, value))
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [(k, v) for _, k, v in scored[:limit]]

Memory.recall = _recall
`,
        tests: [
          ["finds by key", String.raw`m = Memory(); m.remember("favourite_language", "python"); m.remember("home_city", "pune")
assert m.recall("which language do I like") == [("favourite_language", "python")]`],
          ["finds by value", String.raw`m = Memory(); m.remember("home_city", "pune")
assert m.recall("pune weather") == [("home_city", "pune")]`],
          ["nothing relevant", String.raw`m = Memory(); m.remember("a_b", "c")
assert m.recall("zebra") == []`],
          ["limit", String.raw`m = Memory()
for i in range(5): m.remember(f"tag_{i}", "tag")
assert len(m.recall("tag", limit=2)) == 2`],
        ],
        hints: ["Build a set of words from the key (`key.split(\"_\")`) and, for strings, the value.", "Score is the size of the intersection with the query words; sort by `(-score, key)`."],
      },
      {
        title: "Forget the least recently used",
        mode: "open",
        instructions: "Make the memory bounded. Add a `max_items` limit (a new `BoundedMemory(Memory)` class taking `max_items` in `__init__`). Calling `remember`, `get` or `recall` on a fact counts as using it. When a `remember` would take the memory above `max_items`, forget the least recently used fact first. Return values stay the same as `Memory`.",
        scaffold: "",
        solution: String.raw`class BoundedMemory(Memory):
    def __init__(self, max_items):
        super().__init__()
        self.max_items = max_items
        self.clock = 0
        self.used = {}

    def _touch(self, key):
        self.clock += 1
        self.used[key] = self.clock

    def remember(self, key, value):
        if key not in self.facts and len(self.facts) >= self.max_items:
            oldest = min(self.facts, key=lambda k: self.used[k])
            self.forget(oldest)
        super().remember(key, value)
        self._touch(key)

    def get(self, key):
        if key in self.facts:
            self._touch(key)
        return super().get(key)

    def forget(self, key):
        super().forget(key)
        self.used.pop(key, None)

    def recall(self, query, limit=3):
        found = super().recall(query, limit)
        for key, _ in found:
            self._touch(key)
        return found
`,
        tests: [
          ["drops the oldest", String.raw`m = BoundedMemory(2)
m.remember("a", 1); m.remember("b", 2); m.remember("c", 3)
assert m.get("a") is None and m.get("b") == 2 and m.get("c") == 3`],
          ["reading keeps a fact alive", String.raw`m = BoundedMemory(2)
m.remember("a", 1); m.remember("b", 2)
m.get("a")
m.remember("c", 3)
assert m.get("a") == 1 and m.get("b") is None`],
          ["updating does not evict", String.raw`m = BoundedMemory(2)
m.remember("a", 1); m.remember("b", 2); m.remember("a", 9)
assert m.get("a") == 9 and m.get("b") == 2`],
          ["recall counts as use", String.raw`m = BoundedMemory(2)
m.remember("city_pune", "pune"); m.remember("diet", "veg")
m.recall("pune")
m.remember("new", "x")
assert m.get("city_pune") == "pune" and m.get("diet") is None`],
        ],
        hints: ["Keep a counter and a dict `used[key] = counter` that you bump whenever a fact is touched.", "Evict with `min(self.facts, key=lambda k: self.used[k])`, but only when adding a new key to a full memory."],
      },
    ],
    stretch: ["Give facts an expiry time using an injected clock.", "Summarise old facts instead of dropping them.", "Store a confidence with each fact and prefer higher-confidence ones when full."],
  },
  {
    id: "retrieval-metrics",
    moduleId: "M7.8",
    title: "Measure a retriever",
    goal: "The two numbers every RAG evaluation starts with, recall@k and MRR, computed over a small golden set so you can tell if a change helped.",
    preamble: String.raw`# Lab: retrieval metrics.
# A case is {"question": ..., "relevant": the id that should be found, "results": the ids your retriever returned, best first}.
`,
    steps: [
      {
        title: "Hit at k",
        mode: "guided",
        instructions: "Finish `hit_at_k(results, relevant, k)`. Return `True` if `relevant` is among the first `k` results, otherwise `False`.",
        scaffold: String.raw`def hit_at_k(results, relevant, k):
    # TODO: is relevant in the first k results?
    return False
`,
        solution: String.raw`def hit_at_k(results, relevant, k):
    return relevant in results[:k]
`,
        tests: [
          ["found", String.raw`assert hit_at_k(["a", "b", "c"], "b", 2) is True`],
          ["too far down", String.raw`assert hit_at_k(["a", "b", "c"], "c", 2) is False`],
          ["not returned", String.raw`assert hit_at_k(["a"], "z", 5) is False`],
        ],
        hints: ["Slice the list: `results[:k]`.", "Use `in` to test membership: `relevant in results[:k]`."],
      },
      {
        title: "Recall and reciprocal rank",
        mode: "partial",
        instructions: "Write `recall_at_k(cases, k)`: the share of cases where `hit_at_k` is true. Write `mrr(cases)`: the average of `1 / position` of the relevant id in `results` (position starts at 1, and a case where it is not returned counts as 0). Both return `0.0` for an empty list of cases.",
        scaffold: String.raw`def recall_at_k(cases, k):
    pass


def mrr(cases):
    pass
`,
        solution: String.raw`def recall_at_k(cases, k):
    if not cases:
        return 0.0
    return sum(hit_at_k(c["results"], c["relevant"], k) for c in cases) / len(cases)


def mrr(cases):
    if not cases:
        return 0.0
    total = 0.0
    for c in cases:
        if c["relevant"] in c["results"]:
            total += 1 / (c["results"].index(c["relevant"]) + 1)
    return total / len(cases)
`,
        tests: [
          ["recall", String.raw`cases = [{"relevant": "a", "results": ["a", "x"]}, {"relevant": "b", "results": ["x", "b"]}, {"relevant": "c", "results": ["x", "y"]}]
assert abs(recall_at_k(cases, 1) - 1 / 3) < 1e-9
assert abs(recall_at_k(cases, 2) - 2 / 3) < 1e-9`],
          ["mrr", String.raw`cases = [{"relevant": "a", "results": ["a", "x"]}, {"relevant": "b", "results": ["x", "b"]}, {"relevant": "c", "results": ["x", "y"]}]
assert abs(mrr(cases) - (1 + 0.5 + 0) / 3) < 1e-9`],
          ["empty", String.raw`assert recall_at_k([], 3) == 0.0 and mrr([]) == 0.0`],
        ],
        hints: ["`sum(...)` over booleans counts the True ones.", "Position is `results.index(relevant) + 1`, but only when the id is in the list."],
      },
      {
        title: "A report to compare two retrievers",
        mode: "open",
        instructions: "Write `report(cases, ks=(1, 3))` returning a dict like `{\"recall@1\": 0.5, \"recall@3\": 1.0, \"mrr\": 0.75}` with each number rounded to 3 decimals, plus `\"misses\"`: the list of `question` values of the cases that were not found at the largest `k`. The misses are the first thing to read when a score is low.",
        scaffold: "",
        solution: String.raw`def report(cases, ks=(1, 3)):
    out = {f"recall@{k}": round(recall_at_k(cases, k), 3) for k in ks}
    out["mrr"] = round(mrr(cases), 3)
    top = max(ks)
    out["misses"] = [c["question"] for c in cases if not hit_at_k(c["results"], c["relevant"], top)]
    return out
`,
        tests: [
          ["report", String.raw`cases = [
    {"question": "q1", "relevant": "a", "results": ["a", "x", "y"]},
    {"question": "q2", "relevant": "b", "results": ["x", "b", "y"]},
    {"question": "q3", "relevant": "c", "results": ["x", "y", "z"]},
]
r = report(cases)
assert r["recall@1"] == 0.333 and r["recall@3"] == 0.667
assert r["mrr"] == 0.5
assert r["misses"] == ["q3"]`],
          ["no misses", String.raw`r = report([{"question": "q", "relevant": "a", "results": ["a"]}], ks=(1,))
assert r["misses"] == [] and r["recall@1"] == 1.0`],
        ],
        hints: ["Build the recall keys with a dict comprehension: `{f\"recall@{k}\": ... for k in ks}`.", "Misses use the largest `k`: `max(ks)`."],
      },
    ],
    stretch: ["Allow several relevant ids per question and compute precision@k.", "Compare two retrievers on the same cases and print which questions each one wins.", "Add a minimum case count warning, because five cases prove very little."],
  },
  {
    id: "semantic-cache-mini",
    moduleId: "M9.5",
    title: "Build a response cache",
    goal: "A cache for LLM answers that hits on identical questions, then on paraphrases above a similarity threshold, expires old entries, and reports its hit rate.",
    preamble: String.raw`# Lab: an exact then semantic cache.
`,
    steps: [
      {
        title: "Exact cache with counters",
        mode: "guided",
        instructions: "Finish the `Cache` class. `get(question)` returns the stored answer or `None` and counts a hit or a miss. `put(question, answer)` stores it. Normalise the question first (lower-case and stripped) so `\"Hi \"` and `\"hi\"` are the same key.",
        scaffold: String.raw`class Cache:
    def __init__(self):
        self.data = {}
        self.hits = 0
        self.misses = 0

    @staticmethod
    def norm(q):
        # TODO: lower-case and strip the question
        return q

    def get(self, question):
        key = self.norm(question)
        # TODO: count a hit and return the answer if key is stored, otherwise count a miss and return None
        return None

    def put(self, question, answer):
        # TODO: store the answer under the normalised question
        pass
`,
        solution: String.raw`class Cache:
    def __init__(self):
        self.data = {}
        self.hits = 0
        self.misses = 0

    @staticmethod
    def norm(q):
        return q.lower().strip()

    def get(self, question):
        key = self.norm(question)
        if key in self.data:
            self.hits += 1
            return self.data[key]
        self.misses += 1
        return None

    def put(self, question, answer):
        self.data[self.norm(question)] = answer
`,
        tests: [
          ["hit and miss", String.raw`c = Cache(); c.put("Hi ", "hello")
assert c.get("hi") == "hello" and c.get("bye") is None
assert (c.hits, c.misses) == (1, 1)`],
        ],
        hints: ["Normalise with `q.lower().strip()` in `norm`.", "Check `key in self.data`, bump the matching counter, and return `self.data[key]` or `None`."],
      },
      {
        title: "Similar questions",
        mode: "partial",
        instructions: "Write `similarity(a, b)`: the Jaccard similarity of the two questions' word sets (lower-case, split on whitespace, strip `?.,!`). That is shared words divided by all distinct words. Then change `Cache.get` to accept `threshold=1.0` and, when there is no exact key, return the answer of the most similar stored question if its similarity is at least `threshold`.",
        scaffold: String.raw`def similarity(a, b):
    """'reset my password' vs 'reset password' -> 2/3"""
    pass


_exact_get = Cache.get

def _get(self, question, threshold=1.0):
    # TODO: try the exact get first; if it misses, look for a similar stored question
    return _exact_get(self, question)

Cache.get = _get
`,
        solution: String.raw`def similarity(a, b):
    wa = {w.strip("?.,!") for w in a.lower().split()}
    wb = {w.strip("?.,!") for w in b.lower().split()}
    if not wa or not wb:
        return 0.0
    return len(wa & wb) / len(wa | wb)


_exact_get = Cache.get

def _get(self, question, threshold=1.0):
    key = self.norm(question)
    if key in self.data:
        return _exact_get(self, question)
    best, best_score = None, 0.0
    for stored in self.data:
        score = similarity(key, stored)
        if score > best_score:
            best, best_score = stored, score
    if best is not None and best_score >= threshold:
        self.hits += 1
        return self.data[best]
    self.misses += 1
    return None

Cache.get = _get
`,
        tests: [
          ["jaccard", String.raw`assert abs(similarity("reset my password", "reset password") - 2 / 3) < 1e-9
assert similarity("a b", "c d") == 0.0`],
          ["exact still works", String.raw`c = Cache(); c.put("how do I reset my password", "use the link")
assert c.get("How do I reset my password") == "use the link"`],
          ["paraphrase hits above the threshold", String.raw`c = Cache(); c.put("how do I reset my password", "use the link")
assert c.get("how can I reset my password?", threshold=0.6) == "use the link"`],
          ["unrelated misses", String.raw`c = Cache(); c.put("how do I reset my password", "use the link")
assert c.get("what is your refund policy", threshold=0.6) is None
assert c.misses == 1 and c.hits == 0`],
          ["default threshold is exact only", String.raw`c = Cache(); c.put("reset my password", "use the link")
assert c.get("reset password") is None`],
        ],
        hints: ["Jaccard is `len(wa & wb) / len(wa | wb)` on two sets of cleaned words.", "Loop over `self.data`, remember the best score, and only use it when `best_score >= threshold`."],
      },
      {
        title: "Expiry and hit rate",
        mode: "open",
        instructions: "Write `TTLCache(Cache)` taking `ttl` seconds and a `now` function (default `time.time`, so tests can pass a fake clock). Entries older than `ttl` seconds must not be returned (count it as a miss) and should be removed. Also add `hit_rate()` returning `hits / (hits + misses)`, or `0.0` before any lookup. Import `time` yourself.",
        scaffold: "",
        solution: String.raw`import time


class TTLCache(Cache):
    def __init__(self, ttl, now=time.time):
        super().__init__()
        self.ttl = ttl
        self.now = now
        self.stamps = {}

    def put(self, question, answer):
        super().put(question, answer)
        self.stamps[self.norm(question)] = self.now()

    def get(self, question, threshold=1.0):
        for key in [k for k, t in self.stamps.items() if self.now() - t > self.ttl]:
            self.data.pop(key, None)
            self.stamps.pop(key, None)
        return super().get(question, threshold)

    def hit_rate(self):
        total = self.hits + self.misses
        return self.hits / total if total else 0.0
`,
        tests: [
          ["expires old entries", String.raw`t = [0.0]
c = TTLCache(10, now=lambda: t[0])
c.put("hi", "hello")
assert c.get("hi") == "hello"
t[0] = 11.0
assert c.get("hi") is None`],
          ["hit rate", String.raw`t = [0.0]
c = TTLCache(10, now=lambda: t[0])
assert c.hit_rate() == 0.0
c.put("hi", "hello")
c.get("hi"); c.get("hi"); c.get("nope")
assert abs(c.hit_rate() - 2 / 3) < 1e-9`],
          ["fresh entry survives", String.raw`t = [0.0]
c = TTLCache(10, now=lambda: t[0])
c.put("hi", "hello")
t[0] = 9.0
assert c.get("hi") == "hello"`],
        ],
        hints: ["Store a timestamp per key in `put`, using `self.now()`.", "At the start of `get`, delete every key whose age is greater than `ttl`, then call `super().get(...)`."],
      },
    ],
    stretch: ["Never cache answers that depend on the user or on fresh data.", "Cap the cache size and evict the least recently used.", "Log which paraphrases hit, to tune the threshold."],
  },
];
