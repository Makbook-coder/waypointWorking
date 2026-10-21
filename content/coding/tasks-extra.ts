// More coding practice for the levels that had little: L1, L7, L8, L10, L11, L12 and L13, plus
// "debug this" tasks whose starter is broken code to fix. Same rules as tasks.ts: standard
// library only, the reference solution must pass and the starter must fail.
import type { CodingSrc } from "./tasks";

export const EXTRA_CODING_TASKS: CodingSrc[] = [
  {
    id: "debug-mutable-default",
    moduleId: "M0.1",
    kind: "debug",
    topics: ["Mutability, scope", "Unit tests and debugging"],
    title: "Debug: tags leak between calls",
    difficulty: "e",
    prompt:
      "`add_tag(tag, tags)` should return a new list with `tag` appended, and when `tags` is not given it should start from an empty list. Users report that tags from one request show up in the next. Find and fix the bug without changing the function's signature (the default can change).",
    starter: `def add_tag(tag, tags=[]):
    tags.append(tag)
    return tags
`,
    solution: `def add_tag(tag, tags=None):
    tags = list(tags) if tags is not None else []
    tags.append(tag)
    return tags
`,
    tests: [
      ["adds a tag", "assert add_tag('a') == ['a']"],
      ["calls don't share state", "add_tag('a')\nassert add_tag('b') == ['b']"],
      ["doesn't modify the caller's list", "mine = ['x']\nout = add_tag('y', mine)\nassert out == ['x', 'y'] and mine == ['x']"],
    ],
    checklist: ["You can explain why a list default is created only once", "The caller's list is never changed"],
    hints: [
      "Default values are evaluated once, when the function is defined, not on each call. What happens to that one default list over many calls?",
      "Use `None` as the default and create a fresh list inside the function. Copy the caller's list with `list(tags)` so you don't change it.",
    ],
  },
  {
    id: "greedy-next-token",
    moduleId: "M1.1",
    topics: ["Next-token prediction"],
    title: "Generate text one token at a time",
    difficulty: "e",
    prompt:
      "A toy language model is a dict `counts[prev][next] = how often next followed prev`. Write `generate(counts, start, max_tokens)` that starts from `start` and repeatedly appends the most likely next token (ties: alphabetically first) until it produces `\"<eos>\"` (don't include it), has added `max_tokens` tokens, or reaches a token with no known next token. Return the list of generated tokens, not including `start`. This is exactly what an LLM does, just with a much bigger table.",
    starter: `def generate(counts, start, max_tokens):
    out = []
    # your code here
    return out
`,
    solution: `def generate(counts, start, max_tokens):
    out = []
    cur = start
    while len(out) < max_tokens:
        options = counts.get(cur)
        if not options:
            break
        nxt = sorted(options.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
        if nxt == "<eos>":
            break
        out.append(nxt)
        cur = nxt
    return out
`,
    tests: [
      ["picks the most likely token", "c = {'the': {'cat': 3, 'dog': 1}, 'cat': {'sat': 2}, 'sat': {'<eos>': 1}}\nassert generate(c, 'the', 10) == ['cat', 'sat']"],
      ["stops at max_tokens", "c = {'a': {'a': 1}}\nassert generate(c, 'a', 3) == ['a', 'a', 'a']"],
      ["ties go alphabetically", "c = {'x': {'b': 2, 'a': 2}}\nassert generate(c, 'x', 1) == ['a']"],
      ["stops at an unknown token", "c = {'hi': {'there': 1}}\nassert generate(c, 'hi', 5) == ['there']"],
    ],
    checklist: ["You can say why greedy decoding repeats itself on the second test", "You can explain how sampling would change the output"],
    hints: [
      "Keep a `cur` token. In a loop, look up `counts.get(cur)`, choose the best next token, append it, and make it the new `cur`.",
      "Sort the options with `key=lambda kv: (-kv[1], kv[0])` so the highest count comes first and ties go alphabetically. Check for `\"<eos>\"` before appending.",
    ],
  },
  {
    id: "attention-weights",
    moduleId: "M1.3",
    topics: ["Queries, keys, values", "The intuition behind attention"],
    title: "Scaled dot-product attention by hand",
    difficulty: "m",
    prompt:
      "Write `attend(q, keys, values, position=None)`. `q` is one query vector, `keys` and `values` are lists of vectors of the same length. Score each key with `dot(q, k) / sqrt(len(q))`, turn the scores into weights with softmax, and return `(weights, output)` where `output` is the weighted sum of the value vectors. If `position` is given, apply a causal mask: only keys at index `<= position` can be attended to (their weights are computed over just those keys; masked ones get weight 0.0).",
    starter: `import math

def attend(q, keys, values, position=None):
    # your code here
    pass
`,
    solution: `import math

def attend(q, keys, values, position=None):
    scale = math.sqrt(len(q))
    scores = [sum(a * b for a, b in zip(q, k)) / scale for k in keys]
    allowed = [position is None or i <= position for i in range(len(keys))]
    m = max(s for s, ok in zip(scores, allowed) if ok)
    exps = [math.exp(s - m) if ok else 0.0 for s, ok in zip(scores, allowed)]
    total = sum(exps)
    weights = [e / total for e in exps]
    dim = len(values[0])
    output = [sum(w * v[d] for w, v in zip(weights, values)) for d in range(dim)]
    return weights, output
`,
    tests: [
      ["weights sum to 1", "w, _ = attend([1, 0], [[1, 0], [0, 1]], [[1], [2]])\nassert abs(sum(w) - 1) < 1e-9"],
      ["the matching key gets more weight", "w, _ = attend([1, 0], [[1, 0], [0, 1]], [[1], [2]])\nassert w[0] > w[1]"],
      ["equal scores give equal weights", "w, out = attend([0, 0], [[1, 0], [0, 1]], [[2, 0], [0, 2]])\nassert abs(w[0] - 0.5) < 1e-9 and all(abs(x - 1) < 1e-9 for x in out)"],
      ["scales by sqrt(d)", "import math\nw, _ = attend([2, 0], [[1, 0], [0, 0]], [[1], [0]])\ne = math.exp(2 / math.sqrt(2))\nassert abs(w[0] - e / (e + 1)) < 1e-9"],
      ["causal mask hides future keys", "w, out = attend([1, 1], [[1, 1], [5, 5], [9, 9]], [[1], [2], [3]], position=0)\nassert w == [1.0, 0.0, 0.0] and out == [1.0]"],
    ],
    checklist: ["You can explain why the scores are divided by sqrt(d)", "You can say what the causal mask is for in a decoder"],
    hints: [
      "Three steps: score each key (dot product divided by `math.sqrt(len(q))`), softmax the scores into weights, then sum `weight × value` dimension by dimension.",
      "For the mask, set the exponent of masked keys to `0.0` before normalizing, and take the max only over allowed scores. The output for dimension d is `sum(w * v[d] for w, v in zip(weights, values))`.",
    ],
  },
  {
    id: "debug-latency-estimate",
    moduleId: "M1.5",
    kind: "debug",
    topics: ["Prefill vs decode", "Tokens, TTFT"],
    title: "Debug: the latency estimate is way off",
    difficulty: "m",
    prompt:
      "`estimate(input_tokens, output_tokens, prefill_tps, decode_tps, overhead_s)` should return `(ttft, total)` in seconds. Time to first token is the network/queue overhead plus prefill (the whole input processed at `prefill_tps`). Total adds decoding the output at `decode_tps`. The current code gives answers that are far too large for long prompts. Fix it.",
    starter: `def estimate(input_tokens, output_tokens, prefill_tps, decode_tps, overhead_s):
    ttft = overhead_s + input_tokens / prefill_tps
    total = ttft + (input_tokens + output_tokens) / decode_tps
    return round(ttft, 3), round(total, 3)
`,
    solution: `def estimate(input_tokens, output_tokens, prefill_tps, decode_tps, overhead_s):
    ttft = overhead_s + input_tokens / prefill_tps
    total = ttft + output_tokens / decode_tps
    return round(ttft, 3), round(total, 3)
`,
    tests: [
      ["ttft is overhead plus prefill", "assert estimate(2000, 100, 4000, 50, 0.2)[0] == 0.7"],
      ["total adds only the output decode", "assert estimate(2000, 100, 4000, 50, 0.2)[1] == 2.7"],
      ["long prompts mostly cost prefill", "ttft, total = estimate(100000, 10, 10000, 50, 0)\nassert ttft == 10.0 and total == 10.2"],
    ],
    checklist: ["You can explain why prefill is much faster per token than decode", "You can say which number streaming improves"],
    hints: [
      "Prefill and decode are separate phases. Which tokens does the model generate one at a time during decode?",
      "Only the output tokens are decoded. The input was already processed during prefill, so it shouldn't appear in the decode term.",
    ],
  },
  {
    id: "context-budget",
    moduleId: "M1.8",
    topics: ["What occupies the context window"],
    title: "Will it fit in the context window?",
    difficulty: "e",
    prompt:
      "Write `plan_context(window, parts, reserve_output)` where `parts` is a dict name → token count (system prompt, history, retrieved docs, tool definitions...). Return a dict with `used` (sum of parts), `free_for_output` (window − used, never below 0), `fits` (True if `free_for_output >= reserve_output`) and `largest` (the name of the biggest part, so you know what to cut first; ties alphabetically).",
    starter: `def plan_context(window, parts, reserve_output):
    # your code here
    return {}
`,
    solution: `def plan_context(window, parts, reserve_output):
    used = sum(parts.values())
    free = max(0, window - used)
    largest = min(parts, key=lambda k: (-parts[k], k)) if parts else None
    return {"used": used, "free_for_output": free, "fits": free >= reserve_output, "largest": largest}
`,
    tests: [
      ["adds up the parts", "r = plan_context(8000, {'system': 500, 'history': 3000, 'docs': 4000}, 1000)\nassert r['used'] == 7500 and r['free_for_output'] == 500"],
      ["output needs room too", "r = plan_context(8000, {'system': 500, 'history': 3000, 'docs': 4000}, 1000)\nassert r['fits'] is False and r['largest'] == 'docs'"],
      ["never negative", "r = plan_context(100, {'a': 300}, 0)\nassert r['free_for_output'] == 0 and r['fits'] is True"],
      ["fits with room", "assert plan_context(128000, {'sys': 1000}, 4000)['fits'] is True"],
    ],
    checklist: ["You remembered that the output shares the window", "You can name what you'd cut first in a real app"],
    hints: [
      "`used` is `sum(parts.values())`. The free space is the window minus that, but clamp it at 0 with `max`.",
      "To find the biggest part with alphabetical ties, use `min(parts, key=lambda k: (-parts[k], k))`.",
    ],
  },
  {
    id: "trace-failing-step",
    moduleId: "M2.10",
    topics: ["Finding the failing step", "Interactions as traces"],
    title: "Find the failing and the slowest step in a trace",
    difficulty: "m",
    prompt:
      "A trace is a list of spans `{\"id\", \"parent\", \"name\", \"start\", \"end\", \"error\"}` (`parent` is None for the root, `error` is a string or None). Write `diagnose(spans)` returning `{\"failing\": name, \"slowest\": name}`. `failing` is the deepest span with an error (the root cause, not the parent that just reported it; ties by earliest start), or None. `slowest` is the span with the longest duration that has no children (leaf work, not a wrapper), ties by earliest start.",
    starter: `def diagnose(spans):
    # your code here
    return {"failing": None, "slowest": None}
`,
    solution: `def diagnose(spans):
    by_id = {s["id"]: s for s in spans}
    parents = {s["parent"] for s in spans if s["parent"] is not None}

    def depth(s):
        d = 0
        while s["parent"] is not None:
            s = by_id[s["parent"]]
            d += 1
        return d

    errors = [s for s in spans if s["error"]]
    failing = min(errors, key=lambda s: (-depth(s), s["start"]))["name"] if errors else None
    leaves = [s for s in spans if s["id"] not in parents]
    slowest = min(leaves, key=lambda s: (-(s["end"] - s["start"]), s["start"]))["name"] if leaves else None
    return {"failing": failing, "slowest": slowest}
`,
    tests: [
      [
        "finds the root cause",
        "spans = [\n  {'id': 1, 'parent': None, 'name': 'request', 'start': 0, 'end': 10, 'error': 'failed'},\n  {'id': 2, 'parent': 1, 'name': 'retrieve', 'start': 0, 'end': 3, 'error': None},\n  {'id': 3, 'parent': 1, 'name': 'generate', 'start': 3, 'end': 10, 'error': 'failed'},\n  {'id': 4, 'parent': 3, 'name': 'tool:search', 'start': 4, 'end': 9, 'error': 'timeout'},\n]\nassert diagnose(spans)['failing'] == 'tool:search'",
      ],
      [
        "slowest leaf, not the wrapper",
        "spans = [\n  {'id': 1, 'parent': None, 'name': 'request', 'start': 0, 'end': 10, 'error': None},\n  {'id': 2, 'parent': 1, 'name': 'retrieve', 'start': 0, 'end': 3, 'error': None},\n  {'id': 3, 'parent': 1, 'name': 'llm', 'start': 3, 'end': 10, 'error': None},\n]\nassert diagnose(spans) == {'failing': None, 'slowest': 'llm'}",
      ],
      ["a single span", "assert diagnose([{'id': 'a', 'parent': None, 'name': 'only', 'start': 0, 'end': 1, 'error': None}]) == {'failing': None, 'slowest': 'only'}"],
    ],
    checklist: ["You can explain why the root span's error is not the root cause", "You would log these fields for every LLM call"],
    hints: [
      "Build `by_id` for lookups and a set of ids that appear as someone's parent. A span is a leaf if its id is not in that set.",
      "Depth is how many parent hops it takes to reach the root. Among error spans, pick the one with the largest depth: `min(errors, key=lambda s: (-depth(s), s[\"start\"]))`.",
    ],
  },
  {
    id: "prompt-ab-compare",
    moduleId: "M3.6",
    topics: ["Comparing versions on the same examples", "Building a small test set"],
    title: "Compare two prompt versions fairly",
    difficulty: "m",
    prompt:
      "You ran prompt A and prompt B on the same test set. `a` and `b` are dicts example id → True/False (passed). Write `compare(a, b)` returning `{\"a_rate\", \"b_rate\", \"wins\", \"losses\", \"regressions\"}`, computed only over ids present in both: pass rates rounded to 2 decimals, `wins` = examples B passes and A fails, `losses` = the reverse, and `regressions` = sorted list of ids that A passed and B failed. If no ids are shared, raise `ValueError`.",
    starter: `def compare(a, b):
    # your code here
    pass
`,
    solution: `def compare(a, b):
    ids = sorted(set(a) & set(b))
    if not ids:
        raise ValueError("no shared examples")
    rate = lambda d: round(sum(1 for i in ids if d[i]) / len(ids), 2)
    regressions = [i for i in ids if a[i] and not b[i]]
    wins = sum(1 for i in ids if b[i] and not a[i])
    return {"a_rate": rate(a), "b_rate": rate(b), "wins": wins, "losses": len(regressions), "regressions": regressions}
`,
    tests: [
      ["counts wins and losses", "r = compare({'1': True, '2': False, '3': True}, {'1': True, '2': True, '3': False})\nassert (r['wins'], r['losses']) == (1, 1)"],
      ["lists regressions", "r = compare({'1': True, '2': False, '3': True}, {'1': True, '2': True, '3': False})\nassert r['regressions'] == ['3']"],
      ["only shared ids count", "r = compare({'1': True, 'x': False}, {'1': True, 'y': True})\nassert r['a_rate'] == 1.0 and r['b_rate'] == 1.0"],
      ["rates", "r = compare({'1': True, '2': False, '3': False}, {'1': True, '2': True, '3': False})\nassert (r['a_rate'], r['b_rate']) == (0.33, 0.67)"],
      ["nothing shared", "try:\n    compare({'1': True}, {'2': True})\n    assert False\nexcept ValueError:\n    pass"],
    ],
    checklist: ["You can explain why the same examples matter", "You'd look at each regression before shipping B"],
    hints: [
      "First find the ids both runs share: `set(a) & set(b)`. Every number in the result is computed over just those.",
      "A regression is `a[i] and not b[i]`; a win is the reverse. The number of losses is just the number of regressions.",
    ],
  },
  {
    id: "debug-rerank",
    moduleId: "M4.10",
    kind: "debug",
    topics: ["Retrieve many, rerank, send the best"],
    title: "Debug: the reranker sends the worst chunks",
    difficulty: "e",
    prompt:
      "`rerank(query, candidates, score, k)` should score every candidate with `score(query, text)` (higher is more relevant) and return the texts of the best `k`, best first. Answers got worse after adding the reranker. Fix the bug.",
    starter: `def rerank(query, candidates, score, k):
    scored = [(score(query, c), c) for c in candidates]
    scored.sort()
    return [c for _, c in scored[:k]]
`,
    solution: `def rerank(query, candidates, score, k):
    scored = [(score(query, c), c) for c in candidates]
    scored.sort(key=lambda t: t[0], reverse=True)
    return [c for _, c in scored[:k]]
`,
    tests: [
      ["best first", "s = lambda q, t: len(set(q.split()) & set(t.split()))\nassert rerank('refund policy', ['shipping times', 'refund policy details', 'policy'], s, 2) == ['refund policy details', 'policy']"],
      ["keeps k", "assert len(rerank('a', ['a', 'b', 'c'], lambda q, t: 1.0, 2)) == 2"],
      ["stable for ties", "assert rerank('x', ['first', 'second'], lambda q, t: 0.5, 2) == ['first', 'second']"],
    ],
    checklist: ["You can explain why sorting tuples also compared the texts", "You checked the order, not just the count"],
    hints: [
      "Print `scored` after sorting. Which end of the list holds the highest scores?",
      "Sort by the score only (`key=lambda t: t[0]`) with `reverse=True`. Sorting by score alone also keeps ties in their original order.",
    ],
  },
  {
    id: "orchestrator-workers",
    moduleId: "M5.6",
    topics: ["Orchestrator", "Worker failure & escalation"],
    title: "Orchestrator with retries and escalation",
    difficulty: "m",
    prompt:
      "Write `orchestrate(subtasks, workers, retries=1)`. `subtasks` is a list of `(worker_name, payload)`. For each, call `workers[worker_name](payload)`. If it raises, retry up to `retries` more times. Return `{\"results\": [...], \"escalated\": [...]}` where `results` holds each successful output in subtask order and `escalated` holds `(index, worker_name, error message)` for subtasks that still failed, or whose worker doesn't exist (message `\"unknown worker\"`). One failing worker must not stop the others.",
    starter: `def orchestrate(subtasks, workers, retries=1):
    results, escalated = [], []
    # your code here
    return {"results": results, "escalated": escalated}
`,
    solution: `def orchestrate(subtasks, workers, retries=1):
    results, escalated = [], []
    for i, (name, payload) in enumerate(subtasks):
        fn = workers.get(name)
        if fn is None:
            escalated.append((i, name, "unknown worker"))
            continue
        for attempt in range(retries + 1):
            try:
                results.append(fn(payload))
                break
            except Exception as e:
                if attempt == retries:
                    escalated.append((i, name, str(e)))
    return {"results": results, "escalated": escalated}
`,
    tests: [
      ["runs every worker", "w = {'up': str.upper, 'rev': lambda s: s[::-1]}\nassert orchestrate([('up', 'a'), ('rev', 'bc')], w)['results'] == ['A', 'cb']"],
      ["retries a flaky worker", "calls = []\ndef flaky(p):\n    calls.append(p)\n    if len(calls) < 2:\n        raise RuntimeError('busy')\n    return 'ok'\nassert orchestrate([('f', 1)], {'f': flaky}) == {'results': ['ok'], 'escalated': []}"],
      ["escalates after retries", "def bad(p):\n    raise ValueError('nope')\nr = orchestrate([('b', 1), ('ok', 2)], {'b': bad, 'ok': lambda p: p * 10})\nassert r == {'results': [20], 'escalated': [(0, 'b', 'nope')]}"],
      ["unknown worker", "assert orchestrate([('x', 1)], {})['escalated'] == [(0, 'x', 'unknown worker')]"],
    ],
    checklist: ["A single failure never stops the run", "You can explain when you'd escalate to a human instead of retrying"],
    hints: [
      "Loop with `enumerate(subtasks)` so you know each index. Look up the worker with `workers.get(name)` and escalate straight away if it's missing.",
      "Inside, loop `for attempt in range(retries + 1)`: on success append and `break`; in `except`, escalate only when `attempt == retries`.",
    ],
  },
  {
    id: "context-priority-fill",
    moduleId: "M6.2",
    topics: ["Prioritizing what matters", "Always present, retrieved, or excluded"],
    title: "Fill the context by priority",
    difficulty: "m",
    prompt:
      "Write `select(items, budget)`. Each item is `{\"id\", \"tokens\", \"priority\", \"always\"}`. Items with `always=True` are always included (even if they alone exceed the budget). Then add the rest by priority (higher first, ties by smaller tokens, then id), skipping any that don't fit in the remaining budget but continuing to try smaller ones. Return the selected ids in their original order.",
    starter: `def select(items, budget):
    # your code here
    return []
`,
    solution: `def select(items, budget):
    chosen = {i["id"] for i in items if i["always"]}
    used = sum(i["tokens"] for i in items if i["always"])
    rest = sorted((i for i in items if not i["always"]), key=lambda i: (-i["priority"], i["tokens"], i["id"]))
    for i in rest:
        if used + i["tokens"] <= budget:
            chosen.add(i["id"])
            used += i["tokens"]
    return [i["id"] for i in items if i["id"] in chosen]
`,
    tests: [
      [
        "always items first, then priority",
        "items = [\n  {'id': 'sys', 'tokens': 100, 'priority': 0, 'always': True},\n  {'id': 'old', 'tokens': 300, 'priority': 1, 'always': False},\n  {'id': 'doc', 'tokens': 300, 'priority': 5, 'always': False},\n]\nassert select(items, 450) == ['sys', 'doc']",
      ],
      [
        "skips what doesn't fit and keeps trying",
        "items = [\n  {'id': 'big', 'tokens': 900, 'priority': 9, 'always': False},\n  {'id': 'small', 'tokens': 50, 'priority': 1, 'always': False},\n]\nassert select(items, 100) == ['small']",
      ],
      ["keeps original order", "items = [{'id': 'a', 'tokens': 1, 'priority': 1, 'always': False}, {'id': 'b', 'tokens': 1, 'priority': 9, 'always': False}]\nassert select(items, 10) == ['a', 'b']"],
    ],
    checklist: ["You can name what belongs in 'always' for a real assistant", "Order is preserved so sources stay distinguishable"],
    hints: [
      "Start with the `always` items: put their ids in a `chosen` set and count their tokens as used.",
      "Sort the others with `key=lambda i: (-i[\"priority\"], i[\"tokens\"], i[\"id\"])` and add each one that still fits. Return ids by walking the original list.",
    ],
  },
  {
    id: "judge-agreement",
    moduleId: "M7.2",
    topics: ["Programmatic, human & LLM-as-a-Judge"],
    title: "Can you trust the LLM judge?",
    difficulty: "m",
    prompt:
      "Before trusting an LLM-as-a-judge, compare it with human labels. Write `agreement(human, judge)` for two equal-length lists of booleans (pass/fail). Return `(raw, kappa)`: raw agreement (fraction of matches) and Cohen's kappa = (po − pe) / (1 − pe), where po is raw agreement and pe = P(human yes)·P(judge yes) + P(human no)·P(judge no). If pe is 1, return kappa 1.0. Round both to 3 decimals. Raise `ValueError` on empty or mismatched lists.",
    starter: `def agreement(human, judge):
    # your code here
    pass
`,
    solution: `def agreement(human, judge):
    if not human or len(human) != len(judge):
        raise ValueError("need two equal, non-empty label lists")
    n = len(human)
    po = sum(h == j for h, j in zip(human, judge)) / n
    ph, pj = sum(human) / n, sum(judge) / n
    pe = ph * pj + (1 - ph) * (1 - pj)
    kappa = 1.0 if pe == 1 else (po - pe) / (1 - pe)
    return round(po, 3), round(kappa, 3)
`,
    tests: [
      ["perfect agreement", "assert agreement([True, False, True], [True, False, True]) == (1.0, 1.0)"],
      ["kappa corrects for chance", "raw, k = agreement([True] * 9 + [False], [True] * 10)\nassert raw == 0.9 and k == 0.0"],
      ["typical case", "h = [True, True, False, False, True, False]\nj = [True, False, False, False, True, True]\nassert agreement(h, j) == (0.667, 0.333)"],
      ["bad input", "try:\n    agreement([], [])\n    assert False\nexcept ValueError:\n    pass"],
    ],
    checklist: ["You can explain why 90% raw agreement can still mean a useless judge", "You'd look at the disagreements, not just the number"],
    hints: [
      "Raw agreement is the fraction of positions where the two lists match. `sum(human)` counts the True values, so `sum(human) / n` is P(human yes).",
      "pe is the agreement you'd expect by chance: both say yes plus both say no. Plug po and pe into `(po - pe) / (1 - pe)` and guard the `pe == 1` case.",
    ],
  },
  {
    id: "trajectory-check",
    moduleId: "M7.9",
    topics: ["Tool selection", "Loops, redundancy"],
    title: "Grade an agent's trajectory, not just its answer",
    difficulty: "m",
    prompt:
      "Write `grade(trajectory, expected_tools, forbidden)`. `trajectory` is the list of tool names the agent called, in order. Return `{\"missing\": [...], \"forbidden_used\": [...], \"redundant\": n, \"passed\": bool}`: expected tools never called (in expected order), forbidden tools that were called (sorted, no duplicates), the number of immediate repeats (the same tool called twice in a row counts 1 per repeat), and `passed` = nothing missing, nothing forbidden and at most 1 redundant call.",
    starter: `def grade(trajectory, expected_tools, forbidden):
    # your code here
    return {}
`,
    solution: `def grade(trajectory, expected_tools, forbidden):
    called = set(trajectory)
    missing = [t for t in expected_tools if t not in called]
    forbidden_used = sorted(called & set(forbidden))
    redundant = sum(1 for a, b in zip(trajectory, trajectory[1:]) if a == b)
    passed = not missing and not forbidden_used and redundant <= 1
    return {"missing": missing, "forbidden_used": forbidden_used, "redundant": redundant, "passed": passed}
`,
    tests: [
      ["a clean run passes", "assert grade(['search', 'read', 'answer'], ['search', 'answer'], ['delete'])['passed'] is True"],
      ["finds missing tools", "assert grade(['answer'], ['search', 'answer'], [])['missing'] == ['search']"],
      ["flags forbidden tools", "r = grade(['search', 'delete', 'delete'], ['search'], ['delete', 'email'])\nassert r['forbidden_used'] == ['delete'] and r['passed'] is False"],
      ["counts loops", "r = grade(['search', 'search', 'search', 'answer'], ['answer'], [])\nassert r['redundant'] == 2 and r['passed'] is False"],
    ],
    checklist: ["You can name a case where the final answer was right but the trajectory was bad", "Forbidden tools fail the run no matter what"],
    hints: [
      "Turn the trajectory into a set for the missing and forbidden checks. Missing keeps the expected order, so loop over `expected_tools`.",
      "Count repeats by pairing each call with the next one: `zip(trajectory, trajectory[1:])`, counting pairs where both are equal.",
    ],
  },
  {
    id: "tool-permission-gate",
    moduleId: "M8.4",
    topics: ["Least privilege", "Human approval for irreversible actions"],
    title: "A permission gate outside the model",
    difficulty: "m",
    prompt:
      "The model can ask for any tool, so the check must live in code. Write `check(call, policy, approved=False)` where `call` is `{\"tool\", \"args\"}` and `policy` maps tool name → `\"read\"` or `\"write\"`. Return `\"allow\"` for read tools, `\"needs_approval\"` for write tools unless `approved` is True (then `\"allow\"`), and `\"deny\"` for tools not in the policy. Also deny any call whose args contain a string value with `..` or starting with `/` (path escape), whatever the tool.",
    starter: `def check(call, policy, approved=False):
    # your code here
    return "allow"
`,
    solution: `def check(call, policy, approved=False):
    for v in call.get("args", {}).values():
        if isinstance(v, str) and (".." in v or v.startswith("/")):
            return "deny"
    kind = policy.get(call["tool"])
    if kind == "read":
        return "allow"
    if kind == "write":
        return "allow" if approved else "needs_approval"
    return "deny"
`,
    tests: [
      ["reads are allowed", "assert check({'tool': 'search', 'args': {'q': 'x'}}, {'search': 'read'}) == 'allow'"],
      ["writes need approval", "p = {'send_email': 'write'}\nassert check({'tool': 'send_email', 'args': {}}, p) == 'needs_approval'\nassert check({'tool': 'send_email', 'args': {}}, p, approved=True) == 'allow'"],
      ["unknown tools are denied", "assert check({'tool': 'rm', 'args': {}}, {'search': 'read'}) == 'deny'"],
      ["path escapes are denied", "p = {'read_file': 'read'}\nassert check({'tool': 'read_file', 'args': {'path': '../secrets.env'}}, p) == 'deny'\nassert check({'tool': 'read_file', 'args': {'path': '/etc/passwd'}}, p) == 'deny'"],
    ],
    checklist: ["Default is deny", "You can explain why this can't be a line in the system prompt"],
    hints: [
      "Check the arguments first, so a path escape is denied whatever the tool. Loop over `call.get(\"args\", {}).values()` and test only strings.",
      "Then look up `policy.get(call[\"tool\"])`: read → allow, write → allow only if approved, anything else (including None) → deny.",
    ],
  },
  {
    id: "debug-tenant-filter",
    moduleId: "M8.5",
    kind: "debug",
    topics: ["Document-level permissions", "cross-tenant"],
    title: "Debug: one customer sees another's documents",
    difficulty: "m",
    prompt:
      "`visible(docs, user)` filters retrieved chunks before they reach the prompt. A doc is visible only if it belongs to the user's tenant AND (it's public within the tenant OR the user is in its `allowed` list). A security review found a cross-tenant leak. Fix it.",
    starter: `def visible(docs, user):
    return [d for d in docs if d["tenant"] == user["tenant"] or d["public"] or user["id"] in d["allowed"]]
`,
    solution: `def visible(docs, user):
    return [d for d in docs if d["tenant"] == user["tenant"] and (d["public"] or user["id"] in d["allowed"])]
`,
    tests: [
      ["own public docs", "u = {'id': 'u1', 'tenant': 'acme'}\nd = [{'id': 1, 'tenant': 'acme', 'public': True, 'allowed': []}]\nassert visible(d, u) == d"],
      ["no other tenant's public docs", "u = {'id': 'u1', 'tenant': 'acme'}\nd = [{'id': 2, 'tenant': 'globex', 'public': True, 'allowed': []}]\nassert visible(d, u) == []"],
      ["private docs need the user listed", "u = {'id': 'u1', 'tenant': 'acme'}\nd = [{'id': 3, 'tenant': 'acme', 'public': False, 'allowed': ['u2']}, {'id': 4, 'tenant': 'acme', 'public': False, 'allowed': ['u1']}]\nassert [x['id'] for x in visible(d, u)] == [4]"],
      ["allowed lists don't cross tenants", "u = {'id': 'u1', 'tenant': 'acme'}\nd = [{'id': 5, 'tenant': 'globex', 'public': False, 'allowed': ['u1']}]\nassert visible(d, u) == []"],
    ],
    checklist: ["Tenant is checked first and always", "You'd add a test like 'no other tenant's public docs' to CI"],
    hints: [
      "Read the condition out loud. With `or` between every part, which single condition is enough to show a document from another tenant?",
      "The tenant check must always hold: `tenant matches and (public or user allowed)`. Mind the brackets.",
    ],
  },
  {
    id: "model-cascade",
    moduleId: "M9.3",
    topics: ["Model cascades", "Routing on task, cost"],
    title: "A cheap-first model cascade",
    difficulty: "m",
    prompt:
      "Write `cascade(prompt, models, threshold)`. `models` is a list of `(name, cost, fn)` from cheapest to most expensive; `fn(prompt)` returns `(answer, confidence)`. Call models in order and return `{\"answer\", \"model\", \"cost\"}` from the first one whose confidence is ≥ threshold, where `cost` is the total spent on every model called. If none is confident, return the last model's answer. If a model raises, add its cost anyway and move on; if all raise, raise `RuntimeError`.",
    starter: `def cascade(prompt, models, threshold):
    # your code here
    pass
`,
    solution: `def cascade(prompt, models, threshold):
    spent = 0.0
    last = None
    for name, cost, fn in models:
        spent += cost
        try:
            answer, conf = fn(prompt)
        except Exception:
            continue
        last = {"answer": answer, "model": name}
        if conf >= threshold:
            return {**last, "cost": round(spent, 6)}
    if last is None:
        raise RuntimeError("every model failed")
    return {**last, "cost": round(spent, 6)}
`,
    tests: [
      ["stops at the first confident model", "m = [('small', 0.001, lambda p: ('A', 0.95)), ('big', 0.02, lambda p: ('B', 0.99))]\nassert cascade('q', m, 0.9) == {'answer': 'A', 'model': 'small', 'cost': 0.001}"],
      ["escalates when unsure", "m = [('small', 0.001, lambda p: ('A', 0.4)), ('big', 0.02, lambda p: ('B', 0.99))]\nassert cascade('q', m, 0.9) == {'answer': 'B', 'model': 'big', 'cost': 0.021}"],
      ["falls back to the last answer", "m = [('s', 1, lambda p: ('A', 0.1)), ('b', 2, lambda p: ('B', 0.2))]\nassert cascade('q', m, 0.9)['model'] == 'b'"],
      ["skips a failing model", "def boom(p):\n    raise TimeoutError()\nm = [('s', 1, boom), ('b', 2, lambda p: ('B', 0.95))]\nassert cascade('q', m, 0.9) == {'answer': 'B', 'model': 'b', 'cost': 3}"],
      ["all fail", "def boom(p):\n    raise TimeoutError()\ntry:\n    cascade('q', [('s', 1, boom)], 0.5)\n    assert False\nexcept RuntimeError:\n    pass"],
    ],
    checklist: ["You can say when a cascade costs more than calling the big model directly", "Confidence needs calibrating against real labels"],
    hints: [
      "Loop over the models in order, adding each model's cost before you call it, so failed calls are still paid for.",
      "Remember the most recent successful answer in a variable. Return early when confidence reaches the threshold; after the loop, return the remembered one or raise if there is none.",
    ],
  },
  {
    id: "prompt-registry",
    moduleId: "M10.3",
    topics: ["A prompt registry", "Rollback by moving a label"],
    title: "A tiny prompt registry with labels",
    difficulty: "m",
    prompt:
      "Implement `class Registry` with `register(name, text)` (adds a new version and returns its number, starting at 1 per name), `set_label(name, label, version)` (raise `KeyError` for an unknown version), and `get(name, label=\"production\", fallback=None)` returning `(version, text)` for the labelled version. If the name or label is unknown, return `(0, fallback)` when a fallback is given, otherwise raise `KeyError`. Rolling back is just moving the label to an older version.",
    starter: `class Registry:
    def __init__(self):
        pass

    def register(self, name, text):
        pass

    def set_label(self, name, label, version):
        pass

    def get(self, name, label="production", fallback=None):
        pass
`,
    solution: `class Registry:
    def __init__(self):
        self.versions = {}
        self.labels = {}

    def register(self, name, text):
        self.versions.setdefault(name, []).append(text)
        return len(self.versions[name])

    def set_label(self, name, label, version):
        if not 1 <= version <= len(self.versions.get(name, [])):
            raise KeyError(f"{name} has no version {version}")
        self.labels[(name, label)] = version

    def get(self, name, label="production", fallback=None):
        v = self.labels.get((name, label))
        if v is None:
            if fallback is not None:
                return 0, fallback
            raise KeyError(f"{name}@{label}")
        return v, self.versions[name][v - 1]
`,
    tests: [
      ["versions count up per name", "r = Registry()\nassert r.register('summarize', 'v1 text') == 1\nassert r.register('summarize', 'v2 text') == 2\nassert r.register('classify', 'x') == 1"],
      ["labels pick a version", "r = Registry()\nr.register('s', 'one'); r.register('s', 'two')\nr.set_label('s', 'production', 2)\nassert r.get('s') == (2, 'two')"],
      ["rollback by moving the label", "r = Registry()\nr.register('s', 'one'); r.register('s', 'two')\nr.set_label('s', 'production', 2)\nr.set_label('s', 'production', 1)\nassert r.get('s') == (1, 'one')"],
      ["fallback when the registry has nothing", "assert Registry().get('s', fallback='built-in') == (0, 'built-in')"],
      ["unknown version", "r = Registry()\nr.register('s', 'one')\ntry:\n    r.set_label('s', 'production', 5)\n    assert False\nexcept KeyError:\n    pass"],
    ],
    checklist: ["Your app keeps working when the registry is down (fallback)", "Every trace records the prompt version"],
    hints: [
      "Store `versions[name]` as a list of texts, so the version number is just its position + 1. Store labels in a dict keyed by `(name, label)`.",
      "In `get`, look up the label; if it's missing, return `(0, fallback)` when there is a fallback, otherwise `raise KeyError`. Otherwise index the list with `version - 1`.",
    ],
  },
  {
    id: "debug-flaky-eval",
    moduleId: "M10.4",
    kind: "debug",
    topics: ["Handling non-determinism", "Per-metric thresholds"],
    title: "Debug: the release gate fails on a good model",
    difficulty: "m",
    prompt:
      "LLM outputs vary, so each eval case runs `runs` times. `gate(case_results, min_pass_rate)` takes a dict case id → list of booleans (one per run). A case passes when its pass rate is ≥ `min_pass_rate`, and the gate returns `(all_passed, failing_case_ids_sorted)`. Right now it blocks releases even when every case passes 4 out of 5 runs with `min_pass_rate=0.8`. Fix it.",
    starter: `def gate(case_results, min_pass_rate):
    failing = []
    for case, runs in case_results.items():
        rate = sum(runs) // len(runs)
        if rate <= min_pass_rate:
            failing.append(case)
    return (not failing, sorted(failing))
`,
    solution: `def gate(case_results, min_pass_rate):
    failing = []
    for case, runs in case_results.items():
        rate = sum(runs) / len(runs) if runs else 0.0
        if rate < min_pass_rate:
            failing.append(case)
    return (not failing, sorted(failing))
`,
    tests: [
      ["4 of 5 passes at 0.8", "assert gate({'a': [True, True, True, True, False]}, 0.8) == (True, [])"],
      ["a weak case fails", "assert gate({'a': [True] * 5, 'b': [True, False, False, True, False]}, 0.8) == (False, ['b'])"],
      ["no runs counts as failing", "assert gate({'z': []}, 0.5) == (False, ['z'])"],
    ],
    checklist: ["You found both bugs, not just one", "You can explain why a single run per case makes a gate flaky"],
    hints: [
      "There are two bugs. Work out by hand what `4 // 5` is in Python, then what `0.8 <= 0.8` is.",
      "Use true division `/` for the rate and `<` for failing, so a rate exactly at the threshold passes. Guard an empty run list too.",
    ],
  },
  {
    id: "error-rate-alert",
    moduleId: "M10.9",
    topics: ["Alerts that need a human", "Application metrics"],
    title: "An error-rate alert that doesn't cry wolf",
    difficulty: "m",
    prompt:
      "Write `should_alert(events, now, window_s=300, threshold=0.05, min_requests=20)`. `events` is a list of `(timestamp, ok)` tuples. Look only at events with `now - window_s < timestamp <= now`. Alert (return True) only if there are at least `min_requests` of them and the error rate (share of `ok == False`) is strictly above `threshold`. A handful of failures at 3am shouldn't page anyone.",
    starter: `def should_alert(events, now, window_s=300, threshold=0.05, min_requests=20):
    # your code here
    return False
`,
    solution: `def should_alert(events, now, window_s=300, threshold=0.05, min_requests=20):
    recent = [ok for t, ok in events if now - window_s < t <= now]
    if len(recent) < min_requests:
        return False
    errors = sum(1 for ok in recent if not ok)
    return errors / len(recent) > threshold
`,
    tests: [
      ["alerts on a real spike", "ev = [(i, i % 5 != 0) for i in range(100)]\nassert should_alert(ev, 100) is True"],
      ["quiet when traffic is low", "ev = [(1, False), (2, False), (3, True)]\nassert should_alert(ev, 10) is False"],
      ["old errors don't count", "ev = [(i, False) for i in range(50)] + [(i, True) for i in range(400, 450)]\nassert should_alert(ev, 450) is False"],
      ["exactly at threshold doesn't alert", "ev = [(i, i >= 1) for i in range(20)]\nassert should_alert(ev, 20, threshold=0.05) is False"],
    ],
    checklist: ["You can explain why the minimum request count matters", "Your alert would name a runbook"],
    hints: [
      "First keep only events inside the window: `now - window_s < t <= now`. If fewer than `min_requests` remain, don't alert.",
      "Error rate is the number of `not ok` events divided by the number of recent events. Alert when it is strictly greater than the threshold.",
    ],
  },
  {
    id: "tenant-cost-attribution",
    moduleId: "M11.5",
    topics: ["Attributing spend per team or tenant", "Budgets & runaway-cost alerts"],
    title: "Who spent the money?",
    difficulty: "m",
    prompt:
      "Write `attribute(requests, prices, budgets)`. Each request is `{\"tenant\", \"model\", \"in\", \"out\"}` (token counts); `prices[model] = (price_in, price_out)` in dollars per million tokens. Return `(spend, over)` where `spend` maps tenant → total dollars rounded to 4 decimals, and `over` is a sorted list of tenants whose spend is above their entry in `budgets` (tenants with no budget are never over). Unknown models raise `KeyError`.",
    starter: `def attribute(requests, prices, budgets):
    spend = {}
    # your code here
    return spend, []
`,
    solution: `def attribute(requests, prices, budgets):
    spend = {}
    for r in requests:
        p_in, p_out = prices[r["model"]]
        cost = (r["in"] * p_in + r["out"] * p_out) / 1_000_000
        spend[r["tenant"]] = spend.get(r["tenant"], 0.0) + cost
    spend = {t: round(v, 4) for t, v in spend.items()}
    over = sorted(t for t, v in spend.items() if t in budgets and v > budgets[t])
    return spend, over
`,
    tests: [
      ["sums per tenant", "p = {'m': (1.0, 2.0)}\nreqs = [{'tenant': 'a', 'model': 'm', 'in': 1_000_000, 'out': 0}, {'tenant': 'a', 'model': 'm', 'in': 0, 'out': 500_000}]\nassert attribute(reqs, p, {})[0] == {'a': 2.0}"],
      ["flags budget overruns", "p = {'m': (1.0, 1.0)}\nreqs = [{'tenant': 'a', 'model': 'm', 'in': 3_000_000, 'out': 0}, {'tenant': 'b', 'model': 'm', 'in': 1_000_000, 'out': 0}]\nassert attribute(reqs, p, {'a': 2.0, 'b': 5.0})[1] == ['a']"],
      ["no budget, never over", "p = {'m': (1.0, 1.0)}\nreqs = [{'tenant': 'c', 'model': 'm', 'in': 9_000_000, 'out': 0}]\nassert attribute(reqs, p, {})[1] == []"],
      ["unknown model", "try:\n    attribute([{'tenant': 'a', 'model': 'x', 'in': 1, 'out': 1}], {}, {})\n    assert False\nexcept KeyError:\n    pass"],
    ],
    checklist: ["Every request is tagged with a tenant in your real logs", "You'd alert before the budget is gone, not after"],
    hints: [
      "Loop over requests, look up the model's two prices, and add `(in × price_in + out × price_out) / 1,000,000` to that tenant's running total.",
      "Round at the end, then a tenant is over when it has a budget and its spend is greater than it: `t in budgets and v > budgets[t]`.",
    ],
  },
  {
    id: "debug-router-failover",
    moduleId: "M11.7",
    kind: "debug",
    topics: ["Routing rules & automatic failover"],
    title: "Debug: the gateway never fails over",
    difficulty: "m",
    prompt:
      "`route(prompt, providers, healthy)` should try providers in order, skipping any whose name isn't in `healthy`, and return `(provider_name, answer)` from the first call that succeeds. If every provider is skipped or fails, raise `RuntimeError`. In production, one provider outage takes the whole app down. Fix the bug.",
    starter: `def route(prompt, providers, healthy):
    for name, call in providers:
        if name not in healthy:
            continue
        try:
            return name, call(prompt)
        except Exception as e:
            raise RuntimeError(f"{name} failed") from e
    raise RuntimeError("no provider available")
`,
    solution: `def route(prompt, providers, healthy):
    errors = []
    for name, call in providers:
        if name not in healthy:
            continue
        try:
            return name, call(prompt)
        except Exception as e:
            errors.append(f"{name}: {e}")
    raise RuntimeError("no provider available: " + "; ".join(errors))
`,
    tests: [
      ["uses the first healthy provider", "p = [('a', lambda x: 'A'), ('b', lambda x: 'B')]\nassert route('q', p, {'a', 'b'}) == ('a', 'A')"],
      ["skips unhealthy providers", "p = [('a', lambda x: 'A'), ('b', lambda x: 'B')]\nassert route('q', p, {'b'}) == ('b', 'B')"],
      ["fails over on an error", "def down(x):\n    raise ConnectionError('503')\np = [('a', down), ('b', lambda x: 'B')]\nassert route('q', p, {'a', 'b'}) == ('b', 'B')"],
      ["raises when all fail", "def down(x):\n    raise ConnectionError('503')\ntry:\n    route('q', [('a', down)], {'a'})\n    assert False\nexcept RuntimeError:\n    pass"],
    ],
    checklist: ["The final error says what each provider did", "You can name one difference between providers a router can't hide"],
    hints: [
      "Follow the code when the first provider raises. Does the loop ever get to the second provider?",
      "In the `except`, record the error and let the loop continue. Raise only after the loop, once every provider has been tried.",
    ],
  },
  {
    id: "image-tokens",
    moduleId: "M12.2",
    topics: ["Why one image costs many tokens", "Tiling & detail settings"],
    title: "How many tokens is this image?",
    difficulty: "m",
    prompt:
      "Many vision APIs bill images by tiles. Write `image_tokens(width, height, detail=\"high\")` using this common scheme: low detail costs a flat 85 tokens. For high detail: if either side is over 2048, scale the image down (keeping aspect ratio) to fit in 2048×2048; then, if the shorter side is over 768, scale down so the shorter side is 768. Count 512-pixel tiles with `ceil(w / 512) * ceil(h / 512)` and return `85 + 170 * tiles`. Check your numbers against your provider's docs, since schemes differ.",
    starter: `import math

def image_tokens(width, height, detail="high"):
    # your code here
    return 0
`,
    solution: `import math

def image_tokens(width, height, detail="high"):
    if detail == "low":
        return 85
    w, h = float(width), float(height)
    if max(w, h) > 2048:
        s = 2048 / max(w, h)
        w, h = w * s, h * s
    if min(w, h) > 768:
        s = 768 / min(w, h)
        w, h = w * s, h * s
    tiles = math.ceil(w / 512) * math.ceil(h / 512)
    return 85 + 170 * tiles
`,
    tests: [
      ["low detail is flat", "assert image_tokens(4000, 3000, 'low') == 85"],
      ["a 1024 square", "assert image_tokens(1024, 1024) == 765"],
      ["a tall 2048x4096", "assert image_tokens(2048, 4096) == 1105"],
      ["a small image isn't scaled up", "assert image_tokens(500, 300) == 255"],
    ],
    checklist: ["You can explain why a screenshot can cost more than a page of text", "You know when low detail is good enough"],
    hints: [
      "Work in floats. Do the two scaling steps in order: first fit the longer side into 2048, then shrink so the shorter side is 768, each only if needed.",
      "Scale both sides by the same factor `s` to keep the aspect ratio. Then `math.ceil(w / 512) * math.ceil(h / 512)` tiles, and `85 + 170 * tiles` tokens.",
    ],
  },
  {
    id: "preference-pairs",
    moduleId: "M13.5",
    topics: ["Building preference pairs", "Avoiding length bias"],
    title: "Build DPO preference pairs and check for length bias",
    difficulty: "m",
    prompt:
      "Write `make_pairs(rated)` where `rated` maps prompt → list of `(response, score)`. For each prompt with at least two responses, pair the highest-scored response (chosen) with the lowest-scored (rejected); skip prompts where those scores are equal. Return `(pairs, longer_share)` where `pairs` is a list of `{\"prompt\", \"chosen\", \"rejected\"}` in prompt order and `longer_share` is the fraction of pairs whose chosen response is longer than the rejected one (rounded to 2 decimals, 0.0 if no pairs). A share near 1.0 is a warning sign: the model may learn \"longer is better\".",
    starter: `def make_pairs(rated):
    pairs = []
    # your code here
    return pairs, 0.0
`,
    solution: `def make_pairs(rated):
    pairs = []
    for prompt, responses in rated.items():
        if len(responses) < 2:
            continue
        best = max(responses, key=lambda r: r[1])
        worst = min(responses, key=lambda r: r[1])
        if best[1] == worst[1]:
            continue
        pairs.append({"prompt": prompt, "chosen": best[0], "rejected": worst[0]})
    if not pairs:
        return pairs, 0.0
    longer = sum(1 for p in pairs if len(p["chosen"]) > len(p["rejected"]))
    return pairs, round(longer / len(pairs), 2)
`,
    tests: [
      ["pairs best with worst", "pairs, _ = make_pairs({'p': [('ok', 3), ('great', 5), ('bad', 1)]})\nassert pairs == [{'prompt': 'p', 'chosen': 'great', 'rejected': 'bad'}]"],
      ["skips ties and singletons", "pairs, share = make_pairs({'a': [('x', 2), ('y', 2)], 'b': [('z', 5)]})\nassert pairs == [] and share == 0.0"],
      ["measures length bias", "_, share = make_pairs({'a': [('long answer', 5), ('no', 1)], 'b': [('short', 4), ('very long wrong', 2)]})\nassert share == 0.5"],
    ],
    checklist: ["You'd look at a sample of pairs by hand", "You can explain what DPO does with these pairs"],
    hints: [
      "For each prompt, find the best and worst response with `max(..., key=lambda r: r[1])` and `min(...)`, and skip when their scores are equal.",
      "After building the pairs, count how many have `len(chosen) > len(rejected)` and divide by the number of pairs.",
    ],
  },
  {
    id: "debug-finetune-compare",
    moduleId: "M13.8",
    kind: "debug",
    topics: ["Same held-out set, same judge"],
    title: "Debug: the fine-tune looks better than it is",
    difficulty: "m",
    prompt:
      "`compare(baseline, tuned)` takes two dicts example id → score (0 to 1) and should report `{\"baseline\", \"tuned\", \"delta\", \"n\"}` averaged over the examples both were scored on, rounded to 3 decimals. The current code reports a big win that disappears on a closer look. Fix it.",
    starter: `def compare(baseline, tuned):
    b = sum(baseline.values()) / len(baseline)
    t = sum(tuned.values()) / len(tuned)
    return {"baseline": round(b, 3), "tuned": round(t, 3), "delta": round(t - b, 3), "n": len(tuned)}
`,
    solution: `def compare(baseline, tuned):
    ids = set(baseline) & set(tuned)
    if not ids:
        raise ValueError("no shared examples")
    b = sum(baseline[i] for i in ids) / len(ids)
    t = sum(tuned[i] for i in ids) / len(ids)
    return {"baseline": round(b, 3), "tuned": round(t, 3), "delta": round(t - b, 3), "n": len(ids)}
`,
    tests: [
      ["same examples only", "base = {'1': 0.5, '2': 0.5, 'hard': 0.0}\ntuned = {'1': 0.6, '2': 0.6}\nassert compare(base, tuned) == {'baseline': 0.5, 'tuned': 0.6, 'delta': 0.1, 'n': 2}"],
      ["identical sets", "assert compare({'a': 1.0}, {'a': 0.0})['delta'] == -1.0"],
      ["nothing shared", "try:\n    compare({'a': 1.0}, {'b': 1.0})\n    assert False\nexcept ValueError:\n    pass"],
    ],
    checklist: ["You can explain how a missing hard example inflated the result", "Your write-up states n"],
    hints: [
      "Look at the first test: the tuned model was never scored on the hard example. What does that do to each average?",
      "Average both models over the ids they share (`set(baseline) & set(tuned)`), and report that count as `n`.",
    ],
  },
];
