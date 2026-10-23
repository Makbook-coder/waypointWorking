import { LLM, practice, pj } from "../../build";
import type { ProjectSrc } from "../../types";

const code = (...lines: string[]) => lines.join("\n");
const AI = ["Python 3.11 or newer", LLM];

export const P_M14: ProjectSrc[] = [
  practice("m14-1-compose-l4-with-fastapi", "debug",
    pj("The endpoint that works once", 40, "Find why a Q&A endpoint works on the first call and fails on the next and fix it.",
      [
        ["Read the starter code and the two logged calls.", "Compare. Take it one small step at a time."],
        ["Find the shared state or blocking call that breaks the second request.", "Cause. Write down what you see before changing anything."],
        ["Fix it so requests are independent and do not block each other.", "Code. Re-read the step and try the smallest version first."],
        ["Show five concurrent requests succeed.", "Test. Check one example by hand to be sure."],
      ],
      "A fixed endpoint that handles concurrent requests independently with a test of five at once.",
      ["Cause found and confirmed", "State fixed and confirmed", "Five concurrent requests pass"],
      "Look at tool calling and structured output next.", AI),
    { starter: code(
      "index = []",
      "@app.post('/ask')",
      "async def ask(q: Question):",
      "    index.clear(); index.extend(load_and_embed(DOCS))   # runs every call",
      "    return answer(q.text, index)",
      "log: call 1 ok 9.1 s | call 2 TimeoutError | call 3 ok 14 s") }),
  practice("m14-2-tool-calling-and-structured-output", "review",
    pj("Review a screening design", 35, "Review a resume screening design for fairness, injection and privacy risks.",
      [
        ["Read the starter design and write down the result.", "Flow. Save your work so you can compare later."],
        ["List fairness risks such as using names or schools.", "Items. Ask what changed since the last run."],
        ["List injection and privacy risks.", "Items. Print the intermediate values to see them."],
        ["Rewrite the design with controls for each.", "Controls. Start with a single input before using many."],
      ],
      "A review of a screening design with fairness, injection and privacy risks and a revised design.",
      ["Design read and confirmed", "Risks listed", "Controls added"],
      "Look at LangGraph orchestration next.", ["A text editor"]),
    { starter: code(
      "Design: send the whole resume text including name, photo description and address to the model. Ask 'Should we hire this person? Reply yes or no.' Auto-reject on no. Keep all resumes forever for analytics.") }),
  practice("m14-3-langgraph-orchestration", "extend",
    pj("Add a human approval step", 40, "Extend a graph with a human approval node before publishing.",
      [
        ["Read the starter graph and write down the result.", "Nodes. Take it one small step at a time."],
        ["Add an approval node that pauses the run with the draft.", "Interrupt. Write down what you see before changing anything."],
        ["Route approved drafts to publish and rejected ones back to the writer with comments.", "Edges. Re-read the step and try the smallest version first."],
        ["Run both paths and show the traces.", "Two runs. Check one example by hand to be sure."],
      ],
      "A graph with a human approval step shown on an approve path and a reject path.",
      ["Approval node added", "Both paths routed", "Two traces shown"],
      "Look at connecting a model to a real tool next.", AI),
    { starter: code(
      "graph.add_node('research', research); graph.add_node('write', write); graph.add_node('publish', publish)",
      "graph.add_edge('research', 'write'); graph.add_edge('write', 'publish')") }),
  practice("m14-4-connect-a-model-to-a-real-tool", "optimise",
    pj("Make the tools easier for a model", 40, "Improve tool names and descriptions so a model picks the right tool more often.",
      [
        ["Read the starter tool list and the confusion table.", "Both. Save your work so you can compare later."],
        ["Rewrite names and descriptions to separate the confused tools.", "Edit. Ask what changed since the last run."],
        ["Add examples and parameter descriptions.", "Schema. Print the intermediate values to see them."],
        ["Re-run the 15 requests and report tool selection accuracy.", "Before and after. Start with a single input before using many."],
      ],
      "Improved tool descriptions with selection accuracy compared before and after on fifteen requests.",
      ["Descriptions rewritten", "Schemas improved", "Accuracy compared"],
      "Look at the operations story next.", AI),
    { starter: code(
      "tools: get(id) 'gets data' | fetch(id) 'fetches data' | find(q) 'finds' | search(q) 'searches' | update(id, v) 'updates'",
      "Selection accuracy on 15 requests: 6 of 15. Confused: get/fetch, find/search.") }),
  practice("m14-5-operations-story", "challenge",
    pj("Run an incident from the logs", 55, "Diagnose a simulated incident from logs and metrics alone and write the post-mortem, with no steps given.",
      [],
      "A post-mortem of a simulated incident with timeline, cause, fix and prevention, derived from logs only.",
      ["A simulated incident with at least three simultaneous symptoms", "A timeline reconstructed from logs and metrics only", "A root cause supported by evidence and a fix that you test", "Prevention actions with owners and a change to alerts"],
      "Look at the realtime voice or vision pipeline next.", AI),
    { hints: ["Plan the simulated fault first: for example a slow tool, a rate limit and a prompt change at the same time.", "Reconstruct from timestamps before guessing a cause.", "A good post-mortem names what the alerts missed."] }),
  practice("m14-6-realtime-voice-or-vision-pipeline", "reimplement",
    pj("Measure a pipeline stage by stage", 40, "Build a small tracer that times every stage of a voice or vision pipeline.",
      [
        ["Wrap each stage in a timer that records start and end.", "Context manager. Take it one small step at a time."],
        ["Write the spans to a file with a request id.", "JSON lines. Write down what you see before changing anything."],
        ["Print a waterfall for one request and a table of medians for 20.", "Report. Re-read the step and try the smallest version first."],
        ["Point to the stage you would fix first and why.", "Evidence. Check one example by hand to be sure."],
      ],
      "A stage tracer producing a waterfall for one request and medians over twenty with a first fix chosen.",
      ["Timers wrap stages", "Spans written", "First fix chosen"],
      "Look at write-up, publish and present next.", AI)),
  practice("m14-7-write-up-publish-and-present", "review",
    pj("Review a portfolio page", 30, "Review a portfolio project page as a hiring manager would and list what to fix.",
      [
        ["Read the starter page and write down the result.", "As a stranger. Save your work so you can compare later."],
        ["Mark what is unclear, unproven or missing.", "Marks. Ask what changed since the last run."],
        ["Rank the three fixes with the biggest effect.", "Rank. Print the intermediate values to see them."],
        ["Rewrite the opening paragraph.", "Rewrite. Start with a single input before using many."],
      ],
      "A review of a portfolio project page with ranked fixes and a rewritten opening.",
      ["Page read and confirmed", "Fixes ranked", "Opening rewritten"],
      "Return to the capstone: portfolio and positioning.", ["A text editor"]),
    { starter: code(
      "Project: SmartBot. 'I built an amazing AI chatbot using cutting-edge technology that revolutionises customer support.' Tech: Python, LLM. Link: github.com/me/smartbot (README: 'todo').") }),
];
