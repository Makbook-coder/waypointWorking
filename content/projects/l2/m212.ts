import { LLM, levelCapstone } from "../build";
import type { ProjectSrc } from "../types";
import { pj } from "../build";

export const M212: ProjectSrc[] = [
  levelCapstone(2,
    pj("Streaming Tool-Using Assistant", 600, "Build a streaming command-line assistant with real tools, structured outputs, reliability, usage tracking and a LangChain port.",
      [
        ["Plan the assistant on one page: who uses it, five tools (for example notes, weather, calculator, web page fetch and file search), and what success looks like.", "Write 30 test conversations with expected tool paths first."],
        ["Build the raw streaming chat: keep the message history yourself, print tokens as they arrive and show time to first token.", "Handle Ctrl+C by stopping the stream and keeping the partial reply."],
        ["Add the tool loop: tool definitions generated from functions, a registry, ids matched, a step cap and a permission gate for risky tools.", "Run independent tool calls in parallel and dependent ones in order."],
        ["Harden the tools: validate arguments, restrict file paths to a sandbox, return short readable errors and cap repeated failures.", "Test with adversarial prompts that try to escape the sandbox."],
        ["Add structured output for one feature, such as a daily summary object, with validation, local repair and a capped retry.", "Count accepted, repaired and rejected outputs."],
        ["Add reliability: retry only temporary errors with backoff and jitter, timeouts, a deadline and a fallback model.", "Test against a fake flaky server."],
        ["Add observability: a request log with tokens, cost and latency, plus traces for every turn and redacted logs.", "Make a report of cost and latency per feature."],
        ["Run all 30 test conversations and score tool choice, arguments, answer quality, retries, cost and latency.", "Fix the three biggest problems and run again."],
        ["Port the assistant to LangChain with `bind_tools`, and explain in writing which raw calls each LangChain line replaces.", "Compare results on the same 30 conversations."],
        ["Write a README with a diagram, the results table, a troubleshooting section and a list of what you would improve with a bigger budget.", "Include a short demo transcript."],
      ],
      "A streaming assistant that uses real tools safely, with a results table over 30 conversations, traces, a cost report and a LangChain port.",
      ["Responses stream and can be interrupted", "Tools are validated, sandboxed and gated", "Failures are retried or reported cleanly", "Cost, latency and traces are recorded", "LangChain port explained against raw calls"],
      "Level 3 starts retrieval and RAG, where this assistant gains a knowledge base.",
      ["Everything from Level 2", LLM]),
  ),
];
