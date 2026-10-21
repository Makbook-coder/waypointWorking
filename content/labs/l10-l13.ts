import type { LabSrc } from "./types";

export const LABS_L10_L13: LabSrc[] = [
  {
    id: "canary-monitor",
    moduleId: "M10.9",
    title: "Monitor a release and decide: promote or roll back",
    goal: "The monitoring side of LLMOps in miniature: record request metrics, compute latency percentiles, check them against SLOs, and compare a canary version with the stable one to decide whether to promote it.",
    preamble: `# Lab: metrics, SLOs and a canary decision.
import math
`,
    steps: [
      {
        title: "Record request metrics",
        mode: "guided",
        instructions:
          "Finish `Metrics.record(latency_ms, ok, cost=0.0)` and `Metrics.error_rate()`. Keep every latency in a list, count requests and errors, and add up cost. The error rate is errors / requests (0.0 with no requests).",
        scaffold: `class Metrics:
    def __init__(self):
        self.latencies = []
        self.requests = 0
        self.errors = 0
        self.cost = 0.0

    def record(self, latency_ms, ok, cost=0.0):
        # TODO: update latencies, requests, errors and cost
        pass

    def error_rate(self):
        # TODO: errors / requests, or 0.0 with no requests
        return 0.0
`,
        solution: `class Metrics:
    def __init__(self):
        self.latencies = []
        self.requests = 0
        self.errors = 0
        self.cost = 0.0

    def record(self, latency_ms, ok, cost=0.0):
        self.latencies.append(latency_ms)
        self.requests += 1
        self.errors += 0 if ok else 1
        self.cost += cost

    def error_rate(self):
        return self.errors / self.requests if self.requests else 0.0
`,
        tests: [
          ["counts", "m = Metrics()\nm.record(100, True, 0.01)\nm.record(300, False, 0.02)\nassert (m.requests, m.errors, round(m.cost, 2)) == (2, 1, 0.03)"],
          ["error rate", "m = Metrics()\nfor ok in [True, True, True, False]:\n    m.record(1, ok)\nassert m.error_rate() == 0.25"],
          ["empty", "assert Metrics().error_rate() == 0.0"],
        ],
        hints: [
          "`record` changes four things: append the latency, add 1 to requests, add 1 to errors when `ok` is False, and add the cost.",
          "`error_rate` is `self.errors / self.requests if self.requests else 0.0`.",
        ],
      },
      {
        title: "Latency percentiles",
        mode: "guided",
        instructions:
          "Averages hide slow requests, so monitor percentiles. Finish `percentile(values, p)` using the nearest-rank method: sort the values and take the one at rank `ceil(p / 100 * n)` (1-based). Return 0 for an empty list.",
        scaffold: `def percentile(values, p):
    if not values:
        return 0
    ordered = sorted(values)
    rank = 1  # TODO: math.ceil(p / 100 * len(ordered)), at least 1
    return ordered[rank - 1]
`,
        solution: `def percentile(values, p):
    if not values:
        return 0
    ordered = sorted(values)
    rank = max(1, math.ceil(p / 100 * len(ordered)))
    return ordered[rank - 1]
`,
        tests: [
          ["p50", "assert percentile([5, 1, 3, 2, 4], 50) == 3"],
          ["p95 catches the slow tail", "assert percentile([100] * 19 + [2000], 95) == 100 and percentile([100] * 18 + [2000, 2000], 95) == 2000"],
          ["p100 is the max", "assert percentile([3, 9, 1], 100) == 9"],
        ],
        hints: [
          "Nearest rank is `math.ceil(p / 100 * n)`. For p50 of 5 values that is `ceil(2.5) = 3`, the third smallest.",
          "Wrap it in `max(1, ...)` so a tiny p never gives rank 0, then index with `rank - 1` because lists start at 0.",
        ],
      },
      {
        title: "Check SLOs",
        mode: "partial",
        instructions:
          "Write `check_slo(metrics, max_error_rate=0.02, max_p95_ms=2000, min_requests=50)` returning a sorted list of breaches: `\"errors\"` if the error rate is above the limit, `\"latency\"` if p95 is above the limit. With fewer than `min_requests` requests, return `[\"insufficient data\"]` instead, because a decision on five requests is noise.",
        scaffold: `def check_slo(metrics, max_error_rate=0.02, max_p95_ms=2000, min_requests=50):
    """Sorted list of breaches, or ["insufficient data"]."""
    # your code here
`,
        solution: `def check_slo(metrics, max_error_rate=0.02, max_p95_ms=2000, min_requests=50):
    if metrics.requests < min_requests:
        return ["insufficient data"]
    breaches = []
    if metrics.error_rate() > max_error_rate:
        breaches.append("errors")
    if percentile(metrics.latencies, 95) > max_p95_ms:
        breaches.append("latency")
    return sorted(breaches)
`,
        tests: [
          ["healthy", "m = Metrics()\nfor _ in range(100):\n    m.record(500, True)\nassert check_slo(m) == []"],
          ["both breached", "m = Metrics()\nfor i in range(100):\n    m.record(3000 if i % 10 == 0 else 500, i % 20 != 0)\nassert check_slo(m) == ['errors', 'latency']"],
          ["too few requests", "m = Metrics()\nm.record(9000, False)\nassert check_slo(m) == ['insufficient data']"],
        ],
        hints: [
          "Check the request count first and return early. Then build a list and append `\"errors\"` and/or `\"latency\"`.",
          "Use your own pieces: `metrics.error_rate()` and `percentile(metrics.latencies, 95)`.",
        ],
      },
      {
        title: "Canary decision",
        mode: "open",
        instructions:
          "Write `canary_decision(stable, canary, max_regression=0.2)` taking two `Metrics`. Return `\"wait\"` if the canary breaches SLOs with insufficient data, `\"rollback\"` if the canary breaches any SLO or its p95 or cost per request is more than `max_regression` (20%) worse than stable's, and `\"promote\"` otherwise. Cost per request is cost / requests.",
        scaffold: "",
        solution: `def canary_decision(stable, canary, max_regression=0.2):
    breaches = check_slo(canary)
    if breaches == ["insufficient data"]:
        return "wait"
    if breaches:
        return "rollback"
    worse = lambda new, old: old > 0 and new > old * (1 + max_regression)
    if worse(percentile(canary.latencies, 95), percentile(stable.latencies, 95)):
        return "rollback"
    per = lambda m: m.cost / m.requests if m.requests else 0.0
    if worse(per(canary), per(stable)):
        return "rollback"
    return "promote"
`,
        tests: [
          ["promotes a good canary", "s, c = Metrics(), Metrics()\nfor _ in range(100):\n    s.record(800, True, 0.01)\n    c.record(700, True, 0.01)\nassert canary_decision(s, c) == 'promote'"],
          ["rolls back a slower canary", "s, c = Metrics(), Metrics()\nfor _ in range(100):\n    s.record(800, True, 0.01)\n    c.record(1100, True, 0.01)\nassert canary_decision(s, c) == 'rollback'"],
          ["rolls back a pricier canary", "s, c = Metrics(), Metrics()\nfor _ in range(100):\n    s.record(800, True, 0.01)\n    c.record(800, True, 0.02)\nassert canary_decision(s, c) == 'rollback'"],
          ["waits for data", "s, c = Metrics(), Metrics()\ns.record(800, True)\nc.record(800, True)\nassert canary_decision(s, c) == 'wait'"],
        ],
        hints: [
          "Start from `check_slo(canary)`: insufficient data means wait, any other breach means roll back.",
          "Then compare canary with stable on p95 and on cost per request. \"More than 20% worse\" is `new > old * 1.2`.",
        ],
      },
    ],
    stretch: [
      "Add an online quality signal (thumbs up/down rate) to the canary decision.",
      "Export these metrics in Prometheus text format.",
      "Write the runbook entry for what a human does when the decision is rollback.",
    ],
  },
  {
    id: "capacity-planner",
    moduleId: "M11.5",
    title: "Plan capacity and pick a pricing model",
    goal: "Work out what an LLM feature will cost per month on pay-per-token versus provisioned capacity, where the break-even point is, and how many provisioned units you'd need for peak traffic. These are the numbers a platform team will ask you for.",
    preamble: `# Lab: capacity and cost planning.
# Prices are made up; plug in your provider's real ones.
import math
`,
    steps: [
      {
        title: "Cost per request",
        mode: "guided",
        instructions:
          "Finish `request_cost(tokens_in, tokens_out, price_in, price_out)` with prices in dollars per million tokens, and `monthly_on_demand(requests_per_day, tokens_in, tokens_out, price_in, price_out, days=30)`. Round both to 4 decimals.",
        scaffold: `def request_cost(tokens_in, tokens_out, price_in, price_out):
    # TODO: (tokens_in * price_in + tokens_out * price_out) / 1_000_000, rounded to 4 decimals
    return 0.0


def monthly_on_demand(requests_per_day, tokens_in, tokens_out, price_in, price_out, days=30):
    per = (tokens_in * price_in + tokens_out * price_out) / 1_000_000
    # TODO: multiply by requests per day and days, round to 4 decimals
    return 0.0
`,
        solution: `def request_cost(tokens_in, tokens_out, price_in, price_out):
    return round((tokens_in * price_in + tokens_out * price_out) / 1_000_000, 4)


def monthly_on_demand(requests_per_day, tokens_in, tokens_out, price_in, price_out, days=30):
    per = (tokens_in * price_in + tokens_out * price_out) / 1_000_000
    return round(per * requests_per_day * days, 4)
`,
        tests: [
          ["one request", "assert request_cost(2000, 500, 3.0, 15.0) == 0.0135"],
          ["a month", "assert monthly_on_demand(10_000, 2000, 500, 3.0, 15.0) == 4050.0"],
        ],
        hints: [
          "Prices are per million tokens, so divide by 1,000,000 after multiplying tokens by price.",
          "For the month, multiply the per-request cost by requests per day and by days. Don't round before multiplying.",
        ],
      },
      {
        title: "Provisioned cost and units",
        mode: "guided",
        instructions:
          "Provisioned capacity is billed per unit per hour whether you use it or not. Finish `units_needed(peak_tokens_per_min, tokens_per_min_per_unit)` (round up, at least 1) and `monthly_provisioned(units, hourly_price, hours=730)` rounded to 2 decimals.",
        scaffold: `def units_needed(peak_tokens_per_min, tokens_per_min_per_unit):
    # TODO: round up peak / per-unit, and never return less than 1
    return 1


def monthly_provisioned(units, hourly_price, hours=730):
    # TODO: units * hourly_price * hours, rounded to 2 decimals
    return 0.0
`,
        solution: `def units_needed(peak_tokens_per_min, tokens_per_min_per_unit):
    return max(1, math.ceil(peak_tokens_per_min / tokens_per_min_per_unit))


def monthly_provisioned(units, hourly_price, hours=730):
    return round(units * hourly_price * hours, 2)
`,
        tests: [
          ["rounds units up", "assert units_needed(250_000, 100_000) == 3"],
          ["at least one", "assert units_needed(10, 100_000) == 1"],
          ["monthly", "assert monthly_provisioned(2, 5.0) == 7300.0"],
        ],
        hints: [
          "`math.ceil(peak / per_unit)` rounds up, because 2.5 units isn't something you can buy.",
          "Wrap it in `max(1, ...)`. The monthly cost is a straight multiplication of units, hourly price and hours.",
        ],
      },
      {
        title: "Break-even volume",
        mode: "partial",
        instructions:
          "Write `break_even_requests_per_day(units, hourly_price, tokens_in, tokens_out, price_in, price_out, days=30, hours=730)`: the number of requests per day at which on-demand costs as much as the provisioned units. Round up to a whole request. Below that volume, on-demand is cheaper.",
        scaffold: `def break_even_requests_per_day(units, hourly_price, tokens_in, tokens_out, price_in, price_out, days=30, hours=730):
    """Requests per day where on-demand cost equals provisioned cost (rounded up)."""
    # your code here
`,
        solution: `def break_even_requests_per_day(units, hourly_price, tokens_in, tokens_out, price_in, price_out, days=30, hours=730):
    fixed = units * hourly_price * hours
    per = (tokens_in * price_in + tokens_out * price_out) / 1_000_000
    return math.ceil(fixed / (per * days))
`,
        tests: [
          ["break-even point", "assert break_even_requests_per_day(2, 5.0, 2000, 500, 3.0, 15.0) == 18025"],
          ["checks out against both formulas", "n = break_even_requests_per_day(1, 4.0, 1000, 200, 2.0, 8.0)\nassert monthly_on_demand(n, 1000, 200, 2.0, 8.0) >= monthly_provisioned(1, 4.0) > monthly_on_demand(n - 1, 1000, 200, 2.0, 8.0)"],
        ],
        hints: [
          "Set the two monthly costs equal: `requests × per_request × days = units × hourly × hours`, and solve for requests.",
          "So `requests = fixed / (per_request × days)`, rounded up with `math.ceil`.",
        ],
      },
      {
        title: "Recommend a plan",
        mode: "open",
        instructions:
          "Write `recommend(profile, prices)`. `profile` has `requests_per_day`, `tokens_in`, `tokens_out`, `peak_tokens_per_min`. `prices` has `price_in`, `price_out`, `unit_hourly`, `tokens_per_min_per_unit` and `on_demand_tpm_quota`. Return `{\"plan\", \"monthly\", \"units\", \"note\"}`. Use provisioned when it's cheaper, or when peak traffic exceeds the on-demand quota (note `\"peak exceeds on-demand quota\"`); otherwise on-demand (units 0, note `\"\"`). For provisioned without a quota problem, the note is `\"cheaper at this volume\"`. `monthly` is the chosen plan's cost.",
        scaffold: "",
        solution: `def recommend(profile, prices):
    od = monthly_on_demand(profile["requests_per_day"], profile["tokens_in"], profile["tokens_out"], prices["price_in"], prices["price_out"])
    units = units_needed(profile["peak_tokens_per_min"], prices["tokens_per_min_per_unit"])
    pv = monthly_provisioned(units, prices["unit_hourly"])
    if profile["peak_tokens_per_min"] > prices["on_demand_tpm_quota"]:
        return {"plan": "provisioned", "monthly": pv, "units": units, "note": "peak exceeds on-demand quota"}
    if pv < od:
        return {"plan": "provisioned", "monthly": pv, "units": units, "note": "cheaper at this volume"}
    return {"plan": "on-demand", "monthly": od, "units": 0, "note": ""}
`,
        tests: [
          [
            "small apps stay on-demand",
            "prices = {'price_in': 3.0, 'price_out': 15.0, 'unit_hourly': 5.0, 'tokens_per_min_per_unit': 100_000, 'on_demand_tpm_quota': 400_000}\nprofile = {'requests_per_day': 2000, 'tokens_in': 2000, 'tokens_out': 500, 'peak_tokens_per_min': 50_000}\nassert recommend(profile, prices) == {'plan': 'on-demand', 'monthly': 810.0, 'units': 0, 'note': ''}",
          ],
          [
            "high volume goes provisioned",
            "prices = {'price_in': 3.0, 'price_out': 15.0, 'unit_hourly': 5.0, 'tokens_per_min_per_unit': 100_000, 'on_demand_tpm_quota': 400_000}\nprofile = {'requests_per_day': 50_000, 'tokens_in': 2000, 'tokens_out': 500, 'peak_tokens_per_min': 150_000}\nassert recommend(profile, prices) == {'plan': 'provisioned', 'monthly': 7300.0, 'units': 2, 'note': 'cheaper at this volume'}",
          ],
          [
            "bursty traffic needs capacity",
            "prices = {'price_in': 3.0, 'price_out': 15.0, 'unit_hourly': 5.0, 'tokens_per_min_per_unit': 100_000, 'on_demand_tpm_quota': 400_000}\nprofile = {'requests_per_day': 1000, 'tokens_in': 2000, 'tokens_out': 500, 'peak_tokens_per_min': 600_000}\nr = recommend(profile, prices)\nassert r['plan'] == 'provisioned' and r['units'] == 6 and r['note'] == 'peak exceeds on-demand quota'",
          ],
        ],
        hints: [
          "Compute both monthly costs and the units up front with the functions you already wrote.",
          "Check the quota first, because a plan that can't serve your peak is wrong however cheap it is. Then compare costs.",
        ],
      },
    ],
    stretch: [
      "Add a mix: provisioned for the baseline load and on-demand for bursts.",
      "Attribute the monthly cost to tenants by their share of tokens.",
      "Add a budget alert at 80% of the monthly figure.",
    ],
  },
  {
    id: "cross-modal-search",
    moduleId: "M12.9",
    title: "Build and evaluate cross-modal search",
    goal: "Search a mixed collection of images, audio and text through one shared embedding space, fall back to caption keywords, fuse both rankings, and measure which approach finds the right items on your own labelled queries.",
    preamble: `# Lab: cross-modal search.
# Vectors are given (as if from a CLIP-style model); captions come with each item.
import math
`,
    steps: [
      {
        title: "Normalize and compare vectors",
        mode: "guided",
        instructions:
          "Finish `normalize(v)` (divide by the vector's length; a zero vector stays zero) and `similarity(a, b)` (the dot product of the two normalized vectors, which is cosine similarity).",
        scaffold: `def normalize(v):
    n = math.sqrt(sum(x * x for x in v))
    # TODO: return v divided by n, or v unchanged if n is 0


def similarity(a, b):
    # TODO: dot product of normalize(a) and normalize(b)
    return 0.0
`,
        solution: `def normalize(v):
    n = math.sqrt(sum(x * x for x in v))
    return [x / n for x in v] if n else list(v)


def similarity(a, b):
    return sum(x * y for x, y in zip(normalize(a), normalize(b)))
`,
        tests: [
          ["unit length", "assert normalize([3, 4]) == [0.6, 0.8]"],
          ["zero vector", "assert normalize([0, 0]) == [0, 0]"],
          ["cosine", "assert abs(similarity([1, 0], [5, 0]) - 1) < 1e-9 and abs(similarity([1, 0], [0, 2])) < 1e-9"],
        ],
        hints: [
          "`[x / n for x in v]` divides each element. Guard `n == 0` so you never divide by zero.",
          "Once both vectors have length 1, their dot product is the cosine: `sum(x * y for x, y in zip(...))`.",
        ],
      },
      {
        title: "Search the shared space",
        mode: "guided",
        instructions:
          "Finish `vector_search(query_vec, items, k=3, modality=None)`. Each item is `{\"id\", \"modality\", \"vec\", \"caption\"}`. Score every item (optionally only those with the given modality), and return the ids of the top `k`, best first, ties by id.",
        scaffold: `def vector_search(query_vec, items, k=3, modality=None):
    pool = [it for it in items if modality is None or it["modality"] == modality]
    scored = [(similarity(query_vec, it["vec"]), it["id"]) for it in pool]
    # TODO: sort by score (highest first), then id, and return the top k ids
    return []
`,
        solution: `def vector_search(query_vec, items, k=3, modality=None):
    pool = [it for it in items if modality is None or it["modality"] == modality]
    scored = [(similarity(query_vec, it["vec"]), it["id"]) for it in pool]
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [i for _, i in scored[:k]]
`,
        tests: [
          [
            "finds across modalities",
            "items = [{'id': 'img-dog', 'modality': 'image', 'vec': [0.9, 0.1, 0], 'caption': 'a dog on a beach'}, {'id': 'aud-bark', 'modality': 'audio', 'vec': [0.8, 0.2, 0.1], 'caption': 'dog barking'}, {'id': 'txt-tax', 'modality': 'text', 'vec': [0, 0.1, 0.9], 'caption': 'tax form guide'}]\nassert vector_search([1, 0, 0], items, k=2) == ['img-dog', 'aud-bark']",
          ],
          ["filters by modality", "items = [{'id': 'a', 'modality': 'image', 'vec': [1, 0], 'caption': ''}, {'id': 'b', 'modality': 'audio', 'vec': [1, 0], 'caption': ''}]\nassert vector_search([1, 0], items, modality='audio') == ['b']"],
        ],
        hints: [
          "Sort with `key=lambda s: (-s[0], s[1])`: negative score so the highest comes first, then id for ties.",
          "Return only the ids of the first `k`: `[i for _, i in scored[:k]]`.",
        ],
      },
      {
        title: "Caption keywords and fusion",
        mode: "partial",
        instructions:
          "Shared embeddings miss exact terms like product codes. Write `caption_search(query_text, items, k=3)` scoring items by the number of query words (lowercase) in their caption, dropping zero scores, top `k` ids with ties by id. Then write `fuse(rankings, k=60)`: reciprocal rank fusion, where each id scores the sum of `1 / (k + rank)` over the lists (rank starts at 1), sorted by score then id.",
        scaffold: `def caption_search(query_text, items, k=3):
    """Ids of the items whose captions share the most words with the query."""
    # your code here


def fuse(rankings, k=60):
    """Reciprocal rank fusion of several ranked id lists."""
    # your code here
`,
        solution: `def caption_search(query_text, items, k=3):
    q = set(query_text.lower().split())
    scored = [(len(q & set(it["caption"].lower().split())), it["id"]) for it in items]
    scored = [s for s in scored if s[0] > 0]
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [i for _, i in scored[:k]]


def fuse(rankings, k=60):
    scores = {}
    for ranking in rankings:
        for rank, i in enumerate(ranking, start=1):
            scores[i] = scores.get(i, 0.0) + 1 / (k + rank)
    return sorted(scores, key=lambda i: (-scores[i], i))
`,
        tests: [
          ["keyword search", "items = [{'id': 'a', 'modality': 'image', 'vec': [1], 'caption': 'Invoice INV-2041 scan'}, {'id': 'b', 'modality': 'image', 'vec': [1], 'caption': 'a cat'}]\nassert caption_search('find inv-2041', items) == ['a']"],
          ["fusion rewards agreement", "assert fuse([['a', 'b', 'c'], ['b', 'a', 'd']])[:2] == ['a', 'b'] and fuse([['x'], ['y', 'x']])[0] == 'x'"],
        ],
        hints: [
          "For captions, turn the query and each caption into sets of lowercase words and score by the size of their intersection.",
          "For fusion, loop over each ranking with `enumerate(ranking, start=1)` and add `1 / (k + rank)` to that id's score.",
        ],
      },
      {
        title: "Evaluate on your own collection",
        mode: "open",
        instructions:
          "Write `evaluate(queries, items, k=3)`. Each query is `{\"text\", \"vec\", \"relevant\": set of ids}`. For three methods (`\"vector\"`, `\"caption\"`, `\"fused\"` = `fuse` of the other two), compute recall@k averaged over queries, rounded to 2 decimals. Return a dict method → recall, and add `\"best\"`: the method with the highest recall (ties in the order vector, caption, fused).",
        scaffold: "",
        solution: `def evaluate(queries, items, k=3):
    def recall(found, relevant):
        return len(set(found[:k]) & relevant) / len(relevant) if relevant else 0.0

    totals = {"vector": 0.0, "caption": 0.0, "fused": 0.0}
    for q in queries:
        v = vector_search(q["vec"], items, k=len(items))
        c = caption_search(q["text"], items, k=len(items))
        totals["vector"] += recall(v, q["relevant"])
        totals["caption"] += recall(c, q["relevant"])
        totals["fused"] += recall(fuse([v[:k], c[:k]]), q["relevant"])
    n = len(queries) or 1
    out = {m: round(t / n, 2) for m, t in totals.items()}
    out["best"] = max(["vector", "caption", "fused"], key=lambda m: out[m])
    return out
`,
        tests: [
          [
            "fused wins when each method misses something",
            "items = [\n  {'id': 'inv', 'modality': 'image', 'vec': [0, 0, 1], 'caption': 'invoice INV-2041'},\n  {'id': 'dog', 'modality': 'image', 'vec': [1, 0, 0], 'caption': 'photo'},\n  {'id': 'bark', 'modality': 'audio', 'vec': [0.9, 0.1, 0], 'caption': 'clip'},\n  {'id': 'misc', 'modality': 'text', 'vec': [0, 1, 0], 'caption': 'notes'},\n]\nqueries = [\n  {'text': 'a dog', 'vec': [1, 0, 0], 'relevant': {'dog', 'bark'}},\n  {'text': 'INV-2041', 'vec': [0, 1, 0], 'relevant': {'inv'}},\n]\nr = evaluate(queries, items, k=2)\nassert r == {'vector': 0.5, 'caption': 0.5, 'fused': 1.0, 'best': 'fused'}",
          ],
        ],
        hints: [
          "Write a small `recall(found, relevant)` helper: the share of relevant ids that appear in the first `k` found.",
          "For each query, get the full vector and caption rankings, then fuse their top `k`. Average each method's recall over the queries and pick the best with `max(..., key=...)`.",
        ],
      },
    ],
    stretch: [
      "Use a real CLIP model to embed ten of your own photos and five text queries.",
      "Add a caption-then-search pipeline: caption each image with a vision model, then use text embeddings.",
      "Find a query where cross-modal search fails, and write down why.",
    ],
  },
  {
    id: "finetune-data",
    moduleId: "M13.2",
    title: "Prepare a clean fine-tuning dataset",
    goal: "Turn messy examples into a training set you can trust: normalize and deduplicate, filter bad rows, format as chat messages, and split train and test without leaks. Most fine-tuning failures start here, not in the training run.",
    preamble: `# Lab: preparing a fine-tuning dataset.
# Each raw example is {"prompt": ..., "response": ...}.
import hashlib
import json
`,
    steps: [
      {
        title: "Normalize and deduplicate",
        mode: "guided",
        instructions:
          "Finish `norm(text)` (lowercase, collapse whitespace, strip) and `dedupe(examples)`: keep the first example for each normalized prompt and drop the rest. Return the kept examples in their original order.",
        scaffold: `def norm(text):
    # TODO: lowercase, collapse whitespace to single spaces, strip
    return text


def dedupe(examples):
    seen, out = set(), []
    for ex in examples:
        key = norm(ex["prompt"])
        # TODO: keep ex only if key hasn't been seen, and remember key
    return out
`,
        solution: `def norm(text):
    return " ".join(text.lower().split())


def dedupe(examples):
    seen, out = set(), []
    for ex in examples:
        key = norm(ex["prompt"])
        if key in seen:
            continue
        seen.add(key)
        out.append(ex)
    return out
`,
        tests: [
          ["normalizes", "assert norm('  Hello\\n  World ') == 'hello world'"],
          ["drops near-duplicates", "ex = [{'prompt': 'Reset password?', 'response': 'a'}, {'prompt': 'reset  password?', 'response': 'b'}, {'prompt': 'Cancel order', 'response': 'c'}]\nassert [e['response'] for e in dedupe(ex)] == ['a', 'c']"],
        ],
        hints: [
          "`\" \".join(text.lower().split())` lowercases and collapses all whitespace in one go.",
          "In the loop, skip with `continue` if `key in seen`; otherwise add the key to `seen` and append the example.",
        ],
      },
      {
        title: "Filter bad rows",
        mode: "guided",
        instructions:
          "Finish `quality_issues(ex, max_words=300)` returning a list of problems: `\"empty\"` if the prompt or response is blank, `\"too long\"` if the response has more than `max_words` words, and `\"refusal\"` if the response starts with \"I'm sorry\" or \"As an AI\" (case-insensitive). Then `clean(examples)` keeps only examples with no issues.",
        scaffold: `REFUSALS = ("i'm sorry", "as an ai")

def quality_issues(ex, max_words=300):
    issues = []
    if not ex["prompt"].strip() or not ex["response"].strip():
        issues.append("empty")
    # TODO: "too long" when the response has more than max_words words
    # TODO: "refusal" when the lowercased, stripped response starts with one of REFUSALS
    return issues


def clean(examples):
    # TODO: keep examples with no issues
    return examples
`,
        solution: `REFUSALS = ("i'm sorry", "as an ai")

def quality_issues(ex, max_words=300):
    issues = []
    if not ex["prompt"].strip() or not ex["response"].strip():
        issues.append("empty")
    if len(ex["response"].split()) > max_words:
        issues.append("too long")
    if ex["response"].strip().lower().startswith(REFUSALS):
        issues.append("refusal")
    return issues


def clean(examples):
    return [ex for ex in examples if not quality_issues(ex)]
`,
        tests: [
          ["finds issues", "assert quality_issues({'prompt': 'q', 'response': \"I'm sorry, I can't help\"}) == ['refusal']\nassert quality_issues({'prompt': '', 'response': 'ok'}) == ['empty']\nassert quality_issues({'prompt': 'q', 'response': 'word ' * 301}) == ['too long']"],
          ["clean keeps good rows", "ex = [{'prompt': 'q', 'response': 'Go to Settings.'}, {'prompt': 'q2', 'response': 'As an AI, I cannot'}]\nassert clean(ex) == [ex[0]]"],
        ],
        hints: [
          "`len(ex[\"response\"].split())` is the word count. `str.startswith` accepts a tuple, so `REFUSALS` works directly.",
          "`clean` is one line: keep `ex` when `quality_issues(ex)` is an empty list, which is falsy.",
        ],
      },
      {
        title: "Format as chat JSONL",
        mode: "partial",
        instructions:
          "Write `to_jsonl(examples, system)` returning a string with one JSON object per line, each `{\"messages\": [{\"role\": \"system\", ...}, {\"role\": \"user\", ...}, {\"role\": \"assistant\", ...}]}`, with the prompt and response stripped. End with a newline. This is the shape most fine-tuning APIs and TRL expect.",
        scaffold: `def to_jsonl(examples, system):
    """One {"messages": [...]} JSON object per line."""
    # your code here
`,
        solution: `def to_jsonl(examples, system):
    lines = []
    for ex in examples:
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": ex["prompt"].strip()},
            {"role": "assistant", "content": ex["response"].strip()},
        ]
        lines.append(json.dumps({"messages": messages}))
    return "\\n".join(lines) + "\\n" if lines else ""
`,
        tests: [
          [
            "one object per line",
            "out = to_jsonl([{'prompt': ' Hi ', 'response': 'Hello! '}, {'prompt': 'Bye', 'response': 'See you'}], 'Be brief.')\nrows = [json.loads(l) for l in out.strip().split('\\n')]\nassert len(rows) == 2 and out.endswith('\\n')\nassert rows[0]['messages'] == [{'role': 'system', 'content': 'Be brief.'}, {'role': 'user', 'content': 'Hi'}, {'role': 'assistant', 'content': 'Hello!'}]",
          ],
        ],
        hints: [
          "Build the three messages for each example as a list of dicts, then `json.dumps({\"messages\": messages})` gives one line.",
          "Join the lines with newlines and add one at the end.",
        ],
      },
      {
        title: "Split without leaks, and report",
        mode: "open",
        instructions:
          "Write `prepare(raw, system, test_ratio=0.2)` that runs everything: dedupe, clean, then split by normalized prompt so a prompt never appears in both sets. Put an example in test when `int(hashlib.sha256(norm(prompt).encode()).hexdigest(), 16) % 100 < test_ratio * 100`. Return `{\"train\": jsonl, \"test\": jsonl, \"report\": {\"raw\", \"duplicates\", \"rejected\", \"train\", \"test\"}}` with the counts.",
        scaffold: "",
        solution: `def prepare(raw, system, test_ratio=0.2):
    unique = dedupe(raw)
    good = clean(unique)
    train, test = [], []
    for ex in good:
        bucket = int(hashlib.sha256(norm(ex["prompt"]).encode()).hexdigest(), 16) % 100
        (test if bucket < test_ratio * 100 else train).append(ex)
    report = {"raw": len(raw), "duplicates": len(raw) - len(unique), "rejected": len(unique) - len(good), "train": len(train), "test": len(test)}
    return {"train": to_jsonl(train, system), "test": to_jsonl(test, system), "report": report}
`,
        tests: [
          [
            "counts add up",
            "raw = [{'prompt': f'question {i}', 'response': f'answer {i}'} for i in range(40)]\nraw += [{'prompt': 'Question 1', 'response': 'dup'}, {'prompt': 'q', 'response': ''}]\nr = prepare(raw, 'sys')['report']\nassert r['raw'] == 42 and r['duplicates'] == 1 and r['rejected'] == 1 and r['train'] + r['test'] == 40 and r['test'] > 0",
          ],
          [
            "no prompt in both sets",
            "raw = [{'prompt': f'question {i}', 'response': 'a'} for i in range(60)]\nout = prepare(raw, 'sys')\nprompts = lambda s: {json.loads(l)['messages'][1]['content'] for l in s.strip().split('\\n') if l}\nassert not (prompts(out['train']) & prompts(out['test']))",
          ],
        ],
        hints: [
          "Chain the steps you have: `dedupe`, then `clean`, then split, then `to_jsonl` for each side. Keep each intermediate list so you can count it.",
          "The split depends only on the hash of the normalized prompt, so the same prompt always lands in the same set. Duplicates are `len(raw) - len(unique)` and rejected rows are `len(unique) - len(good)`.",
        ],
      },
    ],
    stretch: [
      "Detect near-duplicates with word-set overlap above 0.8, not just exact normalized matches.",
      "Report the response length distribution, since length bias creeps in here.",
      "Run a baseline prompt on the test split before training, so you have something to beat.",
    ],
  },
];
