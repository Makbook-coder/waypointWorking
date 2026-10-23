import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M97: ProjectSrc[] = [
  practice("m9-7-the-end-to-end-flow", "review",
    pj("Review a flow diagram", 30, "Review a flow diagram and find missing steps, owners and failure paths.",
      [
        ["Read the flow below and list each step with its input and output.", "Note any step with no output."],
        ["Find the steps with no owner and no failure path.", "List them. Write down what you see before changing anything."],
        ["Add the missing steps such as validation, logging and a fallback.", "Draw the new flow."],
        ["Mark the two steps you would watch most closely in production and why.", "Name a signal. Compare with a case you know the answer to."],
      ],
      "A reviewed flow with missing steps added, owners assigned and two watched steps with signals.",
      ["Steps listed", "Missing steps added", "Watched steps chosen"],
      "Look at deterministic and model-delegated decisions next.", ["A text editor"]),
    { starter: code(
      "User uploads a form -> model extracts fields -> database.",
      "If the extraction looks wrong, someone will notice later. Nothing is logged.") }),
  practice("m9-7-deterministic-vs-model-delegated-decisions", "extend",
    pj("Put a rule in front of the model", 40, "Extend a model-only classifier with rules that handle the obvious cases.",
      [
        ["Run the starter classifier on 40 labelled messages and record accuracy, time and cost.", "Save the results. Keep a note of each result."],
        ["Write rules for the clear cases such as exact phrases and codes.", "Return a label or nothing."],
        ["Call the model only when no rule applies.", "Log which path decided."],
        ["Rerun and compare accuracy, time and cost.", "Check the rules did not make mistakes."],
      ],
      "A classifier with rules for clear cases and a model for the rest that saves time and cost with equal accuracy.",
      ["Baseline recorded", "Rules added for clear cases", "Rules produce no mistakes"],
      "Look at sync, async, queued or long-running work next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def route(message):",
      "    return llm('Which department? ' + message)      # even for 'I want a refund, order #123'") }),
  practice("m9-7-sync-async-queued-or-long-running", "debug",
    pj("Jobs that vanish", 40, "Find why long jobs are lost when a worker restarts and fix the queue.",
      [
        ["Run the starter queue, start three jobs and restart the worker halfway.", "Record which jobs finish."],
        ["Find where the job state is kept and why a restart loses it.", "Quote the lines. If it feels vague, add a number or an example."],
        ["Store job state durably and return unfinished jobs to the queue after a timeout.", "Keep a retry limit."],
        ["Repeat the restart test and show all three finish.", "Show a job that always fails ends as failed."],
      ],
      "A queue that survives worker restarts, retries stuck jobs and ends hopeless jobs as failed.",
      ["Loss reproduced", "State stored durably", "Failed state tested"],
      "Look at avoiding unnecessary agentic complexity next.", ["Python 3.11 or newer"]),
    { starter: code(
      "jobs = []                       # lives only in memory",
      "def worker():",
      "    job = jobs.pop(0)          # removed before it finishes",
      "    run(job)") }),
  practice("m9-7-avoiding-unnecessary-agentic-complexity", "challenge",
    pj("Replace an agent with a workflow", 50, "Replace an agent with a fixed workflow and show it is cheaper and just as good, with no steps given.",
      [],
      "A fixed workflow that matches an agent's quality on a test set at a lower cost and time.",
      ["The agent measured on at least 20 cases", "A workflow built for the same task", "Quality, calls, time and cost compared", "A note on the cases where the agent was better"],
      "Look at component boundaries next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Read the agent's traces to see which steps it takes almost every time.", "Turn those steps into fixed code and keep the model for the parts that need judgment.", "Keep the test cases where the agent chose a different path, since they are your hard cases."] }),
  practice("m9-7-component-boundaries", "optimise",
    pj("Untangle a pipeline", 45, "Untangle a single large function into components with clear interfaces and measure the effect on change.",
      [
        ["Read the starter function and list the jobs it does.", "Mark where data crosses between jobs."],
        ["Split it into functions with typed inputs and outputs.", "Move nothing else."],
        ["Add tests for each component using fake neighbours.", "Run them. Check it with someone else or a model if you can."],
        ["Swap one component for a different version and count the lines you had to change elsewhere.", "It should be none."],
      ],
      "A pipeline split into components with tests and a swap of one component without touching the others.",
      ["Jobs of the function listed", "Components tested alone", "Swap needs no other change"],
      "Look at the module capstone next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def handle(req):",
      "    text = fetch(req.url); chunks = split(text); hits = search(chunks, req.q)",
      "    prompt = build(hits, req.q); out = llm(prompt); log(out); return format(out)") }),
];
