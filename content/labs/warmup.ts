import type { LabSrc } from "./types";

/**
 * The beginner on-ramp's Python refresher. It lives on M0.1 (Python for AI Engineering) and on
 * /start, for anyone who hasn't written Python before or hasn't in a while.
 */
export const WARMUP_LAB: LabSrc = {
  id: "python-warmup",
  moduleId: "M0.1",
  title: "Python warm-up: the basics you'll use every day",
  goal: "Five small steps that refresh strings, lists, loops, dictionaries, JSON and errors, ending with a tiny chat analyser. If you can finish this, you're ready for L0.",
  preamble: `# Lab: Python warm-up.
# Each step adds a few small functions. Press "Run checkpoint" after each step.
import json
`,
  steps: [
    {
      title: "Strings",
      mode: "guided",
      instructions:
        "Finish `greet(name)` so it returns `\"Hello, <name>!\"`, and `shout(text)` so it returns the text in capitals with `\"!\"` on the end. An f-string like `f\"Hello, {name}!\"` puts a variable inside text.",
      scaffold: `def greet(name):
    # TODO: return "Hello, <name>!" using an f-string
    return ""


def shout(text):
    # TODO: return the text in capitals followed by "!"  (hint: text.upper())
    return text
`,
      solution: `def greet(name):
    return f"Hello, {name}!"


def shout(text):
    return text.upper() + "!"
`,
      tests: [
        ["greet", "assert greet('Asha') == 'Hello, Asha!'"],
        ["shout", "assert shout('ship it') == 'SHIP IT!'"],
      ],
      hints: [
        "Inside an f-string, anything in curly braces is replaced by its value: `f\"Hello, {name}!\"`.",
        "`\"abc\".upper()` gives `\"ABC\"`. Join strings with `+`: `text.upper() + \"!\"`.",
      ],
    },
    {
      title: "Lists and loops",
      mode: "guided",
      instructions:
        "Finish `word_count(text)` (how many words, split on spaces), `total_words(messages)` (the word count of every string in a list, added up) and `longest(words)` (the longest word; the first one if there's a tie; `None` for an empty list).",
      scaffold: `def word_count(text):
    return len(text.split())


def total_words(messages):
    total = 0
    for m in messages:
        # TODO: add this message's word count to total
        pass
    return total


def longest(words):
    if not words:
        return None
    best = words[0]
    for w in words:
        # TODO: if w is longer than best, make it the new best
        pass
    return best
`,
      solution: `def word_count(text):
    return len(text.split())


def total_words(messages):
    total = 0
    for m in messages:
        total += word_count(m)
    return total


def longest(words):
    if not words:
        return None
    best = words[0]
    for w in words:
        if len(w) > len(best):
            best = w
    return best
`,
      tests: [
        ["word count", "assert word_count('one two three') == 3"],
        ["total words", "assert total_words(['hi there', 'how are you']) == 5"],
        ["longest", "assert longest(['ai', 'model', 'token', 'gpu']) == 'model'"],
        ["empty list", "assert longest([]) is None"],
      ],
      hints: [
        "`total += word_count(m)` adds to the running total each time round the loop.",
        "Compare lengths with `len(w) > len(best)`. Using `>` rather than `>=` keeps the first word on a tie.",
      ],
    },
    {
      title: "Dictionaries and JSON",
      mode: "guided",
      instructions:
        "Finish `count_words(text)`: a dictionary from each lowercase word to how many times it appears. Then `to_json(data)` returns the dictionary as a JSON string with keys sorted, and `from_json(text)` turns a JSON string back into Python. APIs send and receive JSON all the time.",
      scaffold: `def count_words(text):
    counts = {}
    for word in text.lower().split():
        # TODO: add 1 to counts[word], starting from 0 if it isn't there yet
        pass
    return counts


def to_json(data):
    return json.dumps(data, sort_keys=True)


def from_json(text):
    # TODO: use json.loads
    return None
`,
      solution: `def count_words(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts


def to_json(data):
    return json.dumps(data, sort_keys=True)


def from_json(text):
    return json.loads(text)
`,
      tests: [
        ["counts words", "assert count_words('The cat and the hat') == {'the': 2, 'cat': 1, 'and': 1, 'hat': 1}"],
        ["round trip", "d = {'b': 2, 'a': [1, 2]}\nassert to_json(d) == '{\"a\": [1, 2], \"b\": 2}'\nassert from_json(to_json(d)) == d"],
      ],
      hints: [
        "`counts.get(word, 0)` gives the current count, or 0 if the word is new.",
        "So the line is `counts[word] = counts.get(word, 0) + 1`. For `from_json`, `return json.loads(text)`.",
      ],
    },
    {
      title: "Handling errors",
      mode: "partial",
      instructions:
        "Real input is messy. Write `parse_int(text, default=0)` that turns a string like `\" 42 \"` into the number 42, and returns `default` instead of crashing when it isn't a whole number. Then write `safe_divide(a, b)` that returns `a / b`, or `None` when `b` is zero.",
      scaffold: `def parse_int(text, default=0):
    """Return int(text), or default if text isn't a whole number."""
    # your code here (try/except ValueError)


def safe_divide(a, b):
    """Return a / b, or None when b is 0."""
    # your code here
`,
      solution: `def parse_int(text, default=0):
    try:
        return int(text.strip())
    except ValueError:
        return default


def safe_divide(a, b):
    if b == 0:
        return None
    return a / b
`,
      tests: [
        ["parses numbers", "assert parse_int(' 42 ') == 42"],
        ["falls back", "assert parse_int('forty', -1) == -1 and parse_int('') == 0"],
        ["divides", "assert safe_divide(10, 4) == 2.5 and safe_divide(1, 0) is None"],
      ],
      hints: [
        "Put the risky line in `try:` and the fallback in `except ValueError:`. `int(\"forty\")` raises `ValueError`.",
        "For division, check `if b == 0: return None` before dividing.",
      ],
    },
    {
      title: "Put it together",
      mode: "open",
      instructions:
        "Write `summarize_chat(messages)` where `messages` is a list of dicts like `{\"role\": \"user\", \"content\": \"...\"}`. Return a dict with `turns` (how many messages), `user_turns` (how many have role `\"user\"`), `words` (total words across all contents) and `top_word` (the most common lowercase word across all contents, ties alphabetically first, `None` if there are no words). Reuse what you wrote above.",
      scaffold: "",
      solution: `def summarize_chat(messages):
    text = " ".join(m["content"] for m in messages)
    counts = count_words(text)
    top = min(counts, key=lambda w: (-counts[w], w)) if counts else None
    return {
        "turns": len(messages),
        "user_turns": sum(1 for m in messages if m["role"] == "user"),
        "words": total_words([m["content"] for m in messages]),
        "top_word": top,
    }
`,
      tests: [
        [
          "summarizes",
          "chat = [{'role': 'user', 'content': 'What is a token'}, {'role': 'assistant', 'content': 'A token is a piece of text'}, {'role': 'user', 'content': 'Thanks'}]\nassert summarize_chat(chat) == {'turns': 3, 'user_turns': 2, 'words': 12, 'top_word': 'a'}",
        ],
        ["empty chat", "assert summarize_chat([]) == {'turns': 0, 'user_turns': 0, 'words': 0, 'top_word': None}"],
      ],
      hints: [
        "Join every message's content into one string and pass it to your `count_words`. `total_words` takes a list of the contents.",
        "The most common word with alphabetical ties is `min(counts, key=lambda w: (-counts[w], w))`. Count user turns with `sum(1 for m in messages if m[\"role\"] == \"user\")`.",
      ],
    },
  ],
  stretch: [
    "Save a chat to a .json file and load it back with `open` and `json.load`.",
    "Write a test file and run it with pytest.",
    "Move on to the L0 lab: the core of a notes REST API.",
  ],
};
