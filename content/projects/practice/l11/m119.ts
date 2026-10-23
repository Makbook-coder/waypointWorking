import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M119: ProjectSrc[] = [
  practice("m11-9-what-travels-and-what-does-not", "debug",
    pj("Prompts that only work in one place", 40, "Find why prompts that worked on one platform fail on another and make them portable.",
      [
        ["Run the starter prompts on both platforms and list the failures.", "Quote two. Do the easy part first, then return to the hard part."],
        ["Find platform-specific syntax or assumptions.", "Mark them. Save your work here so you can compare later."],
        ["Rewrite the prompts to be portable, with differences in an adapter.", "Test. Try it on one small example first."],
        ["Report the pass rate on both platforms before and after.", "Table. Write down what you see before changing anything."],
      ],
      "Prompts rewritten to work on both platforms with an adapter for differences and pass rates before and after.",
      ["Failures listed", "Assumptions marked", "Pass rates compared"],
      "Look at keeping an abstraction in place next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "Prompt: '<<SYS>> You are a helper. [INST] {question} [/INST]' with 'Human:' and 'Assistant:' turns hand-written inside.") }),
  practice("m11-9-keeping-an-abstraction-in-place", "review",
    pj("Review where the abstraction leaks", 30, "Review a codebase's abstraction and find where platform details leak through.",
      [
        ["Read the snippets below and list the platform names that appear.", "Note the files. Compare with a case you know the answer to."],
        ["Mark which leaks are harmful and which are fine.", "Explain. Keep a note of each result."],
        ["Write the refactoring for the worst two.", "Describe each. If it feels vague, add a number or an example."],
        ["Write a check that fails the build when a leak appears.", "Name the pattern. Check it with someone else or a model if you can."],
      ],
      "A review of abstraction leaks with harmful ones marked, a refactoring for two and a build check.",
      ["Names listed", "Leaks judged", "Build check described"],
      "Look at the real costs of lock-in next.", ["A text editor"]),
    { starter: code(
      "app/chat.py: from bedrock_client import invoke_bedrock; reply = invoke_bedrock(model_id='anthropic.xyz', body=...)",
      "app/rag.py: uses 'bedrock_kb_id' in the function signature.  app/prompts.py: if platform == 'azure': system_role = 'developer'") }),
  practice("m11-9-the-real-costs-of-lock-in", "extend",
    pj("Add exit costs to the budget", 35, "Extend a cost model with the cost of leaving and the probability you will need to.",
      [
        ["Read the starter model and note it has no exit cost.", "List what it contains."],
        ["Add an exit cost in days and money and a yearly probability of needing it.", "Justify the numbers."],
        ["Compute the expected yearly lock-in cost.", "Show the sum. Do the easy part first, then return to the hard part."],
        ["Compare with the cost of keeping an abstraction.", "Decide. Save your work here so you can compare later."],
      ],
      "A cost model with exit cost and probability that gives an expected yearly lock-in cost compared with the abstraction cost.",
      ["Exit cost added", "Expected cost computed", "Comparison decided"],
      "Look at migration as an evaluation exercise next.", ["A spreadsheet or Python 3.11"]),
    { starter: code(
      "Platform A yearly cost 120,000. Platform B yearly cost 135,000. Choice: A (15,000 cheaper).") }),
  practice("m11-9-migration-as-an-evaluation-exercise", "challenge",
    pj("Prove the move is safe", 55, "Prove with an evaluation that a move to another platform is safe, with no steps given.",
      [],
      "A migration evaluation that compares platforms across quality, safety, format and latency and gives a clear decision.",
      ["At least 40 cases including safety and format cases", "Repeated runs on both platforms with spread reported", "Differences fixed where possible with prompt or adapter changes", "A decision record with the remaining risks"],
      "Look at catalog lag and deprecation next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Include cases from past incidents; they are the ones most likely to differ.", "Report the spread so you do not mistake noise for a difference.", "Write the pass rule before you run the comparison."] }),
  practice("m11-9-catalog-lag-and-deprecation", "optimise",
    pj("Plan the model roadmap", 35, "Turn a list of model retirement dates into a yearly plan that avoids rushed migrations.",
      [
        ["Read the starter list of models used and retirement dates.", "Sort by date. Try it on one small example first."],
        ["Estimate the migration time for each, using your earlier numbers.", "Add a margin. Write down what you see before changing anything."],
        ["Schedule migrations to spread the work and avoid overlaps.", "Draw a timeline. Compare with a case you know the answer to."],
        ["Find any that cannot be done in time and say what you would do.", "Options. Keep a note of each result."],
      ],
      "A yearly migration timeline that spreads the work and flags any that cannot be done in time.",
      ["Dates sorted", "Schedule drawn", "Impossible ones flagged"],
      "Look at running two platforms in parallel next.", ["A spreadsheet or text editor"]),
    { starter: code(
      "model-a retires in 5 months; model-b in 6 months; model-c in 14 months. Each migration needs about 3 weeks plus evaluation of 1 week.") }),
  practice("m11-9-running-two-platforms-in-parallel", "reimplement",
    pj("Rebuild a traffic splitter", 45, "Rebuild a splitter that sends a controlled share of traffic to a new platform.",
      [
        ["Write the requirements: stable user assignment, adjustable share and a kill switch.", "Add numbers. If it feels vague, add a number or an example."],
        ["Write the splitter using a hash of the user id.", "Test the share. Check it with someone else or a model if you can."],
        ["Add logging of which backend served each request.", "Check. Do the easy part first, then return to the hard part."],
        ["Test the kill switch and compare with the starter.", "Report. Save your work here so you can compare later."],
      ],
      "A traffic splitter with stable assignment, an adjustable share, logs and a kill switch.",
      ["Share is stable", "Backend logged", "Kill switch works"],
      "Look at multi-cloud honestly next.", ["Python 3.11 or newer"])),
  practice("m11-9-multi-cloud-honestly", "review",
    pj("Review a multi-cloud proposal", 30, "Review a proposal to run on two clouds and judge whether it is worth it.",
      [
        ["Read the proposal and list its reasons.", "Mark which are solid."],
        ["List the costs it ignores such as people, security and testing.", "Estimate. Try it on one small example first."],
        ["Suggest a smaller step that gets most of the benefit.", "Describe. Write down what you see before changing anything."],
        ["Write the trigger to revisit.", "Give a number. Compare with a case you know the answer to."],
      ],
      "A review of a multi-cloud proposal with solid reasons marked, ignored costs estimated and a smaller step.",
      ["Reasons assessed", "Costs estimated", "Smaller step and trigger"],
      "Look at the module capstone next.", ["A text editor"]),
    { starter: code(
      "Proposal: run everything on two clouds at all times so that we are never locked in. Team of five. Budget unchanged.") }),
];
