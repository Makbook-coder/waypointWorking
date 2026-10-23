import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M63: ProjectSrc[] = [
  practice("m6-3-summarizing-history-without-losing-goals", "debug",
    pj("The summary forgot the goal", 40, "Find why a summarized chat loses the user's goal and fix the summary step.",
      [
        ["Run the starter chat and ask what the original goal was after the summary.", "Save the wrong answer."],
        ["Read the summary prompt and find what it tells the model to keep.", "Quote the line of the summary prompt that decides what is kept so you can change it."],
        ["Change it to keep the goal, decisions and open tasks and keep the goal outside the summary as well.", "Rerun the chat after the change and ask for the goal again to see if it is kept."],
        ["Add a test that asks for the goal after three summaries.", "Check the answer matches."],
      ],
      "A summary step that keeps the goal across three summaries, with a test that asks for it.",
      ["Forgotten goal reproduced", "Summary prompt fixed", "Three-summary test passes"],
      "Look at compacting large tool outputs next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "SUMMARY_PROMPT = 'Summarize the conversation so far in a few sentences.'",
      "def compact(history):",
      "    return [{'role': 'user', 'content': summarize(history[:-4])}] + history[-4:]   # the first message held the goal") }),
  practice("m6-3-compacting-large-tool-outputs", "optimise",
    pj("Smaller tool results", 40, "Reduce the tokens that tool results add to a run without hurting the answers.",
      [
        ["Run the starter on eight tasks and record the tokens each tool result adds.", "Save the answers so you can compare them with the answers after the filter."],
        ["Select only the needed fields from the JSON results and truncate long text.", "Add a note when text is cut."],
        ["Rerun the eight tasks and compare answers with the saved ones.", "Mark any that changed."],
        ["Fix the filter for any task that got worse and report final token numbers.", "Use a table with the task, the tokens before, the tokens after and whether the answer changed."],
      ],
      "A result filter that cuts tool tokens while keeping eight answers correct, with a before and after table.",
      ["Baseline tokens and answers saved", "Filter keeps needed fields", "Changed answers fixed"],
      "Look at rolling and hierarchical summaries next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def run_tool(name, args):",
      "    result = TOOLS[name](**args)         # full JSON, sometimes 8,000 tokens",
      "    history.append({'role': 'tool', 'content': json.dumps(result)})") }),
  practice("m6-3-rolling-and-hierarchical-summaries", "review",
    pj("Review a summary chain", 30, "Review a rolling summary system and find where facts decay over time.",
      [
        ["Read the three summary versions below and list the facts in the first one.", "Number the facts so you can refer to each one when you compare the later versions."],
        ["Mark which facts are missing or changed in the second and third versions.", "Use a table with one row for each fact and one column for each version."],
        ["Name the cause of each loss, such as repeated rewording or a word limit.", "Quote the wording."],
        ["Propose changes to the update prompt that would stop the decay.", "Keep to three changes so each one can be tried and measured on its own."],
      ],
      "A review tracking fact decay across three summary versions with causes and three proposed changes.",
      ["Facts numbered", "Losses tabulated", "Three changes proposed"],
      "Look at preserving exact structured data next.", ["Python 3.11 or newer"]),
    { starter: code(
      "v1: Order #48213 for Ana, 3 blue chairs, due 14 March, refund agreed up to 40 USD.",
      "v2: Ana ordered chairs, due mid-March, a small refund was agreed.",
      "v3: A customer wants furniture and a refund may be possible.") }),
  practice("m6-3-preserving-exact-structured-data", "challenge",
    pj("Never lose an id", 50, "Keep exact values correct through many compactions, with no steps given.",
      [],
      "A compaction setup that keeps every exact value correct through five compactions.",
      ["A test chat with at least 15 exact values such as ids, dates and amounts", "Five compactions run on the chat", "Every exact value is checked against the original", "A note explains what you stored outside the summary and why"],
      "Look at reduction versus information loss next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Do not ask the model to copy exact values through a summary, store them in a separate structure.", "Write the checker first so it compares every value with the original.", "Make the structure update by key so a changed value replaces the old one."] }),
  practice("m6-3-reduction-vs-information-loss", "reimplement",
    pj("Rebuild a loss meter", 45, "Rebuild a small tool that measures how much information a compression step loses.",
      [
        ["Read the description of the meter and write the three inputs and outputs it needs.", "Write the inputs and outputs in plain words so the meter can be tested before it is built."],
        ["Write a function that takes a document, its compressed form and a list of questions with answers.", "Return an accuracy score."],
        ["Test it with an uncompressed copy, a half-length summary and an empty summary.", "Check the ordering of scores."],
        ["Use it to compare two compression prompts on one document.", "Report the winner."],
      ],
      "A loss meter that scores compression by question accuracy and ranks two compression prompts.",
      ["Inputs and outputs written", "Meter passes three checks", "Two prompts compared"],
      "Move on to memory and state offloading.", ["Python 3.11 or newer", LLM]),
    {}),
];
