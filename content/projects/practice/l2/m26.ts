import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M26: ProjectSrc[] = [
  practice("m2-6-names-descriptions-and-types", "debug",
    pj("The tool the model never picks", 30, "Find why the model never chooses a tool and fix its definition.",
      [
        ["Ask five questions that should use the tool below and record that it is never called.", "Print the tool calls for each."],
        ["List what is wrong with the definition: a vague name, an empty description and untyped parameters.", "Say how each would confuse a reader."],
        ["Rewrite the name, description and parameter types.", "Describe when to use it and when not."],
        ["Rerun the five questions and add two that should not use the tool.", "Both kinds of mistake matter."],
        ["Write the three changes that made the biggest difference.", "Base it on your runs."],
      ],
      "A tool that is chosen on five of five suitable questions and skipped on two unrelated ones.",
      ["Problems with the definition listed", "Rewritten definition tested", "Two negative cases included"],
      "Study ambiguous tools next.", [LLM]),
    { starter: code(
      "tool = {",
      "    'name': 'do_it',",
      "    'description': 'Does the thing.',",
      "    'parameters': {'type': 'object', 'properties': {'x': {}, 'y': {}}},",
      "}",
      "# real behaviour: look up the shipping status of an order by order number and country code") }),
  practice("m2-6-ambiguous-and-overlapping-tools", "challenge",
    pj("Untangle five overlapping tools", 50, "Take five tools that overlap and redesign them so the model chooses correctly, with no steps given.",
      [],
      "A redesigned tool set with a test showing fewer wrong choices than the original.",
      ["The original set has five tools with real overlap, such as three kinds of search", "A test of at least 25 requests with the expected tool exists", "Wrong choices are counted before and after", "Redesign uses merging, renaming or clearer boundaries, and you say which", "The new set has fewer wrong choices and no new failure category you ignored"],
      "Test scale with many tools next.", [LLM]),
    { hints: ["Write a confusion table: expected tool by chosen tool.", "Merging two tools into one with a mode argument is allowed, but check argument errors.", "Each description should say what the tool does not cover."] }),
  practice("m2-6-too-many-undifferentiated-tools", "optimise",
    pj("Shrink the tool list per request", 45, "Cut the number of tools sent per request while keeping accuracy.",
      [
        ["Run the starter with all 40 tools on 20 requests and record accuracy and input tokens.", "Reuse a generated tool list."],
        ["Group the tools into categories and write one line per category.", "Eight groups of five is a good start."],
        ["Select a group with keyword rules or an embedding match, and send only that group's tools.", "Add a fallback with all tools when nothing matches."],
        ["Measure accuracy and tokens again.", "Include the cost of the selection step."],
        ["List two kinds of request the selection step gets wrong and how you would handle them.", "Requests that cross groups are the usual one."],
      ],
      "A comparison of all tools versus selected groups on accuracy and tokens, with two failure cases.",
      ["Baseline recorded", "Selection with a fallback", "Selection cost included", "Failure cases listed"],
      "Treat arguments as untrusted next.", [LLM, "Python 3.11 or newer"]),
    { starter: code(
      "tools = [make_tool(f'tool_{i}', f'Handles task type {i}.') for i in range(40)]",
      "reply = client.chat(messages, tools=tools)   # all 40 sent every time") }),
  practice("m2-6-treating-arguments-as-untrusted", "review",
    pj("Penetration-test a tool", 40, "Review a set of tools for argument abuse and harden them against a list of attacks.",
      [
        ["Read the tools below and write the worst argument you can give each one.", "Think paths, queries and addresses."],
        ["Build a list of 12 hostile arguments, such as `../../secret`, `'; DROP TABLE users;--` and an internal URL.", "Keep them in a file."],
        ["Run each hostile argument against each tool and record which succeed.", "Succeeding is the problem."],
        ["Add allow-lists, path resolution checks and parameterised queries until none succeed.", "Prefer allow-lists to block-lists."],
        ["Write a test that runs all hostile arguments and expects refusals.", "Keep it in the test suite."],
      ],
      "A test file proving twelve hostile arguments are refused by every tool.",
      ["Hostile list written", "Failures recorded before fixing", "Allow-lists used", "All refusals tested"],
      "Learn that descriptions are context next.", ["Python 3.11 or newer", "pytest"]),
    { starter: code(
      "def read_file(path): return open(path).read()",
      "def run_sql(query): return db.execute(query).fetchall()",
      "def fetch_url(url): return requests.get(url).text") }),
  practice("m2-6-tool-descriptions-are-context", "extend",
    pj("A description budget gate", 40, "Extend a tool list with a check that fails when the descriptions get too long.",
      [
        ["Count the tokens used by the tool definitions in the starter.", "Use a tokenizer and sum the JSON of each."],
        ["Set a budget, such as 800 tokens, and write a function that raises when the tools exceed it.", "Print which tool is the largest."],
        ["Shorten the biggest descriptions until the list fits, keeping accuracy.", "Test on 10 requests before and after."],
        ["Add the check to your test suite so a future change cannot silently bloat it.", "Use `pytest` and assert that the total token count is under the budget."],
        ["Write a rule for what belongs in a description and what belongs in the system prompt.", "Think of rarely needed detail."],
      ],
      "A test that fails when tool definitions pass the budget, and a trimmed list with unchanged accuracy.",
      ["Tokens counted per tool", "Budget enforced by a test", "Accuracy rechecked", "Rule written"],
      "Next, multi-step workflows in the following module.", [LLM, "tiktoken"]),
    { starter: code(
      "tools = load_tools('tools.json')",
      "print(len(tools), 'tools')") }),
];
