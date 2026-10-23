import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M67: ProjectSrc[] = [
  practice("m6-7-the-cost-of-resending-static-context", "extend",
    pj("Add a cost meter", 40, "Extend an agent so it prints what each call and the whole run cost.",
      [
        ["Run the starter and read the usage fields in one response.", "Print the usage fields so you can see which ones hold the input, output and cached tokens."],
        ["Add a meter that adds input, output and cached tokens across calls.", "Use your provider's prices."],
        ["Print a summary at the end showing static tokens, new tokens and total cost.", "Keep the summary short, a few lines, so it is easy to read at the end of a run."],
        ["Test the meter with fake usage numbers and check the arithmetic.", "Use round numbers."],
      ],
      "An agent with a cost meter that reports static tokens, new tokens and total cost, tested with fake numbers.",
      ["Usage fields printed", "Meter adds calls", "Arithmetic test passes"],
      "Look at structuring for cache hits next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def call(messages):",
      "    reply = client.messages.create(model=MODEL, messages=messages, system=SYSTEM)",
      "    return reply         # usage is never read") }),
  practice("m6-7-structuring-for-cache-hits", "review",
    pj("Review a prompt for caching", 30, "Review a prompt and find what stops a cache from being used.",
      [
        ["Read the prompt layout below and mark each part as stable or changing.", "Use a table with each part of the prompt and whether it changes between calls."],
        ["Find at least three things that would break a cached prefix.", "Quote each item that would change the prefix, such as a date or a user name."],
        ["Explain how each one makes the cost higher.", "Use a rough number."],
        ["Write a reordered layout that would hit the cache.", "Keep the meaning of the prompt the same while you move the changing parts to the end."],
      ],
      "A review of a prompt layout with three cache breakers, their cost and a reordered layout.",
      ["Parts marked", "Three breakers found", "Layout reordered"],
      "Look at stable context versus changing state next.", ["Python 3.11 or newer"]),
    { starter: code(
      "1. 'Today is {date}, you are talking to {user_name}.'",
      "2. Company rules (4,000 tokens, never change)",
      "3. Tool definitions (6,000 tokens, never change)",
      "4. Long document (20,000 tokens, changes once a week)",
      "5. Conversation so far, then the new question") }),
  practice("m6-7-stable-context-vs-changing-state", "debug",
    pj("The cache never hits", 40, "Find why the cache is never used even though the prompt looks the same each time.",
      [
        ["Run the starter twice and read the cache fields in the usage data.", "Save the numbers so you can compare the cache fields with the later run."],
        ["Print a hash of the stable part for each call and compare them.", "Find the call where it changes."],
        ["Find the hidden change, such as a timestamp or a reordered key, and remove it.", "Rerun after the fix and check the hash stays the same on every call."],
        ["Add a test that checks the hash of the stable part stays the same across calls.", "Run the test once to see it pass, then change the prompt to see it fail."],
      ],
      "A prompt whose stable part has the same hash across calls and now hits the cache, with a test to keep it that way.",
      ["Zero hits observed", "Changing part found", "Hash test passes"],
      "Look at cutting redundant tokens next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def system_prompt():",
      "    return f'{RULES}\\nNow: {datetime.now().isoformat()}\\nTools: {json.dumps(tools)}'   # dict order may vary") }),
  practice("m6-7-cutting-redundant-tokens", "reimplement",
    pj("Rebuild a prompt linter", 45, "Rebuild a small linter that finds redundant text in a prompt from its list of checks.",
      [
        ["Read the list of checks and write a test for each.", "Use short prompts."],
        ["Write checks for repeated sentences, repeated instructions and long unused examples.", "Return line numbers."],
        ["Make the tests pass and run the linter on a real prompt.", "Count the findings."],
        ["Fix three findings and compare token counts before and after.", "Check behaviour is unchanged."],
      ],
      "A prompt linter that finds repeated text, tested against a list of checks and used to shorten a real prompt.",
      ["Tests for each check", "Linter finds repeats", "Real prompt shortened safely"],
      "Look at measuring cache utilization next.", ["Python 3.11 or newer"]),
    {}),
  practice("m6-7-measuring-cache-utilization", "optimise",
    pj("Raise the hit rate", 40, "Raise the cache hit rate of a multi-turn agent and measure the saving.",
      [
        ["Run the starter for 15 turns and log the hit rate for each turn.", "Save the log so you can compare it with the log after your changes."],
        ["Find the turns with the lowest rate and read their prompts.", "Write the cause of each low turn in one line, such as a changed prefix or a new tool."],
        ["Reorder the prompt and remove the cause.", "Keep behaviour unchanged."],
        ["Rerun 15 turns and compare the hit rate and the cost.", "Use a table with the hit rate and the cost for both runs."],
      ],
      "A higher cache hit rate over 15 turns with the cause fixed and cost compared before and after.",
      ["Baseline hit rate logged", "Cause found and fixed", "Cost compared"],
      "Move on to harness engineering.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def messages_for(turn):",
      "    return [{'role': 'system', 'content': f'Turn {turn}. ' + BASE_RULES}] + history     # the turn number changes the prefix") }),
];
