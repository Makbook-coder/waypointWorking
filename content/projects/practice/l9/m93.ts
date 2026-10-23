import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M93: ProjectSrc[] = [
  practice("m9-3-what-a-model-gateway-does", "extend",
    pj("Add redaction to a gateway", 40, "Extend a gateway so personal data is removed before any request leaves your system.",
      [
        ["Run the starter gateway and show that an email address reaches the provider in the logs.", "Save the log line."],
        ["Add a step that replaces emails and phone numbers with tokens before the call.", "Restore them in the reply."],
        ["Make the step part of the gateway so no caller can skip it.", "Test by calling the gateway from two places."],
        ["Test five messages with personal data and show the provider-side text has none.", "Report the results."],
      ],
      "A gateway that removes personal data from every outgoing request and restores it in replies.",
      ["Leak shown in the log", "Redaction in the gateway", "Five messages clean"],
      "Look at routing on task, cost and risk next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def gateway(task, messages):",
      "    log(task, messages)                      # logs raw text",
      "    return provider.chat(messages)") }),
  practice("m9-3-routing-on-task-cost-and-risk", "review",
    pj("Review a routing policy", 30, "Review a routing policy that sends everything to the largest model.",
      [
        ["Read the policy and the traffic mix below and list the task types.", "Estimate each share of traffic."],
        ["For each type, say whether a smaller model could handle it and what you would test.", "Name the test. Do the easy part first, then return to the hard part."],
        ["Compute the monthly cost now and under your proposed routing.", "Show the sums. Save your work here so you can compare later."],
        ["List the risks of your routing and a monitor for each.", "At least two. Try it on one small example first."],
      ],
      "A review with a proposed routing table, monthly costs before and after and monitors for the risks.",
      ["Task types and shares", "Costs computed", "Risk monitors named"],
      "Look at model cascades next.", ["A calculator"]),
    { starter: code(
      "Policy: every request uses the large model. 2,000,000 requests a month, 1,500 tokens each.",
      "Mix: 55 percent greetings and simple lookups, 35 percent summaries, 10 percent contract analysis.",
      "Large model costs 10 times the small model per token.") }),
  practice("m9-3-model-cascades", "optimise",
    pj("Tune the escalation point", 40, "Tune a cascade's threshold to cut cost while keeping accuracy.",
      [
        ["Run the starter cascade on the 40 labelled cases and record accuracy and cost at the current threshold.", "Save the results. Write down what you see before changing anything."],
        ["Try five thresholds and record accuracy, the share escalated and cost.", "Put them in a table."],
        ["Find the cheapest threshold that keeps accuracy within one point of the best.", "Explain the choice."],
        ["Check which cases the cascade gets wrong at that threshold.", "List two patterns."],
      ],
      "A cascade tuned to the cheapest threshold within one point of the best accuracy with the remaining errors described.",
      ["Five thresholds compared", "Threshold chosen with reason", "Error patterns listed"],
      "Look at provider fallbacks and quality risk next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "THRESHOLD = 0.99        # escalates almost everything, so the cascade saves nothing") }),
  practice("m9-3-provider-fallbacks-and-quality-risk", "debug",
    pj("The fallback that made answers worse", 40, "Find why switching to a fallback model broke an output format and fix it.",
      [
        ["Run the starter with the fallback model forced on and list the failures in the replies.", "Quote two. Compare with a case you know the answer to."],
        ["Compare the prompts and formats each model needs.", "Find the difference."],
        ["Add a per-model prompt or format and a validator that retries once.", "Keep the interface the same."],
        ["Rerun the 20 cases on both models and report the pass rate of each.", "The fallback should pass most."],
      ],
      "A fallback path that produces valid output with a per-model prompt and a validator, with pass rates for both models.",
      ["Failures quoted", "Per-model prompt added", "Both pass rates reported"],
      "Look at centralising auth, limits and tracking next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "PROMPT = 'Reply with JSON using double quotes only.'          # tuned for the primary model",
      "fallback replies: \"Sure! Here is the JSON: {'ok': true}\"      # breaks the parser") }),
  practice("m9-3-centralising-auth-limits-and-tracking", "challenge",
    pj("Stop a runaway caller", 45, "Add protection so one noisy caller cannot use the whole budget, with no steps given.",
      [],
      "A gateway protection that contains a runaway caller and shows the damage is capped and visible.",
      ["A per-caller budget enforced by the gateway", "A runaway caller simulated and stopped", "Other callers unaffected during the test", "An alert with the caller name and the cost so far"],
      "Look at breaking latency into components next.", ["Python 3.11 or newer"]),
    { hints: ["Track spend per caller in the gateway before each call, not after the month ends.", "Simulate the runaway with a loop that calls the gateway as fast as it can.", "Check that a normal caller still gets answers while the noisy one is refused."] }),
];
