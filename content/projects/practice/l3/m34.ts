import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M34: ProjectSrc[] = [
  practice("m3-4-what-belongs-in-a-system-prompt", "review",
    pj("Review a system prompt", 30, "Review a bloated system prompt and move per-task text out of it.",
      [
        ["Read the system prompt above and mark each line as stable rule, per-task instruction or noise.", "Quote the noisy lines."],
        ["Rewrite the system prompt with only stable rules and shorten it.", "Aim for half the length."],
        ["Move per-task text into the user message template.", "Show the template."],
        ["Run five tasks with the old and new setups and compare quality and tokens.", "Note any behaviour that changed."],
      ],
      "A shorter system prompt, a task template and a comparison of quality and tokens on five tasks.",
      ["Lines classified", "Per-task text moved", "Old and new compared"],
      "Look at stable rules versus task instructions next.", [LLM]),
    { starter: code(
      "You are a friendly assistant for Acme Bank. Today we are summarising a complaint.",
      "Always be polite. Summarise the next message in 3 bullets. Never give legal advice.",
      "Use British spelling. Remember to say hello. Translate to French if asked.") }),
  practice("m3-4-stable-rules-vs-task-instructions", "extend",
    pj("Add a new task safely", 40, "Extend an assistant with a new task without changing its stable rules.",
      [
        ["Run the assistant on its existing task and save the replies as a baseline.", "Use the same five inputs every time you run it."],
        ["Add a second task by changing only the user message, not the system prompt.", "Write the template."],
        ["Run both tasks and check the stable rules still hold in both.", "Write a check for each rule."],
        ["If a rule fails, decide whether it belongs in the system prompt or the task and move it.", "Explain the choice."],
      ],
      "An assistant with two tasks sharing one system prompt, with rule checks that pass in both.",
      ["Baseline saved", "Second task added through the template", "Rule checks pass in both tasks"],
      "Look at missing and out-of-scope input next.", [LLM]),
    { starter: code(
      "system = 'You are a support assistant for Acme. Be brief. Never promise refunds.'",
      "task_1 = 'Summarise this ticket in two sentences: {ticket}'",
      "# add a task that drafts a reply to the ticket without editing `system`") }),
  practice("m3-4-handling-missing-or-out-of-scope-input", "debug",
    pj("The overconfident bot", 35, "Find why a bot invents an answer when the information is missing and repair it.",
      [
        ["Run the bot on the six questions above and mark which ones it answered from nothing.", "Compare with the facts in the context."],
        ["Add a rule for missing information and a clear fallback reply.", "State the exact wording to use."],
        ["Add a rule for out-of-scope questions with a different fallback.", "Keep them distinct."],
        ["Rerun the six questions and a few extra in-scope ones.", "Watch for wrong refusals."],
        ["Report the invented answers before and after and the wrong refusals.", "Report invented answers and wrong refusals as two numbers."],
      ],
      "Counts of invented answers and wrong refusals before and after the fix.",
      ["Invented answers found", "Two fallbacks added", "Both error types counted"],
      "Look at lightweight guardrails next.", [LLM]),
    { starter: code(
      "context = 'Opening hours: Mon-Fri 9 to 5. Phone: 555-0100.'",
      "questions = ['When do you open on Saturday?', 'What is the price of a premium plan?',",
      "             'What is the phone number?', 'Who won the football match?',",
      "             'Do you ship to Canada?', 'What are your opening hours?']") }),
  practice("m3-4-lightweight-behavioural-guardrails", "challenge",
    pj("Hold the line", 45, "Write guardrail wording that keeps an assistant on topic under pressure, then try to break it, with no steps given.",
      [],
      "A system prompt, an attempt set grouped by type and a table of how often each type succeeds before and after your wording.",
      ["At least 25 attempts across five types", "Success rate recorded per type", "Wording improved at least once and measured again", "You state what the guardrails cannot promise"],
      "Go on to controlling style and format in M3.5.", [LLM]),
    { hints: ["Types might be role change, hidden prompt requests, scope drift, rudeness and urgency.", "Change one sentence at a time so you know what helped.", "A guardrail written in words lowers the chance; it does not give a guarantee."] }),
];
