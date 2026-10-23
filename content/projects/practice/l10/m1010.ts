import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M1010: ProjectSrc[] = [
  practice("m10-10-llm-specific-incidents", "review",
    pj("Review an incident timeline", 30, "Review an incident timeline and find where detection and diagnosis were slow.",
      [
        ["Read the timeline below and list each step with its time.", "Compute the gaps. Save your work here so you can compare later."],
        ["Mark the longest gaps and the reason for each.", "Quote the lines. Try it on one small example first."],
        ["Write what signal or tool would have shortened each gap.", "Be specific. Write down what you see before changing anything."],
        ["Rank the changes by value and effort.", "Choose the first. Compare with a case you know the answer to."],
      ],
      "A review of an incident timeline with gaps measured, tools proposed and a ranked first change.",
      ["Gaps computed", "Reasons given", "First change chosen"],
      "Look at the lever for each cause next.", ["A text editor"]),
    { starter: code(
      "09:00 provider updates the model. 09:05 refusal rate rises from 2 to 15 percent. 13:40 a customer emails.",
      "14:10 support forwards it. 15:30 someone reads traces. 17:00 the prompt is changed. 17:20 refusals fall.") }),
  practice("m10-10-the-lever-for-each-cause", "extend",
    pj("Add a kill switch", 40, "Extend an app with a configuration lever that turns off a risky feature without a deploy.",
      [
        ["Run the starter and note that turning off the web search tool needs a code change.", "Estimate the time."],
        ["Add a setting that disables a tool and reads from a config store at runtime.", "Cache briefly. Keep a note of each result."],
        ["Show the tool disabled within seconds without a restart.", "Time it. If it feels vague, add a number or an example."],
        ["Log each change to the setting with who and when.", "Check. Check it with someone else or a model if you can."],
      ],
      "A runtime kill switch for a tool that works within seconds and logs each change.",
      ["Setting disables the tool", "Change timed", "Changes logged"],
      "Look at runbooks next.", ["Python 3.11 or newer"]),
    { starter: code(
      "TOOLS = [web_search, send_email, read_file]          # fixed in code") }),
  practice("m10-10-runbooks", "debug",
    pj("The runbook that did not work", 40, "Find why a runbook failed when used and correct it.",
      [
        ["Read the starter runbook and the notes from the person who used it.", "List where they got stuck."],
        ["Find the cause of each stuck point, such as a stale command or missing access.", "Quote it. Do the easy part first, then return to the hard part."],
        ["Correct the runbook and add the missing steps.", "Mark commands as tested."],
        ["Test it again with a fresh person or a fresh environment.", "Record the time. Save your work here so you can compare later."],
      ],
      "A corrected runbook with tested commands and a successful trial by a fresh person.",
      ["Stuck points listed", "Runbook corrected", "Fresh trial succeeded"],
      "Look at re-evaluating on model changes next.", ["A text editor"]),
    { starter: code(
      "Runbook: 1. ssh to prod-1 (the host was replaced last month). 2. Run ./switch_prompt.sh v2 (script renamed).",
      "3. Check the dashboard (link is dead). Notes: took 40 minutes, no one knew the new host name.") }),
  practice("m10-10-re-evaluate-on-model-changes", "optimise",
    pj("Cheaper model re-evaluation", 40, "Reduce the cost and time of re-evaluating a new model without losing important checks.",
      [
        ["Run the starter re-evaluation and record cost and time.", "Note which cases matter most."],
        ["Split the suite into must-run safety and quality cases and optional ones.", "Document the split."],
        ["Run the must-run set first and stop early when it fails.", "Add a stop rule. Try it on one small example first."],
        ["Compare total cost and time with the starter on a good and a bad candidate.", "Report both. Write down what you see before changing anything."],
      ],
      "A staged re-evaluation that stops early on a bad candidate and costs less on a good one.",
      ["Baseline cost recorded", "Cases split into two groups", "Early stop works"],
      "Look at blameless reviews next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "reevaluate(candidate): runs all 600 cases three times, always, about 25 dollars and 40 minutes") }),
  practice("m10-10-blameless-reviews", "challenge",
    pj("Write a review people learn from", 45, "Write a blameless review of a realistic incident that leads to real changes, with no steps given.",
      [],
      "A blameless review of a realistic incident whose actions are specific, owned and checkable.",
      ["A factual timeline with times", "Causes expressed as system conditions, not people", "At least three actions with owners and dates", "A way to check each action worked"],
      "Look at the Level 10 capstone next.", ["A text editor"]),
    { hints: ["Ask why the system allowed the mistake, not who made it.", "Make each action small enough to finish in a week.", "Write how you would know the action worked, such as a test or a metric."] }),
];
