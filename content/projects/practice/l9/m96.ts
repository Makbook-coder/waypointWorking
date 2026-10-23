import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M96: ProjectSrc[] = [
  practice("m9-6-designing-for-every-failure", "debug",
    pj("The silent failure", 40, "Find a failure that nobody noticed and add detection for it.",
      [
        ["Run the starter pipeline with the retrieval service returning nothing and read the reply.", "Note what the user sees."],
        ["Find where the empty result is hidden.", "Quote the lines. Do the easy part first, then return to the hard part."],
        ["Add a check that detects empty or low-quality retrieval and changes the behaviour.", "Log the event. Save your work here so you can compare later."],
        ["Rerun and show the user is told the system could not find information.", "Add a test. Try it on one small example first."],
      ],
      "A pipeline that detects empty retrieval, tells the user honestly and logs the event with a test.",
      ["Silent failure reproduced", "Detection added", "Honest message tested"],
      "Look at timeouts, circuit breakers and queues next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "docs = retrieve(q) or []",
      "return llm('Answer: ' + q + ' Context: ' + ' '.join(docs))      # answers from nothing") }),
  practice("m9-6-timeouts-circuit-breakers-and-queues", "optimise",
    pj("Retry storm", 40, "Fix a retry policy that makes an outage worse and measure the difference.",
      [
        ["Run the starter against a failing service and count the total calls made.", "Note the time. Write down what you see before changing anything."],
        ["Find why retries pile up, such as no waiting, no limit or retries at every layer.", "Draw the layers. Compare with a case you know the answer to."],
        ["Add growing waits with random jitter, a limit and a single layer of retry.", "Add a breaker. Keep a note of each result."],
        ["Rerun and compare calls made and the service's recovery time.", "Report both. If it feels vague, add a number or an example."],
      ],
      "A retry policy with growing waits, jitter, limits and a breaker that makes far fewer calls during an outage.",
      ["Calls counted", "Policy replaced", "Recovery compared"],
      "Look at guardrails at system boundaries next.", ["Python 3.11 or newer"]),
    { starter: code(
      "for attempt in range(100):",
      "    try: return call_service()",
      "    except Exception: continue          # no waiting, and callers above retry too") }),
  practice("m9-6-guardrails-at-system-boundaries", "extend",
    pj("Add the missing boundary", 40, "Extend a system with a check at the one boundary that has none.",
      [
        ["Read the starter system and list its boundaries and which have checks.", "Mark the gap. Check it with someone else or a model if you can."],
        ["Write what could cross the gap and the harm it could cause.", "Give two examples."],
        ["Add a check suited to that boundary, such as a schema, an allow list or a size limit.", "Return a clear error."],
        ["Write five tests that cross the boundary and run them.", "Include two hostile ones."],
      ],
      "A system with a check at the missing boundary and five tests including two hostile cases.",
      ["Missing check found", "Check added at the gap", "Five tests pass"],
      "Look at graceful degradation next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def handle(request):",
      "    ok = validate_input(request)                  # input is checked",
      "    result = run_tool(llm_plan(request))          # tool arguments are not checked",
      "    return format_output(result)                  # output is checked") }),
  practice("m9-6-graceful-degradation", "review",
    pj("Review a degradation plan", 30, "Review a degradation plan and test whether users would understand what is happening.",
      [
        ["Read the plan and write down what the user sees at each level.", "Use the exact words."],
        ["Mark any level where the user could be misled into trusting a worse answer.", "Explain how. Do the easy part first, then return to the hard part."],
        ["Rewrite the user messages so they are honest and useful.", "Keep them short. Save your work here so you can compare later."],
        ["Add the signal that should trigger each move and a number for it.", "Check they do not flap."],
      ],
      "A reviewed degradation plan with honest user messages and numeric triggers that do not flap.",
      ["User views written", "Misleading levels marked", "Triggers have numbers"],
      "Look at human approval for high-risk actions next.", ["A text editor"]),
    { starter: code(
      "Level 1: normal. Level 2: smaller model, no message. Level 3: search results shown as if they were an AI answer.",
      "Move down when errors exceed 1 percent, move up when errors drop below 1 percent.") }),
  practice("m9-6-human-approval-for-high-risk-actions", "challenge",
    pj("Approval that cannot be tricked", 50, "Build an approval flow that resists a model trying to get actions approved by describing them as safe, with no steps given.",
      [],
      "An approval flow that shows real action details, resists misleading descriptions and records every decision.",
      ["The approval shows the real arguments, not a model summary", "A test where the model describes a risky action as harmless", "A safe default when nobody responds", "An audit record of every request and decision"],
      "Look at service-level expectations next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Build the text of the approval request in code from the real arguments.", "Test with a fake model that always claims the action is routine.", "Decide what happens to a request nobody answers and make it the safe one."] }),
  practice("m9-6-service-level-expectations", "reimplement",
    pj("Rebuild an error budget report", 40, "Rebuild a report that shows how much of a service's error budget is used.",
      [
        ["Read the description and write the targets and the window.", "Use a 30-day window."],
        ["Write a function that counts good and bad requests from a log.", "Define bad clearly."],
        ["Compute the budget used, the budget left and the burn rate.", "Show the sums. Try it on one small example first."],
        ["Test with a log that has a bad hour and a log with none.", "Check the alert rule in each."],
      ],
      "An error budget report with budget used, left and burn rate tested on two logs.",
      ["Good and bad defined", "Budget and burn computed", "Alert tested on two logs"],
      "Look at the module capstone next.", ["Python 3.11 or newer"]) ),
];
