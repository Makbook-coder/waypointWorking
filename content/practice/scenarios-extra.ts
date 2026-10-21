import type { ScenarioSrc } from "./types";

/**
 * Scenarios for the levels that had none or one, so every level from L0 to L13 has at least three
 * and each level exam has one to draw from. Written for beginners: concrete situations, plain words.
 */
export const EXTRA_SCENARIOS: ScenarioSrc[] = [
  // L0 Software engineering
  ["M0.2", "e", "The API works in Postman but not in your code", "Your Python script calls a weather API and gets a 401, but the same request works in Postman. Walk through how you find the difference.", ["401 means the server didn't accept your credentials", "Compare the exact headers: is the API key header name and value the same?", "Print the outgoing request (URL, headers, body) instead of guessing", "Check the key is loaded from the environment and not empty"]],
  ["M0.3", "m", "Your endpoint returns 500 for bad input", "Users who send a request without a `title` get a 500 Internal Server Error from your FastAPI endpoint. What should happen instead, and how do you fix it?", ["Bad client input is a 4xx (422 or 400), never a 500", "Validate input with a Pydantic model so FastAPI rejects it before your code runs", "Return a clear error message naming the field", "Add a test that sends the bad request"]],
  ["M0.7", "m", "It runs on my machine, not in Docker", "Your app works locally but the Docker container exits immediately with `ModuleNotFoundError`. How do you debug it?", ["Read the container logs (`docker logs`) for the full error", "Check that dependencies are installed in the image (requirements copied and installed before the code)", "Check the working directory and the command the container runs", "Rebuild without cache to rule out a stale layer"]],

  // L1 LLM 101
  ["M1.9", "e", "The model made up a citation", "A teammate asked a chat model for sources on a medical topic and got a paper title and DOI that don't exist. Explain to them why this happens and what to do instead.", ["LLMs predict plausible text; they don't look things up unless given a tool", "Hallucination is most likely for specific facts like titles, numbers and links", "Give the model real sources (search or RAG) and ask it to quote them", "Always verify citations before using them"]],
  ["M1.12", "m", "Pick a model for a support bot", "Your manager asks you to pick a model for a customer support bot that handles 50,000 chats a day. How do you choose?", ["Start from requirements: quality bar, latency, cost per chat, privacy", "Shortlist two or three models (one cheap, one strong)", "Test them on 30 to 50 real past tickets, not leaderboards", "Estimate monthly cost from real token counts"]],
  ["M1.6", "e", "Same question, different answers", "A user complains that asking the same question twice gives different answers. Explain why and what you can change.", ["Sampling with temperature above 0 picks different tokens each time", "Lower temperature makes output more consistent, not more correct", "Some variation remains even at temperature 0 on many APIs", "For facts, ground the answer in sources; for formats, use structured output"]],

  // L2 Working with LLM APIs
  ["M2.4", "m", "The JSON breaks your parser once a day", "Your pipeline asks the model for JSON and parses it with `json.loads`. About once a day it crashes on invalid output. How do you make it reliable?", ["Use the provider's structured output or JSON mode with a schema if available", "Validate against a schema, not just `json.loads`", "On failure, retry once with the error message", "Log and alert on repeated failures instead of crashing"]],
  ["M2.9", "m", "A provider outage takes your app down", "Your LLM provider had a 20-minute outage and your whole app returned errors. What do you add so it degrades gracefully next time?", ["Timeouts on every call so requests don't hang", "Retries with backoff and jitter only for transient errors", "A fallback model or provider, tested ahead of time", "A friendly degraded message and an alert"]],
  ["M2.10", "e", "Costs doubled overnight", "Your LLM bill doubled from one day to the next with no traffic increase. How do you find out why?", ["Check per-request logs: tokens in, tokens out, model name", "Look for a prompt change that added context, or a loop calling the model repeatedly", "Group cost by endpoint or feature to find the culprit", "Add a daily budget alert"]],

  // L3 Prompt engineering
  ["M3.6", "m", "Your prompt fix broke something else", "You changed a prompt to fix one bad answer. A week later, users report a different kind of answer got worse. How do you stop this happening again?", ["Keep a small test set of real examples, including the old failures", "Run every prompt change against the whole set, not just the new case", "Compare old and new versions on the same examples", "Version your prompts so you can roll back"]],
  ["M3.4", "e", "The assistant is too chatty", "Your assistant answers simple yes/no questions with three paragraphs. How do you fix it with the system prompt?", ["State the desired length and format clearly", "Show one or two short examples of good answers", "Tell it what to do (be brief) rather than only what not to do", "Test on a set of simple and complex questions"]],
  ["M3.3", "m", "The model gets multi-step maths wrong", "Your model answers invoice-total questions in one shot and is often wrong by a small amount. What do you try?", ["Ask it to reason step by step or show its working", "Break the task into steps (extract numbers, then compute)", "Better: do the arithmetic in code and let the model extract values", "Measure accuracy before and after"]],

  // L4 RAG
  ["M4.2", "m", "Answers cut off mid-table", "Your RAG bot answers questions about pricing tables with half the rows missing. What's going wrong and how do you fix it?", ["Fixed-size chunking split the table across chunks", "Chunk by structure (keep tables and sections whole)", "Add overlap or attach the table header to each chunk", "Test retrieval on table questions specifically"]],

  // L5 Agents
  ["M5.9", "m", "The agent deleted the wrong file", "Your coding agent was asked to clean up temp files and deleted a config file. What safeguards do you add?", ["Least privilege: limit which folders the tool can touch", "Require human approval for destructive actions", "Dry-run mode that shows what would change first", "Log every tool call so you can trace what happened"]],

  // L6 Context engineering
  ["M6.1", "e", "Quality dropped after adding more documents", "You doubled the number of retrieved documents in the prompt and answers got worse, not better. Explain why.", ["More context adds noise and distracts the model", "Important facts in the middle of long contexts get less attention", "Longer prompts also cost more and are slower", "Retrieve less but better, or rerank"]],
  ["M6.7", "m", "Prompt caching isn't saving money", "You turned on prompt caching but the cache hit rate is nearly zero. What do you check?", ["Caches match on an exact prefix", "Put stable content (instructions, tools, docs) first and changing content last", "Look for a timestamp or user id near the start of the prompt", "Measure the shared prefix between consecutive requests"]],

  // L7 Evals
  ["M7.1", "e", "\"It looks good to me\"", "Your team ships prompt changes after reading three or four outputs. Convince them to build an eval set, and say what goes in it first.", ["Spot checks miss regressions and rare failures", "Start with 20 to 50 real examples with known good answers", "Include past failures and edge cases", "Run it on every change and track the score over time"]],

  // L8 Security
  ["M8.3", "m", "Users bypass your content filter", "Users get your assistant to produce disallowed content by writing requests in leetspeak or another language. What do you do?", ["A single keyword filter is easy to evade", "Use an output guardrail as well as an input one", "Test with obfuscated and translated attacks", "Layer defences and log blocked attempts"]],

  // L10 LLMOps
  ["M10.10", "m", "Quality dropped after a model update", "Your provider silently updated the model behind an alias and your answer quality dropped. How do you respond now, and what do you change for next time?", ["Roll back by pinning the previous model version if available", "Confirm with your eval suite, not anecdotes", "Pin exact model versions in config", "Re-run evals whenever the model changes"]],

  // L11 Managed platforms
  ["M11.5", "m", "Hitting rate limits at launch", "On launch day your app hits the provider's tokens-per-minute quota and users see errors. What do you do in the moment and afterwards?", ["Queue and retry with backoff instead of failing", "Serve a cheaper model for low-value traffic", "Request a quota increase with real usage numbers", "Load test before the next launch"]],

  // L12 Multimodal
  ["M12.3", "m", "The vision model misreads small text", "Your invoice reader reads totals correctly on clear scans but gets small print and phone photos wrong. How do you improve it?", ["Downscaling destroys small text; send higher detail or crops", "Crop the region of interest before sending", "Use a document OCR service for text-heavy pages", "Evaluate on real phone photos, not just clean scans"]],

  // L13 Fine-tuning
  ["M13.1", "m", "Should we fine-tune?", "A stakeholder wants to fine-tune a model so it \"knows our product\". The product docs change every week. What do you recommend?", ["Fine-tuning teaches style and format, not fresh facts", "Weekly-changing knowledge belongs in RAG", "Try prompting and RAG first with an eval set", "Fine-tune only for a measured gap that prompting can't close"]],
];
