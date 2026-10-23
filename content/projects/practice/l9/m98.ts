import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M98: ProjectSrc[] = [
  practice("m9-8-wiring-evals-and-feedback-into-production", "extend",
    pj("Add live sampling", 40, "Extend a service to sample live traffic for automatic evaluation without slowing users.",
      [
        ["Run the starter service and note that evaluation only happens offline.", "Record the latency of requests."],
        ["Add a sampler that picks a share of requests and sends them to an evaluator after the reply is sent.", "Make the share a setting."],
        ["Store the scores with the trace id.", "Print the average for the day."],
        ["Show that user latency does not change and that a bad answer is flagged.", "Report both. Do the easy part first, then return to the hard part."],
      ],
      "A service that samples live requests, scores them after the reply and shows no added user latency.",
      ["Sampler works", "Scores stored by trace id", "Latency unchanged"],
      "Look at what to monitor next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def handle(q):",
      "    answer = llm(q)",
      "    return answer          # nothing is stored for later evaluation") }),
  practice("m9-8-what-to-monitor", "review",
    pj("Review a dashboard", 30, "Review a dashboard and decide which signals are missing for an AI feature.",
      [
        ["Read the dashboard description and list each metric.", "Note whether it shows quality, speed, cost or safety."],
        ["Find what is missing from each of the four groups.", "List at least one for each."],
        ["For each missing item, write how to compute it and a normal range.", "Use numbers. Save your work here so you can compare later."],
        ["Mark which metrics would not have caught last month's problem and why.", "Describe it. Try it on one small example first."],
      ],
      "A dashboard review that finds missing signals, defines them with ranges and explains why last month's problem was missed.",
      ["Metrics grouped", "Missing signals defined", "Missed problem explained"],
      "Look at explicit and implicit feedback next.", ["A text editor"]),
    { starter: code(
      "Dashboard: requests per hour, average latency, error rate, total monthly spend.",
      "Last month the assistant started giving outdated policy answers for two weeks. No chart changed.") }),
  practice("m9-8-explicit-and-implicit-feedback", "reimplement",
    pj("Rebuild a feedback collector", 40, "Rebuild a collector that records thumbs and behaviour signals against the right trace.",
      [
        ["Read the description and define the events: thumbs, copy, edit and retry.", "Give each a field list."],
        ["Write a function that stores an event with the trace id and a time.", "Reject events with an unknown trace."],
        ["Write a summary that computes a score per answer and per day.", "Show it for fake data."],
        ["Test with duplicate events and out-of-order events.", "Fix any problem. Write down what you see before changing anything."],
      ],
      "A feedback collector that stores events by trace id and produces daily scores, tested with duplicates and out-of-order events.",
      ["Events defined", "Summary computed", "Duplicates handled"],
      "Look at turning failures into evaluation cases next.", ["Python 3.11 or newer"]) ),
  practice("m9-8-failures-become-evaluation-cases", "debug",
    pj("A suite that passed everything", 40, "Find why a suite passes while users still report failures and fix it.",
      [
        ["Run the starter suite and read the list of user-reported failures.", "Check which the suite covers."],
        ["Find why the suite misses them, such as easy cases only or exact matching that is too lenient.", "Quote examples. Compare with a case you know the answer to."],
        ["Add five cases from the reported failures with strict checks.", "Remove personal data."],
        ["Rerun and show the suite now fails on them.", "Fix one and show it pass."],
      ],
      "A suite that fails on the reported problems after five added cases and passes after one fix.",
      ["Gaps in the suite found", "Five cases added", "One fix turns a case green"],
      "Look at versioning for traceable regressions next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "CASES = [('What is the leave policy?', 'leave')]      # passes if the word 'leave' appears",
      "Reported: the bot gives last year's leave numbers and invents an appeals process.") }),
  practice("m9-8-versioning-for-traceable-regressions", "challenge",
    pj("Find the culprit in a week of changes", 50, "Given traces and a version history, find which change caused a regression, with no steps given.",
      [],
      "A diagnosis that names the change that caused a regression with evidence from versioned traces.",
      ["Scores split by prompt, model and index versions", "The causing change identified with numbers", "A rollback or fix proposed", "A note on the extra data you wish the traces had recorded"],
      "Look at deploy, observe, improve and redeploy next.", ["Python 3.11 or newer"]),
    { hints: ["Group the scores by each version field in turn and look for a field that splits good from bad.", "Check that the cases in each group are similar, otherwise the split may mislead.", "Confirm your diagnosis by rerunning the old and new versions on the same cases."] }),
  practice("m9-8-deploy-observe-improve-redeploy", "optimise",
    pj("Shorten the loop", 45, "Shorten the time from noticing a problem to a safe fix.",
      [
        ["Read the starter timeline of an incident and mark each wait.", "Add the time of each."],
        ["Find the three longest waits and a reason for each.", "Such as manual copying or unclear owners."],
        ["Propose and build one automation for the longest wait, for example a script that turns flagged traces into cases.", "Test it. Keep a note of each result."],
        ["Recompute the timeline with your change.", "Report the new total."],
      ],
      "A timeline with the longest waits found, one automation built and a shorter recomputed total.",
      ["Waits marked", "Automation built", "Total recomputed"],
      "Look at the module capstone next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Mon 09:00 users report wrong answers. Wed 14:00 someone reads traces. Thu 11:00 cases written by hand.",
      "Fri 16:00 fix released. Total 8 days. No one owns the process.") }),
];
