// The "Stuck? start here" ladder for coding tasks: hint 1 points at the approach, hint 2 at the
// tricky part. The reference solution is the third rung. Keyed by task id; the build fails if a
// task has no hints or a hint names an unknown task.

export const CODING_HINTS: Record<string, [string, string]> = {
  "py-batched": [
    "Keep a list called `batch`. Append each item, and when it reaches `size` items, `yield` it and start a new empty list.",
    "After the loop ends there may be a partial batch left over. Yield it only if it isn't empty. Check `size < 1` before the loop.",
  ],
  "py-env-config": [
    "Use `env.get(name, default)` for each setting, and convert the strings: `int(...)` for max_tokens, a set of truthy words for debug.",
    "Check the key first: `key = env.get(\"API_KEY\", \"\")`, and `raise KeyError` if it's empty. For debug, `.strip().lower() in {\"1\", \"true\", \"yes\"}`.",
  ],
  "http-retry-policy": [
    "Two conditions must both be true: the method is idempotent and the status is retryable. Put each list in a set.",
    "Normalize the method with `.upper()` so `get` and `GET` behave the same, then `return method.upper() in IDEMPOTENT and status in RETRYABLE`.",
  ],
  "pydantic-like-validate": [
    "Start with `errors = []` and check every field separately, appending a dict for each problem. Don't return early.",
    "`title` must be a `str` whose `.strip()` is non-empty and at most 120 chars. `tags` defaults to `[]` and every element must be a `str`. Return 422 if `errors` is non-empty.",
  ],
  "sql-param-query": [
    "Values become `%s` placeholders in the SQL and go in the `params` tuple. Only the column name is put into the string, so check it against an allow-list first.",
    "`ORDER BY {order_by} DESC` is safe only after `if order_by not in {\"score\", \"created_at\"}: raise ValueError`. The index is the equality column first, then the range column: `(\"owner\", \"score\")`.",
  ],
  "token-cost": [
    "Prices are per million tokens, so cost = (input × price_in + output × price_out) / 1,000,000.",
    "For the month, compute the cost of one average request, multiply by requests per day and by days, then round to 2 decimals.",
  ],
  "sampling-temperature": [
    "Softmax: divide each logit by the temperature, take `math.exp`, then divide each by the total. Subtract the max logit first so `exp` can't overflow.",
    "For top-p, sort tokens by probability (highest first) and keep adding until the running total reaches `p`. Then divide each kept probability by the kept total.",
  ],
  "chat-history-window": [
    "Split the problem: pull out the system message (if it's first) and the last message. Those are always kept and their tokens count against the budget.",
    "Walk the remaining middle messages from newest to oldest, stopping the first time one doesn't fit. Reverse what you collected so it's back in original order.",
  ],
  "stream-accumulate": [
    "Keep one growing string. After adding each delta, check the whole string for `stop`, not just the new delta, because the stop text can be split across chunks.",
    "When you find it, `return text[: text.index(stop)], True` straight away so you stop reading the stream. If the loop finishes, return `(text, False)`.",
  ],
  "json-repair-loop": [
    "Loop `max_tries` times. In each try, call the model, `json.loads` the reply inside `try/except json.JSONDecodeError`, and check it's a dict with every required key.",
    "Keep a `note` string that you append to the prompt on the next try, describing what went wrong. After the loop, `raise ValueError`.",
  ],
  "tool-loop": [
    "Keep a `messages` list starting with the user message. Each step: call `model(messages)`. If it returns text, you're done; if it returns a tool call, run it and append the result.",
    "Look the tool up with `tools.get(name)` and wrap the call in `try/except Exception`, so a missing tool or an error becomes the tool message's content instead of a crash.",
  ],
  "bounded-concurrency": [
    "Create `sem = asyncio.Semaphore(limit)`. Wrap each function in a small `async def` that does `async with sem: return await fn()`.",
    "`asyncio.gather(...)` returns results in the order you passed the awaitables in, whatever order they finish in, so input order is kept for free.",
  ],
  "backoff-jitter": [
    "Loop `for attempt in range(retries + 1)`, return `fn()` on success, and catch only `TransientError`. Other exceptions should not be caught at all.",
    "On the last attempt, `raise` instead of sleeping. Otherwise sleep for `rand() * min(cap, base * 2 ** attempt)`.",
  ],
  "prompt-delimit": [
    "You only need to neutralize the opening and closing tags inside the document. `re.sub` with `re.IGNORECASE` can do it in one go.",
    "The pattern `<(/?document)` matches both `<document` and `</document`. Replace with `&lt;\\1` to keep the tag name but break the tag.",
  ],
  "few-shot-builder": [
    "Group examples by label in a dict. Dicts keep insertion order, so the labels stay in order of first appearance.",
    "Then go round-robin: take the 1st example of each label, then the 2nd of each, and so on, stopping when you have `k` (or run out of examples).",
  ],
  "injection-screen": [
    "Write one regex per signal in a dict, `{\"override\": ..., \"role\": ..., \"exfil\": ...}`, and keep the names whose pattern matches with `re.IGNORECASE`.",
    "For override, allow a few words between the verb and the target: `\\b(ignore|disregard)\\b.{0,20}\\b(previous|prior|all|above)\\b`. For exfil, look for `https?://\\S+\\?` followed by `{` or `secret`.",
  ],
  "chunk-overlap": [
    "Each new chunk starts `size - overlap` words after the previous one. Loop `start` over `range(0, len(words), step)`.",
    "Stop as soon as a chunk reaches the end of the text (`start + size >= len(words)`), otherwise the next chunk would only repeat overlap words.",
  ],
  "cosine-topk": [
    "Cosine = dot product divided by the product of the two vector lengths (norms). Return 0.0 if either norm is zero.",
    "Score every doc, then sort with `key=lambda t: (-t[1], t[0])` to get score descending with id as the tiebreak, and slice `[:k]`.",
  ],
  "bm25": [
    "Tokenize every doc once. Count document frequency (`df`) per term using a `set` of each doc's tokens, and compute the average doc length.",
    "For each doc and query term in it: `idf × f × (k1 + 1) / (f + k1 × (1 − b + b × len(doc) / avgdl))`, where `f` is the term's count in that doc. Sum over query terms.",
  ],
  "rrf": [
    "Keep a dict of scores. For every ranked list, loop with `enumerate(ranking, start=1)` and add `1 / (k + rank)` to that id's score.",
    "Sort the ids with `key=lambda d: (-scores[d], d)` so higher scores come first and ties go alphabetically.",
  ],
  "retrieval-metrics": [
    "Loop over the queries in `relevant` (not in `results`). For recall@k, compare the first `k` results with the relevant set.",
    "For MRR, find the position of the first relevant result (starting at 1) and use 1/position, or 0 if none is found. Average over queries.",
  ],
  "rag-prompt-citations": [
    "Filter by `min_score`, sort the rest by score descending, then add chunks one at a time while the total text length stays within `max_chars`.",
    "If nothing was picked, return `None`. Otherwise label each chunk `[id] text` and build a prompt that says: answer only from sources, cite ids in brackets, say \"I don't know\" otherwise.",
  ],
  "citation-check": [
    "`re.findall(r\"\\[([^\\[\\]]+)\\]\", answer)` gives every id inside brackets. Use a `seen` set to drop repeats while keeping first-use order.",
    "Split sentences with `re.split(r\"[.!?]\", answer)`, ignore empty pieces, and count the ones with no `[...]` in them.",
  ],
  "react-loop-guard": [
    "Turn each call into one comparable key: the tool name plus `json.dumps(args, sort_keys=True)`, so key order doesn't matter.",
    "Stuck if the last `window` keys are all the same (`len(set(keys[-window:])) == 1`), or if any key's total count is greater than `window` (use `Counter`).",
  ],
  "tool-result-trim": [
    "Slice `rows[:max_rows]` and build a new dict per row with only the wanted fields: `{f: r.get(f) for f in fields}`.",
    "`total` is the length of the full input, and `truncated` is simply `len(rows) > max_rows`.",
  ],
  "memory-store": [
    "Store `key -> (text, order)` where `order` comes from a counter that goes up on every write, so you know which memory is newest.",
    "To recall, score each memory by the size of the set intersection of lowercase words, skip zero scores, and sort by `(-score, -order)`.",
  ],
  "budget-guard": [
    "In `__init__` save the limits, record `start = clock()`, and set steps to 0 and cost to 0.0.",
    "In `charge`, add first, then check in order: steps, cost, time (`clock() - start`). Raise `BudgetExceeded(\"steps\")` and so on.",
  ],
  "context-compact": [
    "If there are no more than `keep_last` messages, return them unchanged. Otherwise split into `older` and `recent` at `len(messages) - keep_last`.",
    "Join the older contents into one string, summarize it, and find ids with `re.findall(r\"[A-Z]{2,}-\\d+\", text)`. `dict.fromkeys(...)` removes duplicates in first-seen order.",
  ],
  "cache-friendly-prompt": [
    "Make two lists, one for stable parts and one for changing parts, each in the order given, and join stable + changing with `\"\\n\\n\"`.",
    "For the shared prefix, walk both strings together with `zip` and count until the first character that differs.",
  ],
  "eval-gate": [
    "Loop over `thresholds`, not `scores`, so a missing metric is noticed. Each problem becomes one string in a `failures` list.",
    "Check the threshold first; only if it passes, compare with the baseline (`baseline[metric] - score > max_drop`). Format numbers with `:.2f` and return `(not failures, sorted(failures))`.",
  ],
  "pii-redact": [
    "Write one compiled regex per kind and apply them one after another with `.sub`. Emails and keys first, phones last, so digits inside a key aren't taken as a phone.",
    "A phone is ten digits with optional spaces or dashes between them, an optional `+91` or `+1` prefix, and no digit directly before or after: `(?<!\\d)` and `(?!\\d)`.",
  ],
  "semantic-cache": [
    "Store each entry as `(vector, answer, owner)`, where owner is the user for personal answers and `None` for shared ones.",
    "In `get`, skip entries owned by someone else, compute cosine with the query vector, and keep the best one whose similarity is at least the threshold.",
  ],
  "circuit-breaker": [
    "Track `failures` and `opened_at` (None when closed). Work out the state from those: closed, open (cooldown not over) or half-open (cooldown over).",
    "While open, return `fallback()` without calling `fn`. On a failure, open (set `opened_at = clock()`) if you were half-open or hit the threshold. On success, reset both.",
  ],
  "gpu-memory": [
    "Weights: parameters × bits / 8 gives bytes. With params in billions, multiply by 1e9 first, then divide by 1e9 for GB.",
    "KV cache: 2 × layers × kv_heads × head_dim × seq_len × batch × bytes_per, divided by 1e9. Round both to 2 decimals.",
  ],
  "wer": [
    "This is edit distance on words instead of characters. Build a table where cell (i, j) is the distance between the first i reference words and first j hypothesis words.",
    "Each cell is the minimum of deletion (above + 1), insertion (left + 1) and substitution (diagonal + 0 or 1). Divide the final cell by the reference length.",
  ],
  "leak-free-split": [
    "Every example's split must depend only on its group key, never on its position, so the same group always lands in the same place.",
    "Compute `int(hashlib.sha256(g.encode()).hexdigest(), 16) % 100` and send the example to test when that is below `test_ratio * 100`.",
  ],
  "lora-params": [
    "For one matrix, A has `r × d_in` numbers and B has `d_out × r`. Add those for each shape.",
    "`sum(r * (d_in + d_out) for d_out, d_in in shapes)`. The scaling is just `alpha / r`.",
  ],
};
