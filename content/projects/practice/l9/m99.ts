import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M99: ProjectSrc[] = [
  practice("m9-9-customer-support-copilot", "review",
    pj("Review a copilot launch plan", 30, "Review a launch plan for a support copilot and find the risks it ignores.",
      [
        ["Read the plan and list what the copilot is allowed to do.", "Mark actions that cannot be undone."],
        ["Find the risks the plan does not mention, such as wrong promises and private data.", "List at least four."],
        ["Write a control and a test for each risk.", "Keep them short. If it feels vague, add a number or an example."],
        ["Write the measure you would use to decide if the pilot succeeded.", "Give a number. Check it with someone else or a model if you can."],
      ],
      "A review of a launch plan with ignored risks listed, controls and tests for each and a pilot success measure.",
      ["Allowed actions listed", "Four risks with controls", "Success measure has a number"],
      "Look at a coding assistant next.", ["A text editor"]),
    { starter: code(
      "Plan: the copilot reads customer emails and replies automatically. It can issue refunds up to 500 dollars.",
      "It learns from every reply. Launch to all customers next week. Success: fewer tickets.") }),
  practice("m9-9-coding-assistant", "extend",
    pj("Give the assistant a test runner", 45, "Extend a code-suggesting assistant so it runs tests on its suggestions before showing them.",
      [
        ["Run the starter on three tasks and record that suggestions are shown without checking.", "Count how many are wrong."],
        ["Add a step that writes the suggestion into a copy and runs the tests.", "Use a timeout. Do the easy part first, then return to the hard part."],
        ["Show a suggestion only if the tests pass, otherwise retry up to twice.", "Log attempts. Save your work here so you can compare later."],
        ["Rerun the three tasks and report wrong suggestions shown and the added time.", "Describe the trade-off."],
      ],
      "An assistant that tests suggestions in a copy of the code before showing them and a report of the trade-off.",
      ["Unchecked suggestions counted", "Tests run in a copy", "Trade-off described"],
      "Look at a deep research agent next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "def suggest(task, code):",
      "    return llm('Write code for: ' + task + code)      # shown to the user as is") }),
  practice("m9-9-deep-research-agent", "challenge",
    pj("A research agent that admits gaps", 55, "Build a research agent that reports what it could not find instead of guessing, with no steps given.",
      [],
      "A research agent whose reports separate supported claims from gaps and are checked by a citation checker.",
      ["A report where every claim has a citation to a real source in the set", "A section listing what could not be found", "A checker that flags unsupported claims", "At least one question the sources cannot answer"],
      "Look at requirements, architecture and trade-offs next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Make the writing step use only the notes and tell it to write unknown when notes are missing.", "Write the checker as a separate step so it cannot be fooled by the writer's confidence.", "Test with a question that has no answer in the sources and check the report says so."] }),
  practice("m9-9-requirements-architecture-trade-offs", "reimplement",
    pj("Rebuild a design from its requirements", 45, "Rebuild a system design from requirements alone and compare it with a given answer.",
      [
        ["Read the requirements below and write your own architecture without looking at the answer.", "Draw it. Try it on one small example first."],
        ["Estimate cost and latency for your design.", "Show the sums. Write down what you see before changing anything."],
        ["Compare your design with the given one and list differences.", "Note which requirement explains each."],
        ["Decide which design you would pick and write why.", "Name the number that decides it."],
      ],
      "A design built from requirements, estimated, compared with a given answer and a choice with a deciding number.",
      ["Design drawn first", "Estimates shown", "Differences explained"],
      "Look at the module capstone next.", ["A text editor"]) ),
];
