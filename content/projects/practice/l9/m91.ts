import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M91: ProjectSrc[] = [
  practice("m9-1-starting-from-requirements-and-constraints", "review",
    pj("Review a vague brief", 30, "Review a product brief and list the missing requirements before anyone designs anything.",
      [
        ["Read the brief below and underline every claim that has no number.", "Write the claims in a list."],
        ["Write the questions that would turn each claim into a requirement.", "Ask at least eight questions."],
        ["Mark which missing answers would change the design the most.", "Explain one in a sentence."],
        ["Rewrite the brief with five measurable requirements and two constraints.", "Use assumptions where you must."],
      ],
      "A reviewed brief with the vague claims listed, questions asked and a rewrite with measurable requirements.",
      ["Vague claims listed", "Eight questions asked", "Rewrite has numbers"],
      "Look at prompting, RAG, agents or fine-tuning next.", ["A text editor"]),
    { starter: code(
      "Brief: We want an AI assistant for our staff that is fast, accurate and cheap.",
      "It should know everything about the company and never make mistakes.",
      "Launch is next month and legal must be happy with it.") }),
  practice("m9-1-prompting-rag-agents-or-fine-tuning", "extend",
    pj("Add a decision rule", 40, "Extend a simple chooser so it recommends prompting, RAG, an agent or fine-tuning with reasons.",
      [
        ["Run the starter chooser on the five sample problems and note which answers look wrong.", "Write why. Write down what you see before changing anything."],
        ["Add questions about changing knowledge, needed actions, style and volume.", "Use yes or no answers."],
        ["Turn the answers into a rule that picks the cheapest approach that could work.", "Return a reason with the pick."],
        ["Test on ten problems you wrote and compare with your own choice.", "Report disagreements."],
      ],
      "A chooser that recommends an approach with a reason and agrees with your own choice on most of ten problems.",
      ["Wrong answers noted", "Rule picks cheapest approach", "Ten problems compared"],
      "Look at the quality, latency and cost triangle next.", ["Python 3.11 or newer"]),
    { starter: code(
      "def choose(problem):",
      "    return 'fine-tuning'        # always the most expensive option") }),
  practice("m9-1-quality-latency-cost", "debug",
    pj("The estimate that was wrong", 40, "Find why a cost and latency estimate was far from the real bill and correct it.",
      [
        ["Run the starter estimate and compare it with the measured numbers below.", "Write the size of the gap."],
        ["Check each assumption in the estimate against the measured usage.", "Look at output tokens and retries."],
        ["Fix the assumptions and recompute.", "Show the sums. Compare with a case you know the answer to."],
        ["Write the numbers you would measure before estimating next time.", "List at least three."],
      ],
      "A corrected estimate that matches the measured numbers and a list of what to measure first next time.",
      ["Size of the gap written", "Wrong assumptions found", "Corrected estimate matches"],
      "Look at baseline before sophistication next.", ["Python 3.11 or newer"]),
    { starter: code(
      "Estimate: 300 input tokens, 100 output tokens, one call, 2 seconds. Cost 0.4 cents.",
      "Measured: 1,800 input tokens (history and chunks), 450 output tokens, 1.6 calls on average due to retries,",
      "6 seconds at the 95th percentile. Cost 2.7 cents.") }),
  practice("m9-1-baseline-before-sophistication", "challenge",
    pj("Beat the simple version", 50, "Show that a more complex design beats a simple baseline by enough to be worth it, with no steps given.",
      [],
      "A measured comparison of a baseline and a more complex design with a verdict on whether the extra complexity pays.",
      ["A baseline measured on at least 30 cases", "A more complex version measured on the same cases", "Cost and time compared as well as quality", "A verdict with the evidence behind it"],
      "Look at where knowledge should come from next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Freeze the test cases before you build either version so you do not tune to them.", "Make the baseline as good as a simple prompt can be before you compare.", "If the complex version wins by a little, compute what the win costs per 1,000 requests."] }),
];
