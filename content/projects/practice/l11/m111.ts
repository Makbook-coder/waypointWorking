import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M111: ProjectSrc[] = [
  practice("m11-1-three-ways-to-consume-a-model", "review",
    pj("Review a vendor choice memo", 30, "Review a memo that picks a public API and find what it missed.",
      [
        ["Read the memo below and list its claims.", "Note which have evidence."],
        ["List the questions about data, cost and control that it does not answer.", "At least five. Write down what you see before changing anything."],
        ["Say which of the other two paths might fit better and why.", "One paragraph. Compare with a case you know the answer to."],
        ["Rewrite the recommendation with what must be verified first.", "Make it short. Keep a note of each result."],
      ],
      "A reviewed memo with unanswered questions, an alternative path considered and a rewritten recommendation.",
      ["Claims listed", "Five questions asked", "Recommendation rewritten"],
      "Look at open weights without running GPUs next.", ["A text editor"]),
    { starter: code(
      "Memo: We will use the biggest public model API because it is the best and the easiest.",
      "Our app sends customer support chats, some with account numbers. Launch is in 3 weeks.",
      "Cost will be fine because the pilot was cheap.") }),
  practice("m11-1-open-weights-without-running-gpus", "challenge",
    pj("Prove an open model is good enough", 50, "Show whether a hosted open-weight model is good enough for a task, with no steps given.",
      [],
      "A measured verdict on whether a hosted open model can replace a closed one on your task, including cost and licence.",
      ["At least 30 test cases with expected results", "Both models run with equal prompt effort", "Cost per 1,000 requests for each", "The licence terms checked and summarised"],
      "Look at why regulated teams cannot use a public API next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Write the test cases before you run either model so you cannot tune to them.", "Give each model a few rounds of prompt improvement, not just the first draft.", "Read the licence for limits on use, size of service and attribution."] }),
  practice("m11-1-why-regulated-teams-cannot-use-a-public-api", "debug",
    pj("The pilot that legal stopped", 40, "Find what in a pilot's design broke the rules and redesign the data flow.",
      [
        ["Read the pilot description and the rules below.", "Mark each breach. If it feels vague, add a number or an example."],
        ["Find the line of the data flow that causes each breach.", "Quote it. Check it with someone else or a model if you can."],
        ["Redesign the flow so the rules are met, for example with redaction or a different path.", "Draw it. Do the easy part first, then return to the hard part."],
        ["List what you would need to confirm with the vendor.", "At least three items."],
      ],
      "A redesigned data flow that meets the rules with the breaches explained and vendor confirmations listed.",
      ["Breaches marked", "Redesign drawn", "Vendor items listed"],
      "Look at comparing the three paths next.", ["A text editor"]),
    { starter: code(
      "Pilot: patient notes (with names) are sent to a public API in another country; the provider keeps prompts for 30 days",
      "for abuse monitoring; logs of full prompts go to a third-party tool. Rule: no patient data leaves the country,",
      "no third party may store identifiable data, all processing must be auditable.") }),
  practice("m11-1-comparing-the-three-paths", "extend",
    pj("Add risk to the comparison", 40, "Extend a cost-only comparison of the paths with risk and effort.",
      [
        ["Read the starter comparison and note what it leaves out.", "List three things."],
        ["Add columns for data risk, vendor risk and effort to operate.", "Score each from one to five."],
        ["Add a short reason beside every score.", "Use evidence. Save your work here so you can compare later."],
        ["Recompute the ranking with weights and note what changed from cost alone.", "Explain. Try it on one small example first."],
      ],
      "A comparison that adds data risk, vendor risk and effort to cost and shows how the ranking changes.",
      ["Omissions listed", "Scores with reasons", "Ranking change explained"],
      "Look at platform, gateway or both next.", ["A spreadsheet or text editor"]),
    { starter: code(
      "Path A public API: 0.8 cents per request.  Path B platform: 1.1 cents.  Path C self-hosted: 1.6 cents.",
      "Winner: A.") }),
  practice("m11-1-platform-gateway-or-both", "reimplement",
    pj("Rebuild the call layer behind an interface", 40, "Rebuild an app's model call layer so it can use a platform directly or a gateway.",
      [
        ["Read the starter code and list every place it calls a provider.", "Count them. Write down what you see before changing anything."],
        ["Define one interface and move all calls behind it.", "Keep the arguments simple."],
        ["Write a direct implementation and a gateway implementation.", "Use a fake for the gateway."],
        ["Switch between them by a setting and run the same tests.", "Report that both pass."],
      ],
      "An app whose model calls go through one interface with direct and gateway implementations passing the same tests.",
      ["Call sites counted", "One interface", "Both implementations pass"],
      "Look at the module capstone next.", ["Python 3.11 or newer"])),
];
