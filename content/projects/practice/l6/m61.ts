import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");

export const P_M61: ProjectSrc[] = [
  practice("m6-1-context-as-a-budget", "review",
    pj("Review a prompt budget", 30, "Review a prompt layout and find where the token budget is being wasted or put at risk.",
      [
        ["Read the layout below and add up the tokens each part takes from the window.", "Use the sizes given."],
        ["Find at least three parts that take far more than they are worth.", "Quote each with its size."],
        ["Say which part will overflow first when the chat grows to fifty turns.", "Show your arithmetic."],
        ["Write a revised budget that fits with room left for the answer.", "Use a table with each part, its old size and its new size so the fit is easy to check."],
      ],
      "A review of a prompt layout naming three wasteful parts, the first to overflow and a revised budget.",
      ["Tokens added up", "Three wasteful parts found", "Revised budget fits"],
      "Look at context rot next.", ["Python 3.11 or newer"]),
    { starter: code(
      "window: 128,000 tokens; answer reserve: none",
      "system prompt: 9,000 (includes 40 examples)    tools: 14,000 (30 tools)",
      "memory: 6,000 (every note ever saved)         history: grows 1,500 per turn",
      "documents: 60,000 (pasted whole, same files every turn)") }),
  practice("m6-1-context-rot-and-lost-in-the-middle", "challenge",
    pj("Beat the rot", 50, "Keep answer quality high as a conversation grows, with no steps given.",
      [],
      "A chat setup whose accuracy stays flat as the context grows, with measurements at four lengths.",
      ["At least 20 test questions with known answers", "Accuracy measured at four context lengths", "A plain baseline curve and an improved curve are both shown", "A note explains which change helped most and why"],
      "Look at inspecting what actually enters the window next.", ["Python 3.11 or newer", LLM]),
    { hints: ["Measure first, because you cannot beat a curve you have not drawn.", "Moving key text to the edges, trimming old turns and restating the question are all cheap things to try.", "Change one thing at a time and keep the questions identical across runs."] }),
  practice("m6-1-inspecting-what-actually-enters", "extend",
    pj("Add a window report", 40, "Extend a chat app so every call prints a report of what entered the window.",
      [
        ["Run the starter and send three messages with the report turned off.", "Note what you cannot see."],
        ["Add a function that counts tokens for each message role and for the tools.", "Reuse one tokenizer."],
        ["Print the report before each call and flag any message over 2,000 tokens.", "Keep the report to a few lines so it is quick to read before every call."],
        ["Write a test with a fake long message that checks the flag appears.", "Use fake text of a known length so the test does not need a real model."],
      ],
      "A chat app that prints a per-part token report before every call and flags oversized messages.",
      ["Starter run observed", "Report printed per call", "Flag test passes"],
      "Look at allocating the budget next.", ["Python 3.11 or newer", LLM]),
    { starter: code(
      "history = [{'role': 'system', 'content': SYSTEM}]",
      "def chat(user_text):",
      "    history.append({'role': 'user', 'content': user_text})",
      "    reply = client.messages.create(model=MODEL, messages=history, tools=TOOLS)",
      "    history.append({'role': 'assistant', 'content': reply.content})") }),
  practice("m6-1-allocating-the-budget", "debug",
    pj("The budget keeps overflowing", 40, "Find why a budget check lets a prompt overflow and fix it.",
      [
        ["Run the starter with a long document and watch the call fail or truncate.", "Copy the exact error or truncation message so you know which limit was hit."],
        ["Find the part that is not counted by the budget check.", "Quote the line of the budget check that adds up the parts so you can see what it leaves out."],
        ["Fix the counting and make the trimming apply to the part that overflows.", "Keep the system message."],
        ["Add a test with an oversized tool result that must now be trimmed.", "Check the final size."],
      ],
      "A budget check that counts every part of the prompt and trims the right one, with a test on an oversized tool result.",
      ["Overflow reproduced", "Uncounted part found", "Oversized result test passes"],
      "Move on to context selection and assembly.", ["Python 3.11 or newer"]),
    { starter: code(
      "def fits(system, history, docs):",
      "    return count(system) + count(history) + count(docs) < LIMIT   # tools and tool results are not counted",
      "def trim(history):",
      "    return history[-6:]        # drops turns even when the documents are the problem") }),
];
